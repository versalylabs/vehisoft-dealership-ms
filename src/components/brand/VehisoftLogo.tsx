import React from "react";
import Link from "next/link";

interface VehisoftLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light"; // dark = dark emblem for light bg; light = light/white emblem for dark bg
  subtitle?: string;
  href?: string;
}

/**
 * Vehisoft Emblem: An aerodynamic automotive crest combining a precision-cut
 * luxury speed-V with a hypercar roofline silhouette and forward aero fins.
 */
export function VehisoftIcon({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Deep luxury shield gradient */}
        <linearGradient id="vhShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000d10" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#000d10" />
        </linearGradient>

        {/* Dynamic electric cyan/blue speed glow */}
        <linearGradient id="vhSpeedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Warm clay/gold accent on aerodynamic hood */}
        <linearGradient id="vhGoldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bc7155" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Subtle inner highlight */}
        <linearGradient id="vhBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Automotive Crest Outer Shape */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="18"
        fill="url(#vhShieldGrad)"
        stroke="url(#vhBorderGrad)"
        strokeWidth="1.5"
      />

      {/* Aerodynamic Speed V and Vehicle Silhouette */}
      {/* Front splitter / ground effect */}
      <path
        d="M16 46C24 48 40 48 48 46"
        stroke="url(#vhSpeedGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Main Aerodynamic V-Wing Canopy (Hypercar Silhouette) */}
      <path
        d="M12 28L24 16C29 14 35 14 40 16L52 28C48 31 43 32 32 32C21 32 16 31 12 28Z"
        fill="url(#vhSpeedGrad)"
        fillOpacity="0.18"
      />

      {/* Sharp Sculpted V Speed Lines */}
      <path
        d="M14 24L32 44L50 24"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Aerodynamic Canopy Windshield Curve */}
      <path
        d="M23 23C27 18 37 18 41 23L32 37L23 23Z"
        fill="url(#vhSpeedGrad)"
      />

      {/* Center Precision Hood Stagger / Gold Horizon Line */}
      <path
        d="M32 15V22"
        stroke="url(#vhGoldAccent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Headlight Apex Accents (Left & Right) */}
      <circle cx="17" cy="24" r="1.5" fill="#38bdf8" />
      <circle cx="47" cy="24" r="1.5" fill="#38bdf8" />
    </svg>
  );
}

export function VehisoftLogo({
  className = "",
  iconOnly = false,
  size = "md",
  theme = "dark",
  subtitle,
  href,
}: VehisoftLogoProps) {
  const iconPixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 52,
  };

  const textSizes = {
    sm: "text-[18px]",
    md: "text-[21px]",
    lg: "text-[26px]",
    xl: "text-[32px]",
  };

  const isLight = theme === "light";
  const textColor = isLight ? "text-white" : "text-[#000d10]";
  const subColor = isLight ? "text-slate-400" : "text-[#8e8e95]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <VehisoftIcon size={iconPixelSizes[size]} />

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight ${textSizes[size]} ${textColor} flex items-center leading-tight`}
          >
            <span>Vehisoft</span>
            <sup className="text-[0.45em] font-extrabold align-super ml-0.5 tracking-normal opacity-90">
              ®
            </sup>
          </span>
          {subtitle && (
            <span
              className={`text-[11px] sm:text-[12px] font-medium tracking-normal mt-0.5 ${subColor}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-95 transition-opacity inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
