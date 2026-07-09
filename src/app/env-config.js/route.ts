import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET() {
  const { url, key } = getSupabaseConfig();
  const body = `window.__SUPABASE_URL=${JSON.stringify(url)};window.__SUPABASE_ANON_KEY=${JSON.stringify(key)};`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store",
    },
  });
}
