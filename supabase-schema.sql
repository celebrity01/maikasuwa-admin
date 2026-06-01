-- KASUWA 2.0 — Supabase Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ═══════════════════════════════════════════════════
-- SELLER PROFILES TABLE
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  shop_address TEXT NOT NULL,
  home_as_business BOOLEAN DEFAULT false,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT DEFAULT '',
  landmark TEXT DEFAULT '',
  shop_type TEXT DEFAULT 'shop',
  photo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_disabled BOOLEAN DEFAULT false,
  default_password_set BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for registration)
CREATE POLICY "Allow public insert" ON public.seller_profiles
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read their own profile (by user_id or email)
CREATE POLICY "Users can read own profile" ON public.seller_profiles
  FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Allow authenticated sellers to update their own profile
CREATE POLICY "Sellers can update own profile" ON public.seller_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role full access (for admin API)
CREATE POLICY "Service role full access" ON public.seller_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════
-- PRODUCTS TABLE
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  condition TEXT DEFAULT 'Brand New',
  state TEXT DEFAULT '',
  description TEXT DEFAULT '',
  specs JSONB DEFAULT '{}',
  negotiable BOOLEAN DEFAULT true,
  haggle_min NUMERIC DEFAULT 0,
  haggle_max NUMERIC DEFAULT 0,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active products (for marketplace)
CREATE POLICY "Allow public read active" ON public.products
  FOR SELECT USING (status = 'active');

-- Allow sellers to insert their own products
CREATE POLICY "Sellers can insert products" ON public.products
  FOR INSERT WITH CHECK (true);

-- Allow sellers to update/delete their own products
CREATE POLICY "Sellers can update own products" ON public.products
  FOR UPDATE USING (seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Sellers can delete own products" ON public.products
  FOR DELETE USING (seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  ));

-- Allow service role full access
CREATE POLICY "Service role full access products" ON public.products
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_seller_profiles_status ON public.seller_profiles(status);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON public.seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- ═══════════════════════════════════════════════════
-- AUTO-UPDATE UPDATED_AT
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
