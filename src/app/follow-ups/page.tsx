"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";
import { ActivityTypeEnum } from "@/lib/demo-store";

export default function FollowUpsPage() {
  const {
    activities,
    customers,
    vehicles,
    leads,
    addActivity,
    updateActivityStatus,
  } = useDealership();
  const { users, user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>("DUE");
  const [toast, setToast] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );

  const [form, setForm] = useState({
    type: "CALL" as ActivityTypeEnum,
    customerId: customers[0]?.id || "",
    vehicleId: vehicles[0]?.id || "",
    staffId: salespeople[0]?.id || user.id,
    scheduledAt: new Date().toISOString().slice(0, 10),
    notes: "",
    nextAction: "",
  });

  const filteredActivities = activities.filter((a) =>
    statusFilter === "ALL" ? true : a.status === statusFilter
  );

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.notes.trim()) return;
    const cust = customers.find((c) => c.id === form.customerId);
    const veh = vehicles.find((v) => v.id === form.vehicleId);
    const staff = users.find((u) => u.id === form.staffId) || user;
    const linkedLead = leads.find((l) => l.customerId === form.customerId);

    addActivity({
      type: form.type,
      status: "DUE",
      customerId: cust?.id || "cust-1",
      customerName: cust?.fullName || "Customer",
      leadId: linkedLead?.id,
      vehicleId: veh?.id,
      vehicleTitle: veh ? `${veh.make} ${veh.model}` : "Vehicle Enquiry",
      staffId: staff.id,
      staffName: staff.name,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      notes: form.notes.trim(),
      nextAction: form.nextAction.trim() || "Follow up with customer",
    });

    setForm({ ...form, notes: "", nextAction: "" });
    setToast("Follow-up scheduled and added to salesperson queue.");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Today&apos;s Follow-ups &amp; Sales Activities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track pending calls, WhatsApp messages, SMS, vehicle viewings, and
            next actions for salespeople.
          </p>
        </div>

        {toast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          {
            id: "DUE",
            label: `Due Follow-ups (${
              activities.filter((a) => a.status === "DUE").length
            })`,
          },
          {
            id: "COMPLETED",
            label: `Completed (${
              activities.filter((a) => a.status === "COMPLETED").length
            })`,
          },
          { id: "ALL", label: `All Activities (${activities.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Follow-ups Table matching Section 5 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Today&apos;s Follow-ups Queue
              </h2>
              <p className="text-xs text-slate-500">
                Customer • Vehicle • Follow-up Type • Assigned • Status
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Follow-up</th>
                  <th className="py-3.5 px-4">Assigned</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center">
                      <p className="text-sm font-bold text-slate-900">
                        No follow-ups in this view
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        You&apos;re all caught up on this filter, or you can schedule a new follow-up on the right.
                      </p>
                      {statusFilter !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => setStatusFilter("ALL")}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                        >
                          Show All Follow-ups
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/customers/${act.customerId}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                        >
                          {act.customerName}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {act.notes}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {act.vehicleId ? (
                          <Link
                            href={`/inventory/${act.vehicleId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {act.vehicleTitle}
                          </Link>
                        ) : (
                          act.vehicleTitle
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {act.type.replace("_", " ")}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDate(act.scheduledAt)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {act.staffName.split(" ")[0]}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            act.status === "DUE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {act.status === "DUE" ? "Due" : "Completed"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {act.status === "DUE" ? (
                          <button
                            type="button"
                            onClick={() => {
                              updateActivityStatus(act.id, "COMPLETED");
                              setToast(
                                `Marked follow-up with ${act.customerName} as completed.`
                              );
                              setTimeout(() => setToast(""), 3000);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Follow-up / Log Activity Form */}
        <form
          onSubmit={handleCreateFollowUp}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit"
        >
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Schedule Follow-up / Activity
              </h2>
              <p className="text-xs text-slate-500">
                Add a call, WhatsApp, viewing, or reminder.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Activity Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ActivityTypeEnum })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="CALL">Call</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
              <option value="VEHICLE_VIEWING">Vehicle Viewing</option>
              <option value="TEST_DRIVE">Test Drive</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="NOTE">Note</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer
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
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle
            </label>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.stockNumber} — {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Staff
              </label>
              <select
                value={form.staffId}
                onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {salespeople.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm({ ...form, scheduledAt: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Notes *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Call customer regarding bank undertaking status..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Action
            </label>
            <input
              type="text"
              placeholder="e.g. Book test drive or issue reservation receipt"
              value={form.nextAction}
              onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Follow-up Queue</span>
          </button>
        </form>
      </div>
    </div>
  );
}
