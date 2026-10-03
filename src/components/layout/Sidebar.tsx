"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  Kanban,
  PhoneCall,
  CalendarClock,
  BookmarkCheck,
  BadgeDollarSign,
  PlusCircle,
  Receipt,
  Truck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/auth";

interface NavChild {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChild[];
  visible?: boolean;
}

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, permissions } = useAuth();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Sales: true,
    Inventory: true,
    Reports: false,
    Settings: false,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
      visible: true,
    },
    {
      label: "Sales",
      icon: <Kanban className="w-5 h-5" />,
      visible: permissions.canManageCRM || permissions.canManageSales || user.role === "INVENTORY_STAFF",
      children: [
        { label: "Leads", href: "/leads" },
        { label: "Pipeline", href: "/pipeline" },
        { label: "Follow-ups", href: "/follow-ups" },
        { label: "Test Drives", href: "/test-drives" },
        { label: "Reservations", href: "/reservations" },
        { label: "Sales", href: "/sales" },
      ],
    },
    {
      label: "Inventory",
      icon: <Car className="w-5 h-5" />,
      visible: true,
      children: [
        { label: "Vehicles", href: "/inventory" },
        ...(permissions.canManageInventory
          ? [{ label: "Add Vehicle", href: "/inventory/add" }]
          : []),
        ...(permissions.canManageCosts
          ? [{ label: "Vehicle Costs", href: "/inventory/costs" }]
          : []),
      ],
    },
    {
      label: "Customers",
      href: "/customers",
      icon: <Users className="w-5 h-5" />,
      visible: permissions.canManageCRM,
    },
    {
      label: "Suppliers",
      href: "/suppliers",
      icon: <Truck className="w-5 h-5" />,
      visible: permissions.canManageSuppliers,
    },
    {
      label: "Reports",
      icon: <BarChart3 className="w-5 h-5" />,
      visible: permissions.canViewReports,
      children: [
        { label: "Sales", href: "/reports?tab=sales" },
        { label: "Inventory", href: "/reports?tab=inventory" },
        { label: "Leads", href: "/reports?tab=leads" },
        ...(permissions.canViewAllFinancials
          ? [{ label: "Profitability", href: "/reports?tab=profitability" }]
          : []),
      ],
    },
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      visible: permissions.canManageSettings,
      children: [
        { label: "Dealership", href: "/settings?tab=dealership" },
        { label: "Users & Roles", href: "/settings?tab=users" },
        { label: "Pipeline", href: "/settings?tab=pipeline" },
        { label: "System Settings", href: "/settings?tab=system" },
      ],
    },
  ];

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    if (cleanHref === "/") return pathname === "/";
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen shrink-0 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 px-5 flex items-center justify-between border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base block leading-none">
                Vehisoft
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                Dealership MS • KSh.
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems
            .filter((item) => item.visible !== false)
            .map((item) => {
              if (!item.children) {
                const active = isActive(item.href!);
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              const groupOpen = openGroups[item.label] ?? false;
              const hasActiveChild = item.children.some((c) =>
                isActive(c.href)
              );

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      hasActiveChild
                        ? "text-white bg-slate-800/80"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {groupOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {groupOpen && (
                    <div className="pl-9 pr-2 space-y-0.5 border-l border-slate-800 ml-5">
                      {item.children.map((child) => {
                        const childActive =
                          pathname === child.href.split("?")[0];
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                              childActive
                                ? "bg-blue-600/20 text-blue-400 font-semibold"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>

        {/* Active User & Role Footer */}
        <div className="p-4 shrink-0 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-400 font-medium truncate">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
