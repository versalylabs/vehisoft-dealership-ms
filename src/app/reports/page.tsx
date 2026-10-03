"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Download,
  Car,
  Users,
  TrendingUp,
  BadgeDollarSign,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatCompactKSh,
  formatDate,
  getInventoryAgeDays,
  getInventoryAgeBucket,
  calculateVehicleFinancials,
} from "@/lib/format";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "sales";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const { vehicles, leads, sales } = useDealership();
  const { permissions } = useAuth();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  // CSV Export Helper
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows
        .map((r) =>
          r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // 1. SALES REPORTS METRICS
  // =========================================================================
  const totalSalesRevenue = sales.reduce((s, x) => s + x.salePrice, 0);
  const totalCostOfSold = sales.reduce(
    (s, x) => s + x.purchaseCostSnapshot + x.expensesSnapshot,
    0
  );
  const totalRealizedProfit = sales.reduce((s, x) => s + x.grossProfit, 0);
  const totalOutstandingBalances = sales.reduce((s, x) => s + x.balanceDue, 0);

  // =========================================================================
  // 2. INVENTORY REPORTS METRICS
  // =========================================================================
  const activeStock = vehicles.filter((v) => v.status !== "SOLD");
  const vehiclesWithNoEnquiries = activeStock.filter(
    (v) => !leads.some((l) => l.vehicleId === v.id)
  );
  const vehiclesApproachingTargetAge = activeStock.filter(
    (v) => getInventoryAgeDays(v.dateAcquired) >= 45
  );

  // =========================================================================
  // 3. CRM REPORTS METRICS
  // =========================================================================
  const soldLeadsCount = leads.filter((l) => l.stage === "SOLD").length;
  const conversionRate =
    leads.length > 0 ? Math.round((soldLeadsCount / leads.length) * 100) : 0;

  const leadSourcesBreakdown = Array.from(
    new Set(leads.map((l) => l.source))
  ).map((source) => {
    const group = leads.filter((l) => l.source === source);
    const won = group.filter((l) => l.stage === "SOLD").length;
    return {
      source,
      count: group.length,
      won,
      pipelineValue: group.reduce((s, l) => s + l.askingPrice, 0),
    };
  });

  const handleExportCurrentTab = () => {
    if (activeTab === "sales" || activeTab === "profitability") {
      downloadCSV("vehisoft-sales-profitability-report.csv", [
        [
          "Sale Number",
          "Sale Date",
          "Customer",
          "Vehicle",
          "Stock No",
          "Sale Price (KSh)",
          "Total Cost (KSh)",
          "Gross Profit (KSh)",
          "Balance Due (KSh)",
          "Salesperson",
        ],
        ...sales.map((s) => [
          s.saleNumber,
          formatDate(s.saleDate),
          s.customerName,
          s.vehicleTitle,
          s.stockNumber,
          String(s.salePrice),
          String(s.purchaseCostSnapshot + s.expensesSnapshot),
          String(s.grossProfit),
          String(s.balanceDue),
          s.salespersonName,
        ]),
      ]);
    } else if (activeTab === "inventory") {
      downloadCSV("vehisoft-inventory-aging-report.csv", [
        [
          "Stock No",
          "Registration",
          "Make",
          "Model",
          "Year",
          "Status",
          "Days in Stock",
          "Age Bucket",
          "Asking Price (KSh)",
        ],
        ...vehicles.map((v) => [
          v.stockNumber,
          v.registrationNumber,
          v.make,
          v.model,
          String(v.year),
          v.status,
          String(getInventoryAgeDays(v.dateAcquired)),
          getInventoryAgeBucket(v.dateAcquired),
          String(v.askingPrice),
        ]),
      ]);
    } else {
      downloadCSV("vehisoft-crm-leads-report.csv", [
        [
          "Customer",
          "Vehicle",
          "Source",
          "Stage",
          "Asking Price (KSh)",
          "Budget (KSh)",
          "Salesperson",
        ],
        ...leads.map((l) => [
          l.customerName,
          l.vehicleTitle,
          l.source,
          l.stage,
          String(l.askingPrice),
          String(l.budget),
          l.assignedSalespersonName,
        ]),
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dealership Reports &amp; Business Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sales performance, inventory aging &amp; zero-enquiry alerts, CRM
            conversion rates, and KSh. financial profitability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCurrentTab}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Report to CSV</span>
        </button>
      </div>

      {/* Report Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: "sales",
            label: "1. Sales Reports",
            icon: <BadgeDollarSign className="w-4 h-4" />,
          },
          {
            id: "inventory",
            label: "2. Inventory & Aging Reports",
            icon: <Car className="w-4 h-4" />,
          },
          {
            id: "leads",
            label: "3. CRM & Lead Conversion",
            icon: <Users className="w-4 h-4" />,
          },
          ...(permissions.canViewAllFinancials
            ? [
                {
                  id: "profitability",
                  label: "4. Financial & Profitability",
                  icon: <TrendingUp className="w-4 h-4" />,
                },
              ]
            : []),
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === t.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: SALES REPORTS */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Total Units Sold
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {sales.length} Vehicles
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Total Sales Revenue (KSh.)
              </span>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatKSh(totalSalesRevenue)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Average Deal Size
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCompactKSh(
                  sales.length > 0 ? totalSalesRevenue / sales.length : 0
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Sales by Vehicle, Make, Price Range &amp; Salesperson
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Sale No.</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Vehicle Sold</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Salesperson</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4 text-right">Sale Price (KSh.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {s.saleNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(s.saleDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {s.vehicleTitle} ({s.stockNumber})
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {s.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        {s.salespersonName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {s.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatKSh(s.salePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY REPORTS (Section 11) */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicles Approaching / Exceeding Target Age */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Aging Stock &amp; Approaching 60-Day Target
                  </h2>
                  <p className="text-xs text-slate-500">
                    Units in stock 45+ days recommended for price review or
                    promotion.
                  </p>
                </div>
              </div>

              {vehiclesApproachingTargetAge.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No active stock units exceed 45 days.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {vehiclesApproachingTargetAge.map((v) => {
                    const days = getInventoryAgeDays(v.dateAcquired);
                    return (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between"
                      >
                        <div>
                          <Link
                            href={`/inventory/${v.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600"
                          >
                            {v.stockNumber} • {v.year} {v.make} {v.model}
                          </Link>
                          <p className="text-[11px] text-slate-600">
                            Asking: {formatKSh(v.askingPrice)} • Min:{" "}
                            {formatKSh(v.minimumPrice)}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                          {days} Days Old
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vehicles with No Enquiries */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-indigo-600" />
                  Vehicles with Zero Enquiries ({vehiclesWithNoEnquiries.length}
                  )
                </h2>
                <p className="text-xs text-slate-500">
                  Active inventory units that currently have no linked CRM
                  leads.
                </p>
              </div>

              {vehiclesWithNoEnquiries.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                  100% of current stock units have active customer enquiries!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {vehiclesWithNoEnquiries.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <Link
                          href={`/inventory/${v.id}`}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600"
                        >
                          {v.stockNumber} • {v.year} {v.make} {v.model}
                        </Link>
                        <p className="text-[11px] text-slate-500">
                          Status: {v.status}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {formatKSh(v.askingPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Complete Stock Valuation Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Complete Stock Status &amp; Aging Register
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Stock No.</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date Acquired</th>
                    <th className="py-3 px-4">Age Bucket</th>
                    <th className="py-3 px-4 text-right">Asking Price (KSh.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold">
                        {v.stockNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {v.year} {v.make} {v.model}
                      </td>
                      <td className="py-3 px-4">{v.status}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(v.dateAcquired)}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {getInventoryAgeDays(v.dateAcquired)}d (
                        {getInventoryAgeBucket(v.dateAcquired)})
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatKSh(v.askingPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CRM & LEADS REPORTS (Section 11) */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Total Leads Tracked
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {leads.length} Enquiries
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Lead-to-Sale Conversion Rate
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {conversionRate}%
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Lost Leads
              </span>
              <p className="text-2xl font-bold text-slate-700 mt-1">
                {leads.filter((l) => l.stage === "LOST").length} Lost
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Leads by Source Attribution &amp; Pipeline Value (KSh.)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Lead Source</th>
                    <th className="py-3.5 px-4">Total Enquiries</th>
                    <th className="py-3.5 px-4">Closed Won (Sold)</th>
                    <th className="py-3.5 px-4 text-right">
                      Total Pipeline Value (KSh.)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {leadSourcesBreakdown.map((row) => (
                    <tr key={row.source} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {row.source.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-4">{row.count} Leads</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {row.won} Sold
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatKSh(row.pipelineValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL & PROFITABILITY REPORTS (Section 11) */}
      {activeTab === "profitability" && permissions.canViewAllFinancials && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                1. Total Sales Revenue
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {formatKSh(totalSalesRevenue)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                2. Cost of Vehicles Sold
              </span>
              <p className="text-xl font-bold text-slate-700 mt-1">
                {formatKSh(totalCostOfSold)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                3. Realized Gross Profit
              </span>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                +{formatKSh(totalRealizedProfit)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                4. Outstanding Customer Balances
              </span>
              <p className="text-xl font-bold text-amber-700 mt-1">
                {formatKSh(totalOutstandingBalances)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Deal-by-Deal Profitability &amp; Balance Sheet (KSh.)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Sale / Vehicle</th>
                    <th className="py-3.5 px-4">Purchase Cost</th>
                    <th className="py-3.5 px-4">Prep Expenses</th>
                    <th className="py-3.5 px-4">Total Landed Cost</th>
                    <th className="py-3.5 px-4">Net Sale Price</th>
                    <th className="py-3.5 px-4">Balance Due</th>
                    <th className="py-3.5 px-4 text-right">Gross Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {sales.map((s) => {
                    const landed =
                      s.purchaseCostSnapshot + s.expensesSnapshot;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">
                            {s.saleNumber} • {s.vehicleTitle}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Buyer: {s.customerName}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          {formatKSh(s.purchaseCostSnapshot)}
                        </td>
                        <td className="py-3.5 px-4 text-amber-700">
                          +{formatKSh(s.expensesSnapshot)}
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {formatKSh(landed)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-blue-700">
                          {formatKSh(s.salePrice)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-700">
                          {formatKSh(s.balanceDue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          +{formatKSh(s.grossProfit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Loading reports...</div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
