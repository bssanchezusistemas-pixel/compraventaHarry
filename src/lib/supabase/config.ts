// Valores de respaldo cuando las variables de entorno no están disponibles
// (p. ej. mal configuradas en Vercel). Son credenciales PÚBLICAS por diseño:
// la URL y la publishable/anon key se envían al navegador de cualquier visitante,
// y la seguridad real la imponen las políticas RLS en Supabase.
const FALLBACK_URL = "https://vfrmlqwjpiqtyxokawir.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_C-l5PIaF32zHqhQRMFXoAA_-zEyPnRJ";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || FALLBACK_ANON_KEY;
  return { url, key };
}
