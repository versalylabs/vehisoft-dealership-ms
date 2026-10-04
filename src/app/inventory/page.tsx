"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  Search,
  Filter,
  Plus,
  Eye,
  Receipt,
  LayoutGrid,
  List,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatCompactKSh,
  formatMileage,
  calculateVehicleFinancials,
  getInventoryAgeDays,
} from "@/lib/format";
import { STATUS_BADGE_STYLES, STATUS_LABELS } from "@/lib/badges";

export default function InventoryListPage() {
  const { vehicles, aiSettings, updateAISettings } = useDealership();
  const { permissions } = useAuth();

  const spotlightIds = aiSettings.spotlightVehicleIds || [
    "veh-1001",
    "veh-1003",
    "veh-1002",
    "veh-1006",
  ];

  const toggleVehicleSpotlight = (vehicleId: string) => {
    const exists = spotlightIds.includes(vehicleId);
    const updated = exists
      ? spotlightIds.filter((id) => id !== vehicleId)
      : [...spotlightIds, vehicleId];
    updateAISettings({ spotlightVehicleIds: updated });
  };

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bodyFilter, setBodyFilter] = useState("ALL");
  const [fuelFilter, setFuelFilter] = useState("ALL");
  const [transFilter, setTransFilter] = useState("ALL");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("ALL");

  const uniqueMakes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles]
  );

  const uniqueBodies = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.bodyType))).sort(),
    [vehicles]
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay =
          `${v.stockNumber} ${v.registrationNumber} ${v.make} ${v.model} ${v.variant} ${v.year} ${v.vin}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (makeFilter !== "ALL" && v.make !== makeFilter) return false;
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      if (bodyFilter !== "ALL" && v.bodyType !== bodyFilter) return false;
      if (fuelFilter !== "ALL" && v.fuelType !== fuelFilter) return false;
      if (transFilter !== "ALL" && v.transmission !== transFilter) return false;
      if (
        maxPriceFilter !== "ALL" &&
        v.askingPrice > Number(maxPriceFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [
    vehicles,
    search,
    makeFilter,
    statusFilter,
    bodyFilter,
    fuelFilter,
    transFilter,
    maxPriceFilter,
  ]);

  const resetFilters = () => {
    setSearch("");
    setMakeFilter("ALL");
    setStatusFilter("ALL");
    setBodyFilter("ALL");
    setFuelFilter("ALL");
    setTransFilter("ALL");
    setMaxPriceFilter("ALL");
  };

  // Summary metrics
  const availableCount = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const reservedCount = vehicles.filter((v) => v.status === "RESERVED").length;
  const inTransitCount = vehicles.filter((v) => v.status === "IN_TRANSIT").length;
  const totalActiveValue = vehicles
    .filter((v) => v.status === "AVAILABLE" || v.status === "RESERVED")
    .reduce((sum, v) => sum + v.askingPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vehicle Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter, and manage dealership stock, pricing in KSh., and
            acquisition status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {permissions.canManageCosts && (
            <Link
              href="/inventory/costs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm"
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Vehicle Costs &amp; Profit</span>
            </Link>
          )}
          {permissions.canManageInventory && (
            <Link
              href="/inventory/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
          )}
        </div>
      </div>

      {/* Inventory Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Available in Showroom
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {availableCount} Units
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Reserved (Deposit Paid)
          </span>
          <p className="text-xl font-bold text-amber-700 mt-1">
            {reservedCount} Units
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            In Transit / Port Clearance
          </span>
          <p className="text-xl font-bold text-indigo-700 mt-1">
            {inTransitCount} Units
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Active Stock Asking Value
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatCompactKSh(totalActiveValue)}
          </p>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Stock No (VH-1001), Reg No (KDR 450X), Make, Model, Year, or VIN..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md ${
                  viewMode === "table"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="PENDING_ACQUISITION">Pending Acquisition</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Make
            </label>
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">All Makes</option>
              {uniqueMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Body Type
            </label>
            <select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">All Body Types</option>
              {uniqueBodies.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Fuel Type
            </label>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">All Fuels</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Transmission
            </label>
            <select
              value={transFilter}
              onChange={(e) => setTransFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">All Transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="CVT">CVT</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Max Price (KSh.)
            </label>
            <select
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="ALL">Any Price</option>
              <option value="3000000">Under KSh. 3.0M</option>
              <option value="4500000">Under KSh. 4.5M</option>
              <option value="6500000">Under KSh. 6.5M</option>
              <option value="10000000">Under KSh. 10.0M</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle List Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Stock No.</th>
                  <th className="py-3.5 px-4">Reg No.</th>
                  <th className="py-3.5 px-4">Year &amp; Specs</th>
                  <th className="py-3.5 px-4">Asking Price (KSh.)</th>
                  {permissions.canViewAllFinancials && (
                    <th className="py-3.5 px-4">Total Cost &amp; Profit</th>
                  )}
                  <th className="py-3.5 px-4">Stock Age</th>
                  <th className="py-3.5 px-4">Website Spotlight</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredVehicles.map((v) => {
                  const expensesSum = v.expenses.reduce(
                    (s, e) => s + e.amount,
                    0
                  );
                  const fin = calculateVehicleFinancials({
                    purchasePrice: v.purchasePrice,
                    expensesTotal: expensesSum,
                    askingPrice: v.askingPrice,
                    actualSalePrice: v.actualSalePrice,
                  });
                  const ageDays = getInventoryAgeDays(v.dateAcquired);

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.imageUrl}
                            alt={`${v.make} ${v.model}`}
                            className="w-14 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/inventory/${v.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                            >
                              {v.make} {v.model}
                            </Link>
                            <p className="text-slate-500 text-[11px]">
                              {v.variant} • {v.color}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {v.stockNumber}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {v.registrationNumber || "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">
                          {v.year}
                        </span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-slate-600">
                          {formatMileage(v.mileage)}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {v.fuelType} • {v.transmission} • {v.bodyType}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {formatKSh(v.askingPrice)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Min: {formatKSh(v.minimumPrice)}
                        </p>
                      </td>

                      {permissions.canViewAllFinancials && (
                        <td className="py-3.5 px-4">
                          <p className="text-slate-700 font-medium">
                            Cost: {formatKSh(fin.totalCost)}
                          </p>
                          <p className="text-emerald-700 font-bold text-[11px]">
                            Est. Profit: +{formatKSh(fin.expectedProfit)} (
                            {fin.marginPercent}%)
                          </p>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            ageDays > 60
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : ageDays > 30
                              ? "bg-amber-50 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {ageDays}d
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {v.status === "AVAILABLE" ? (
                          <button
                            type="button"
                            onClick={() => toggleVehicleSpotlight(v.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                              spotlightIds.includes(v.id)
                                ? "bg-[#000d10] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {spotlightIds.includes(v.id)
                              ? "★ In Spotlight"
                              : "+ Spotlight"}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            STATUS_BADGE_STYLES[v.status]
                          }`}
                        >
                          {STATUS_LABELS[v.status]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/inventory/${v.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((v) => {
            const ageDays = getInventoryAgeDays(v.dateAcquired);
            return (
              <Link
                key={v.id}
                href={`/inventory/${v.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all group flex flex-col"
              >
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={v.imageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white font-mono text-xs font-bold">
                      {v.stockNumber}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        STATUS_BADGE_STYLES[v.status]
                      }`}
                    >
                      {STATUS_LABELS[v.status]}
                    </span>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[11px] font-medium">
                    {ageDays} days in stock
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {v.year} • {v.registrationNumber}
                      </span>
                      <span>{formatMileage(v.mileage)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 mt-1">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-xs text-slate-500">{v.variant}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Asking Price
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {formatKSh(v.askingPrice)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      View Sheet →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
