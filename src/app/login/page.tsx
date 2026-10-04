"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, UserRole } from "@/lib/auth";

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
    <div className="min-h-screen hyer-sky-hero text-[#000d10] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="max-w-[1200px] w-full mx-auto px-6 sm:px-8 pt-[23px] flex items-center justify-between">
        <Link href="/" className="hyer-nav-link inline-flex items-center gap-[11px]">
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
          <span>Back to Showroom</span>
        </Link>
        <span className="text-[17px] font-bold text-[#000d10]">
          Vehisoft® Dealership OS
        </span>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-8 py-[52px] grid grid-cols-1 lg:grid-cols-12 gap-[52px] items-start">
        {/* Left: Monumental Wordmark & Editorial Statement */}
        <div className="lg:col-span-6">
          <h1 className="hyer-wordmark">
            Vehisoft
            <sup className="text-[0.28em] font-bold align-super ml-1">®</sup>
          </h1>
          <h2 className="hyer-display text-[#000d10] mt-[23px]">
            Staff
            <br />
            Portal.
          </h2>
          <p className="hyer-body text-[#000d10] mt-[22px] max-w-[440px]">
            Sign in to access the Dealership Performance Dashboard, Live
            Inventory, CRM Pipeline, and 24/7 AI Sales Agent controls.
          </p>

          {/* Featured Clay Card for Admin Credentials (#bc7155, 0px radius) */}
          <div className="mt-[38px] bg-[#bc7155] text-[#ffffff] p-[34px]">
            <span className="text-[17px] font-bold block">
              Executive Admin Credentials
            </span>
            <p className="hyer-body text-[#ffffff] mt-[8px]">
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
              className="mt-[17px] hyer-pill-ghost-white !py-[11px] !px-[21px]"
            >
              Auto-Fill Credentials
            </button>
          </div>
        </div>

        {/* Right: Hard-Edged White Login Panel (0px radius, hairline dividers) */}
        <div className="lg:col-span-6 bg-[#ffffff] p-[38px] sm:p-[53px] border-t border-[#000d10]">
          <h3 className="hyer-heading text-[#000d10] mb-[31px]">
            Sign In.
          </h3>

          <form onSubmit={handleSubmit} className="space-y-[23px]">
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pb-[11px] text-[18px] border-b border-[#000d10] bg-transparent text-[#000d10] focus:outline-none rounded-none"
                placeholder="versalylabs@gmail.com"
              />
            </div>

            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pb-[11px] pr-10 text-[18px] border-b border-[#000d10] bg-transparent text-[#000d10] focus:outline-none rounded-none"
                  placeholder="labversaly-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 bottom-[11px] text-[#8e8e95] hover:text-[#000d10]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-[16px] border border-[#000d10] text-[17px] text-[#000d10] font-bold">
                {error}
              </div>
            )}

            <div className="pt-[11px]">
              <button type="submit" className="hyer-pill-dark w-full">
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* One-Click Role Sign-In (RBAC Preview) */}
          <div className="mt-[52px] pt-[31px] border-t border-[#d5d3d4]">
            <span className="text-[17px] font-bold text-[#000d10] block mb-[21px]">
              One-Click Role Sign-In (RBAC Preview)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[21px]">
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
                    className="text-left border-t border-[#d5d3d4] pt-[15px] hover:border-[#000d10] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[18px] font-bold text-[#000d10]">
                        {ROLE_LABELS[role]}
                      </span>
                      <span className="text-[14px] text-[#8e8e95]">
                        {account?.email === "versalylabs@gmail.com"
                          ? "versalylabs"
                          : account?.name.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-[15px] text-[#8e8e95] mt-[6px] line-clamp-2">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Terminal */}
      <footer className="bg-[#000d10] text-[#ffffff] py-[23px] px-6 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between text-[17px] text-[#8e8e95]">
          <span>Vehisoft® Dealership Management System</span>
          <span>Currency: KSh.</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center text-[#000d10] text-[18px] font-bold">
          Loading Staff Portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
