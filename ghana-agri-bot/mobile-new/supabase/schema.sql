-- =====================================================
-- SEMMA AGRIBOT - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql/new
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- Stores user profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  full_name TEXT,
  location TEXT,
  region TEXT,
  district TEXT,
  farm_size TEXT,
  crops TEXT[] DEFAULT '{}',
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"push": true, "sms": false, "email": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. PRODUCTS TABLE
-- Marketplace products
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- kg, bags, pieces, etc.
  quantity_available DECIMAL(10, 2) NOT NULL,
  min_order_quantity DECIMAL(10, 2) DEFAULT 1,
  images TEXT[] DEFAULT '{}',
  location TEXT,
  region TEXT,
  is_available BOOLEAN DEFAULT true,
  is_organic BOOLEAN DEFAULT false,
  harvest_date DATE,
  expiry_date DATE,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Sellers can manage their own products"
  ON products FOR ALL
  USING (auth.uid() = seller_id);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ORDERS TABLE
-- Order management
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  buyer_name TEXT,
  seller_name TEXT,
  delivery_address TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  tracking_number TEXT,
  estimated_delivery DATE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CHAT MESSAGES TABLE
-- For marketplace chat between buyers and sellers
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'product', 'order')),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat policies
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update message read status"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Index for faster conversation queries
CREATE INDEX idx_chat_conversation ON chat_messages(conversation_id, created_at DESC);

-- =====================================================
-- 5. FEEDBACK TABLE
-- User feedback and ratings
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  location TEXT,
  language TEXT DEFAULT 'en',
  feature TEXT, -- which feature the feedback is about
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Feedback policies
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. AI CHAT HISTORY TABLE
-- Store AI assistant conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- for storing KB hits, duration, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- AI chat policies
CREATE POLICY "Users can view their own chat history"
  ON ai_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history"
  ON ai_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster session queries
CREATE INDEX idx_ai_chat_session ON ai_chat_history(user_id, session_id, created_at);

-- =====================================================
-- 7. SAVED CROPS TABLE
-- Crops that users are growing/interested in
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  planting_date DATE,
  expected_harvest DATE,
  field_size TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved crops"
  ON saved_crops FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- Push notification records
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster notification queries
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(region, location);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =====================================================
-- 9. REVIEWS TABLE
-- Product and order reviews
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, user_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their orders"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX idx_reviews_order ON reviews(order_id);

-- =====================================================
-- 10. WALLETS TABLE
-- User wallet balances
-- =====================================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'GHS',
  monthly_income DECIMAL(15, 2) DEFAULT 0,
  monthly_expenses DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. TRANSACTIONS TABLE
-- Financial transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sales', 'inputs', 'loan', 'investment', 'insurance', 'referral', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

-- =====================================================
-- 12. LOANS TABLE
-- Micro loans management
-- =====================================================
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  purpose TEXT NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 15.0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'repaying', 'completed', 'defaulted', 'rejected')),
  approved_amount DECIMAL(15, 2),
  disbursed_amount DECIMAL(15, 2),
  repaid_amount DECIMAL(15, 2) DEFAULT 0,
  monthly_payment DECIMAL(15, 2),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans"
  ON loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can apply for loans"
  ON loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_loans_user ON loans(user_id, status);

-- =====================================================
-- 13. INSURANCE POLICIES TABLE
-- Crop insurance management
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE,
  crop_type TEXT NOT NULL,
  field_size DECIMAL(10, 2) NOT NULL,
  coverage_amount DECIMAL(15, 2) NOT NULL,
  premium DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'claimed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  risk_factors JSONB DEFAULT '{}',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own policies"
  ON insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can apply for insurance"
  ON insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_insurance_user ON insurance_policies(user_id, status);

-- =====================================================
-- 14. REFERRALS TABLE
-- Referral program tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_amount DECIMAL(10, 2) DEFAULT 50.0,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id, status);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- =====================================================
-- 15. USER REFERRAL CODES TABLE
-- Store unique referral codes per user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  total_rewards DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral code"
  ON user_referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their referral code"
  ON user_referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Automatically create referral code for new users
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  LOOP
    new_code := generate_referral_code();
    BEGIN
      INSERT INTO user_referral_codes (user_id, referral_code)
      VALUES (NEW.id, new_code);
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      IF attempt >= max_attempts THEN
        RAISE EXCEPTION 'Could not generate unique referral code';
      END IF;
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_referral_code_created ON profiles;
CREATE TRIGGER on_user_referral_code_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_code();

-- =====================================================
-- WALLET RPC FUNCTIONS
-- Secure server-side operations for wallet transactions
-- =====================================================

-- Add money to wallet
CREATE OR REPLACE FUNCTION add_money(
  p_user_id UUID,
  p_amount DECIMAL,
  p_method TEXT
) RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_reference TEXT;
BEGIN
  -- Generate reference
  v_reference := 'ADD_' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '_' || substr(md5(random()::text), 1, 8);
  
  -- Insert transaction
  INSERT INTO transactions (user_id, type, amount, description, category, status, reference)
  VALUES (p_user_id, 'credit', p_amount, 'Money added via ' || p_method, 'other', 'completed', v_reference)
  RETURNING id INTO v_transaction_id;
  
  -- Update wallet balance
  UPDATE wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create wallet if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance)
    VALUES (p_user_id, p_amount);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'reference', v_reference
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send money between users
CREATE OR REPLACE FUNCTION send_money(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount DECIMAL,
  p_note TEXT
) RETURNS JSONB AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_reference TEXT;
BEGIN
  -- Check sender balance
  SELECT balance INTO v_sender_balance
  FROM wallets
  WHERE user_id = p_sender_id;
  
  IF v_sender_balance IS NULL OR v_sender_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Generate reference
  v_reference := 'SEND_' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '_' || substr(md5(random()::text), 1, 8);
  
  -- Debit sender
  UPDATE wallets SET balance = balance - p_amount WHERE user_id = p_sender_id;
  INSERT INTO transactions (user_id, type, amount, description, category, status, reference)
  VALUES (p_sender_id, 'debit', p_amount, 'Sent to user: ' || p_note, 'other', 'completed', v_reference);
  
  -- Credit recipient
  UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_recipient_id;
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance) VALUES (p_recipient_id, p_amount);
  END IF;
  INSERT INTO transactions (user_id, type, amount, description, category, status, reference)
  VALUES (p_recipient_id, 'credit', p_amount, 'Received from user: ' || p_note, 'other', 'completed', v_reference);
  
  RETURN jsonb_build_object('success', true, 'reference', v_reference);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Withdraw money
CREATE OR REPLACE FUNCTION withdraw_money(
  p_user_id UUID,
  p_amount DECIMAL,
  p_method TEXT,
  p_account TEXT
) RETURNS JSONB AS $$
DECLARE
  v_balance DECIMAL;
  v_reference TEXT;
BEGIN
  -- Check balance
  SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id;
  
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  v_reference := 'WTH_' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '_' || substr(md5(random()::text), 1, 8);
  
  -- Debit wallet
  UPDATE wallets SET balance = balance - p_amount WHERE user_id = p_user_id;
  INSERT INTO transactions (user_id, type, amount, description, category, status, reference)
  VALUES (p_user_id, 'debit', p_amount, 'Withdrawal to ' || p_method || ' (' || p_account || ')', 'other', 'completed', v_reference);
  
  RETURN jsonb_build_object('success', true, 'reference', v_reference);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! Your database is now ready with all features.
-- =====================================================
