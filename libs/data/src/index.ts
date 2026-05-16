// Supabase client
export { getSupabaseClient } from './lib/supabase/client.js';

// Database types
export type { Database } from './lib/supabase/database.types.js';

// Storage adapter
export { SupabaseImageUploader } from './lib/supabase/storage.js';

// Repository implementations
export { SupabaseConversionRepository } from './lib/repositories/conversion.repository.js';
export { SupabaseProductRepository } from './lib/repositories/product.repository.js';
