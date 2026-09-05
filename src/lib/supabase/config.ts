// Valores de respaldo cuando las variables de entorno no están disponibles
// (p. ej. mal configuradas en Vercel). Son credenciales PÚBLICAS por diseño:
// la URL y la publishable/anon key se envían al navegador de cualquier visitante,
// y la seguridad real la imponen las políticas RLS en Supabase.
const FALLBACK_URL = "https://crvvcnzrwbxdzgifiblc.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_mJuWmV6WxWQgGVDvVPzevA_3EzM82fa";

export function getSupabaseConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || url.includes("vfrmlqwjpiqtyxokawir")) {
    url = FALLBACK_URL;
    key = FALLBACK_ANON_KEY;
  }
  if (!key || key.includes("C-l5PIaF32zHqhQRMFXoAA")) {
    key = FALLBACK_ANON_KEY;
  }

  return { url, key };
}
