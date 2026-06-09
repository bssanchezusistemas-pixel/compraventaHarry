"use client";

import Script from "next/script";

function dispatchDomContentLoadedIfReady() {
  if (document.readyState !== "loading") {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }
}

export default function LegacyHomeScripts() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
        strategy="beforeInteractive"
      />
      <Script src="/env-config.js" strategy="beforeInteractive" />
      <Script
        src="/legacy-app.js"
        strategy="afterInteractive"
        onLoad={dispatchDomContentLoadedIfReady}
      />
    </>
  );
}
