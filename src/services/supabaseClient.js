/**
 * Supabase Client Configuration
 * Uses import.meta.env.VITE_SUPABASE_URL and import.meta.env.VITE_SUPABASE_ANON_KEY.
 * No hardcoded keys or fallback values.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getMissingConfigMessage = () => {
  if (!supabaseUrl && !supabaseAnonKey) {
    return 'Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Please configure them in your environment or AI Studio Secrets.';
  }
  if (!supabaseUrl) {
    return 'Missing VITE_SUPABASE_URL. Please set VITE_SUPABASE_URL (e.g. in .env).';
  }
  if (!supabaseAnonKey) {
    return 'Missing VITE_SUPABASE_ANON_KEY. Please add VITE_SUPABASE_ANON_KEY in your AI Studio Secrets / env panel.';
  }
  return null;
};

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('[RootIQ] Failed to initialize Supabase client:', err);
  }
}

export const getSupabase = () => {
  const missing = getMissingConfigMessage();
  if (missing) {
    throw new Error(missing);
  }
  if (!client) {
    throw new Error('Supabase client is not initialized.');
  }
  return client;
};

export const supabase = client;
export default supabase;
