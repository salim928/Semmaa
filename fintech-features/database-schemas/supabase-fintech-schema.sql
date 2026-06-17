-- Fintech Database Schema for Supabase
-- Extracted from AgriBOT for future fintech app development

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets Table
CREATE TABLE public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL DEFAULT 0.0 NOT NULL CHECK (balance >= 0),
  currency TEXT DEFAULT 'GHS' NOT NULL,
  monthly_income DECIMAL DEFAULT 0.0,
  monthly_expenses DECIMAL DEFAULT 0.0,
  credit_limit DECIMAL DEFAULT 0.0,
  loan_eligible BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer')),
  amount DECIMAL NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'GHS' NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('sales', 'inputs', 'loan', 'investment', 'insurance', 'referral', 'transfer', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference TEXT,
  related_transaction_id UUID REFERENCES public.transactions(id), -- For transfers
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE public.loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  purpose TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0), -- in months
  interest_rate DECIMAL NOT NULL CHECK (interest_rate >= 0),
  total_repayment DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'paid', 'defaulted')),
  approval_date TIMESTAMP WITH TIME ZONE,
  disbursement_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  rejection_reason TEXT,
  collateral JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Repayment Schedule Table
CREATE TABLE public.loan_repayments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  principal DECIMAL NOT NULL,
  interest DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  paid_date TIMESTAMP WITH TIME ZONE,
  paid_amount DECIMAL DEFAULT 0,
  transaction_id UUID REFERENCES public.transactions(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Money Accounts Table
CREATE TABLE public.mobile_money_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('MTN', 'Vodafone', 'AirtelTigo')),
  phone_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phone_number, provider)
);

-- Payments Table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  amount DECIMAL NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'GHS' NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer', 'card', 'wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  provider TEXT, -- e.g., 'MTN', 'Vodafone', 'Visa', 'Bank of Ghana'
  provider_reference TEXT,
  transaction_reference TEXT,
  mobile_money_account_id UUID REFERENCES public.mobile_money_accounts(id),
  failure_reason TEXT,
  metadata JSONB,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Score/Profile Table (for loan eligibility)
CREATE TABLE public.credit_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credit_score INTEGER DEFAULT 0 CHECK (credit_score >= 0 AND credit_score <= 1000),
  total_loans_taken INTEGER DEFAULT 0,
  active_loans INTEGER DEFAULT 0,
  loans_paid INTEGER DEFAULT 0,
  loans_defaulted INTEGER DEFAULT 0,
  total_borrowed DECIMAL DEFAULT 0,
  total_repaid DECIMAL DEFAULT 0,
  on_time_payments INTEGER DEFAULT 0,
  late_payments INTEGER DEFAULT 0,
  last_loan_date TIMESTAMP WITH TIME ZONE,
  last_default_date TIMESTAMP WITH TIME ZONE,
  verified_income DECIMAL DEFAULT 0,
  income_source TEXT,
  employment_status TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);
CREATE INDEX idx_loan_repayments_due_date ON public.loan_repayments(due_date);
CREATE INDEX idx_mobile_money_accounts_user_id ON public.mobile_money_accounts(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_credit_profiles_user_id ON public.credit_profiles(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_money_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_profiles ENABLE ROW LEVEL SECURITY;

-- Wallets Policies
CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loans Policies
CREATE POLICY "Users can view own loans" ON public.loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can apply for loans" ON public.loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loan Repayments Policies
CREATE POLICY "Users can view own loan repayments" ON public.loan_repayments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_repayments.loan_id
      AND loans.user_id = auth.uid()
    )
  );

-- Mobile Money Accounts Policies
CREATE POLICY "Users can view own mobile money accounts" ON public.mobile_money_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mobile money accounts" ON public.mobile_money_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Payments Policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit Profiles Policies
CREATE POLICY "Users can view own credit profile" ON public.credit_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Functions
-- Update wallet balance on transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE public.wallets
      SET balance = balance + NEW.amount,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'debit' THEN
      UPDATE public.wallets
      SET balance = balance - NEW.amount,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER transaction_update_wallet
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- Update credit score on loan payment
CREATE OR REPLACE FUNCTION update_credit_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.credit_profiles
    SET 
      on_time_payments = on_time_payments + 1,
      credit_score = LEAST(1000, credit_score + 10),
      updated_at = NOW()
    WHERE user_id = (SELECT user_id FROM public.loans WHERE id = NEW.loan_id);
  ELSIF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
    UPDATE public.credit_profiles
    SET 
      late_payments = late_payments + 1,
      credit_score = GREATEST(0, credit_score - 20),
      updated_at = NOW()
    WHERE user_id = (SELECT user_id FROM public.loans WHERE id = NEW.loan_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER repayment_update_credit
AFTER UPDATE ON public.loan_repayments
FOR EACH ROW
EXECUTE FUNCTION update_credit_score();
