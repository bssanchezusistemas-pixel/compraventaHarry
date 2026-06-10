"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=180%",
          scrub: 1,
          pin: pinRef.current,
          anticipatePin: 1,
        },
      });

      // estado inicial (estable)
      gsap.set(brandRef.current, {
        opacity: 0,
        y: 30,
      });

      gsap.set(".hero-card", {
        opacity: 0,
        y: 40,
        scale: 0.95,
      });

      gsap.set(videoRef.current, {
        scale: 1,
      });

      // animación principal (scroll driven)
      tl.to(videoRef.current, {
        scale: 1.08,
        ease: "none",
      });

      tl.to(
        brandRef.current,
        {
          opacity: 1,
          y: 0,
          ease: "none",
        },
        0.1
      );

      tl.to(
        ".hero-card",
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          ease: "none",
        },
        0.25
      );

      tl.to(
        brandRef.current,
        {
          opacity: 0,
          y: -40,
          ease: "none",
        },
        0.8
      );

      tl.to(
        ".hero-card",
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
          stagger: 0.05,
          ease: "none",
        },
        0.8
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero">
      <div ref={pinRef} className="hero__pin">

        {/* VIDEO */}
        <video
          ref={videoRef}
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero1.mp4" type="video/mp4" />
        </video>

        {/* BRAND */}
        <div ref={brandRef} className="hero__brand">
          <div className="hero__title">COMPRAVENTA</div>
          <div className="hero__subtitle">HARRY</div>
        </div>

        {/* CARDS */}
        <div ref={cardsRef} className="hero__cards">
          <div className="hero-card">🏍️ Motos</div>
          <div className="hero-card">🚗 Carros</div>
          <div className="hero-card">💰 Divisas</div>
          <div className="hero-card">🔑 Alquiler</div>
        </div>

      </div>
    </section>
  );
}