"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  GitBranch,
  Sliders,
  Plus,
  CheckCircle2,
  Shield,
  MapPin,
  Tag,
  Bell,
  Hash,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, UserRole } from "@/lib/auth";

interface BranchItem {
  id: string;
  name: string;
  location: string;
  phone: string;
  isMain: boolean;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dealership";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const {
    user,
    users,
    permissions,
    addStaffUser,
    toggleUserStatus,
    updateUserRole,
  } = useAuth();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  // 1. Dealership Profile & Numbering State
  const [profile, setProfile] = useState({
    dealershipName: "Vehisoft Motors Ltd",
    tagline: "Trusted Imported & Local Quality Vehicles",
    phone: "+254 704 611 033 / +254 929 868 25",
    email: "versalylabs@gmail.com",
    address: "Ngong Road, Opposite Prestige Plaza, Nairobi",
    currencySymbol: "KSh.",
    currencyCode: "KES",
    stockNumberPrefix: "VH-",
    nextStockSequence: 1005,
    targetInventoryDays: 60,
    defaultReservationDays: 7,
  });

  const [branches, setBranches] = useState<BranchItem[]>([
    {
      id: "br-1",
      name: "Ngong Road Showroom (HQ)",
      location: "Nairobi",
      phone: "+254 704 611 033",
      isMain: true,
    },
    {
      id: "br-2",
      name: "Kiambu Road Yard",
      location: "Nairobi North",
      phone: "+254 929 868 25",
      isMain: false,
    },
  ]);

  const [newBranch, setNewBranch] = useState({
    name: "",
    location: "",
    phone: "",
  });

  // 2. New Staff Member State
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SALESPERSON" as UserRole,
    branchName: "Ngong Road Showroom (HQ)",
  });

  // 3. System Lookup Lists
  const [makes, setMakes] = useState<string[]>([
    "Toyota",
    "Mazda",
    "Subaru",
    "Mercedes-Benz",
    "BMW",
    "Nissan",
    "Volkswagen",
    "Land Rover",
    "Honda",
    "Isuzu",
  ]);
  const [newMake, setNewMake] = useState("");

  const [bodyTypes] = useState<string[]>([
    "SUV",
    "Sedan",
    "Hatchback",
    "Double Cab Pickup",
    "Station Wagon",
    "Coupe",
    "Commercial Van",
  ]);

  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    "Bank Transfer (RTGS / EFT)",
    "M-Pesa Paybill",
    "Asset Finance / Bank Release",
    "Cash Deposit",
    "Bankers Cheque",
    "Trade-In Top Up",
  ]);
  const [newPaymentMethod, setNewPaymentMethod] = useState("");

  const [expenseCategories] = useState<string[]>([
    "Purchase Cost",
    "Transport & Carrier",
    "Mechanical Repairs",
    "Detailing & Buffing",
    "QISJ / KEBS / Inspection",
    "NTSA Registration & Plates",
    "Transit Insurance",
    "Classifieds & Advertising",
    "Other Expenses",
  ]);

  const [leadSources] = useState<string[]>([
    "Walk-in",
    "Website",
    "Instagram",
    "Facebook",
    "WhatsApp",
    "Phone",
    "Referral",
    "Dealer",
    "Marketplace",
    "Other",
  ]);

  const [pipelineStages] = useState<
    { stage: string; probability: number; color: string }[]
  >([
    { stage: "New", probability: 10, color: "bg-slate-100 text-slate-700" },
    { stage: "Contacted", probability: 20, color: "bg-blue-100 text-blue-700" },
    {
      stage: "Qualified",
      probability: 40,
      color: "bg-indigo-100 text-indigo-700",
    },
    { stage: "Viewing", probability: 55, color: "bg-purple-100 text-purple-700" },
    {
      stage: "Test Drive",
      probability: 70,
      color: "bg-amber-100 text-amber-800",
    },
    {
      stage: "Negotiation",
      probability: 80,
      color: "bg-orange-100 text-orange-800",
    },
    {
      stage: "Reserved",
      probability: 90,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      stage: "Sold / Lost",
      probability: 100,
      color: "bg-green-100 text-green-800",
    },
  ]);

  const [notifications, setNotifications] = useState({
    notifyOverdueFollowUps: true,
    notifyExpiringReservations: true,
    notifyAgingStockThreshold: true,
    notifyNewHighValueSale: true,
  });

  const [savedBanner, setSavedBanner] = useState("");

  const showToast = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(""), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Dealership profile & KSh. numbering settings saved.");
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;
    setBranches([
      ...branches,
      {
        id: `br-${Date.now()}`,
        name: newBranch.name,
        location: newBranch.location || "Nairobi",
        phone: newBranch.phone || "+254 700 000 000",
        isMain: false,
      },
    ]);
    setNewBranch({ name: "", location: "", phone: "" });
    showToast("New dealership branch added.");
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim()) return;
    addStaffUser({
      name: newStaff.name.trim(),
      email: newStaff.email.trim(),
      phone: newStaff.phone.trim() || "+254 700 000 000",
      role: newStaff.role,
      branchName: newStaff.branchName,
      isActive: true,
    });
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "SALESPERSON",
      branchName: branches[0]?.name || "Ngong Road Showroom (HQ)",
    });
    showToast("Staff user created and assigned RBAC role.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            System Settings &amp; Role Administration
          </h1>
          <p className="text-sm text-[#9f9fa0] mt-1">
            Configure dealership profile, branches, users &amp; RBAC roles,
            sales pipeline stages, and KSh. numbering defaults.
          </p>
        </div>

        {savedBanner && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedBanner}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          {
            id: "dealership",
            label: "Dealership & Branches",
            icon: <Building2 className="w-4 h-4" />,
          },
          {
            id: "users",
            label: "Users & Roles (RBAC)",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: "pipeline",
            label: "Pipeline & Lead Sources",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: "system",
            label: "Catalogs, Payments & Alerts",
            icon: <Sliders className="w-4 h-4" />,
          },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === t.id
                ? "bg-[#847dff] text-white shadow-md border border-[#847dff]"
                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DEALERSHIP PROFILE & BRANCHES */}
      {activeTab === "dealership" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-2 bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Dealership Profile &amp; Stock Numbering
                </h2>
                <p className="text-xs text-[#9f9fa0]">
                  Used on sale agreements, reservation receipts, and reports.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Currency: {profile.currencySymbol} ({profile.currencyCode})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Dealership Name
                </label>
                <input
                  type="text"
                  value={profile.dealershipName}
                  onChange={(e) =>
                    setProfile({ ...profile, dealershipName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) =>
                    setProfile({ ...profile, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Primary Phone
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Showroom Physical Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9f9fa0] mb-3 flex items-center gap-1.5 font-mono">
                <Hash className="w-3.5 h-3.5 text-[#00b3dd]" />
                <span>Stock Code &amp; Inventory Rules</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Stock Prefix
                  </label>
                  <input
                    type="text"
                    value={profile.stockNumberPrefix}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        stockNumberPrefix: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white font-mono focus:border-[#847dff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Next Sequence
                  </label>
                  <input
                    type="number"
                    value={profile.nextStockSequence}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        nextStockSequence: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white font-mono focus:border-[#847dff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Target Stock Age (Days)
                  </label>
                  <input
                    type="number"
                    value={profile.targetInventoryDays}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        targetInventoryDays: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Reservation Hold (Days)
                  </label>
                  <input
                    type="number"
                    value={profile.defaultReservationDays}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        defaultReservationDays: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#847dff] hover:bg-[#726af8] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Save Dealership Settings
              </button>
            </div>
          </form>

          {/* Branches Card */}
          <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Showroom Branches
              </h2>
              <p className="text-xs text-[#9f9fa0]">
                Locations where vehicle stock is held.
              </p>
            </div>

            <div className="space-y-2.5">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg border border-white/10 bg-white/5 flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {b.name}
                      </span>
                      {b.isMain && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#847dff]/20 text-[#d1c9ff] border border-[#847dff]/30">
                          HQ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9f9fa0] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-[#00b3dd]" />
                      {b.location} • {b.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddBranch}
              className="pt-3 border-t border-white/10 space-y-3"
            >
              <p className="text-xs font-bold text-white/90">Add New Branch</p>
              <input
                type="text"
                placeholder="Branch / Yard Name"
                value={newBranch.name}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, name: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City / Area"
                  value={newBranch.location}
                  onChange={(e) =>
                    setNewBranch({ ...newBranch, location: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newBranch.phone}
                  onChange={(e) =>
                    setNewBranch({ ...newBranch, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#847dff] hover:bg-[#726af8] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ROLES (RBAC) */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Staff Directory Table */}
            <div className="lg:col-span-2 bg-[#141517] rounded-xl border border-white/10 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Dealership Staff &amp; Role Assignments
                  </h2>
                  <p className="text-xs text-[#9f9fa0] mt-0.5">
                    Active session: <strong className="text-white">{user.name}</strong> (
                    {ROLE_LABELS[user.role]})
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#847dff] bg-[#847dff]/15 border border-[#847dff]/30 px-3 py-1 rounded-full">
                  {users.length} Staff Accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0c0d0e] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#9f9fa0]">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[#9f9fa0] mt-0.5">
                            {u.email} • {u.phone}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-white/80">
                          {u.branchName}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            disabled={!permissions.canManageUsers}
                            value={u.role}
                            onChange={(e) => {
                              updateUserRole(u.id, e.target.value as UserRole);
                              showToast(`Updated ${u.name}'s role.`);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-white/15 bg-[#0c0d0e] text-xs font-semibold text-white disabled:opacity-60 focus:border-[#847dff] focus:outline-none cursor-pointer"
                          >
                            {(
                              [
                                "ADMIN",
                                "MANAGER",
                                "SALESPERSON",
                                "INVENTORY_STAFF",
                              ] as UserRole[]
                            ).map((r) => (
                              <option key={r} value={r} className="bg-[#141517] text-white">
                                {ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.isActive
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-white/10 text-white/60 border-white/15"
                            }`}
                          >
                            {u.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {permissions.canManageUsers && (
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(u.id)}
                              className="text-xs font-semibold text-[#847dff] hover:text-[#d1c9ff] transition-colors cursor-pointer"
                            >
                              {u.isActive ? "Suspend" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Staff Member Form */}
            <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#847dff]" />
                <div>
                  <h2 className="text-base font-bold text-white">
                    Add Staff Member
                  </h2>
                  <p className="text-xs text-[#9f9fa0]">
                    Assign role-based permissions.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Mutuku"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@vehisoft.co.ke"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+254 722 000 000"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    System Role
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none cursor-pointer"
                  >
                    {(
                      [
                        "ADMIN",
                        "MANAGER",
                        "SALESPERSON",
                        "INVENTORY_STAFF",
                      ] as UserRole[]
                    ).map((r) => (
                      <option key={r} value={r} className="bg-[#141517] text-white">
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#9f9fa0] mt-1">
                    {ROLE_DESCRIPTIONS[newStaff.role]}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Branch
                  </label>
                  <select
                    value={newStaff.branchName}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, branchName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name} className="bg-[#141517] text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-[#847dff] hover:bg-[#726af8] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE STAGES & LEAD SOURCES */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Sales Pipeline Stages
              </h2>
              <p className="text-xs text-[#9f9fa0] mt-0.5">
                Standardized 8-stage vehicle sales workflow from initial enquiry
                to closed deal.
              </p>
            </div>
            <div className="space-y-2">
              {pipelineStages.map((s, idx) => (
                <div
                  key={s.stage}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.color}`}
                    >
                      {s.stage}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#9f9fa0]">
                    Default Win Probability: <strong className="text-white">{s.probability}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Lead Sources
              </h2>
              <p className="text-xs text-[#9f9fa0] mt-0.5">
                Channels tracked in CRM Lead attribution and conversion reports.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {leadSources.map((src) => (
                <span
                  key={src}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/90"
                >
                  <Tag className="w-3.5 h-3.5 text-[#00b3dd]" />
                  {src}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM CATALOGS, PAYMENTS & NOTIFICATIONS */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Makes & Body Types */}
          <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-white">
              Supported Vehicle Makes &amp; Body Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {makes.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full bg-[#847dff]/15 text-[#d1c9ff] border border-[#847dff]/30 text-xs font-semibold"
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add vehicle make (e.g. Mitsubishi)"
                value={newMake}
                onChange={(e) => setNewMake(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newMake.trim()) return;
                  setMakes([...makes, newMake.trim()]);
                  setNewMake("");
                  showToast("Added vehicle make to catalog.");
                }}
                className="px-4 py-2 rounded-lg bg-[#847dff] hover:bg-[#726af8] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Add Make
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-bold text-white/80 mb-2">
                Standard Body Types
              </p>
              <div className="flex flex-wrap gap-2">
                {bodyTypes.map((bt) => (
                  <span
                    key={bt}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-xs font-medium"
                  >
                    {bt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods, Expense Categories & Notifications */}
          <div className="space-y-6">
            <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white">
                Accepted Payment Methods &amp; Cost Categories (KSh.)
              </h2>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((pm) => (
                  <span
                    key={pm}
                    className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                  >
                    {pm}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add payment method..."
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#0c0d0e] border border-white/15 rounded-lg text-white focus:border-[#847dff] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPaymentMethod.trim()) return;
                    setPaymentMethods([
                      ...paymentMethods,
                      newPaymentMethod.trim(),
                    ]);
                    setNewPaymentMethod("");
                    showToast("Payment method added.");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#847dff] hover:bg-[#726af8] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-bold text-white/80 mb-2">
                  Vehicle Expense Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {expenseCategories.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#141517] rounded-xl border border-white/10 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#847dff]" />
                <h2 className="text-base font-bold text-white">
                  Operational Notification Rules
                </h2>
              </div>
              {[
                {
                  key: "notifyOverdueFollowUps",
                  label: "Alert salespeople on overdue customer follow-ups",
                },
                {
                  key: "notifyExpiringReservations",
                  label:
                    "Auto-revert vehicle status (Reserved → Available) when deposit hold expires",
                },
                {
                  key: "notifyAgingStockThreshold",
                  label: `Flag inventory units exceeding ${profile.targetInventoryDays} days in stock`,
                },
                {
                  key: "notifyNewHighValueSale",
                  label: "Notify Owner/Admin when a vehicle sale is completed",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium text-white/90">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={
                      notifications[item.key as keyof typeof notifications]
                    }
                    onChange={(e) => {
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      });
                      showToast("Notification rule updated.");
                    }}
                    className="w-4 h-4 accent-[#847dff] rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Loading settings...</div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
