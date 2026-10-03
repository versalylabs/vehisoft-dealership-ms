"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  Plus,
  CheckCircle2,
  Car,
  X,
  TrendingUp,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatCompactKSh,
  formatDate,
  calculateVehicleFinancials,
} from "@/lib/format";
import { PaymentStatusEnum } from "@/lib/demo-store";

const PAYMENT_STATUS_BADGE: Record<PaymentStatusEnum, string> = {
  PAID: "bg-emerald-100 text-emerald-800",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800",
  UNPAID: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-200 text-slate-600",
};

export default function SalesPage() {
  const { sales, customers, vehicles, addSale, markSalePaid } =
    useDealership();
  const { users, user, permissions } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );
  const sellableVehicles = vehicles.filter((v) => v.status !== "SOLD");

  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    vehicleId: sellableVehicles[0]?.id || vehicles[0]?.id || "",
    salespersonId: salespeople[0]?.id || user.id,
    salePrice: sellableVehicles[0]?.askingPrice || 4200000,
    discount: 50000,
    depositPaid: sellableVehicles[0]?.askingPrice
      ? sellableVehicles[0].askingPrice - 50000
      : 4150000,
    paymentMethod: "Bank Transfer (RTGS)",
    paymentStatus: "PAID" as PaymentStatusEnum,
    notes: "",
  });

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const selectedVehicleExpenses = selectedVehicle
    ? selectedVehicle.expenses.reduce((s, e) => s + e.amount, 0)
    : 0;
  const netPricePreview =
    (Number(form.salePrice) || 0) - (Number(form.discount) || 0);
  const balancePreview = Math.max(
    0,
    netPricePreview - (Number(form.depositPaid) || 0)
  );
  const finPreview = calculateVehicleFinancials({
    purchasePrice: selectedVehicle?.purchasePrice || 0,
    expensesTotal: selectedVehicleExpenses,
    askingPrice: netPricePreview,
    actualSalePrice: netPricePreview,
  });

  const totalRevenue = sales.reduce((s, x) => s + x.salePrice, 0);
  const totalGrossProfit = sales.reduce((s, x) => s + x.grossProfit, 0);
  const totalBalanceDue = sales.reduce((s, x) => s + x.balanceDue, 0);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = users.find((u) => u.id === form.salespersonId) || user;

    const created = addSale({
      customerId: form.customerId,
      vehicleId: form.vehicleId,
      salespersonId: sp.id,
      salespersonName: sp.name,
      salePrice: Number(form.salePrice),
      discount: Number(form.discount),
      depositPaid: Number(form.depositPaid),
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      notes:
        form.notes.trim() ||
        "Formal sale agreement signed. Logbook transfer initiated.",
    });

    if (created) {
      setShowModal(false);
      setToast(
        `Sale ${created.saleNumber} completed! Vehicle ${created.stockNumber} marked SOLD with Gross Profit ${formatKSh(
          created.grossProfit
        )}.`
      );
      setTimeout(() => setToast(""), 4500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Completed Vehicle Sales
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Formal sale records, KSh. payment tracking, customer balances, and
            realized gross profit per deal.
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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Completed Sale</span>
          </button>
        </div>
      </div>

      {/* Sales KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Completed Vehicle Sales
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {sales.length} Units Sold
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Total Sales Revenue (KSh.)
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {formatCompactKSh(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-400">
            Exact: {formatKSh(totalRevenue)}
          </p>
        </div>

        {permissions.canViewAllFinancials && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              Realized Gross Profit (KSh.)
            </span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              +{formatCompactKSh(totalGrossProfit)}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              Exact: {formatKSh(totalGrossProfit)}
            </p>
          </div>
        )}

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Outstanding Customer Balances
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {formatKSh(totalBalanceDue)}
          </p>
        </div>
      </div>

      {/* Sales Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Official Sales Register (KSh.)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Sale No. &amp; Date</th>
                <th className="py-3.5 px-4">Buyer</th>
                <th className="py-3.5 px-4">Vehicle Sold</th>
                <th className="py-3.5 px-4">Sale Price &amp; Balance (KSh.)</th>
                {permissions.canViewAllFinancials && (
                  <th className="py-3.5 px-4">Cost vs Gross Profit</th>
                )}
                <th className="py-3.5 px-4">Payment Method &amp; Status</th>
                <th className="py-3.5 px-4">Salesperson</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {sales.map((s) => {
                const totalCost =
                  s.purchaseCostSnapshot + s.expensesSnapshot;
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900">
                        {s.saleNumber}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(s.saleDate)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/customers/${s.customerId}`}
                        className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                      >
                        {s.customerName}
                      </Link>
                      <p className="text-[11px] text-slate-500">
                        {s.customerPhone}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/inventory/${s.vehicleId}`}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Car className="w-3.5 h-3.5" />
                        {s.vehicleTitle}
                      </Link>
                      <p className="font-mono text-[11px] text-slate-500">
                        {s.stockNumber} • Reg: {s.registrationNumber} • VIN:{" "}
                        {s.vin}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {formatKSh(s.salePrice)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Paid: {formatKSh(s.depositPaid)} • Bal:{" "}
                        <strong
                          className={
                            s.balanceDue > 0
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }
                        >
                          {formatKSh(s.balanceDue)}
                        </strong>
                      </p>
                    </td>

                    {permissions.canViewAllFinancials && (
                      <td className="py-3.5 px-4">
                        <p className="text-slate-600">
                          Total Cost: {formatKSh(totalCost)}
                        </p>
                        <p className="font-bold text-emerald-700 text-sm">
                          Profit: +{formatKSh(s.grossProfit)}
                        </p>
                      </td>
                    )}

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          PAYMENT_STATUS_BADGE[s.paymentStatus]
                        }`}
                      >
                        {s.paymentStatus.replace("_", " ")}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {s.paymentMethod}
                      </p>
                      {s.balanceDue > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            markSalePaid(s.id);
                            setToast(
                              `Cleared balance on ${s.saleNumber} — Payment status updated to PAID.`
                            );
                            setTimeout(() => setToast(""), 3500);
                          }}
                          className="mt-1 text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Mark Balance Paid →
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {s.salespersonName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Close Deal &amp; Record Vehicle Sale
                </h2>
                <p className="text-xs text-slate-500">
                  Automatically marks the vehicle as SOLD and locks in realized
                  gross profit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer (Customer) *
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
                    Vehicle Sold *
                  </label>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => {
                      const v = vehicles.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        vehicleId: e.target.value,
                        salePrice: v ? v.askingPrice : form.salePrice,
                        depositPaid: v ? v.askingPrice : form.depositPaid,
                        discount: 0,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {sellableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.stockNumber} — {v.year} {v.make} {v.model} (
                        {formatCompactKSh(v.askingPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Agreed Gross Price (KSh.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.salePrice}
                    onChange={(e) =>
                      setForm({ ...form, salePrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Granted (KSh.)
                  </label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({ ...form, discount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount / Deposit Paid (KSh.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.depositPaid}
                    onChange={(e) =>
                      setForm({ ...form, depositPaid: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bank Transfer (RTGS)">
                      Bank Transfer (RTGS)
                    </option>
                    <option value="M-Pesa Paybill">M-Pesa Paybill</option>
                    <option value="Asset Finance / Bank Release">
                      Asset Finance / Bank Release
                    </option>
                    <option value="Cash Deposit">Cash Deposit</option>
                    <option value="Bankers Cheque">Bankers Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentStatus: e.target.value as PaymentStatusEnum,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Closing Salesperson
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
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Deal Profit Preview */}
              <div className="p-4 rounded-xl bg-slate-900 text-white grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Net Sale Price
                  </span>
                  <span className="font-bold text-sm">
                    {formatKSh(netPricePreview)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Balance Due
                  </span>
                  <span className="font-bold text-sm text-amber-400">
                    {formatKSh(balancePreview)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Realized Gross Profit
                  </span>
                  <span className="font-bold text-sm text-emerald-400">
                    +{formatKSh(finPreview.actualProfit ?? 0)}
                  </span>
                </div>
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
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
