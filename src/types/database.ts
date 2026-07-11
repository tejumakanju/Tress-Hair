/**
 * Supabase Database types.
 * Regenerate after schema changes:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
    };
    Views: {
      storefront_products: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      is_staff: { Args: { check_role?: string }; Returns: boolean };
      get_variant_stock: { Args: { variant_uuid: string }; Returns: number };
    };
    Enums: Record<string, never>;
  };
};
