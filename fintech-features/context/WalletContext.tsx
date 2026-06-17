// context/WalletContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: 'sales' | 'inputs' | 'loan' | 'investment' | 'insurance' | 'referral' | 'other';
  status: 'completed' | 'pending' | 'failed';
  reference: string | null;
  metadata: any;
  created_at: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  monthly_income: number;
  monthly_expenses: number;
}

interface WalletContextType {
  balance: WalletBalance;
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  refreshWallet: () => Promise<void>;
  addMoney: (amount: number, method: string) => Promise<{ success: boolean; error?: string }>;
  sendMoney: (recipientId: string, amount: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  withdrawMoney: (amount: number, method: string, account: string) => Promise<{ success: boolean; error?: string }>;
  applyForLoan: (amount: number, purpose: string, duration: number) => Promise<{ success: boolean; error?: string; loanId?: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<WalletBalance>({
    balance: 0,
    currency: 'GHS',
    monthly_income: 0,
    monthly_expenses: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWalletData();
      subscribeToTransactions();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        // Create wallet if it doesn't exist
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: 0, currency: 'GHS' })
          .select()
          .single();
        
        if (newWallet) {
          setBalance({
            balance: 0,
            currency: 'GHS',
            monthly_income: 0,
            monthly_expenses: 0,
          });
        }
      } else if (wallet) {
        setBalance({
          balance: wallet.balance,
          currency: wallet.currency,
          monthly_income: wallet.monthly_income || 0,
          monthly_expenses: wallet.monthly_expenses || 0,
        });
      }

      // Get transactions
      const { data: txns, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!txnError && txns) {
        setTransactions(txns);
      }
    } catch (error) {
      console.error('Load wallet error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const subscribeToTransactions = () => {
    if (!user) return;

    const subscription = supabase
      .channel('wallet-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev =>
              prev.map(t => (t.id === payload.new.id ? (payload.new as Transaction) : t))
            );
          }
          loadWalletData(); // Refresh balance
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addMoney = async (amount: number, method: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('add_money', {
        p_user_id: user.id,
        p_amount: amount,
        p_method: method,
      });

      if (error) throw error;

      await loadWalletData();
      return { success: true };
    } catch (error: any) {
      console.error('Add money error:', error);
      return { success: false, error: error.message };
    }
  };

  const sendMoney = async (recipientId: string, amount: number, note?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('send_money', {
        p_sender_id: user.id,
        p_recipient_id: recipientId,
        p_amount: amount,
        p_note: note || '',
      });

      if (error) throw error;

      await loadWalletData();
      return { success: true };
    } catch (error: any) {
      console.error('Send money error:', error);
      return { success: false, error: error.message };
    }
  };

  const withdrawMoney = async (amount: number, method: string, account: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('withdraw_money', {
        p_user_id: user.id,
        p_amount: amount,
        p_method: method,
        p_account: account,
      });

      if (error) throw error;

      await loadWalletData();
      return { success: true };
    } catch (error: any) {
      console.error('Withdraw money error:', error);
      return { success: false, error: error.message };
    }
  };

  const applyForLoan = async (amount: number, purpose: string, duration: number) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('loans')
        .insert({
          user_id: user.id,
          amount,
          purpose,
          duration_months: duration,
          status: 'pending',
          interest_rate: 15, // 15% annual rate
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, loanId: data.id };
    } catch (error: any) {
      console.error('Apply for loan error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        refreshing,
        refreshWallet,
        addMoney,
        sendMoney,
        withdrawMoney,
        applyForLoan,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
