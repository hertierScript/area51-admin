import { createClient } from "@supabase/supabase-js";

// Admin client with service role key - use only on server side
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate environment variables
  if (!supabaseUrl || supabaseUrl.trim() === "") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
        "Please set it in your .env.local file or deployment platform.",
    );
  }

  if (!serviceRoleKey || serviceRoleKey.trim() === "") {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "Please set it in your .env.local file or deployment platform.",
    );
  }

  // Debug logging to diagnose API key issues
  console.log("[DEBUG] Supabase URL configured:", supabaseUrl ? "YES" : "NO");
  console.log(
    "[DEBUG] Service role key configured:",
    serviceRoleKey ? "YES" : "NO",
  );
  console.log(
    "[DEBUG] Service role key starts with:",
    serviceRoleKey?.substring(0, 20) + "...",
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
