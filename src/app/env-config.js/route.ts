export async function GET() {
  const body = `window.__SUPABASE_URL=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || "")};window.__SUPABASE_ANON_KEY=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")};`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store",
    },
  });
}
