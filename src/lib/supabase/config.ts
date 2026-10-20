// Valores de respaldo para Supabase.
// Son credenciales públicas de solo lectura / anon key protegidas por RLS.
// Proyecto activo y operativo: vfrmlqwjpiqtyxokawir
const FALLBACK_URL = "https://vfrmlqwjpiqtyxokawir.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_C-l5PIaF32zHqhQRMFXoAA_-zEyPnRJ";

export function getSupabaseConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Si no hay variables configuradas o si apuntan al proyecto restringido por cuota (crvvcnzrwbxdzgifiblc),
  // usamos automáticamente el proyecto activo vfrmlqwjpiqtyxokawir.
  if (!url || url.includes("crvvcnzrwbxdzgifiblc")) {
    url = FALLBACK_URL;
    key = FALLBACK_ANON_KEY;
  }
  if (!key || key.includes("mJuWmV6WxWQgGVDvVPzevA")) {
    key = FALLBACK_ANON_KEY;
  }

  return { url, key };
}
