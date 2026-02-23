// src/config/key.js

import { createClient } from "@supabase/supabase-js";

/* 🔽 YOUR SUPABASE DETAILS */
const SUPABASE_URL = "https://dbodngvrlskqaqwejiey.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_MrENqYp4igVjaqe7O7N7KA_IWOoi45H";

/* ✅ Create Supabase client */
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
