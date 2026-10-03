"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Calculator,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatCompactKSh,
  formatDate,
  calculateVehicleFinancials,
} from "@/lib/format";
import { ExpenseCategoryType } from "@/lib/demo-store";

export default function VehicleCostsPage() {
  const { vehicles, addVehicleExpense } = useDealership();
  const { user } = useAuth();

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    vehicles[0]?.id || ""
  );
  const [category, setCategory] = useState<ExpenseCategoryType>("TRANSPORT");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(35000);
  const [toast, setToast] = useState("");

  const totalPurchaseCost = vehicles.reduce(
    (s, v) => s + v.purchasePrice,
    0
  );
  const totalAdditionalExpenses = vehicles.reduce(
    (s, v) => s + v.expenses.reduce((es, e) => es + e.amount, 0),
    0
  );
  const totalLandedInventoryCost = totalPurchaseCost + totalAdditionalExpenses;
  const totalExpectedRevenue = vehicles.reduce(
    (s, v) => s + (v.actualSalePrice || v.askingPrice),
    0
  );
  const totalExpectedProfit = totalExpectedRevenue - totalLandedInventoryCost;

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !description.trim() || amount <= 0) return;
    addVehicleExpense(
      selectedVehicleId,
      {
        category,
        description: description.trim(),
        amount: Number(amount),
      },
      user.name
    );
    setDescription("");
    setToast("Expense recorded and vehicle profitability recalculated.");
    setTimeout(() => setToast(""), 3500);
  };

  const allExpensesFlat = vehicles.flatMap((v) =>
    v.expenses.map((e) => ({
      ...e,
      stockNumber: v.stockNumber,
      vehicleTitle: `${v.year} ${v.make} ${v.model}`,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vehicle Costs &amp; Profitability Engine
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track purchase costs, transport, repairs, detailing, and NTSA
            registration to compute exact gross profit in KSh.
          </p>
        </div>

        {toast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Cost & Profit Formula KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Total Vehicle Purchase Cost
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatCompactKSh(totalPurchaseCost)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Exact: {formatKSh(totalPurchaseCost)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Additional Preparation Expenses
          </span>
          <p className="text-xl font-bold text-amber-700 mt-1">
            {formatKSh(totalAdditionalExpenses)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {allExpensesFlat.length} logged expense items
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Total Landed Cost (Purchase + Expenses)
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatCompactKSh(totalLandedInventoryCost)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Exact: {formatKSh(totalLandedInventoryCost)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Projected / Realized Gross Profit
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            +{formatCompactKSh(totalExpectedProfit)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Exact: {formatKSh(totalExpectedProfit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Per-Vehicle Profitability Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Unit-Level Cost &amp; Gross Profit Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Gross Profit = Selling/Asking Price − (Purchase Price + Expenses)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Purchase Price</th>
                  <th className="py-3 px-4">Expenses</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Asking / Sale Price</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {vehicles.map((v) => {
                  const expSum = v.expenses.reduce((s, e) => s + e.amount, 0);
                  const fin = calculateVehicleFinancials({
                    purchasePrice: v.purchasePrice,
                    expensesTotal: expSum,
                    askingPrice: v.askingPrice,
                    actualSalePrice: v.actualSalePrice,
                  });
                  const profit =
                    fin.actualProfit !== null
                      ? fin.actualProfit
                      : fin.expectedProfit;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/inventory/${v.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600"
                        >
                          {v.stockNumber} • {v.make} {v.model}
                        </Link>
                        <p className="text-[11px] text-slate-500">
                          {v.year} • {v.status}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {formatKSh(v.purchasePrice)}
                      </td>
                      <td className="py-3.5 px-4 text-amber-700 font-semibold">
                        +{formatKSh(expSum)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatKSh(fin.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">
                        {formatKSh(v.actualSalePrice || v.askingPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        +{formatKSh(profit)} ({fin.marginPercent}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Vehicle Expense Card */}
        <form
          onSubmit={handleLogExpense}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Record Vehicle Cost
              </h2>
              <p className="text-xs text-slate-500">
                Attach an expense directly to a stock unit.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.stockNumber} — {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ExpenseCategoryType)
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="TRANSPORT">Transport</option>
              <option value="REPAIRS">Repairs</option>
              <option value="DETAILING">Detailing</option>
              <option value="INSPECTION">Inspection</option>
              <option value="REGISTRATION">Registration</option>
              <option value="INSURANCE">Insurance</option>
              <option value="ADVERTISING">Advertising</option>
              <option value="OTHER">Other Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mombasa CFS port clearance & carrier"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (KSh.)
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Save Vehicle Expense</span>
          </button>
        </form>
      </div>
    </div>
  );
}
