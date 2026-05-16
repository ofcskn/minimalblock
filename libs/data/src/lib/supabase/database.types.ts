export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ConversionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          category: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversions: {
        Row: {
          id: string;
          product_id: string;
          owner_id: string;
          source_asset_url: string;
          source_asset_key: string;
          source_asset_mime: string;
          source_asset_size: number;
          output_asset_url: string | null;
          output_asset_key: string | null;
          output_asset_mime: string | null;
          output_asset_size: number | null;
          status: ConversionStatus;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          product_id: string;
          owner_id: string;
          source_asset_url: string;
          source_asset_key: string;
          source_asset_mime: string;
          source_asset_size: number;
          output_asset_url?: string | null;
          output_asset_key?: string | null;
          output_asset_mime?: string | null;
          output_asset_size?: number | null;
          status?: ConversionStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          owner_id?: string;
          source_asset_url?: string;
          source_asset_key?: string;
          source_asset_mime?: string;
          source_asset_size?: number;
          output_asset_url?: string | null;
          output_asset_key?: string | null;
          output_asset_mime?: string | null;
          output_asset_size?: number | null;
          status?: ConversionStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      conversion_status: ConversionStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
