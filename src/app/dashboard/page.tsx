"use client";

import React from "react";
import Link from "next/link";
import {
  Car,
  BookmarkCheck,
  BadgeDollarSign,
  Wallet,
  TrendingUp,
  Kanban,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Clock,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useDealership } from "@/context/DealershipContext";
import { ROLE_LABELS } from "@/lib/auth";
import {
  formatKSh,
  formatCompactKSh,
  formatDate,
  getInventoryAgeBucket,
} from "@/lib/format";

export default function DashboardPage() {
  const { user, permissions } = useAuth();
  const { vehicles, leads, activities, sales } = useDealership();

  // =========================================================================
  // 1. KEY CARDS METRICS (Section 1)
  // =========================================================================
  const inStockUnits = vehicles.filter(
    (v) => v.status === "AVAILABLE" || v.status === "IN_TRANSIT"
  );
  const reservedUnits = vehicles.filter((v) => v.status === "RESERVED");
  const soldThisMonthCount = sales.length;

  const totalInventoryValue = vehicles
    .filter((v) => v.status !== "SOLD" && v.status !== "ARCHIVED")
    .reduce((sum, v) => sum + v.askingPrice, 0);

  const salesValueThisMonth = sales.reduce((sum, s) => sum + s.salePrice, 0);
  const grossProfitThisMonth = sales.reduce((sum, s) => sum + s.grossProfit, 0);

  const activeLeads = leads.filter(
    (l) => l.stage !== "SOLD" && l.stage !== "LOST"
  );
  const pendingFollowUps = activities.filter((a) => a.status === "DUE");

  // =========================================================================
  // 2. CHART DATA (Section 1)
  // =========================================================================

  // A. Sales this month vs previous months (in Millions of KSh.)
  const monthlySalesChartData = [
    { month: "May", salesM: 9.8, profitM: 1.15, units: 2 },
    { month: "Jun", salesM: 14.2, profitM: 1.68, units: 3 },
    { month: "Jul", salesM: 11.5, profitM: 1.32, units: 3 },
    { month: "Aug", salesM: 16.9, profitM: 2.05, units: 4 },
    { month: "Sep", salesM: 15.1, profitM: 1.82, units: 3 },
    {
      month: "Oct (Current)",
      salesM: Number((salesValueThisMonth / 1_000_000).toFixed(2)),
      profitM: Number((grossProfitThisMonth / 1_000_000).toFixed(2)),
      units: soldThisMonthCount,
    },
  ];

  // B. Sales by Salesperson
  const salesByPersonMap = new Map<
    string,
    { name: string; revenueM: number; profitM: number; count: number }
  >();
  sales.forEach((s) => {
    const first = s.salespersonName.split(" ")[0];
    const prev = salesByPersonMap.get(first) || {
      name: first,
      revenueM: 0,
      profitM: 0,
      count: 0,
    };
    prev.revenueM = Number(
      (prev.revenueM + s.salePrice / 1_000_000).toFixed(2)
    );
    prev.profitM = Number(
      (prev.profitM + s.grossProfit / 1_000_000).toFixed(2)
    );
    prev.count += 1;
    salesByPersonMap.set(first, prev);
  });
  const salesBySalespersonData = Array.from(salesByPersonMap.values());

  // C. Sales Pipeline by Stage
  const stageLabels: { key: string; label: string; color: string }[] = [
    { key: "NEW", label: "New", color: "#64748b" },
    { key: "CONTACTED", label: "Contacted", color: "#3b82f6" },
    { key: "QUALIFIED", label: "Qualified", color: "#6366f1" },
    { key: "VIEWING", label: "Viewing", color: "#a855f7" },
    { key: "TEST_DRIVE", label: "Test Drive", color: "#f59e0b" },
    { key: "NEGOTIATION", label: "Negotiation", color: "#f97316" },
    { key: "RESERVED", label: "Reserved", color: "#10b981" },
    { key: "SOLD", label: "Sold", color: "#16a34a" },
  ];

  const pipelineByStageData = stageLabels.map((st) => ({
    stage: st.label,
    count: leads.filter((l) => l.stage === st.key).length,
    color: st.color,
  }));

  // D. Inventory by Vehicle Type (Body Type)
  const bodyTypeCounts = new Map<string, number>();
  vehicles
    .filter((v) => v.status !== "SOLD")
    .forEach((v) => {
      bodyTypeCounts.set(v.bodyType, (bodyTypeCounts.get(v.bodyType) || 0) + 1);
    });
  const inventoryByTypeData = Array.from(bodyTypeCounts.entries()).map(
    ([type, count]) => ({ type, count })
  );

  // E. Inventory Age Buckets: 0–30, 31–60, 61–90, 90+ days
  const activeStockUnits = vehicles.filter((v) => v.status !== "SOLD");
  const ageBuckets: {
    bucket: "0–30 days" | "31–60 days" | "61–90 days" | "90+ days";
    count: number;
    badge: string;
  }[] = [
    {
      bucket: "0–30 days",
      count: activeStockUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "0–30 days"
      ).length,
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      bucket: "31–60 days",
      count: activeStockUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "31–60 days"
      ).length,
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      bucket: "61–90 days",
      count: activeStockUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "61–90 days"
      ).length,
      badge: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      bucket: "90+ days",
      count: activeStockUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "90+ days"
      ).length,
      badge: "bg-red-50 text-red-700 border-red-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Executive Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {user.name} • {ROLE_LABELS[user.role]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dealership Performance Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time snapshot of vehicle stock, sales pipeline, follow-ups, and
            KSh. profitability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Log New Enquiry</span>
          </Link>
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Kanban className="w-4 h-4" />
            <span>Open Pipeline Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 8 KEY KPI CARDS (Section 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Vehicles in stock */}
        <Link
          href="/inventory"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>1. Vehicles in Stock</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {inStockUnits.length} Units
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {vehicles.filter((v) => v.status === "AVAILABLE").length} Showroom •{" "}
            {vehicles.filter((v) => v.status === "IN_TRANSIT").length} In
            Transit
          </p>
        </Link>

        {/* 2. Vehicles reserved */}
        <Link
          href="/reservations"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>2. Vehicles Reserved</span>
            <BookmarkCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {reservedUnits.length} Reserved
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Held against customer deposit
          </p>
        </Link>

        {/* 3. Vehicles sold this month */}
        <Link
          href="/sales"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>3. Vehicles Sold This Month</span>
            <BadgeDollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {soldThisMonthCount} Units Sold
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Closed deals in Oct 2026
          </p>
        </Link>

        {/* 4. Total inventory value */}
        <Link
          href="/inventory"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>4. Total Inventory Value</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCompactKSh(totalInventoryValue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Exact: {formatKSh(totalInventoryValue)}
          </p>
        </Link>

        {/* 5. Sales value this month */}
        <Link
          href="/sales"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>5. Sales Value This Month</span>
            <BadgeDollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">
            {formatCompactKSh(salesValueThisMonth)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Exact: {formatKSh(salesValueThisMonth)}
          </p>
        </Link>

        {/* 6. Gross profit this month */}
        <Link
          href="/inventory/costs"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>6. Gross Profit This Month</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          {permissions.canViewAllFinancials ? (
            <>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                +{formatCompactKSh(grossProfitThisMonth)}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Exact: {formatKSh(grossProfitThisMonth)}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-slate-400 mt-2">
                Restricted
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Admin / Manager view only
              </p>
            </>
          )}
        </Link>

        {/* 7. Active leads */}
        <Link
          href="/pipeline"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>7. Active Sales Leads</span>
            <Kanban className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {activeLeads.length} Active Leads
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across 7 open pipeline stages
          </p>
        </Link>

        {/* 8. Pending follow-ups */}
        <Link
          href="/follow-ups"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>8. Pending Follow-ups</span>
            <PhoneCall className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {pendingFollowUps.length} Due Today
          </p>
          <p className="text-xs text-amber-800 font-medium mt-1">
            Click to open salesperson queue →
          </p>
        </Link>
      </div>

      {/* CHARTS ROW 1: Monthly Sales Trend + Sales Pipeline by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales this month vs previous months */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sales This Month vs Previous Months (KSh. Millions)
              </h2>
              <p className="text-xs text-slate-500">
                Monthly sales revenue and realized gross profit trend.
              </p>
            </div>
            <Link
              href="/reports?tab=sales"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Full Report →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}M`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `KSh. ${value}M`,
                    name === "salesM" ? "Sales Revenue" : "Gross Profit",
                  ]}
                />
                <Bar
                  dataKey="salesM"
                  name="Sales Revenue"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="profitM"
                  name="Gross Profit"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Pipeline by Stage */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sales Pipeline by Stage
              </h2>
              <p className="text-xs text-slate-500">
                Distribution of leads from New Enquiry to Sold.
              </p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Kanban Board →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]}>
                  {pipelineByStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS & WIDGETS ROW 2: Sales by Salesperson + Inventory by Type + Inventory Age */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Salesperson */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Sales by Salesperson (KSh.)
          </h2>
          <div className="space-y-3">
            {salesBySalespersonData.map((sp) => (
              <div
                key={sp.name}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{sp.name}</p>
                  <p className="text-xs text-slate-500">
                    {sp.count} Vehicle(s) Sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-700">
                    KSh. {sp.revenueM}M
                  </p>
                  {permissions.canViewAllFinancials && (
                    <p className="text-[11px] font-semibold text-emerald-700">
                      Profit: +KSh. {sp.profitM}M
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory by Vehicle Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Inventory by Vehicle Body Type
          </h2>
          <div className="space-y-2.5">
            {inventoryByTypeData.map((item) => {
              const pct = Math.round(
                (item.count / Math.max(1, activeStockUnits.length)) * 100
              );
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.type}</span>
                    <span className="text-slate-600">
                      {item.count} units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Age: 0–30, 31–60, 61–90, 90+ days */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Inventory Aging Analysis
            </h2>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ageBuckets.map((b) => (
              <div
                key={b.bucket}
                className={`p-3.5 rounded-xl border ${b.badge}`}
              >
                <span className="text-xs font-bold block">{b.bucket}</span>
                <span className="text-2xl font-extrabold mt-1 block">
                  {b.count} Units
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Target stock turn threshold: <strong>60 days</strong>. Units over 60
            days are highlighted for price review.
          </p>
        </div>
      </div>

      {/* OPERATIONAL LIST WIDGETS ROW 3: Recent Enquiries, Upcoming Follow-ups, Recently Sold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Recent Customer Enquiries
            </h2>
            <Link
              href="/leads"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {leads.slice(0, 4).map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/customers/${l.customerId}`}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600"
                  >
                    {l.customerName}
                  </Link>
                  <p className="text-[11px] text-slate-500">
                    {l.vehicleTitle} • {l.source.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 block">
                    {formatCompactKSh(l.askingPrice)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {l.stage.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Upcoming Follow-ups
            </h2>
            <Link
              href="/follow-ups"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Queue →
            </Link>
          </div>
          <div className="space-y-3">
            {activities
              .filter((a) => a.status === "DUE")
              .slice(0, 4)
              .map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {act.customerName} ({act.vehicleTitle})
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {act.notes}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {act.type}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {act.staffName.split(" ")[0]}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recently Sold Vehicles */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Recently Sold Vehicles
            </h2>
            <Link
              href="/sales"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Sales Register →
            </Link>
          </div>
          <div className="space-y-3">
            {sales.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/40 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {s.vehicleTitle}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Buyer: {s.customerName} • {formatDate(s.saleDate)}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatCompactKSh(s.salePrice)}
                  </span>
                  {permissions.canViewAllFinancials && (
                    <span className="text-[10px] font-bold text-emerald-700">
                      +{formatCompactKSh(s.grossProfit)} Profit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
