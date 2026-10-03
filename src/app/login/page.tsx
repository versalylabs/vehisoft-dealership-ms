"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Car,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient refraction orbs for React Bits Liquid-Glass */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[440px] h-[440px] rounded-full bg-emerald-500/20 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors rb-liquid-glass-dark px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Dealership Showroom</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 mb-4">
          <Car className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Staff & Dealership Admin Login
        </h1>
        <p className="mt-1.5 text-sm text-slate-300">
          Sign in to access the Dealership Dashboard, Inventory, CRM & AI Agent
          Controls
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="rb-liquid-glass py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Credentials Info Banner */}
          <div className="mb-6 p-3.5 rounded-xl rb-liquid-badge flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-blue-950">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold block">Admin Credentials:</span>
                <span>
                  Email: <strong>versalylabs@gmail.com</strong> • Password:{" "}
                  <strong>labversaly-16</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("versalylabs@gmail.com");
                setPassword("labversaly-16");
                setError("");
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="versalylabs@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/80 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="labversaly-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <span>Sign In to Staff Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Role Login Selector */}
          <div className="mt-7 pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                One-Click Role Sign-In (RBAC Preview)
              </span>
            </div>
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
                    className="text-left p-3 rounded-xl rb-liquid-badge hover:border-blue-500 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {ROLE_LABELS[role]}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-slate-600">
                        {account?.email === "versalylabs@gmail.com"
                          ? "versalylabs"
                          : account?.name.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
          Loading Login...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
