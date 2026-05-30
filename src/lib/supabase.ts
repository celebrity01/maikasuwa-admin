import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * Singleton client — only use for client-side reads
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

/**
 * Create a fresh Supabase client for each API route request.
 * This prevents session state from leaking between concurrent requests.
 */
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ── Database types ──

export type SellerStatus = "pending" | "approved" | "rejected";

export interface SellerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  shop_name: string;
  shop_address: string;
  home_as_business: boolean;
  city: string;
  state: string;
  lga: string;
  landmark: string;
  shop_type: string;
  photo_url: string | null;
  status: SellerStatus;
  is_disabled: boolean;
  default_password_set: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  currency: string;
  condition: string;
  state: string;
  description: string;
  specs: Record<string, string>;
  negotiable: boolean;
  haggle_min: number;
  haggle_max: number;
  image_urls: string[];
  status: "active" | "paused" | "sold";
  views: number;
  created_at: string;
  updated_at: string;
}
