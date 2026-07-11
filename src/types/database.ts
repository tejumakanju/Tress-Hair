/**
 * Supabase Database types.
 * Regenerate after schema changes:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          accepts_marketing: boolean;
          loyalty_points: number;
          store_credit_cents: number;
          referral_code: string | null;
          referred_by: string | null;
          is_blacklisted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          base_price_cents: number;
          status: string;
          badge: string | null;
          rating_avg: number;
          review_count: number;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          total_cents: number;
          status: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: {
      storefront_products: {
        Row: Record<string, unknown>;
        Relationships: [];
      };
    };
    Functions: {
      is_staff: { Args: { check_role?: string }; Returns: boolean };
      get_variant_stock: { Args: { variant_uuid: string }; Returns: number };
    };
    Enums: Record<string, never>;
  };
};
