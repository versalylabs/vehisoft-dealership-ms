"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Eye,
  CheckCircle2,
  X,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatCompactKSh,
  formatRelativeDate,
} from "@/lib/format";
import { CustomerTypeEnum } from "@/lib/demo-store";
import {
  CUSTOMER_TYPE_BADGE,
  CUSTOMER_TYPE_LABEL,
  STAGE_BADGE_STYLE,
} from "@/lib/badges";

export default function CustomersPage() {
  const { customers, leads, addCustomer } = useDealership();
  const { users, user } = useAuth();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [salespersonFilter, setSalespersonFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );

  const [form, setForm] = useState({
    fullName: "",
    phone: "+254 7",
    altPhone: "",
    email: "",
    address: "",
    location: "Nairobi",
    idPassportNo: "",
    customerType: "INDIVIDUAL" as CustomerTypeEnum,
    preferredMakes: "Toyota, Mazda",
    preferredModels: "Harrier, CX-5",
    budgetMin: 3000000,
    budgetMax: 4500000,
    preferredYear: 2020,
    preferredFuel: "Petrol",
    preferredTrans: "Automatic",
    preferredBody: "SUV",
    assignedSalespersonId: salespeople[0]?.id || user.id,
    notes: "",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay =
          `${c.fullName} ${c.phone} ${c.email} ${c.location} ${c.preferredMakes} ${c.preferredModels}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (typeFilter !== "ALL" && c.customerType !== typeFilter) return false;
      if (
        salespersonFilter !== "ALL" &&
        c.assignedSalespersonId !== salespersonFilter
      ) {
        return false;
      }
      return true;
    });
  }, [customers, search, typeFilter, salespersonFilter]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) return;
    const sp =
      users.find((u) => u.id === form.assignedSalespersonId) || user;

    addCustomer({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      altPhone: form.altPhone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      location: form.location.trim(),
      idPassportNo: form.idPassportNo.trim(),
      customerType: form.customerType,
      preferredMakes: form.preferredMakes.trim(),
      preferredModels: form.preferredModels.trim(),
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      preferredYear: Number(form.preferredYear),
      preferredFuel: form.preferredFuel,
      preferredTrans: form.preferredTrans,
      preferredBody: form.preferredBody,
      assignedSalespersonId: sp.id,
      assignedSalespersonName: sp.name,
      pipelineStage: "NEW",
      notes: form.notes.trim(),
    });

    setShowAddModal(false);
    setForm({
      ...form,
      fullName: "",
      phone: "+254 7",
      email: "",
      notes: "",
    });
    setToast("Customer added to dealership CRM database.");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers Database
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Centralized CRM of individual buyers, corporate accounts, trade
            dealers, and fleet customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toast && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Type Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(
          ["INDIVIDUAL", "COMPANY", "DEALER", "FLEET"] as CustomerTypeEnum[]
        ).map((t) => {
          const count = customers.filter((c) => c.customerType === t).length;
          return (
            <div
              key={t}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
            >
              <span className="text-xs font-semibold text-slate-500">
                {CUSTOMER_TYPE_LABEL[t]}s
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {count} Records
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, phone (+254...), email, location, or preferred vehicle..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="ALL">All Customer Types</option>
          <option value="INDIVIDUAL">Individual</option>
          <option value="COMPANY">Company</option>
          <option value="DEALER">Dealer</option>
          <option value="FLEET">Fleet Customer</option>
        </select>

        <select
          value={salespersonFilter}
          onChange={(e) => setSalespersonFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="ALL">All Salespeople</option>
          {salespeople.map((sp) => (
            <option key={sp.id} value={sp.id}>
              Assigned: {sp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact &amp; Location</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Preferences &amp; Budget (KSh.)</th>
                <th className="py-3.5 px-4">Assigned Salesperson</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">Last Interaction</th>
                <th className="py-3.5 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      No customers match your current filters
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reset your search query, customer type, or salesperson filter to see all CRM buyers.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setTypeFilter("ALL");
                        setSalespersonFilter("ALL");
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      Reset Customer Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const custPurchases = leads.filter(
                    (l) => l.customerId === c.id && l.stage === "SOLD"
                  ).length;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                        >
                          {c.fullName}
                        </Link>
                        {custPurchases > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold">
                            {custPurchases} Purchased
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.location} • {c.email}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            CUSTOMER_TYPE_BADGE[c.customerType]
                          }`}
                        >
                          {CUSTOMER_TYPE_LABEL[c.customerType]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {c.preferredMakes} ({c.preferredModels})
                        </p>
                        <p className="text-[11px] text-emerald-700 font-bold">
                          {formatCompactKSh(c.budgetMin)} –{" "}
                          {formatCompactKSh(c.budgetMax)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {c.assignedSalespersonName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            STAGE_BADGE_STYLE[c.pipelineStage]
                          }`}
                        >
                          {c.pipelineStage.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {formatRelativeDate(c.lastInteraction)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/customers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>360° View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add New Customer Record
                </h2>
                <p className="text-xs text-slate-500">
                  Capture contact information and vehicle preferences in KSh.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daniel Kipkorir"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={form.customerType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customerType: e.target.value as CustomerTypeEnum,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COMPANY">Company</option>
                    <option value="DEALER">Dealer</option>
                    <option value="FLEET">Fleet Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="daniel@gmail.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ID / Passport / Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 29481023"
                    value={form.idPassportNo}
                    onChange={(e) =>
                      setForm({ ...form, idPassportNo: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Makes
                  </label>
                  <input
                    type="text"
                    value={form.preferredMakes}
                    onChange={(e) =>
                      setForm({ ...form, preferredMakes: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Models
                  </label>
                  <input
                    type="text"
                    value={form.preferredModels}
                    onChange={(e) =>
                      setForm({ ...form, preferredModels: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Budget (KSh.)
                  </label>
                  <input
                    type="number"
                    value={form.budgetMin}
                    onChange={(e) =>
                      setForm({ ...form, budgetMin: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Budget (KSh.)
                  </label>
                  <input
                    type="number"
                    value={form.budgetMax}
                    onChange={(e) =>
                      setForm({ ...form, budgetMax: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Salesperson
                  </label>
                  <select
                    value={form.assignedSalespersonId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        assignedSalespersonId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {salespeople.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Year &amp; Fuel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={form.preferredYear}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferredYear: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <select
                      value={form.preferredFuel}
                      onChange={(e) =>
                        setForm({ ...form, preferredFuel: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
