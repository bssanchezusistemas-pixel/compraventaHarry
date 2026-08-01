import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const body = `window.__SUPABASE_URL=${JSON.stringify(url)};window.__SUPABASE_ANON_KEY=${JSON.stringify(key)};`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store",
    },
  });
}
