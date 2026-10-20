/**
 * Utility to proxy and optimize Supabase Storage images through Vercel's Edge CDN.
 *
 * Why this solves Supabase quota exhaustion:
 * 1. Supabase free tier only allows 5 GB of Cached Egress per month.
 * 2. Uncompressed 3-4 MB images downloaded directly from Supabase deplete 5 GB in ~70 visits.
 * 3. Routing through Vercel Image Optimization (/_next/image?url=...&w=...&q=...):
 *    - Automatically resizes and converts images to WebP/AVIF (dropping file size by ~95-99% to ~35-45 KB).
 *    - Vercel caches the result globally at the edge (Cache-Control: 30 days).
 *    - Second and subsequent visits hit Vercel Edge CDN (x-vercel-cache: HIT) with 0 bytes billed to Supabase.
 *    - Vercel includes 100 GB/month of CDN bandwidth on the free tier.
 */

export function getCdnImageUrl(
  url: string | null | undefined,
  width: number = 640,
  quality: number = 75
): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();

  // Ignore data URLs, blobs, or already relative URLs
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Already transformed through Next.js image proxy
  if (trimmed.startsWith("/_next/image")) {
    return trimmed;
  }

  // Detect Supabase public storage URLs
  if (trimmed.includes(".supabase.co/storage/v1/object/public/")) {
    return `/_next/image?url=${encodeURIComponent(trimmed)}&w=${width}&q=${quality}`;
  }

  return trimmed;
}
