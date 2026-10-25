"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  XCircle,
  Gauge,
  Car,
  UserCheck,
  X,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { formatMileage, formatDate } from "@/lib/format";

export default function TestDrivesPage() {
  const {
    testDrives,
    customers,
    vehicles,
    addTestDrive,
    completeTestDrive,
    cancelTestDrive,
  } = useDealership();
  const { users, user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [mileageInInput, setMileageInInput] = useState<number>(0);
  const [outcomeInput, setOutcomeInput] = useState<string>(
    "Customer impressed — proceeding to price negotiation"
  );
  const [toast, setToast] = useState("");
  const [completeError, setCompleteError] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );
  const availableVehicles = vehicles.filter((v) => v.status !== "SOLD");

  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    vehicleId: availableVehicles[0]?.id || "",
    salespersonId: salespeople[0]?.id || user.id,
    scheduledAt: new Date().toISOString().slice(0, 16),
    driverName: customers[0]?.fullName || "",
    driverLicenseNo: "DL-KE-",
    mileageOut: availableVehicles[0]?.mileage || 42000,
    notes: "",
  });

  const filteredDrives = testDrives.filter((td) =>
    statusFilter === "ALL" ? true : td.status === statusFilter
  );

  const handleScheduleTestDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === form.customerId);
    const veh = vehicles.find((v) => v.id === form.vehicleId);
    const sp = users.find((u) => u.id === form.salespersonId) || user;
    if (!cust || !veh) return;

    addTestDrive({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: veh.id,
      vehicleTitle: `${veh.year} ${veh.make} ${veh.model}`,
      stockNumber: veh.stockNumber,
      salespersonId: sp.id,
      salespersonName: sp.name,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      driverName: form.driverName || cust.fullName,
      driverLicenseNo: form.driverLicenseNo || "DL-KE-Verified",
      mileageOut: Number(form.mileageOut) || veh.mileage,
      mileageIn: null,
      status: "SCHEDULED",
      notes: form.notes || "Showroom test drive loop.",
      outcome: "Pending completion",
    });

    setForm({ ...form, notes: "" });
    setToast("Test drive scheduled and pipeline stage updated.");
    setTimeout(() => setToast(""), 3500);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingId) return;
    const targetTd = testDrives.find((t) => t.id === completingId);
    if (targetTd && Number(mileageInInput) < targetTd.mileageOut) {
      setCompleteError(
        `Return odometer reading (${formatMileage(Number(mileageInInput))}) cannot be less than starting Mileage Out (${formatMileage(targetTd.mileageOut)}).`
      );
      return;
    }
    setCompleteError("");
    completeTestDrive(completingId, Number(mileageInInput), outcomeInput);
    setCompletingId(null);
    setToast("Test drive completed and vehicle odometer mileage updated.");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Test Drives &amp; Odometer Log
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule customer test drives, verify driver licenses, and log
            mileage out &amp; mileage in.
          </p>
        </div>

        {toast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Scheduled Test Drives
          </span>
          <p className="text-xl font-bold text-amber-700 mt-1">
            {testDrives.filter((t) => t.status === "SCHEDULED").length} Upcoming
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Completed Test Drives
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {testDrives.filter((t) => t.status === "COMPLETED").length} Completed
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Cancelled
          </span>
          <p className="text-xl font-bold text-slate-600 mt-1">
            {testDrives.filter((t) => t.status === "CANCELLED").length} Records
          </p>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {st === "ALL" ? "All Test Drives" : st}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Drives Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Test Drive Register
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Customer &amp; Driver</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Mileage (Out → In)</th>
                  <th className="py-3.5 px-4">Date &amp; Salesperson</th>
                  <th className="py-3.5 px-4">Status &amp; Outcome</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center">
                      <p className="text-sm font-bold text-slate-900">
                        No test drives match this status filter
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Switch to All Test Drives or schedule a new appointment on the right.
                      </p>
                      {statusFilter !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => setStatusFilter("ALL")}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                        >
                          Show All Test Drives
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((td) => {
                    const distanceDriven =
                      td.mileageIn && td.mileageIn >= td.mileageOut
                        ? td.mileageIn - td.mileageOut
                        : null;

                    return (
                      <tr key={td.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/customers/${td.customerId}`}
                            className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                          >
                            {td.customerName}
                          </Link>
                          <p className="text-[11px] text-slate-500">
                            Driver: {td.driverName} ({td.driverLicenseNo})
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <Link
                            href={`/inventory/${td.vehicleId}`}
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Car className="w-3.5 h-3.5" />
                            {td.vehicleTitle}
                          </Link>
                          <span className="font-mono text-[11px] text-slate-500">
                            {td.stockNumber}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-mono font-semibold text-slate-800">
                            Out: {formatMileage(td.mileageOut)}
                          </p>
                          <p className="font-mono text-[11px] text-emerald-700 font-bold">
                            In:{" "}
                            {td.mileageIn ? formatMileage(td.mileageIn) : "Out now"}
                            {distanceDriven !== null && ` (+${distanceDriven} km)`}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-800">
                            {formatDate(td.scheduledAt)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Staff: {td.salespersonName.split(" ")[0]}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              td.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : td.status === "SCHEDULED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {td.status}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-[180px] truncate">
                            {td.outcome}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {td.status === "SCHEDULED" && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setCompleteError("");
                                  setCompletingId(td.id);
                                  setMileageInInput(td.mileageOut + 15);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  cancelTestDrive(td.id);
                                  setToast(`Cancelled test drive for ${td.customerName}.`);
                                  setTimeout(() => setToast(""), 3000);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Cancel Test Drive"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Test Drive Form */}
        <form
          onSubmit={handleScheduleTestDrive}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3.5 h-fit"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Book Test Drive
              </h2>
              <p className="text-xs text-slate-500">
                Record driver details and starting odometer.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer
            </label>
            <select
              value={form.customerId}
              onChange={(e) => {
                const c = customers.find((x) => x.id === e.target.value);
                setForm({
                  ...form,
                  customerId: e.target.value,
                  driverName: c ? c.fullName : form.driverName,
                });
              }}
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
              onChange={(e) => {
                const v = vehicles.find((x) => x.id === e.target.value);
                setForm({
                  ...form,
                  vehicleId: e.target.value,
                  mileageOut: v ? v.mileage : form.mileageOut,
                });
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.stockNumber} — {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                required
                value={form.driverName}
                onChange={(e) =>
                  setForm({ ...form, driverName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driving License No.
              </label>
              <input
                type="text"
                required
                value={form.driverLicenseNo}
                onChange={(e) =>
                  setForm({ ...form, driverLicenseNo: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mileage Out (km)
              </label>
              <input
                type="number"
                required
                value={form.mileageOut}
                onChange={(e) =>
                  setForm({ ...form, mileageOut: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salesperson
              </label>
              <select
                value={form.salespersonId}
                onChange={(e) =>
                  setForm({ ...form, salespersonId: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {salespeople.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Test Drive</span>
          </button>
        </form>
      </div>

      {/* Complete Test Drive Modal */}
      {completingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCompleteSubmit}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Complete Test Drive &amp; Record Mileage In
              </h3>
              <button
                type="button"
                onClick={() => setCompletingId(null)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {completeError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {completeError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Return Odometer Reading — Mileage In (km) *
              </label>
              <input
                type="number"
                required
                value={mileageInInput}
                onChange={(e) => setMileageInInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Feedback &amp; Outcome *
              </label>
              <textarea
                rows={3}
                required
                value={outcomeInput}
                onChange={(e) => setOutcomeInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Save &amp; Update Odometer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
