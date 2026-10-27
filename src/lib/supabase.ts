import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Primary credentials for Clash Zone project (wcdcnqyhvbdarzzhrkft)
const DEFAULT_URL = 'https://wcdcnqyhvbdarzzhrkft.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZGNucXlodmJkYXJ6emhya2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTEwODIsImV4cCI6MjEwODY2NzA4Mn0.jEYZTdEfmA3ex_TPFRJrAyHYmIaUo3pcPCXsCXogLCw';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Strictly block and override legacy WarZone project credentials
const isLegacyWarzone = rawUrl.includes('xfwhscaytmaohppadbpy');

const supabaseUrl = !rawUrl || isLegacyWarzone ? DEFAULT_URL : rawUrl;
const supabaseAnonKey = !rawKey || isLegacyWarzone ? DEFAULT_ANON_KEY : rawKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
