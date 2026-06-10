"use client";

import { useRef, useLayoutEffect, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HomeHero.css";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const FRAME_END_PROGRESS = 0.9;
const LOGO_HOLD_PROGRESS = 0.96;
const FADE_START_PROGRESS = 0.96;

function frameSrc(index: number) {
  return `/hero-sequence/${String(index + 1).padStart(5, "0")}.png`;
}

/** object-fit: cover — llena viewport sin bandas negras */
function getFrameScale(
  viewportW: number,
  viewportH: number,
  imgW: number,
  imgH: number
) {
  return Math.max(viewportW / imgW, viewportH / imgH);
}

function snapToCatalog() {
  const catalog = document.getElementById("catalogo");
  if (!catalog) return;

  const target = catalog.getBoundingClientRect().top + window.scrollY;
  if (Math.abs(window.scrollY - target) > 8) {
    window.scrollTo({ top: target, behavior: "auto" });
  }
}

export default function HomeHero() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(-1);
  const [loaded, setLoaded] = useState(false);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;

    const clamped = Math.min(Math.max(Math.round(index), 0), FRAME_COUNT - 1);
    if (clamped === currentFrameRef.current) return;

    const img = frames[clamped];
    if (!img?.complete || !img.naturalWidth) return;

    currentFrameRef.current = clamped;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scale = getFrameScale(w, h, img.naturalWidth, img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (w - drawW) / 2;
    const y = (h - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const lastFrame = currentFrameRef.current;
    currentFrameRef.current = -1;
    if (lastFrame >= 0) {
      drawFrame(lastFrame);
    }
  }, [drawFrame]);

  useLayoutEffect(() => {
    if (!rootRef.current || !pinRef.current || !canvasRef.current) return;

    let cancelled = false;
    const frames: HTMLImageElement[] = new Array(FRAME_COUNT);

    const loadFrame = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(index);
        img.onload = () => {
          if (!cancelled) {
            frames[index] = img;
            if (index === 0) drawFrame(0);
          }
          resolve();
        };
        img.onerror = () => resolve();
      });

    const preload = async () => {
      await loadFrame(0);

      const batchSize = 24;
      for (let start = 1; start < FRAME_COUNT; start += batchSize) {
        if (cancelled) return;
        const end = Math.min(start + batchSize, FRAME_COUNT);
        await Promise.all(
          Array.from({ length: end - start }, (_, i) => loadFrame(start + i))
        );
      }

      if (!cancelled) {
        framesRef.current = frames;
        setLoaded(true);
        drawFrame(currentFrameRef.current >= 0 ? currentFrameRef.current : 0);
        ScrollTrigger.refresh();
      }
    };

    preload();
    resizeCanvas();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: "hero-sequence",
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
        onLeave: snapToCatalog,
        onUpdate: (self) => {
          const p = self.progress;
          const frameProgress = Math.min(p / FRAME_END_PROGRESS, 1);
          const frame = frameProgress * (FRAME_COUNT - 1);
          drawFrame(frame);

          if (cueRef.current) {
            cueRef.current.style.opacity = String(Math.max(0, 0.75 - p * 2.2));
          }

          if (overlayRef.current) {
            const fade =
              p <= LOGO_HOLD_PROGRESS
                ? 0
                : Math.min(1, (p - FADE_START_PROGRESS) / (1 - FADE_START_PROGRESS));
            overlayRef.current.style.opacity = String(fade);
          }
        },
      });
    }, rootRef);

    const onResize = () => {
      resizeCanvas();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ctx.revert();
    };
  }, [drawFrame, resizeCanvas]);

  return (
    <section ref={rootRef} className="home-hero" id="hero" aria-label="Hero">
      <div ref={pinRef} className="home-hero__pin">
        <div className="home-hero__media" aria-hidden="true">
          <canvas
            ref={canvasRef}
            className="home-hero__canvas"
            aria-label="Animación de llanta Compraventa Harry"
          />
        </div>

        {!loaded && (
          <div className="home-hero__loader" aria-hidden="true">
            <span className="home-hero__loader-bar" />
          </div>
        )}

        <div ref={overlayRef} className="home-hero__fade" aria-hidden="true" />

        <div ref={cueRef} className="hero-scroll-cue home-hero__cue" aria-hidden="true">
          <span>Desliza hacia abajo</span>
          <div className="hero-scroll-arrow" />
        </div>
      </div>
    </section>
  );
}
