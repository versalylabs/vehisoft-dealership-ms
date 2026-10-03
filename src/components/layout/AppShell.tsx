"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300 text-sm font-medium">
        Redirecting to Staff Portal Login...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50 text-slate-900">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
