-- =========================================================================
-- EXPENSE TRACKER & WEALTH COMMAND - COMPLETE SUPABASE SQL SCHEMA (₹0 TIER)
-- Initial migration managed by Supabase CLI & GitHub Actions
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Sterling H.',
  tier_label TEXT DEFAULT 'Private Tier',
  privacy_mode BOOLEAN DEFAULT TRUE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, tier_label, privacy_mode, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Private Tier',
    TRUE,
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. EXPENSES TABLE (Expense Notebook)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  category_color TEXT DEFAULT '#d4af37',
  paid_with TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  receipt_url TEXT,
  tag TEXT,
  status_badge TEXT DEFAULT 'Verified Receipt',
  icon TEXT,
  date_time TEXT DEFAULT 'Today, Just now',
  date_key TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYABLES TABLE (Bills to Pay Soon / Liabilities)
CREATE TABLE IF NOT EXISTS public.payables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor_name TEXT NOT NULL,
  invoice_note TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  due_date TEXT NOT NULL,
  urgency_badge TEXT,
  category TEXT DEFAULT 'Vendor Liability',
  beneficiary_sub TEXT,
  full_due_date TEXT,
  due_date_urgency TEXT,
  disbursement_route TEXT DEFAULT 'Direct Wire (HDFC)',
  status_label TEXT DEFAULT 'Due Soon',
  action_label TEXT DEFAULT 'Settle Now',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BORROWERS & LOANS TABLE (Active Money Lent)
CREATE TABLE IF NOT EXISTS public.borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_bg TEXT DEFAULT 'bg-[#0f172a]',
  avatar_text TEXT DEFAULT 'text-[#d4af37]',
  badge_number INT,
  contact_or_note TEXT,
  phone TEXT,
  address TEXT,
  borrower_id TEXT,
  principal_amount NUMERIC(12, 2) NOT NULL,
  payment_mode TEXT DEFAULT 'Bank Transfer',
  payment_mode_icon TEXT DEFAULT 'account_balance',
  date_given TEXT NOT NULL,
  interest_rate NUMERIC(5, 2) DEFAULT 10.0,
  interest_rate_period TEXT DEFAULT 'flat rate',
  payout_frequency TEXT DEFAULT 'Monthly Interest Payout',
  tenure_months INT DEFAULT 12,
  term_label TEXT DEFAULT '12-Month Term',
  next_due_date TEXT,
  next_due_amount NUMERIC(12, 2) DEFAULT 0,
  due_countdown_text TEXT,
  due_countdown_type TEXT DEFAULT 'normal' CHECK (due_countdown_type IN ('critical', 'warning', 'normal')),
  received_amount NUMERIC(12, 2) DEFAULT 0,
  total_receivable NUMERIC(12, 2) NOT NULL,
  progress_percent INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'grace', 'paid')),
  status_label TEXT DEFAULT 'Active',
  contract_type TEXT,
  priority_tag TEXT,
  settlement_channel TEXT,
  note_title TEXT,
  note_text TEXT,
  attachment_name TEXT,
  total_sanctioned NUMERIC(12, 2) DEFAULT 0,
  outstanding_balance NUMERIC(12, 2) DEFAULT 0,
  repayment_pacing TEXT DEFAULT '0%',
  lifetime_collected NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LOAN ADVANCES (Tranches)
CREATE TABLE IF NOT EXISTS public.loan_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES public.borrowers(id) ON DELETE CASCADE,
  advance_code TEXT NOT NULL,
  agent TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  issue_amount NUMERIC(12, 2) NOT NULL,
  outstanding_total NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LOAN REPAYMENTS (Installments)
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES public.borrowers(id) ON DELETE CASCADE,
  installment_num INT NOT NULL,
  due_date TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_date TEXT,
  method TEXT DEFAULT 'UPI',
  reference_id TEXT,
  status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Completed', 'Overdue', 'Upcoming')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LOAN DOCUMENTS (Vault)
CREATE TABLE IF NOT EXISTS public.loan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES public.borrowers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'PDF Document',
  size TEXT DEFAULT '1.2 MB',
  uploaded_by TEXT DEFAULT 'Rahul Sharma (Agent)',
  upload_date TEXT DEFAULT 'Today',
  icon_type TEXT DEFAULT 'pdf' CHECK (icon_type IN ('pdf', 'image', 'user', 'bill')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ASSETS & HOLDINGS (Net Worth Components)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Liquid Cash & Banking',
    'Bullion & Precious Metals',
    'Bonds & Fixed Income',
    'Real Estate & Properties',
    'Alternative & Equity'
  )),
  institution TEXT NOT NULL,
  valuation NUMERIC(14, 2) NOT NULL,
  annual_yield_rate NUMERIC(5, 2) DEFAULT 0,
  monthly_yield NUMERIC(12, 2) DEFAULT 0,
  liquidity_tier TEXT DEFAULT 'Instant' CHECK (liquidity_tier IN ('Instant', 'T+1', 'T+3', 'Illiquid')),
  account_ref TEXT,
  last_valuation_date TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PEER RECEIVABLES (Informal advances to friends)
CREATE TABLE IF NOT EXISTS public.peer_receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date_given TEXT NOT NULL,
  date_key TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
  payment_method TEXT DEFAULT 'HDFC Bank UPI',
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  settled_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('due_alert', 'loan_payment', 'repayment_due', 'security', 'system')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('high', 'medium', 'info')),
  read BOOLEAN DEFAULT FALSE,
  action_tab TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 12. RLS POLICIES (Users manage their own data)
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own payables" ON public.payables FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own payables" ON public.payables FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own payables" ON public.payables FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own payables" ON public.payables FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own borrowers" ON public.borrowers FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own borrowers" ON public.borrowers FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own borrowers" ON public.borrowers FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own borrowers" ON public.borrowers FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own assets" ON public.assets FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own peer_receivables" ON public.peer_receivables FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own peer_receivables" ON public.peer_receivables FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own peer_receivables" ON public.peer_receivables FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own peer_receivables" ON public.peer_receivables FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- 13. STORAGE BUCKET FOR CAMERA RECEIPTS & PROMISSORY DOCUMENTS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Public read receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');
