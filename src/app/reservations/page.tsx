"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  Plus,
  CheckCircle2,
  RefreshCw,
  Clock,
  Car,
  Unlock,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { formatKSh, formatDate } from "@/lib/format";
import { PaymentStatusEnum } from "@/lib/demo-store";

export default function ReservationsPage() {
  const {
    reservations,
    customers,
    vehicles,
    addReservation,
    releaseReservation,
    expireOverdueReservations,
  } = useDealership();
  const { users, user } = useAuth();

  const [toast, setToast] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");

  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    vehicleId: availableVehicles[0]?.id || vehicles[0]?.id || "",
    reservedById: salespeople[0]?.id || user.id,
    reservationDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    depositAmount: 300000,
    depositStatus: "PAID" as PaymentStatusEnum,
    notes: "",
  });

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === form.customerId);
    const veh = vehicles.find((v) => v.id === form.vehicleId);
    const sp = users.find((u) => u.id === form.reservedById) || user;
    if (!cust || !veh) return;

    addReservation(
      {
        customerId: cust.id,
        customerName: cust.fullName,
        customerPhone: cust.phone,
        vehicleId: veh.id,
        vehicleTitle: `${veh.year} ${veh.make} ${veh.model} (${veh.registrationNumber})`,
        stockNumber: veh.stockNumber,
        reservedById: sp.id,
        reservedByName: sp.name,
        reservationDate: new Date(form.reservationDate).toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
        depositAmount: Number(form.depositAmount),
        depositStatus: form.depositStatus,
        notes:
          form.notes.trim() ||
          `Vehicle hold against ${formatKSh(
            Number(form.depositAmount)
          )} deposit.`,
      },
      user.name
    );

    setForm({ ...form, notes: "" });
    setToast(
      `Reservation created! ${veh.stockNumber} status automatically changed: Available → Reserved.`
    );
    setTimeout(() => setToast(""), 4000);
  };

  const handleRunExpiryCheck = () => {
    const expiredCount = expireOverdueReservations(user.name);
    if (expiredCount > 0) {
      setToast(
        `Expired ${expiredCount} overdue reservation(s) — Vehicle status reverted: Reserved → Available.`
      );
    } else {
      setToast("All active reservations are still within their valid hold dates.");
    }
    setTimeout(() => setToast(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vehicle Reservations &amp; Deposit Holds
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automatically locks vehicle status (Available → Reserved) and
            reverts expired holds (Reserved → Available).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {toast && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRunExpiryCheck}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Run Expiry Sync Now</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservations Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active &amp; Past Reservations
              </h2>
              <p className="text-xs text-slate-500">
                Prevents multiple salespeople from promising the same vehicle.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              {reservations.filter((r) => r.isActive).length} Active Hold(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Reserved Vehicle</th>
                  <th className="py-3.5 px-4">Deposit (KSh.)</th>
                  <th className="py-3.5 px-4">Hold Period &amp; Expiry</th>
                  <th className="py-3.5 px-4">Reserved By</th>
                  <th className="py-3.5 px-4 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {reservations.map((res) => {
                  const daysLeft = Math.ceil(
                    (new Date(res.expiryDate).getTime() - Date.now()) /
                      86400000
                  );

                  return (
                    <tr key={res.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/customers/${res.customerId}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                        >
                          {res.customerName}
                        </Link>
                        <p className="text-[11px] text-slate-500">
                          {res.customerPhone}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/inventory/${res.vehicleId}`}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Car className="w-3.5 h-3.5" />
                          {res.vehicleTitle}
                        </Link>
                        <span className="font-mono text-[11px] text-slate-500">
                          Stock: {res.stockNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {formatKSh(res.depositAmount)}
                        </p>
                        <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {res.depositStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-700">
                          From: {formatDate(res.reservationDate)}
                        </p>
                        <p className="font-semibold text-amber-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          Expires: {formatDate(res.expiryDate)}{" "}
                          {res.isActive && `(${daysLeft}d)`}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {res.reservedByName.split(" ")[0]}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {res.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              releaseReservation(res.id, user.name);
                              setToast(
                                `Released hold on ${res.stockNumber} — Vehicle status reverted: Reserved → Available.`
                              );
                              setTimeout(() => setToast(""), 4000);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Release Hold</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                            Released / Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Reservation Form */}
        <form
          onSubmit={handleCreateReservation}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3.5 h-fit"
        >
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Reserve Vehicle (Hold Stock)
              </h2>
              <p className="text-xs text-slate-500">
                Automatically marks vehicle as Reserved.
              </p>
            </div>
          </div>

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
              Available Vehicle to Reserve *
            </label>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {vehicles
                .filter((v) => v.status !== "SOLD")
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.stockNumber} — {v.year} {v.make} {v.model} ({v.status})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deposit Amount (KSh.) *
              </label>
              <input
                type="number"
                required
                value={form.depositAmount}
                onChange={(e) =>
                  setForm({ ...form, depositAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deposit Status
              </label>
              <select
                value={form.depositStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    depositStatus: e.target.value as PaymentStatusEnum,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="UNPAID">Unpaid (Promise)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reservation Date
              </label>
              <input
                type="date"
                value={form.reservationDate}
                onChange={(e) =>
                  setForm({ ...form, reservationDate: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reserved By (Salesperson)
            </label>
            <select
              value={form.reservedById}
              onChange={(e) =>
                setForm({ ...form, reservedById: e.target.value })
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
              Hold Notes
            </label>
            <textarea
              rows={2}
              placeholder="M-Pesa ref / Bank undertaking notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Confirm Reservation &amp; Lock Vehicle</span>
          </button>
        </form>
      </div>
    </div>
  );
}
