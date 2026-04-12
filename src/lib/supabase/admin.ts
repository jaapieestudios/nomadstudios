import { createClient } from "@supabase/supabase-js";

// Only use this in server-side route handlers or seed scripts.
// NEVER import this in client-side code.
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
