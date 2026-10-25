"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute, ROLE_LABELS } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, permissions, isAuthenticated, isHydrated, switchUserByRole } =
    useAuth();

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/showroom");

  useEffect(() => {
    if (isHydrated && !isPublicRoute && !isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`
      );
    }
  }, [isHydrated, isPublicRoute, isAuthenticated, pathname, router]);

  // Render standalone layout for public dealership landing page (/ and /showroom) and /login
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Gate staff routes until authenticated
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#000d10] flex flex-col items-center justify-center gap-3 text-[#ffffff] p-6 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#ffffff]/30 border-t-[#ffffff] animate-spin" />
        <p className="text-[18px] font-bold">
          {!isHydrated
            ? "Loading Vehisoft® Dealership OS..."
            : "Redirecting to Staff Portal Login..."}
        </p>
      </div>
    );
  }

  const accessCheck = canAccessRoute(pathname, permissions);

  return (
    <div className="system-portal-shell h-screen overflow-hidden flex bg-[#0f1011] text-[#ffffff] relative font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-[#090a0b] text-[#ffffff]">
          <main className="system-shell-main p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
            {accessCheck.allowed ? (
              children
            ) : (
              <div className="max-w-xl mx-auto my-12 bg-[#0f1011] rounded-[16px] border border-white/10 p-6 sm:p-8 space-y-5">
                <div className="w-12 h-12 rounded-[10px] bg-[#847dff]/15 border border-[#847dff]/30 text-[#847dff] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-[#847dff]/20 text-[#847dff] border border-[#847dff]/30">
                    403 · Access Restricted
                  </span>
                  <h1 className="text-xl font-serif font-light text-white mt-3">
                    Insufficient Permissions for This Module
                  </h1>
                  <p className="text-sm text-white/60 mt-1 leading-relaxed">
                    You are currently signed in as{" "}
                    <strong className="text-white">{user.name}</strong> with the{" "}
                    <strong className="text-white">{ROLE_LABELS[user.role]}</strong> role. Accessing{" "}
                    <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono text-[#00b3dd]">
                      {pathname}
                    </code>{" "}
                    requires:{" "}
                    <strong className="text-white">{accessCheck.requiredPermissionLabel}</strong>.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-white text-black hover:bg-white/90 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => switchUserByRole("ADMIN")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-white/20 hover:border-white text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Switch to Owner / Admin Role</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
