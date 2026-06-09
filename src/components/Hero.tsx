"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const smokeRef1 = useRef<HTMLDivElement>(null);
  const smokeRef2 = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Stagger reveal on mount & scroll interactions
  useGSAP(
    () => {
      // 1. Initial Reveal Timeline
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Reset initial states to avoid flashes
      gsap.set(".char-1", { yPercent: 110 });
      gsap.set(".char-2", { yPercent: 110 });
      gsap.set(".brand-sub", { opacity: 0, y: 15 });
      gsap.set(".brand-desc", { opacity: 0, y: 15 });
      gsap.set(".brand-logo-svg", { opacity: 0, scale: 0.8, rotate: -45 });
      gsap.set(".brand-flag-line", { scaleX: 0 });
      gsap.set(".cta-btn", { opacity: 0, y: 20 });
      gsap.set(".smoke-cloud", { opacity: 0 });

      // Animate Subtitle
      tl.to(".brand-sub", { opacity: 1, y: 0, duration: 0.8 })
        
        // Stagger COMPRAVENTA letters
        .to(".char-1", { yPercent: 0, duration: 0.7, stagger: 0.04 }, "-=0.5")
        
        // Slide in & rotate logo tire icon
        .to(".brand-logo-svg", { opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(1.7)" }, "-=0.8")
        
        // Stagger HARRY letters
        .to(".char-2", { yPercent: 0, duration: 0.8, stagger: 0.06 }, "-=0.6")
        
        // Expand checkered flag lines
        .to(".brand-flag-line", { scaleX: 1, duration: 0.8, stagger: 0.1 }, "-=0.6")
        
        // Fade in description text
        .to(".brand-desc", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        
        // Stagger CTAs in
        .to(".cta-btn", { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.6")
        
        // Fade in smoke clouds softly
        .to(".smoke-cloud", { opacity: 0.35, duration: 1.5, stagger: 0.3 }, "-=1");

      // 2. ScrollTrigger Scroll Animations
      // Video Wrapper Rotation, scale & scroll effects
      gsap.to(videoWrapperRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        rotate: 15,
        scale: 1.08,
        ease: "none",
      });

      // Video tag specific slower rotation (double parallax rotate)
      if (videoRef.current) {
        gsap.to(videoRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          yPercent: 12,
          ease: "none",
        });
      }

      // Parallax movement for right-side text container
      gsap.to(textContainerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        yPercent: -15,
        ease: "none",
      });

      // Dissipate/fade out smoke on scroll
      gsap.to(".smoke-cloud", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "50% top",
          scrub: true,
        },
        opacity: 0,
        y: -50,
        scale: 1.2,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  // Trigger video autoplay backup on hydration
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log("Autoplay prevented; user interaction might be required.");
      });
    }
  }, []);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // In demo route, we might not have these sections, so log it
      console.log(`Scroll to: #${id}`);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden flex flex-col lg:flex-row select-none"
    >
      {/* BACKGROUND DECORATIVE RACING LINES */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10">
        <div className="w-full h-full bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff)] bg-[size:30px_30px] bg-[position:0_0,15px_15px]"></div>
      </div>

      {/* LEFT SIDE: VIDEO SECTION (FULL SCREEN ON MOBILE, 58% ON DESKTOP) */}
      <div className="absolute inset-0 lg:relative lg:w-[58%] lg:h-full z-0 overflow-hidden bg-black border-r border-zinc-900/60">
        {/* Loading Spinner Skeleton */}
        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="text-zinc-600 text-xs tracking-wider uppercase font-semibold">Harry</div>
            </div>
          </div>
        )}

        {/* Video Wrapper (Applies rotation + scale on scroll) */}
        <div
          ref={videoWrapperRef}
          className="w-full h-full relative origin-center scale-[1.01] will-change-transform"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover pointer-events-none brightness-[0.75] lg:brightness-[0.85]"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoaded}
          >
            <source src="/hero1.mp4" type="video/mp4" />
          </video>

          {/* Luxury overlays for rich dark-theme aesthetics */}
          {/* Subtle radial light highlight on the wheel */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_60%)] pointer-events-none"></div>

          {/* Left-edge gradient mask */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/10 to-transparent lg:to-black/40 pointer-events-none"></div>

          {/* Bottom/Top vignette for mobile stacked view */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 lg:bg-none pointer-events-none"></div>
        </div>

        {/* COMPONENT: FADING SMOKE EFFECTS */}
        {/* Smoke Cloud 1 */}
        <div
          ref={smokeRef1}
          className="smoke-cloud absolute bottom-[15%] left-[10%] w-[350px] h-[350px] rounded-full bg-zinc-700/10 blur-[90px] pointer-events-none mix-blend-screen will-change-transform z-10"
        ></div>
        {/* Smoke Cloud 2 (Red tinted brake dust/tire smoke) */}
        <div
          ref={smokeRef2}
          className="smoke-cloud absolute top-[25%] left-[30%] w-[300px] h-[300px] rounded-full bg-red-900/10 blur-[85px] pointer-events-none mix-blend-screen will-change-transform z-10"
        ></div>
      </div>

      {/* RIGHT SIDE: BRAND CONTENT & CTAs */}
      <div className="relative z-10 w-full h-full lg:w-[42%] flex flex-col justify-center items-center lg:items-start px-6 sm:px-12 lg:px-16 bg-gradient-to-t from-black via-black/90 to-transparent lg:bg-none lg:bg-[#030303] border-t lg:border-t-0 border-zinc-900/40">
        
        {/* Dynamic Glow Spotlight behind text */}
        <div className="absolute -right-24 top-1/4 w-[350px] h-[350px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none hidden lg:block"></div>

        <div ref={textContainerRef} className="w-full max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left will-change-transform">
          {/* Subtle Subtitle */}
          <span className="brand-sub inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-5 relative">
            Luxury Automotive Dealership
            <span className="absolute -bottom-1 left-0 w-8 h-[2px] bg-red-600"></span>
          </span>

          {/* Main Logo Composition */}
          <div className="flex flex-col items-center lg:items-start mb-6">
            
            {/* Word 1: COMPRAVENTA with tire wheel logo */}
            <div className="flex items-center gap-3">
              {/* Premium Tire/Track Vector SVG */}
              <svg
                className="brand-logo-svg w-8 h-8 sm:w-11 sm:h-11 text-white flex-shrink-0 select-none"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Tire Tread Pattern */}
                <path
                  d="M15 50C15 30.67 30.67 15 50 15C53.31 15 56.5 15.46 59.54 16.32"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M23 35C28.2 25.4 38.3 19 50 19"
                  stroke="#DC2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M17 50C17 68.2 31.8 83 50 83C68.2 83 83 68.2 83 50C83 31.8 68.2 17 50 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />
                {/* Checkered dynamic center */}
                <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#DC2626" />
                <path d="M35 50H65M50 35V65" stroke="currentColor" strokeWidth="2" />
              </svg>

              <h1 className="text-3xl sm:text-5xl lg:text-[2.7rem] xl:text-5xl font-extrabold tracking-wider text-white select-none leading-none overflow-hidden flex uppercase">
                {Array.from("COMPRAVENTA").map((char, i) => (
                  <span key={i} className="char-1 inline-block will-change-transform">
                    {char}
                  </span>
                ))}
              </h1>
            </div>

            {/* Word 2: HARRY with Checkered Stripes */}
            <div className="flex items-center gap-3 mt-2 sm:mt-3">
              {/* Left Checkered Flag Line */}
              <svg
                className="brand-flag-line brand-flag-left w-10 sm:w-16 h-2 text-red-600/60 origin-right hidden sm:block"
                viewBox="0 0 100 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="fadeL" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="1" />
                  </linearGradient>
                  <pattern id="checkersL" width="10" height="10" patternUnits="userSpaceOnUse">
                    <rect width="5" height="5" fill="url(#fadeL)" />
                    <rect x="5" y="5" width="5" height="5" fill="url(#fadeL)" />
                  </pattern>
                </defs>
                <rect width="100" height="10" fill="url(#checkersL)" />
              </svg>

              <h2 className="text-4xl sm:text-6xl lg:text-[3.8rem] xl:text-6xl font-black italic text-red-600 leading-none overflow-hidden flex uppercase tracking-tight">
                {Array.from("HARRY").map((char, i) => (
                  <span key={i} className="char-2 inline-block will-change-transform">
                    {char}
                  </span>
                ))}
              </h2>

              {/* Right Checkered Flag Line */}
              <svg
                className="brand-flag-line brand-flag-right w-10 sm:w-16 h-2 text-red-600/60 origin-left hidden sm:block"
                viewBox="0 0 100 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="fadeR" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="1" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                  </linearGradient>
                  <pattern id="checkersR" width="10" height="10" patternUnits="userSpaceOnUse">
                    <rect width="5" height="5" fill="url(#fadeR)" />
                    <rect x="5" y="5" width="5" height="5" fill="url(#fadeR)" />
                  </pattern>
                </defs>
                <rect width="100" height="10" fill="url(#checkersR)" />
              </svg>
            </div>
          </div>

          {/* Brand Tagline */}
          <p className="brand-desc text-zinc-400 text-sm sm:text-base leading-relaxed mb-10 max-w-md lg:max-w-none">
            Conectamos tu pasión con el rendimiento extremo. Vehículos de alta gama, motos premium,
            cambio de divisas y trámites de confianza con el estándar de excelencia de Harry.
          </p>

          {/* CALL TO ACTIONS (Primary & Secondary Buttons) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Primary Button */}
            <button
              onClick={() => scrollToSection("catalogo")}
              className="cta-btn group relative px-8 py-4 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(220,38,38,0.45)] active:scale-95"
            >
              {/* Button inner glow overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              {/* Slide effect element */}
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Ver Inventario
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </button>

            {/* Secondary Button */}
            <button
              onClick={() => scrollToSection("contacto")}
              className="cta-btn group relative px-8 py-4 border border-zinc-800 hover:border-zinc-500 bg-transparent text-white font-bold text-xs uppercase tracking-widest rounded-sm overflow-hidden transition-all duration-300 active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-zinc-900/60 transform translateY-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Contactar
                <svg
                  className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Brand Scroll cue indicator (fades out with ScrollTrigger) */}
        <div
          className="smoke-cloud absolute bottom-6 left-1/2 lg:left-16 transform -translate-x-1/2 lg:translate-x-0 flex flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 pointer-events-none"
        >
          <span>Desliza para explorar</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-red-600 to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
