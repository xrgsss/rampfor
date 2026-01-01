
import { createClient } from '@supabase/supabase-js';

// Ganti URL dan KEY ini dengan yang ada di dashboard Supabase Anda
const supabaseUrl = process.env.SUPABASE_URL || 'https://diuakjdzujyjdyyissjf.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_bgSXu1OL4QDHUlA7egv7Pw_ZuDR0V9a';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
