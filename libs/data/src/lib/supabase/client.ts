import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

let _client: SupabaseClient<Database> | null = null;

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey);
}

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient<Database> {
  if (!_client) {
    _client = createClient<Database>(url, anonKey);
  }
  return _client;
}
