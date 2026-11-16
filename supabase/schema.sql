-- =========================================================================
-- EXPENSE TRACKER & WEALTH COMMAND - COMPLETE SUPABASE SQL SCHEMA (₹0 TIER)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Sterling H.',
  tier_label TEXT DEFAULT 'Private Tier',
  privacy_mode BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXPENSES TABLE (Expense Notebook)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  category_color TEXT DEFAULT '#d4af37',
  paid_with TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  receipt_url TEXT,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYABLES TABLE (Bills to Pay Soon / Debts)
CREATE TABLE IF NOT EXISTS public.payables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor_name TEXT NOT NULL,
  invoice_note TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  due_date TEXT NOT NULL,
  urgency_badge TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOANS TABLE (Active Loans Lent to Others)
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  borrower_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  note TEXT,
  principal_amount NUMERIC(12, 2) NOT NULL,
  interest_rate_annual NUMERIC(5, 2) DEFAULT 18.00,
  monthly_interest NUMERIC(10, 2) GENERATED ALWAYS AS ((principal_amount * interest_rate_annual / 100) / 12) STORED,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'repaid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) FOR 100% PRIVATE DATA ACCESS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES (Users can only view and manage their own data)
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Expenses
CREATE POLICY "Users view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Payables
CREATE POLICY "Users view own payables" ON public.payables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payables" ON public.payables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payables" ON public.payables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own payables" ON public.payables FOR DELETE USING (auth.uid() = user_id);

-- Loans
CREATE POLICY "Users view own loans" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own loans" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own loans" ON public.loans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own loans" ON public.loans FOR DELETE USING (auth.uid() = user_id);

-- 7. STORAGE BUCKET FOR CAMERA RECEIPTS & BILLS (1GB Free Tier)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Public read receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');

-- 8. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP (Email OTP)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, tier_label, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'Private Tier',
    'member'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
