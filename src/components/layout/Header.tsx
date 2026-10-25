"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  Plus,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, UserRole } from "@/lib/auth";
import { VehisoftIcon } from "@/components/brand/VehisoftLogo";

export function Header({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  const { user, permissions, switchUserByRole, logout } = useAuth();

  const roles: UserRole[] = [
    "ADMIN",
    "MANAGER",
    "SALESPERSON",
    "INVENTORY_STAFF",
  ];

  return (
    <header className="h-16 shrink-0 bg-[#0f1011] border-b border-white/10 px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2 z-30">
      {/* Left: Mobile Menu Trigger + Brand Icon + Branch Info */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] border border-white/10 hover:border-white/30 text-white flex items-center justify-center shrink-0 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 hover:opacity-90 transition-opacity"
          title="Vehisoft Dealership OS"
        >
          <VehisoftIcon size={30} />
          <span className="hidden sm:inline font-serif font-light text-white tracking-tight text-[18px]">
            Vehisoft<sup className="text-[10px] ml-0.5 font-mono text-[#00b3dd]">®</sup>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3 text-[13px] font-mono text-white/70 truncate border-l border-white/10 pl-3">
          <span className="truncate">{user.branchName || "Ngong Road Showroom (HQ)"}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/50 shrink-0">KSh.</span>
        </div>
      </div>

      {/* Right: Actions + Role Switcher + Sign Out */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <Link
          href="/"
          className="rounded-[8px] border border-white/20 bg-transparent hover:bg-white hover:text-black text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1 sm:gap-1.5 shrink-0"
        >
          <span className="hidden sm:inline">Public Showroom</span>
          <span className="sm:hidden">Showroom</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
        </Link>

        {permissions.canManageCRM && (
          <Link
            href="/follow-ups"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-[8px] border border-white/10 hover:border-white/30 px-3.5 py-2 text-[12px] font-mono uppercase tracking-wider text-white/80 hover:text-white transition-colors shrink-0"
          >
            <span>Today&apos;s Follow-ups</span>
          </Link>
        )}

        {permissions.canManageInventory && (
          <Link
            href="/inventory/add"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-[8px] bg-white text-black hover:bg-white/90 px-3.5 py-2 text-[12px] font-mono uppercase tracking-wider font-semibold transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
        )}

        {/* Role Switcher */}
        <div className="flex items-center rounded-[8px] border border-white/15 bg-[#17181a] px-2.5 sm:px-3 py-1.5 max-w-[140px] sm:max-w-none">
          <label htmlFor="rbac-role-select" className="sr-only">
            Switch Active Role
          </label>
          <select
            id="rbac-role-select"
            value={user.role}
            onChange={(e) => switchUserByRole(e.target.value as UserRole)}
            className="bg-transparent text-[11px] sm:text-[12px] font-mono uppercase tracking-wider text-white focus:outline-none cursor-pointer w-full truncate"
            title="Switch active RBAC role to preview permissions"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-[#0f1011] text-white">
                Role: {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <Link
          href="/login"
          onClick={() => logout()}
          className="w-9 h-9 rounded-[8px] border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center shrink-0 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
