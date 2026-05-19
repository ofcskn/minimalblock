export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ConversionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected';

export type ProviderId = 'meshy' | 'tripo' | 'gemini' | 'mock';

export type GenerationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

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
          slug: string | null;
          hotspots: Json;
          ai_insights: Json | null;
          hotspots_suggested: Json;
          hotspots_suggested_at: string | null;
          workflow_status: string;
          input_method: string;
          import_data: Json | null;
          brand_placement: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          category: string;
          owner_id: string;
          slug?: string | null;
          hotspots?: Json;
          ai_insights?: Json | null;
          hotspots_suggested?: Json;
          hotspots_suggested_at?: string | null;
          workflow_status?: string;
          input_method?: string;
          import_data?: Json | null;
          brand_placement?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          owner_id?: string;
          slug?: string | null;
          hotspots?: Json;
          ai_insights?: Json | null;
          hotspots_suggested?: Json;
          hotspots_suggested_at?: string | null;
          workflow_status?: string;
          input_method?: string;
          import_data?: Json | null;
          brand_placement?: Json | null;
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
          source_asset_url: string | null;
          source_asset_key: string | null;
          source_asset_mime: string | null;
          source_asset_size: number | null;
          output_asset_url: string | null;
          output_asset_key: string | null;
          output_asset_mime: string | null;
          output_asset_size: number | null;
          status: ConversionStatus;
          error_message: string | null;
          provider: ProviderId | null;
          output_storage_key: string | null;
          quality_score: number | null;
          quality_report: Json | null;
          approved_at: string | null;
          approved_by: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          product_id: string;
          owner_id: string;
          source_asset_url?: string | null;
          source_asset_key?: string | null;
          source_asset_mime?: string | null;
          source_asset_size?: number | null;
          output_asset_url?: string | null;
          output_asset_key?: string | null;
          output_asset_mime?: string | null;
          output_asset_size?: number | null;
          status?: ConversionStatus;
          error_message?: string | null;
          provider?: ProviderId | null;
          output_storage_key?: string | null;
          quality_score?: number | null;
          quality_report?: Json | null;
          approved_at?: string | null;
          approved_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          owner_id?: string;
          source_asset_url?: string | null;
          source_asset_key?: string | null;
          source_asset_mime?: string | null;
          source_asset_size?: number | null;
          output_asset_url?: string | null;
          output_asset_key?: string | null;
          output_asset_mime?: string | null;
          output_asset_size?: number | null;
          status?: ConversionStatus;
          error_message?: string | null;
          provider?: ProviderId | null;
          output_storage_key?: string | null;
          quality_score?: number | null;
          quality_report?: Json | null;
          approved_at?: string | null;
          approved_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generation_jobs: {
        Row: {
          id: string;
          conversion_id: string;
          owner_id: string;
          provider: ProviderId;
          provider_job_id: string | null;
          status: GenerationJobStatus;
          attempt: number;
          cost_credits: number | null;
          error_message: string | null;
          request_payload: Json | null;
          response_payload: Json | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversion_id: string;
          owner_id: string;
          provider: ProviderId;
          provider_job_id?: string | null;
          status?: GenerationJobStatus;
          attempt?: number;
          cost_credits?: number | null;
          error_message?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversion_id?: string;
          owner_id?: string;
          provider?: ProviderId;
          provider_job_id?: string | null;
          status?: GenerationJobStatus;
          attempt?: number;
          cost_credits?: number | null;
          error_message?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversion_source_assets: {
        Row: {
          id: string;
          conversion_id: string;
          owner_id: string;
          url: string;
          storage_key: string;
          mime: string;
          size_bytes: number;
          ordinal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversion_id: string;
          owner_id: string;
          url: string;
          storage_key: string;
          mime: string;
          size_bytes: number;
          ordinal?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversion_id?: string;
          owner_id?: string;
          url?: string;
          storage_key?: string;
          mime?: string;
          size_bytes?: number;
          ordinal?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          product_id: string;
          owner_id: string;
          event_type: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          owner_id: string;
          event_type: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          owner_id?: string;
          event_type?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      embed_views: {
        Row: {
          id: string;
          product_id: string;
          referrer: string | null;
          domain: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          referrer?: string | null;
          domain?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          referrer?: string | null;
          domain?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          website: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name?: string;
          description?: string;
          website?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string;
          website?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      brand_logos: {
        Row: {
          id: string;
          brand_id: string;
          owner_id: string;
          storage_key: string;
          public_url: string;
          name: string;
          ordinal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          owner_id: string;
          storage_key: string;
          public_url: string;
          name?: string;
          ordinal?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          owner_id?: string;
          storage_key?: string;
          public_url?: string;
          name?: string;
          ordinal?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      brand_colors: {
        Row: {
          id: string;
          brand_id: string;
          owner_id: string;
          hex: string;
          name: string;
          ordinal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          owner_id: string;
          hex: string;
          name?: string;
          ordinal?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          owner_id?: string;
          hex?: string;
          name?: string;
          ordinal?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_stats_for_owner: {
        Args: { p_owner_id: string };
        Returns: { product_id: string; event_type: string; event_count: number }[];
      };
      get_hotspot_stats_for_owner: {
        Args: { p_owner_id: string };
        Returns: { product_id: string; hotspot_label: string; click_count: number }[];
      };
      get_avg_session_duration: {
        Args: { p_owner_id: string };
        Returns: { product_id: string; avg_duration_ms: number }[];
      };
      get_embed_domains_for_owner: {
        Args: { p_owner_id: string; p_limit?: number };
        Returns: { domain: string; view_count: number }[];
      };
    };
    Enums: {
      conversion_status: ConversionStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
