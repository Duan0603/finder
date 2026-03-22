// Supabase client — works on both local dev (via .env) and Lovable (hardcoded fallback)
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://foxnabdclolrxnmfqlws.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveG5hYmRjbG9scnhubWZxbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODg4ODksImV4cCI6MjA4OTc2NDg4OX0.vJ_Hh1p3XSvOw0J5CMqteS1zQmRbYj1wZAmoF-W6ixw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
