import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** List of admin email addresses (comma-separated in env, or fallback)
 *  These emails bypass the user_metadata.role check on login.
 */
export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS || 'admin@kasuwa.ng'
).split(',').map((e: string) => e.trim().toLowerCase());

/**
 * Check if an email belongs to an admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

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

/**
 * Create a Supabase client using the service_role key.
 * This bypasses ALL Row Level Security policies.
 * ONLY use in server-side admin API routes — never expose to the client.
 */
export function createAdminClient(): SupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations require this environment variable.');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verify that a request comes from an admin user.
 * Checks both the Bearer token validity AND admin role.
 * Returns the user if valid, or null otherwise.
 */
export async function verifyAdmin(req: Request): Promise<{ user: any; token: string } | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Check admin role: either via user_metadata.role OR via admin email list
  const role = user.user_metadata?.role;
  const email = user.email || '';
  if (role === 'admin' || isAdminEmail(email)) {
    return { user, token };
  }

  return null;
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
