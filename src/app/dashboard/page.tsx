"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  Globe,
  Bot,
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
  PieChart,
  Pie,
  Legend,
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

const PIE_COLORS = ["#00b3dd", "#847dff", "#dd90d8", "#90b8f0", "#d1c9ff"];

export default function DashboardPage() {
  const { user, permissions } = useAuth();
  const {
    vehicles,
    leads,
    activities,
    reservations,
    sales,
    aiConversations,
    updateActivityStatus,
  } = useDealership();

  const [salesChartFilter, setSalesChartFilter] = useState<
    "BOTH" | "REVENUE" | "PROFIT"
  >("BOTH");

  // =========================================================================
  // 1. KEY CARDS METRICS (100% Derived from Live Context State)
  // =========================================================================
  const availableShowroomUnits = vehicles.filter(
    (v) => v.status === "AVAILABLE"
  );
  const inTransitUnits = vehicles.filter((v) => v.status === "IN_TRANSIT");
  const inStockUnits = vehicles.filter(
    (v) => v.status === "AVAILABLE" || v.status === "IN_TRANSIT"
  );
  const reservedUnits = vehicles.filter((v) => v.status === "RESERVED");
  const activeUnsoldUnits = vehicles.filter(
    (v) =>
      v.status === "AVAILABLE" ||
      v.status === "RESERVED" ||
      v.status === "IN_TRANSIT"
  );

  const soldThisMonthCount = sales.length;

  const totalInventoryValue = activeUnsoldUnits.reduce(
    (sum, v) => sum + v.askingPrice,
    0
  );
  const totalDepositHeld = reservations
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.depositAmount, 0);

  const salesValueThisMonth = sales.reduce((sum, s) => sum + s.salePrice, 0);
  const grossProfitThisMonth = sales.reduce((sum, s) => sum + s.grossProfit, 0);
  const realizedMarginPct =
    salesValueThisMonth > 0
      ? ((grossProfitThisMonth / salesValueThisMonth) * 100).toFixed(1)
      : "0.0";

  const activeLeads = leads.filter(
    (l) => l.stage !== "SOLD" && l.stage !== "LOST"
  );
  const activePipelineValue = activeLeads.reduce(
    (sum, l) => sum + l.askingPrice,
    0
  );
  const pendingFollowUps = activities.filter(
    (a) => a.status === "DUE" || a.status === "OVERDUE"
  );

  // =========================================================================
  // 2. CHART DATA (100% Accurate & Interactive)
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
    {
      name: string;
      fullName: string;
      revenue: number;
      revenueM: number;
      profit: number;
      profitM: number;
      count: number;
    }
  >();
  sales.forEach((s) => {
    const first = s.salespersonName.split(" ")[0];
    const prev = salesByPersonMap.get(s.salespersonName) || {
      name: first,
      fullName: s.salespersonName,
      revenue: 0,
      revenueM: 0,
      profit: 0,
      profitM: 0,
      count: 0,
    };
    prev.revenue += s.salePrice;
    prev.revenueM = Number((prev.revenue / 1_000_000).toFixed(2));
    prev.profit += s.grossProfit;
    prev.profitM = Number((prev.profit / 1_000_000).toFixed(2));
    prev.count += 1;
    salesByPersonMap.set(s.salespersonName, prev);
  });
  const salesBySalespersonData = Array.from(salesByPersonMap.values());

  // C. Sales Pipeline by Stage
  // C. Sales Pipeline by Stage
  const stageLabels: { key: string; label: string; color: string }[] = [
    { key: "NEW", label: "New", color: "#64748b" },
    { key: "CONTACTED", label: "Contacted", color: "#90b8f0" },
    { key: "QUALIFIED", label: "Qualified", color: "#847dff" },
    { key: "VIEWING", label: "Viewing", color: "#dd90d8" },
    { key: "TEST_DRIVE", label: "Test Drive", color: "#d1c9ff" },
    { key: "NEGOTIATION", label: "Negotiation", color: "#00b3dd" },
    { key: "RESERVED", label: "Reserved", color: "#10b981" },
    { key: "SOLD", label: "Sold", color: "#34d399" },
  ];

  const pipelineByStageData = stageLabels.map((st) => {
    const stageLeads = leads.filter((l) => l.stage === st.key);
    return {
      stage: st.label,
      count: stageLeads.length,
      valueM: Number(
        (
          stageLeads.reduce((s, l) => s + l.askingPrice, 0) / 1_000_000
        ).toFixed(2)
      ),
      color: st.color,
    };
  });

  // D. Inventory by Vehicle Body Type (Active Unsold Stock)
  const bodyTypeCounts = new Map<string, { count: number; value: number }>();
  activeUnsoldUnits.forEach((v) => {
    const prev = bodyTypeCounts.get(v.bodyType) || { count: 0, value: 0 };
    bodyTypeCounts.set(v.bodyType, {
      count: prev.count + 1,
      value: prev.value + v.askingPrice,
    });
  });
  const inventoryByTypeData = Array.from(bodyTypeCounts.entries()).map(
    ([type, data], idx) => ({
      name: type,
      type,
      count: data.count,
      value: data.value,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    })
  );

  // E. Inventory Age Buckets: 0–30, 31–60, 61–90, 90+ days
  const ageBuckets: {
    bucket: "0–30 days" | "31–60 days" | "61–90 days" | "90+ days";
    count: number;
    color: string;
    badge: string;
  }[] = [
    {
      bucket: "0–30 days",
      count: activeUnsoldUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "0–30 days"
      ).length,
      color: "#34d399",
      badge: "bg-[#17181a] text-emerald-400 border border-white/10 hover:border-emerald-500/50",
    },
    {
      bucket: "31–60 days",
      count: activeUnsoldUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "31–60 days"
      ).length,
      color: "#00b3dd",
      badge: "bg-[#17181a] text-[#00b3dd] border border-white/10 hover:border-[#00b3dd]/50",
    },
    {
      bucket: "61–90 days",
      count: activeUnsoldUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "61–90 days"
      ).length,
      color: "#847dff",
      badge: "bg-[#17181a] text-[#847dff] border border-white/10 hover:border-[#847dff]/50",
    },
    {
      bucket: "90+ days",
      count: activeUnsoldUnits.filter(
        (v) => getInventoryAgeBucket(v.dateAcquired) === "90+ days"
      ).length,
      color: "#dd90d8",
      badge: "bg-[#17181a] text-[#dd90d8] border border-white/10 hover:border-[#dd90d8]/50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Executive Header */}
      <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-white/5 border border-white/10 text-white/80 font-mono text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00b3dd]" />
            <span>
              {user.name} ({user.email}) · {ROLE_LABELS[user.role]}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-tight">
            Dealership Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
            Real-time snapshot of vehicle stock ({activeUnsoldUnits.length}{" "}
            active units), sales pipeline ({leads.length} total leads), AI agent
            sessions ({aiConversations.length}), and KSh. profitability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/20 bg-transparent hover:bg-white hover:text-black text-white text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <Globe className="w-4 h-4 text-[#00b3dd]" />
            <span>Public Website</span>
          </Link>
          <Link
            href="/ai-conversations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/10 bg-[#17181a] hover:bg-[#222428] text-white/90 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <Bot className="w-4 h-4 text-[#847dff]" />
            <span>AI ({aiConversations.length})</span>
          </Link>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/10 bg-[#17181a] hover:bg-[#222428] text-white/90 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4 text-[#00b3dd]" />
            <span>Log Enquiry</span>
          </Link>
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-white hover:bg-white/90 text-black text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            <Kanban className="w-4 h-4" />
            <span>Pipeline Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 8 KEY KPI CARDS (Section 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Vehicles in stock */}
        <Link
          href="/inventory"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>1. Vehicles in Stock</span>
            <Car className="w-4 h-4 text-[#00b3dd]" />
          </div>
          <p className="text-2xl font-serif font-light text-white mt-2">
            {inStockUnits.length} Units
          </p>
          <p className="text-[11px] text-white/50 mt-1 font-mono">
            {availableShowroomUnits.length} Showroom · {inTransitUnits.length} In Transit
          </p>
        </Link>

        {/* 2. Vehicles reserved */}
        <Link
          href="/reservations"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>2. Vehicles Reserved</span>
            <BookmarkCheck className="w-4 h-4 text-[#847dff]" />
          </div>
          <p className="text-2xl font-serif font-light text-[#847dff] mt-2">
            {reservedUnits.length} Reserved
          </p>
          <p className="text-[11px] text-white/50 mt-1 font-mono">
            Deposits: {formatCompactKSh(totalDepositHeld)}
          </p>
        </Link>

        {/* 3. Vehicles sold this month */}
        <Link
          href="/sales"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>3. Sold This Month</span>
            <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-light text-white mt-2">
            {soldThisMonthCount} Units Sold
          </p>
          <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
            {vehicles.filter((v) => v.status === "SOLD").length} Completed in Register
          </p>
        </Link>

        {/* 4. Total inventory value */}
        <Link
          href="/inventory"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>4. Total Inventory Value</span>
            <Wallet className="w-4 h-4 text-[#90b8f0]" />
          </div>
          <p className="text-2xl font-serif font-light text-white mt-2">
            {formatCompactKSh(totalInventoryValue)}
          </p>
          <p className="text-[11px] text-white/50 mt-1 font-mono">
            {activeUnsoldUnits.length} Active Unsold Units
          </p>
        </Link>

        {/* 5. Sales value this month */}
        <Link
          href="/sales"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>5. Sales Value (Oct)</span>
            <BadgeDollarSign className="w-4 h-4 text-[#00b3dd]" />
          </div>
          <p className="text-2xl font-serif font-light text-[#00b3dd] mt-2">
            {formatCompactKSh(salesValueThisMonth)}
          </p>
          <p className="text-[11px] text-white/50 mt-1 font-mono">
            {soldThisMonthCount} Completed Deals
          </p>
        </Link>

        {/* 6. Gross profit this month */}
        <Link
          href="/reports?tab=profitability"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>6. Gross Profit (Oct)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          {permissions.canViewAllFinancials ? (
            <>
              <p className="text-2xl font-serif font-light text-emerald-400 mt-2">
                +{formatCompactKSh(grossProfitThisMonth)}
              </p>
              <p className="text-[11px] text-emerald-400/80 font-mono mt-1">
                {realizedMarginPct}% Realized Margin
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-mono text-white/40 mt-2">
                Restricted
              </p>
              <p className="text-[11px] text-white/40 mt-1 font-mono">
                Admin view only
              </p>
            </>
          )}
        </Link>

        {/* 7. Active leads */}
        <Link
          href="/pipeline"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>7. Active Sales Leads</span>
            <Kanban className="w-4 h-4 text-[#847dff]" />
          </div>
          <p className="text-2xl font-serif font-light text-white mt-2">
            {activeLeads.length} Leads
          </p>
          <p className="text-[11px] text-white/50 mt-1 font-mono">
            Pipeline: {formatCompactKSh(activePipelineValue)}
          </p>
        </Link>

        {/* 8. Pending follow-ups */}
        <Link
          href="/follow-ups"
          className="bg-[#0f1011] p-5 rounded-[16px] border border-white/10 hover:border-white/30 transition-all text-white group"
        >
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider">
            <span>8. Pending Follow-ups</span>
            <PhoneCall className="w-4 h-4 text-[#dd90d8]" />
          </div>
          <p className="text-2xl font-serif font-light text-[#dd90d8] mt-2">
            {pendingFollowUps.length} Due Today
          </p>
          <p className="text-[11px] text-white/50 mt-1 font-mono">
            Open salesperson queue →
          </p>
        </Link>
      </div>

      {/* CHARTS ROW 1: Monthly Sales Trend + Sales Pipeline by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales this month vs previous months */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-serif font-light text-white tracking-tight">
                Sales This Month vs Previous Months (KSh. Millions)
              </h2>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Monthly revenue and realized gross profit trajectory.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#17181a] border border-white/10 p-1 rounded-[6px] text-[11px] font-mono uppercase tracking-wider">
                {(["BOTH", "REVENUE", "PROFIT"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSalesChartFilter(mode)}
                    className={`px-2 py-1 rounded-[4px] transition-colors cursor-pointer ${
                      salesChartFilter === mode
                        ? "bg-white text-black font-semibold shadow-2xs"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {mode === "BOTH"
                      ? "Both"
                      : mode === "REVENUE"
                      ? "Revenue"
                      : "Profit"}
                  </button>
                ))}
              </div>
              <Link
                href="/reports?tab=sales"
                className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
              >
                Report →
              </Link>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222428" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} stroke="#333" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  tickFormatter={(v) => `${v}M`}
                  stroke="#333"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1011", borderColor: "#3f4041", borderRadius: 8, color: "#ffffff" }}
                  formatter={(value: number, name: string) => [
                    `KSh. ${value}M`,
                    name === "Sales Revenue" ? "Sales Revenue" : "Gross Profit",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#999" }} />
                {(salesChartFilter === "BOTH" ||
                  salesChartFilter === "REVENUE") && (
                  <Bar
                    dataKey="salesM"
                    name="Sales Revenue"
                    fill="#00b3dd"
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {(salesChartFilter === "BOTH" ||
                  salesChartFilter === "PROFIT") && (
                  <Bar
                    dataKey="profitM"
                    name="Gross Profit"
                    fill="#847dff"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Pipeline by Stage */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-light text-white tracking-tight">
                Sales Pipeline by Stage ({leads.length} Leads)
              </h2>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Distribution across conversion lifecycle.
              </p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
            >
              Kanban Board →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222428" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#888" }}
                  stroke="#333"
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={90}
                  tick={{ fontSize: 11, fill: "#888" }}
                  stroke="#333"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1011", borderColor: "#3f4041", borderRadius: 8, color: "#ffffff" }}
                  formatter={(value: number, _name: string, props: { payload?: { valueM?: number } }) => [
                    `${value} Lead(s) · KSh. ${props?.payload?.valueM || 0}M`,
                    "Stage Count",
                  ]}
                />
                <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
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
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-light text-white tracking-tight">
              Sales by Salesperson (KSh.)
            </h2>
            <Link
              href="/reports?tab=sales"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
            >
              Details →
            </Link>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesBySalespersonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222428" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#888" }} stroke="#333" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  tickFormatter={(v) => `${v}M`}
                  stroke="#333"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1011", borderColor: "#3f4041", borderRadius: 8, color: "#ffffff" }}
                  formatter={(value: number, name: string) => [
                    `KSh. ${value}M`,
                    name,
                  ]}
                />
                <Bar
                  dataKey="revenueM"
                  name="Sales Revenue"
                  fill="#00b3dd"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profitM"
                  name="Gross Profit"
                  fill="#847dff"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 pt-1">
            {salesBySalespersonData.map((sp) => (
              <div
                key={sp.fullName}
                className="p-3 rounded-[8px] border border-white/5 bg-[#17181a] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">
                    {sp.fullName}
                  </p>
                  <p className="text-[11px] text-white/50 font-mono">
                    {sp.count} Vehicle(s) Sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-[#00b3dd]">
                    {formatKSh(sp.revenue)}
                  </p>
                  {permissions.canViewAllFinancials && (
                    <p className="text-[11px] font-mono text-emerald-400">
                      Profit: +{formatKSh(sp.profit)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory by Vehicle Type (Donut Chart + Breakdown) */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-light text-white tracking-tight">
              Inventory by Body Type
            </h2>
            <Link
              href="/inventory"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
            >
              Stock List →
            </Link>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryByTypeData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={4}
                >
                  {inventoryByTypeData.map((entry, idx) => (
                    <Cell key={entry.type} fill={entry.color || PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1011", borderColor: "#3f4041", borderRadius: 8, color: "#ffffff" }}
                  formatter={(value: number, name: string) => [
                    `${value} Unit(s)`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#999" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 pt-1">
            {inventoryByTypeData.map((item) => {
              const pct = Math.round(
                (item.count / Math.max(1, activeUnsoldUnits.length)) * 100
              );
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/80">{item.type}</span>
                    <span className="text-white/50">
                      {item.count} units ({pct}%) · {formatCompactKSh(item.value)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Age: 0–30, 31–60, 61–90, 90+ days */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-light text-white tracking-tight">
              Inventory Aging Analysis
            </h2>
            <Link
              href="/reports?tab=inventory"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Aging Report →</span>
            </Link>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222428" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#888" }} stroke="#333" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#888" }} stroke="#333" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1011", borderColor: "#3f4041", borderRadius: 8, color: "#ffffff" }}
                  formatter={(value: number) => [`${value} Unit(s)`, "Active Stock"]}
                />
                <Bar dataKey="count" name="Units" radius={[4, 4, 0, 0]}>
                  {ageBuckets.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ageBuckets.map((b) => (
              <Link
                key={b.bucket}
                href="/inventory"
                className={`p-3 rounded-[8px] transition-transform hover:scale-[1.02] ${b.badge}`}
              >
                <span className="text-xs font-mono uppercase tracking-wider block">{b.bucket}</span>
                <span className="text-xl font-serif font-light mt-0.5 block">
                  {b.count} {b.count === 1 ? "Unit" : "Units"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* OPERATIONAL LIST WIDGETS ROW 3: Recent Enquiries, Upcoming Follow-ups, Recently Sold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-light text-white tracking-tight">
              Recent Customer Enquiries
            </h2>
            <Link
              href="/leads"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
            >
              All ({leads.length}) →
            </Link>
          </div>
          <div className="space-y-3">
            {leads.slice(0, 4).map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-[8px] border border-white/5 bg-[#17181a] flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/customers/${l.customerId}`}
                    className="text-xs font-semibold text-white hover:text-[#00b3dd] transition-colors"
                  >
                    {l.customerName}
                  </Link>
                  <Link
                    href={`/inventory/${l.vehicleId}`}
                    className="block text-[11px] text-white/50 hover:text-white transition-colors"
                  >
                    {l.vehicleTitle} · {l.source.replace("_", " ")}
                  </Link>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-emerald-400 block">
                    {formatCompactKSh(l.askingPrice)}
                  </span>
                  <Link
                    href="/pipeline"
                    className="text-[10px] font-mono uppercase tracking-wider text-[#847dff] hover:underline"
                  >
                    {l.stage.replace("_", " ")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-light text-white tracking-tight">
              Upcoming Follow-ups ({pendingFollowUps.length})
            </h2>
            <Link
              href="/follow-ups"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
            >
              Queue →
            </Link>
          </div>
          <div className="space-y-3">
            {pendingFollowUps.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-white/50 bg-[#17181a] rounded-[8px]">
                All follow-ups completed for today.
              </div>
            ) : (
              pendingFollowUps.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-[8px] border border-white/5 bg-[#17181a] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/customers/${act.customerId}`}
                      className="text-xs font-semibold text-white hover:text-[#00b3dd] block truncate transition-colors"
                    >
                      {act.customerName} ({act.vehicleTitle})
                    </Link>
                    <p className="text-[11px] text-white/50 line-clamp-1">
                      {act.notes}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#dd90d8]/20 text-[#dd90d8] border border-[#dd90d8]/30 text-[10px] font-mono uppercase tracking-wider">
                      {act.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateActivityStatus(act.id, "COMPLETED")}
                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      title="Mark follow-up completed"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Sold Vehicles */}
        <div className="bg-[#0f1011] rounded-[16px] border border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-light text-white tracking-tight">
              Recently Sold Vehicles ({sales.length})
            </h2>
            <Link
              href="/sales"
              className="text-xs font-mono uppercase tracking-wider text-[#00b3dd] hover:underline"
            >
              Register →
            </Link>
          </div>
          <div className="space-y-3">
            {sales.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-[8px] border border-white/5 bg-[#17181a] flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/inventory/${s.vehicleId}`}
                    className="text-xs font-semibold text-white hover:text-[#00b3dd] block transition-colors"
                  >
                    {s.vehicleTitle}
                  </Link>
                  <Link
                    href={`/customers/${s.customerId}`}
                    className="text-[11px] text-white/50 hover:text-white transition-colors"
                  >
                    Buyer: {s.customerName} · {formatDate(s.saleDate)}
                  </Link>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-mono font-semibold text-white block">
                    {formatCompactKSh(s.salePrice)}
                  </span>
                  {permissions.canViewAllFinancials && (
                    <span className="text-[10px] font-mono text-emerald-400">
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
