/// <reference types="vite/client" />
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    const missing = [];
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

    if (missing.length > 0) {
        console.warn(`Supabase is not configured. Missing environment variables: ${missing.join(', ')}`);
        console.warn('The application will run in "Offline Mode" using local storage.');
    }
}

export { supabase };

/**
 * Returns true if Supabase is configured and available.
 */
export function isSupabaseConfigured(): boolean {
    return supabase !== null;
}
