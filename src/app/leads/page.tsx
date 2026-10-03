"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Kanban,
  Plus,
  Search,
  CheckCircle2,
  X,
  Car,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatCompactKSh,
  formatDate,
  formatRelativeDate,
} from "@/lib/format";
import { STAGE_BADGE_STYLE } from "@/lib/badges";
import { LeadSourceType, PipelineStageType } from "@/lib/demo-store";

export default function LeadsListPage() {
  const { leads, customers, vehicles, addLead, updateLeadStage } =
    useDealership();
  const { users, user } = useAuth();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );

  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    vehicleId: vehicles[0]?.id || "",
    source: "WALK_IN" as LeadSourceType,
    assignedSalespersonId: salespeople[0]?.id || user.id,
    budget: 4200000,
    expectedPurchaseDate: new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .slice(0, 10),
    stage: "NEW" as PipelineStageType,
    probability: 25,
    nextFollowUpAt: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    notes: "",
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay =
          `${l.customerName} ${l.vehicleTitle} ${l.vehicleStockNo} ${l.assignedSalespersonName} ${l.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (stageFilter !== "ALL" && l.stage !== stageFilter) return false;
      if (sourceFilter !== "ALL" && l.source !== sourceFilter) return false;
      return true;
    });
  }, [leads, search, stageFilter, sourceFilter]);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === form.customerId);
    const veh = vehicles.find((v) => v.id === form.vehicleId);
    const sp =
      users.find((u) => u.id === form.assignedSalespersonId) || user;
    if (!cust || !veh) return;

    addLead(
      {
        customerId: cust.id,
        customerName: cust.fullName,
        customerPhone: cust.phone,
        vehicleId: veh.id,
        vehicleTitle: `${veh.make} ${veh.model} ${veh.year}`,
        vehicleStockNo: veh.stockNumber,
        askingPrice: veh.askingPrice,
        source: form.source,
        assignedSalespersonId: sp.id,
        assignedSalespersonName: sp.name,
        budget: Number(form.budget) || veh.askingPrice,
        expectedPurchaseDate: new Date(form.expectedPurchaseDate).toISOString(),
        stage: form.stage,
        probability: Number(form.probability),
        nextFollowUpAt: new Date(form.nextFollowUpAt).toISOString(),
        notes: form.notes.trim() || "Enquired about vehicle availability.",
      },
      user.name
    );

    setShowModal(false);
    setToast("New sales lead recorded and added to pipeline.");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales Leads &amp; Enquiries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage incoming enquiries by lead source, vehicle interest, budget
            in KSh., and pipeline stage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {toast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <Kanban className="w-4 h-4 text-blue-600" />
            <span>Kanban Pipeline View</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead / Enquiry</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by customer, vehicle (e.g. Harrier), stock number, or salesperson..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="ALL">All Pipeline Stages</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="VIEWING">Viewing</option>
          <option value="TEST_DRIVE">Test Drive</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
          <option value="LOST">Lost</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
        >
          <option value="ALL">All Lead Sources</option>
          <option value="WALK_IN">Walk-in</option>
          <option value="WEBSITE">Website</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="PHONE">Phone</option>
          <option value="REFERRAL">Referral</option>
          <option value="DEALER">Dealer</option>
          <option value="MARKETPLACE">Marketplace</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Interested Vehicle</th>
                <th className="py-3.5 px-4">Asking vs Budget (KSh.)</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">Last Contact / Next Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredLeads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/90">
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/customers/${l.customerId}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                    >
                      {l.customerName}
                    </Link>
                    <p className="text-slate-500 text-[11px]">
                      {l.customerPhone}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <Link
                      href={`/inventory/${l.vehicleId}`}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Car className="w-3.5 h-3.5" />
                      {l.vehicleTitle}
                    </Link>
                    <p className="text-[11px] font-mono text-slate-500">
                      Stock: {l.vehicleStockNo}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">
                      Asking: {formatKSh(l.askingPrice)}
                    </p>
                    <p className="text-emerald-700 font-semibold text-[11px]">
                      Budget: {formatKSh(l.budget)} ({l.probability}% prob)
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {l.source.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {l.assignedSalespersonName}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={l.stage}
                      onChange={(e) => {
                        updateLeadStage(
                          l.id,
                          e.target.value as PipelineStageType,
                          user.name
                        );
                        setToast(
                          `Updated ${l.customerName}'s lead stage to ${e.target.value}.`
                        );
                        setTimeout(() => setToast(""), 3000);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-0 cursor-pointer ${
                        STAGE_BADGE_STYLE[l.stage]
                      }`}
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="VIEWING">Viewing</option>
                      <option value="TEST_DRIVE">Test Drive</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="SOLD">Sold</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-slate-700 font-medium">
                      Last: {formatRelativeDate(l.lastContactAt)}
                    </p>
                    <p className="text-[11px] text-amber-700 font-semibold">
                      Next: {formatDate(l.nextFollowUpAt)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Create New Sales Lead / Enquiry
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer *
                </label>
                <select
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Interested In *
                </label>
                <select
                  value={form.vehicleId}
                  onChange={(e) => {
                    const v = vehicles.find((x) => x.id === e.target.value);
                    setForm({
                      ...form,
                      vehicleId: e.target.value,
                      budget: v ? v.askingPrice : form.budget,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.stockNumber} — {v.year} {v.make} {v.model} (
                      {formatCompactKSh(v.askingPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={form.source}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        source: e.target.value as LeadSourceType,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="WALK_IN">Walk-in</option>
                    <option value="WEBSITE">Website</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PHONE">Phone</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="DEALER">Dealer</option>
                    <option value="MARKETPLACE">Marketplace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={form.stage}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stage: e.target.value as PipelineStageType,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="VIEWING">Viewing</option>
                    <option value="TEST_DRIVE">Test Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Budget / Offer (KSh.)
                  </label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: Number(e.target.value) })
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enquiry Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Customer trade-in details, financing preference, viewing date..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Lead to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
