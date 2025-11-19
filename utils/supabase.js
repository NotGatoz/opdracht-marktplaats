import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://inicfjsfdwcrpjjhhnzz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNmanNmZHdjcnBqamhobnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTg0MzcsImV4cCI6MjA3OTA5NDQzN30.046IUAd6DP_hfFRBrNrSkto3_riJuqeUxDCyjoI5a6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
