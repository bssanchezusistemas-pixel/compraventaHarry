"use client";

import Script from "next/script";
import * as supabaseJs from "@supabase/supabase-js";

// legacy-app.js espera `window.supabase.createClient` y las credenciales en
// globals. Reutilizamos el paquete npm ya presente en el bundle (evita la
// descarga duplicada desde CDN) y las env vars públicas inyectadas en build.
if (typeof window !== "undefined") {
  const w = window as unknown as Record<string, unknown>;
  w.supabase = supabaseJs;
  w.__SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  w.__SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
}

function dispatchDomContentLoadedIfReady() {
  if (document.readyState !== "loading") {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }
}

export default function LegacyHomeScripts() {
  return (
    <Script
      src="/legacy-app.js"
      strategy="afterInteractive"
      onLoad={dispatchDomContentLoadedIfReady}
    />
  );
}
