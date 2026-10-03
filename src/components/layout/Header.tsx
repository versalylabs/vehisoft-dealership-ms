"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  Shield,
  Plus,
  LogOut,
  Building2,
  PhoneCall,
  Globe,
  Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, UserRole } from "@/lib/auth";

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
    <header className="h-16 shrink-0 rb-liquid-glass border-b border-white/60 px-4 lg:px-8 flex items-center justify-between z-30">
      {/* Left: Mobile Menu Trigger + Branch Info */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-700 rb-liquid-badge px-3.5 py-1.5 rounded-full">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{user.branchName || "Ngong Road Showroom (HQ)"}</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-semibold">Currency: KSh.</span>
        </div>
      </div>

      {/* Right: Quick Actions + Interactive RBAC Role Switcher + Sign Out */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold rb-liquid-badge text-indigo-700 hover:bg-indigo-100/70 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span>Public Website & AI</span>
        </Link>

        {permissions.canManageCRM && (
          <Link
            href="/follow-ups"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50/80 backdrop-blur-md text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>Today&apos;s Follow-ups</span>
          </Link>
        )}

        {permissions.canManageInventory && (
          <Link
            href="/inventory/add"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
        )}

        {/* Role Switcher for testing RBAC permissions */}
        <div className="flex items-center gap-1.5 rb-liquid-badge rounded-lg px-2.5 py-1">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <label htmlFor="rbac-role-select" className="sr-only">
            Switch Active Role
          </label>
          <select
            id="rbac-role-select"
            value={user.role}
            onChange={(e) => switchUserByRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            title="Switch active RBAC role to preview permissions"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                Role: {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <Link
          href="/login"
          onClick={() => logout()}
          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign Out / Switch User Account"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
