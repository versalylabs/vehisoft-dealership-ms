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
    <header className="h-16 shrink-0 bg-[#ffffff] border-b border-[#d5d3d4] px-4 lg:px-8 flex items-center justify-between z-30">
      {/* Left: Mobile Menu Trigger + Branch Info */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden hyer-circle-btn !w-10 !h-10"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-3 text-[15px] font-bold text-[#000d10]">
          <span>{user.branchName || "Ngong Road Showroom (HQ)"}</span>
          <span className="text-[#d5d3d4]">·</span>
          <span className="text-[#8e8e95]">Currency: KSh.</span>
        </div>
      </div>

      {/* Right: 1000px Pill Actions + Role Switcher + Sign Out */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          className="rounded-full border border-[#000d10] bg-transparent hover:bg-[#000d10] text-[#000d10] hover:text-[#ffffff] px-[17px] py-[9px] text-[14px] font-bold transition-colors inline-flex items-center gap-1.5"
        >
          <span>Public Showroom</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        {permissions.canManageCRM && (
          <Link
            href="/follow-ups"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#d5d3d4] hover:border-[#000d10] px-[17px] py-[9px] text-[14px] font-bold text-[#000d10] transition-colors"
          >
            <span>Today&apos;s Follow-ups</span>
          </Link>
        )}

        {permissions.canManageInventory && (
          <Link
            href="/inventory/add"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#000d10] hover:bg-[#151623] text-[#ffffff] px-[17px] py-[9px] text-[14px] font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
        )}

        {/* Role Switcher */}
        <div className="flex items-center rounded-full border border-[#d5d3d4] px-[15px] py-[7px]">
          <label htmlFor="rbac-role-select" className="sr-only">
            Switch Active Role
          </label>
          <select
            id="rbac-role-select"
            value={user.role}
            onChange={(e) => switchUserByRole(e.target.value as UserRole)}
            className="bg-transparent text-[14px] font-bold text-[#000d10] focus:outline-none cursor-pointer"
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
          className="hyer-circle-btn !w-9 !h-9"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
