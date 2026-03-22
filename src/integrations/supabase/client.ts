// Supabase client — works on both local dev (via .env) and Lovable (hardcoded fallback)
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://coonwfwqrfsvvyuuarfq.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb253ZndxcmZzdnZ5dXVhcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTU0MjQsImV4cCI6MjA4Nzc3MTQyNH0.EbiqlFMn4g292U0Q1nLwdnLWJ6VxjBw6_XyopOs74ZI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
