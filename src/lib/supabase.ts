import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Load values from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For local testing/fallback if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing. Realtime and database features will be inactive until configured.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
