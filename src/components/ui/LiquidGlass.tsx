"use client";

import React, { useEffect, useRef } from "react";

/**
 * React Bits Inspired Liquid-Glass (GlassSurface) Component & Global Specular Controller
 * Provides SVG chromatic displacement refraction, frosted backdrop saturation,
 * prismatic inner rim highlights, and cursor-tracking liquid glare across all pages.
 */
export function LiquidGlassProvider() {
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest(
        ".rb-liquid-glass, .rb-liquid-glass-dark, .rb-glass-card, .luxury-glass-card, .luxury-glass-nav, main .bg-white.rounded-2xl, main .bg-white.rounded-xl"
      ) as HTMLElement | null;
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--rb-mouse-x", `${x}px`);
        card.style.setProperty("--rb-mouse-y", `${y}px`);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <svg
      className="pointer-events-none fixed inset-0 w-0 h-0 opacity-0"
      aria-hidden="true"
    >
      <defs>
        {/* React Bits GlassSurface Displacement & Specular Filter */}
        <filter
          id="react-bits-liquid-distortion"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.015"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="smoothedNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothedNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

interface GlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "prism";
  as?: "div" | "section" | "header";
}

export function GlassSurface({
  children,
  className = "",
  variant = "light",
  as: Tag = "div",
}: GlassSurfaceProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--rb-mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--rb-mouse-y", `${e.clientY - rect.top}px`);
  };

  const baseClass =
    variant === "dark"
      ? "rb-liquid-glass-dark"
      : variant === "prism"
      ? "rb-liquid-glass rb-liquid-prism"
      : "rb-liquid-glass";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseMove={handleMouseMove}
      className={`${baseClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
