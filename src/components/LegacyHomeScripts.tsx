"use client";

import Script from "next/script";
import * as supabaseJs from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

// legacy-app.js espera `window.supabase.createClient` y las credenciales en
// globals. Reutilizamos el paquete npm ya presente en el bundle (evita la
// descarga duplicada desde CDN) y las env vars públicas inyectadas en build.
if (typeof window !== "undefined") {
  const w = window as unknown as Record<string, unknown>;
  const { url, key } = getSupabaseConfig();
  w.supabase = supabaseJs;
  w.__SUPABASE_URL = url;
  w.__SUPABASE_ANON_KEY = key;
}

function dispatchDomContentLoadedIfReady() {
  if (document.readyState !== "loading") {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }
}

export default function LegacyHomeScripts() {
  return (
    <Script
      src="/legacy-app.js?v=20260905-3"
      strategy="afterInteractive"
      onLoad={dispatchDomContentLoadedIfReady}
    />
  );
}
