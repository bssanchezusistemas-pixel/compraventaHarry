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

/** Escala y encuadre según dispositivo y fase de la animación (llanta vs logo) */
function getFrameLayout(
  viewportW: number,
  viewportH: number,
  imgW: number,
  imgH: number,
  frameIndex: number
) {
  const frameT = frameIndex / Math.max(FRAME_COUNT - 1, 1);
  const coverScale = Math.max(viewportW / imgW, viewportH / imgH);
  const containScale = Math.min(viewportW / imgW, viewportH / imgH);
  const isPortrait = viewportH > viewportW * 1.05;

  let scale = coverScale;
  let focusX = 0.5;
  let focusY = 0.5;

  if (isPortrait) {
    const logoPhase = Math.min(Math.max((frameT - 0.65) / 0.35, 0), 1);
    const smokePhase = Math.min(Math.max((frameT - 0.12) / 0.55, 0), 1) * (1 - logoPhase);

    scale = coverScale * (1 - logoPhase) + containScale * logoPhase;
    focusX = 0.5 + smokePhase * 0.08 - logoPhase * 0;
    focusY = 0.5;
  } else {
    const logoPhase = Math.min(Math.max((frameT - 0.72) / 0.28, 0), 1);
    scale = coverScale * (1 - logoPhase * 0.35) + containScale * (logoPhase * 0.35);
  }

  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const x = viewportW * focusX - drawW * focusX;
  const y = viewportH * focusY - drawH * focusY;

  return { drawW, drawH, x, y };
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

    const pin = pinRef.current;
    const w = pin?.clientWidth || canvas.clientWidth;
    const h = pin?.clientHeight || canvas.clientHeight;
    if (w <= 0 || h <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { drawW, drawH, x, y } = getFrameLayout(
      w,
      h,
      img.naturalWidth,
      img.naturalHeight,
      clamped
    );

    ctx.drawImage(img, x, y, drawW, drawH);
  }, []);

  const getViewportSize = useCallback(() => {
    const pin = pinRef.current;
    if (pin) {
      return { w: pin.clientWidth, h: pin.clientHeight };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w, h } = getViewportSize();
    if (w <= 0 || h <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const lastFrame = currentFrameRef.current;
    currentFrameRef.current = -1;
    if (lastFrame >= 0) {
      drawFrame(lastFrame);
    }
  }, [drawFrame, getViewportSize]);

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
