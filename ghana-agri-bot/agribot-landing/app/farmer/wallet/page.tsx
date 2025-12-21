'use client'

// app/farmer/wallet/page.tsx – Full-featured wallet mirroring mobile WalletScreen

import { useState, useMemo, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  category?: string
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 850,
    description: 'Tomato Sales - Kumasi Market',
    date: '2025-01-15',
    status: 'completed',
    category: 'sales',
  },
  {
    id: '2',
    type: 'debit',
    amount: 245,
    description: 'Fertilizer Purchase',
    date: '2025-01-14',
    status: 'completed',
    category: 'inputs',
  },
  {
    id: '3',
    type: 'credit',
    amount: 1200,
    description: 'Maize Sales - Techiman',
    date: '2025-01-12',
    status: 'completed',
    category: 'sales',
  },
  {
    id: '4',
    type: 'debit',
    amount: 150,
    description: 'Seeds Purchase',
    date: '2025-01-10',
    status: 'completed',
    category: 'inputs',
  },
  {
    id: '5',
    type: 'credit',
    amount: 2000,
    description: 'Farm Loan Disbursement',
    date: '2025-01-08',
    status: 'completed',
    category: 'loan',
  },
]

function formatCurrency(amount: number) {
  return `GHS ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export default function FarmerWalletPage() {
  const { walletBalance, transactions: walletTransactions, walletLoading, createWalletTransaction } = useApp()
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'loans'>('overview')
  const [showModal, setShowModal] = useState<'add' | 'send' | 'withdraw' | 'loan' | null>(null)
  const [formAmount, setFormAmount] = useState('')
  const [formRecipient, setFormRecipient] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [loanPurpose, setLoanPurpose] = useState('')
  const [processing, setProcessing] = useState(false)

  // Sync wallet data from context and localStorage
  useEffect(() => {
    // Load from localStorage first
    const savedBalance = localStorage.getItem('semmaai_wallet_balance')
    const savedTransactions = localStorage.getItem('semmaai_wallet_transactions')
    
    if (savedBalance) {
      setBalance(parseFloat(savedBalance))
    } else if (walletBalance !== undefined) {
      setBalance(walletBalance)
    } else {
      // Default starting balance for demo
      setBalance(3655)
    }
    
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions))
      } catch (e) {
        console.error('Error loading transactions:', e)
        setTransactions(INITIAL_TRANSACTIONS)
      }
    } else if (walletTransactions && walletTransactions.length > 0) {
      // Map wallet transactions to local format
      const mapped: Transaction[] = walletTransactions.map((t: { id: string; type: string; amount: number; description: string; created_at: string; status?: string; category?: string }) => ({
        id: t.id,
        type: t.type as 'credit' | 'debit',
        amount: t.amount,
        description: t.description,
        date: t.created_at.split('T')[0],
        status: (t.status || 'completed') as 'completed' | 'pending' | 'failed',
        category: t.category,
      }))
      setTransactions(mapped)
    } else if (!walletLoading) {
      setTransactions(INITIAL_TRANSACTIONS)
    }
  }, [walletBalance, walletTransactions, walletLoading])

  // Save balance and transactions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('semmaai_wallet_balance', balance.toString())
  }, [balance])
  
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('semmaai_wallet_transactions', JSON.stringify(transactions))
    }
  }, [transactions])

  const monthlyIncome = useMemo(() => 
    transactions
      .filter(t => t.type === 'credit' && t.date.startsWith('2025-01'))
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  )

  const monthlyExpenses = useMemo(() =>
    transactions
      .filter(t => t.type === 'debit' && t.date.startsWith('2025-01'))
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  )

  const handleAddMoney = async () => {
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) return
    
    setProcessing(true)
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'credit',
      amount,
      description: 'Mobile Money Deposit',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      category: 'deposit',
    }
    
    // Update local state
    setBalance(prev => prev + amount)
    setTransactions(prev => [newTransaction, ...prev])
    
    // Try to save to Supabase
    try {
      await createWalletTransaction({
        user_id: user?.id || 'guest',
        type: 'credit',
        amount,
        description: 'Mobile Money Deposit',
        reference: `DEP${Date.now()}`,
        status: 'completed',
      })
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
    
    setFormAmount('')
    setShowModal(null)
    setProcessing(false)
  }

  const handleSendMoney = async () => {
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0 || amount > balance || !formRecipient) return
    
    setProcessing(true)
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'debit',
      amount,
      description: `Sent to ${formRecipient}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      category: 'transfer',
    }
    
    // Update local state
    setBalance(prev => prev - amount)
    setTransactions(prev => [newTransaction, ...prev])
    
    // Try to save to Supabase
    try {
      await createWalletTransaction({
        user_id: user?.id || 'guest',
        type: 'debit',
        amount,
        description: `Sent to ${formRecipient}`,
        reference: `TRF${Date.now()}`,
        status: 'completed',
      })
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
    
    setFormAmount('')
    setFormRecipient('')
    setShowModal(null)
    setProcessing(false)
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0 || amount > balance || !formPhone) return
    
    setProcessing(true)
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'debit',
      amount,
      description: `Withdrawal to ${formPhone}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      category: 'withdrawal',
    }
    
    // Update local state
    setBalance(prev => prev - amount)
    setTransactions(prev => [newTransaction, ...prev])
    
    // Try to save to Supabase
    try {
      await createWalletTransaction({
        user_id: user?.id || 'guest',
        type: 'debit',
        amount,
        description: `Withdrawal to ${formPhone}`,
        reference: `WDR${Date.now()}`,
        status: 'pending',
      })
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
    
    setFormAmount('')
    setFormPhone('')
    setShowModal(null)
    setProcessing(false)
  }

  const handleLoanApplication = () => {
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0 || !loanPurpose) return
    
    // Save loan application to localStorage
    const loanApplications = JSON.parse(localStorage.getItem('semmaai_loan_applications') || '[]')
    loanApplications.unshift({
      id: `LOAN${Date.now()}`,
      amount,
      purpose: loanPurpose,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    })
    localStorage.setItem('semmaai_loan_applications', JSON.stringify(loanApplications))
    
    alert(`✅ Loan application submitted!\n\nAmount: ${formatCurrency(amount)}\nPurpose: ${loanPurpose}\n\nOur team will review your application within 24-48 hours.`)
    setFormAmount('')
    setLoanPurpose('')
    setShowModal(null)
  }

  const quickActions = [
    { label: 'Add Money', icon: '💰', action: () => setShowModal('add'), color: 'from-emerald-500 to-emerald-600' },
    { label: 'Send', icon: '📤', action: () => setShowModal('send'), color: 'from-blue-500 to-blue-600' },
    { label: 'Withdraw', icon: '🏧', action: () => setShowModal('withdraw'), color: 'from-violet-500 to-violet-600' },
    { label: 'Apply Loan', icon: '🏦', action: () => setShowModal('loan'), color: 'from-amber-500 to-amber-600' },
  ]

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'sales': return '💵'
      case 'inputs': return '🌱'
      case 'deposit': return '💳'
      case 'transfer': return '📤'
      case 'withdrawal': return '🏧'
      case 'loan': return '🏦'
      default: return '💰'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Balance card */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-5 text-white shadow-lg sm:p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-100">
              Available balance
            </p>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-50">
              SemmaAI Wallet
            </span>
          </div>
          <p className="text-3xl font-bold sm:text-4xl">
            {formatCurrency(balance)}
          </p>
          <p className="text-xs text-emerald-100">
            +{((monthlyIncome - monthlyExpenses) / (monthlyExpenses || 1) * 100).toFixed(1)}% compared to expenses
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-4 gap-2 sm:gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} p-3 text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg sm:p-4`}
          >
            <span className="text-2xl sm:text-3xl">{action.icon}</span>
            <span className="mt-1 text-[10px] font-semibold sm:text-xs">{action.label}</span>
          </button>
        ))}
      </section>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-emerald-50 p-1">
        {(['overview', 'transactions', 'loans'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-600 hover:text-emerald-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick stats */}
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-700">This month income</p>
                <span className="text-lg">📈</span>
              </div>
              <p className="mt-1 text-xl font-bold text-emerald-950">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-700">This month expenses</p>
                <span className="text-lg">📉</span>
              </div>
              <p className="mt-1 text-xl font-bold text-emerald-950">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>
          </section>

          {/* Recent transactions */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-900">Recent transactions</p>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all →
              </button>
            </div>
            <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
              {transactions.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-emerald-50 sm:px-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">
                    {getCategoryIcon(t.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-950">{t.description}</p>
                    <p className="text-xs text-emerald-500">
                      {new Date(t.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      • {t.status}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-emerald-900">All transactions</p>
          <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-emerald-50 sm:px-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">
                  {getCategoryIcon(t.category)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-950">{t.description}</p>
                  <p className="text-xs text-emerald-500">
                    {new Date(t.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    • <span className={`${t.status === 'completed' ? 'text-emerald-600' : t.status === 'pending' ? 'text-amber-600' : 'text-rose-600'}`}>{t.status}</span>
                  </p>
                </div>
                <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <section className="space-y-4">
          {/* Loan Products */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900">Available Loan Products</h3>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-lime-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-900">Farm Input Loan</p>
                    <p className="text-xs text-emerald-600">Up to GHS 5,000 • 12% APR</p>
                  </div>
                  <button
                    onClick={() => setShowModal('loan')}
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-900">Equipment Loan</p>
                    <p className="text-xs text-emerald-600">Up to GHS 20,000 • 15% APR</p>
                  </div>
                  <button
                    onClick={() => setShowModal('loan')}
                    className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-900">Emergency Loan</p>
                    <p className="text-xs text-emerald-600">Up to GHS 1,000 • 10% APR</p>
                  </div>
                  <button
                    onClick={() => setShowModal('loan')}
                    className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Status */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900">Your Loans</h3>
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 text-sm font-medium text-emerald-900">No active loans</p>
              <p className="text-xs text-emerald-600">You're debt-free! Apply when you need funds.</p>
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-emerald-900">
                {showModal === 'add' && '💰 Add Money'}
                {showModal === 'send' && '📤 Send Money'}
                {showModal === 'withdraw' && '🏧 Withdraw'}
                {showModal === 'loan' && '🏦 Apply for Loan'}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="rounded-full p-1 text-emerald-500 hover:bg-emerald-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-emerald-700">Amount (GHS)</label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {showModal === 'send' && (
                <div>
                  <label className="text-xs font-medium text-emerald-700">Recipient ID</label>
                  <input
                    type="text"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="Enter recipient's user ID"
                    className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              )}

              {showModal === 'withdraw' && (
                <div>
                  <label className="text-xs font-medium text-emerald-700">Mobile Money Number</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g., 0241234567"
                    className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              )}

              {showModal === 'loan' && (
                <div>
                  <label className="text-xs font-medium text-emerald-700">Purpose</label>
                  <select
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="">Select purpose</option>
                    <option value="seeds">Seeds & Seedlings</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="equipment">Equipment</option>
                    <option value="labor">Labor</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => {
                  if (showModal === 'add') handleAddMoney()
                  if (showModal === 'send') handleSendMoney()
                  if (showModal === 'withdraw') handleWithdraw()
                  if (showModal === 'loan') handleLoanApplication()
                }}
                disabled={processing}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
              >
                {processing ? '⏳ Processing...' : (
                  <>
                    {showModal === 'add' && '💰 Add Money'}
                    {showModal === 'send' && '📤 Send Money'}
                    {showModal === 'withdraw' && '🏧 Withdraw'}
                    {showModal === 'loan' && '📝 Submit Application'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )}