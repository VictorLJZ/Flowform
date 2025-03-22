import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mmrovgonjnotmtzxbgss.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcm92Z29uam5vdG10enhiZ3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MDk0ODYsImV4cCI6MjA1ODE4NTQ4Nn0.Cy-mB-mhbcHO8UrBO7xCFnBYFzmNc05KaJanf5N3vV4';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 