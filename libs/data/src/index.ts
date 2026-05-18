// Supabase client
export { getSupabaseClient } from './lib/supabase/client.js';

// Database types
export type { Database } from './lib/supabase/database.types.js';

// Storage adapter
export { SupabaseImageUploader } from './lib/supabase/storage.js';

// Repository implementations
export { SupabaseConversionRepository } from './lib/repositories/conversion.repository.js';
export { SupabaseGenerationJobRepository } from './lib/repositories/generation-job.repository.js';
export { SupabaseProductRepository } from './lib/repositories/product.repository.js';
export { SupabaseEventsRepository } from './lib/repositories/events.repository.js';
export type { EventType, ProductStats, HotspotStat } from './lib/repositories/events.repository.js';
export { SupabaseEmbedViewsRepository } from './lib/repositories/embed-views.repository.js';
export type { EmbedDomainStat } from './lib/repositories/embed-views.repository.js';

// Demo seed data
export { DEMO_PRODUCT_FAILED, DEMO_PRODUCT_SUCCESS, DEMO_PRODUCT_WARNING } from './lib/demo/demo-products.js';
