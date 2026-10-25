"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, UserRole } from "@/lib/auth";
import { VehisoftIcon } from "@/components/brand/VehisoftLogo";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { users, loginWithEmail, switchUserByRole } = useAuth();
  const [email, setEmail] = useState("versalylabs@gmail.com");
  const [password, setPassword] = useState("labversaly-16");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = loginWithEmail(email, password);
    if (!ok) {
      setError(
        "Invalid credentials. Use 'versalylabs@gmail.com' with password 'labversaly-16' (or select a staff role below)."
      );
      return;
    }
    router.push(redirectTarget);
  };

  const handleQuickRoleSignIn = (role: UserRole) => {
    switchUserByRole(role);
    router.push(redirectTarget);
  };

  return (
    <div className="min-h-screen bg-[#0f1011] text-[#ffffff] flex flex-col justify-between selection:bg-[#847dff] selection:text-white">
      {/* Top Bar */}
      <header className="max-w-[1200px] w-full mx-auto px-6 sm:px-8 pt-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-[#9f9fa0] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
          <span>Back to Showroom</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <VehisoftIcon size={28} className="transition-transform group-hover:scale-105" />
          <span className="font-serif italic text-[18px] text-white">
            Vehisoft<sup className="text-[10px] ml-0.5 not-italic text-[#847dff]">®</sup>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Monumental Wordmark & Editorial Statement */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-3 mb-4">
            <VehisoftIcon size={40} className="shrink-0" />
            <span className="font-serif italic text-[36px] text-white">
              Vehisoft<sup className="text-[14px] ml-1 not-italic text-[#847dff]">®</sup>
            </span>
          </div>
          <h2 className="origin-display text-white">
            Staff <em>Portal</em>.
          </h2>
          <p className="origin-subheading text-[#9f9fa0] mt-4 max-w-[460px]">
            Sign in to access the Dealership Executive Dashboard, Live Inventory Controls, CRM Lead Pipeline, and 24/7 AI Sales Agent telemetry.
          </p>

          {/* Chromatic Featured Iris Card for Admin Credentials */}
          <div className="mt-8 rounded-[16px] bg-[#847dff] text-white p-7">
            <span className="text-[12px] font-mono tracking-widest uppercase block text-white/80">
              EXECUTIVE ADMIN CREDENTIALS
            </span>
            <p className="text-[15px] text-white mt-2 font-mono">
              Email: <strong>versalylabs@gmail.com</strong>
              <br />
              Password: <strong>labversaly-16</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("versalylabs@gmail.com");
                setPassword("labversaly-16");
                setError("");
              }}
              className="mt-4 px-4 py-2 rounded-[8px] bg-white text-black hover:opacity-90 text-[13px] font-sans font-medium transition-opacity cursor-pointer"
            >
              Auto-Fill Credentials
            </button>
          </div>
        </div>

        {/* Right: Elevated Graphite Card */}
        <div className="lg:col-span-6 origin-card-graphite p-8 sm:p-10">
          <h3 className="font-serif text-[24px] text-white mb-6">
            Sign In to OS
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#000000] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                placeholder="versalylabs@gmail.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#000000] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 pr-10 text-[14px] focus:outline-none focus:border-[#847dff]"
                  placeholder="labversaly-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9f9fa0] hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-[6px] bg-red-950/60 border border-red-500/40 text-[13px] text-red-200">
                {error}
              </div>
            )}

            <button type="submit" className="origin-btn-primary w-full !py-2.5 mt-2">
              <span>Sign In to Executive Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Role Sign-In */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase block mb-3">
              One-Click Role Sign-In (RBAC Preview)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  "ADMIN",
                  "MANAGER",
                  "SALESPERSON",
                  "INVENTORY_STAFF",
                ] as UserRole[]
              ).map((role) => {
                const account = users.find((u) => u.role === role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickRoleSignIn(role)}
                    className="p-3 rounded-[8px] bg-[#0f1011] hover:bg-[#3f4041] border border-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white group-hover:text-[#847dff]">
                        {ROLE_LABELS[role]}
                      </span>
                      <span className="text-[11px] font-mono text-[#00b3dd]">
                        {account?.name.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9f9fa0] mt-1 line-clamp-1">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#090a0b] border-t border-white/10 py-5 px-6 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between text-[13px] text-[#9f9fa0]">
          <span>Vehisoft® Dealership Management System</span>
          <span className="font-mono text-[#00b3dd]">Currency: KSh.</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center text-white text-[16px]">
          Loading Staff Portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
