// Fintech Types - Extracted from AgriBOT for future fintech app development

// Wallet/Finance Types
export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  currency: 'GHS' | 'USD';
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  category?: 'sale' | 'purchase' | 'loan' | 'transfer' | 'other';
  relatedId?: string; // Product ID or User ID
}

export interface Wallet {
  balance: number;
  currency: 'GHS' | 'USD';
  transactions: Transaction[];
  creditLimit?: number;
  loanEligible?: boolean;
}

// From WalletContext.tsx
export interface WalletTransaction {
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

// Loan Types
export interface Loan {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  duration: number; // months
  interest_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid';
  repayment_schedule: RepaymentSchedule[];
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
}

export interface RepaymentSchedule {
  id: string;
  loan_id: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
}

// Payment Types
export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_reference?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Mobile Money Integration Types
export interface MobileMoneyProvider {
  name: 'MTN' | 'Vodafone' | 'AirtelTigo';
  phoneNumber: string;
  accountName: string;
}

export interface MobileMoneyTransaction {
  id: string;
  provider: MobileMoneyProvider;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'success' | 'failed';
  reference: string;
  timestamp: string;
}
