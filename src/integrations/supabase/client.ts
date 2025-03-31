
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rtmmqihdyjomyoemakkt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bW1xaWhkeWpvbXlvZW1ha2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NjQxMTcsImV4cCI6MjA1OTA0MDExN30.EFEgxTAsp1PLGbgj3cat5HUamTk5H_9JhQTktXNRAbg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
