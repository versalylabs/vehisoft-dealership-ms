"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Wallet,
  Truck,
  Camera,
  History,
  Receipt,
  Plus,
  CheckCircle2,
  MapPin,
  Clock,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatMileage,
  formatDate,
  calculateVehicleFinancials,
  getInventoryAgeDays,
  getInventoryAgeBucket,
} from "@/lib/format";
import { STATUS_BADGE_STYLES, STATUS_LABELS } from "@/lib/badges";
import { ExpenseCategoryType, VehicleStatusType } from "@/lib/demo-store";

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params?.id as string;

  const {
    vehicles,
    updateVehicleStatus,
    updateVehiclePrice,
    addVehicleExpense,
    addVehicleImage,
  } = useDealership();
  const { user, permissions } = useAuth();

  const vehicle =
    vehicles.find((v) => v.id === vehicleId) ||
    vehicles.find((v) => v.stockNumber === vehicleId);

  const [activeTab, setActiveTab] = useState<
    "overview" | "financials" | "images" | "history"
  >("overview");

  const [newAskingPrice, setNewAskingPrice] = useState(
    vehicle?.askingPrice || 0
  );
  const [newMinPrice, setNewMinPrice] = useState(vehicle?.minimumPrice || 0);
  const [toast, setToast] = useState("");
  const [errorBanner, setErrorBanner] = useState("");

  // New Expense State
  const [expCategory, setExpCategory] =
    useState<ExpenseCategoryType>("REPAIRS");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState<number>(25000);

  // New Photo State
  const [imgCategory, setImgCategory] = useState<
    "EXTERIOR" | "INTERIOR" | "ENGINE" | "DOCUMENT"
  >("EXTERIOR");
  const [imgUrl, setImgUrl] = useState("");
  const [imgCaption, setImgCaption] = useState("");

  if (!vehicle) {
    return (
      <div className="p-10 bg-white rounded-xl border border-slate-200 text-center max-w-xl mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Car className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Vehicle Record Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          No vehicle with ID or Stock Number <span className="font-mono font-bold text-slate-700">{vehicleId}</span> exists in the dealership inventory.
        </p>
        <Link
          href="/inventory"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vehicle Inventory</span>
        </Link>
      </div>
    );
  }

  const notify = (msg: string) => {
    setErrorBanner("");
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const expensesTotal = vehicle.expenses.reduce((s, e) => s + e.amount, 0);
  const fin = calculateVehicleFinancials({
    purchasePrice: vehicle.purchasePrice,
    expensesTotal,
    askingPrice: vehicle.askingPrice,
    actualSalePrice: vehicle.actualSalePrice,
  });

  const ageDays = getInventoryAgeDays(vehicle.dateAcquired);
  const ageBucket = getInventoryAgeBucket(vehicle.dateAcquired);

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(newAskingPrice) <= 0 || Number(newMinPrice) <= 0) {
      setErrorBanner("Asking price and minimum price must be greater than KSh. 0.");
      return;
    }
    if (Number(newAskingPrice) < Number(newMinPrice)) {
      setErrorBanner("Asking price cannot be lower than the minimum acceptable price.");
      return;
    }
    updateVehiclePrice(
      vehicle.id,
      Number(newAskingPrice),
      Number(newMinPrice),
      user.name
    );
    notify("Asking price updated & logged in vehicle history.");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || expAmount <= 0) return;
    addVehicleExpense(
      vehicle.id,
      {
        category: expCategory,
        description: expDesc.trim(),
        amount: Number(expAmount),
      },
      user.name
    );
    setExpDesc("");
    setExpAmount(15000);
    notify("Vehicle expense logged and Total Cost recalculated.");
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgUrl.trim()) return;
    addVehicleImage(
      vehicle.id,
      {
        category: imgCategory,
        url: imgUrl.trim(),
        caption: imgCaption.trim() || `${vehicle.make} ${imgCategory}`,
      },
      user.name
    );
    setImgUrl("");
    setImgCaption("");
    notify("Photo added to vehicle gallery.");
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb + Status Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                {vehicle.stockNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  STATUS_BADGE_STYLES[vehicle.status]
                }`}
              >
                {STATUS_LABELS[vehicle.status]}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {ageDays} days ({ageBucket})
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model}{" "}
              <span className="text-slate-500 font-normal text-lg">
                {vehicle.variant}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {errorBanner && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              <span>{errorBanner}</span>
            </div>
          )}
          {toast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          {permissions.canManageInventory && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Status:
              </span>
              <select
                value={vehicle.status}
                onChange={(e) => {
                  updateVehicleStatus(
                    vehicle.id,
                    e.target.value as VehicleStatusType,
                    user.name
                  );
                  notify(`Vehicle status changed to ${e.target.value}.`);
                }}
                className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="PENDING_ACQUISITION">Pending Acquisition</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-3">
        <div className="relative h-64 lg:h-auto bg-slate-100">
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 text-white text-xs font-mono">
            Reg: {vehicle.registrationNumber} • VIN: {vehicle.vin}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 flex flex-col justify-between space-y-5">
          {/* Pricing & Profit Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Asking Price
              </span>
              <span className="text-xl font-bold text-slate-900">
                {formatKSh(vehicle.askingPrice)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Min: {formatKSh(vehicle.minimumPrice)}
              </span>
            </div>

            {permissions.canViewAllFinancials ? (
              <>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    Purchase Price
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {formatKSh(vehicle.purchasePrice)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    + Expenses: {formatKSh(expensesTotal)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    Total Landed Cost
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatKSh(fin.totalCost)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {vehicle.expenses.length} cost items
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    {vehicle.actualSalePrice
                      ? "Realized Profit"
                      : "Expected Profit"}
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    +
                    {formatKSh(
                      fin.actualProfit !== null
                        ? fin.actualProfit
                        : fin.expectedProfit
                    )}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    Margin: {fin.marginPercent}%
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-3 flex items-center text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                Acquisition cost and profit breakdown are restricted to
                Owner/Admin &amp; Manager roles.
              </div>
            )}
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Mileage</span>
              <span className="font-bold text-slate-800">
                {formatMileage(vehicle.mileage)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Fuel / Trans</span>
              <span className="font-bold text-slate-800">
                {vehicle.fuelType} • {vehicle.transmission}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Body / Color</span>
              <span className="font-bold text-slate-800">
                {vehicle.bodyType} • {vehicle.color}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Location</span>
              <span className="font-bold text-slate-800 truncate block">
                {vehicle.location}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-blue-50/60 border border-blue-100 p-3 rounded-lg">
            <strong className="text-slate-800">Showroom Notes:</strong>{" "}
            {vehicle.notes || "No additional showroom notes."}
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: "overview",
            label: "Basic Info & Acquisition",
            icon: <Car className="w-4 h-4" />,
          },
          {
            id: "financials",
            label: `Financials & Expenses (${vehicle.expenses.length})`,
            icon: <Wallet className="w-4 h-4" />,
          },
          {
            id: "images",
            label: `Photos & Documents (${vehicle.images.length})`,
            icon: <Camera className="w-4 h-4" />,
          },
          {
            id: "history",
            label: `Vehicle History (${vehicle.history.length})`,
            icon: <History className="w-4 h-4" />,
          },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
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

      {/* TAB 1: BASIC INFO & ACQUISITION */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Basic Vehicle Specifications
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <dt className="text-slate-400">Stock Number</dt>
                <dd className="font-mono font-bold text-slate-900 mt-0.5">
                  {vehicle.stockNumber}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Registration Number</dt>
                <dd className="font-mono font-bold text-slate-900 mt-0.5">
                  {vehicle.registrationNumber}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">VIN / Chassis Number</dt>
                <dd className="font-mono font-bold text-slate-900 mt-0.5">
                  {vehicle.vin}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Make &amp; Model</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {vehicle.make} {vehicle.model}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Variant / Trim</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {vehicle.variant}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Year</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {vehicle.year}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Color</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {vehicle.color}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Mileage</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {formatMileage(vehicle.mileage)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Fuel &amp; Transmission</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {vehicle.fuelType} / {vehicle.transmission}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Body Type</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {vehicle.bodyType}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Acquisition &amp; Source Details
              </h2>
              <Truck className="w-5 h-5 text-blue-600" />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <dt className="text-slate-400">Supplier / Source</dt>
                <dd className="font-bold text-slate-900 mt-1">
                  {vehicle.supplierName}
                </dd>
                <Link
                  href="/suppliers"
                  className="text-[11px] font-semibold text-blue-600 hover:underline mt-1 inline-block"
                >
                  View Supplier Profile →
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <dt className="text-slate-400">Date Acquired</dt>
                <dd className="font-bold text-slate-900 mt-1">
                  {formatDate(vehicle.dateAcquired)}
                </dd>
                <span className="text-[11px] text-slate-500 block mt-1">
                  In stock for {ageDays} days ({ageBucket})
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <dt className="text-slate-400">Current Showroom / Yard</dt>
                <dd className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {vehicle.location}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL INFORMATION & EXPENSES */}
      {activeTab === "financials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Breakdown Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Vehicle Cost &amp; Expense Breakdown (KSh.)
                </h2>
                <p className="text-xs text-slate-500">
                  Total Cost = Purchase Price ({formatKSh(vehicle.purchasePrice)}
                  ) + Expenses ({formatKSh(expensesTotal)}) ={" "}
                  <strong>{formatKSh(fin.totalCost)}</strong>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Logged By</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount (KSh.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr className="bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      PURCHASE COST
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      Base vehicle acquisition from {vehicle.supplierName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">Acquisition</td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(vehicle.dateAcquired)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatKSh(vehicle.purchasePrice)}
                    </td>
                  </tr>
                  {vehicle.expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800">
                        {exp.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {exp.loggedByName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(exp.incurredAt)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatKSh(exp.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={4} className="py-3.5 px-4">
                      TOTAL LANDED VEHICLE COST
                    </td>
                    <td className="py-3.5 px-4 text-right text-sm">
                      {formatKSh(fin.totalCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Update Asking Price & Log Expense */}
          <div className="space-y-6">
            {permissions.canManageCosts && (
              <form
                onSubmit={handleAddExpense}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Log Vehicle Expense (KSh.)
                  </h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) =>
                      setExpCategory(e.target.value as ExpenseCategoryType)
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
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major service & new tyres"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
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
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense to Vehicle</span>
                </button>
              </form>
            )}

            {permissions.canManageInventory && (
              <form
                onSubmit={handlePriceUpdate}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <h3 className="text-sm font-bold text-slate-900">
                  Adjust Asking &amp; Minimum Price
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asking Price (KSh.)
                  </label>
                  <input
                    type="number"
                    value={newAskingPrice}
                    onChange={(e) => setNewAskingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Selling Price (KSh.)
                  </label>
                  <input
                    type="number"
                    value={newMinPrice}
                    onChange={(e) => setNewMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Update Pricing
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: IMAGES & DOCUMENTS */}
      {activeTab === "images" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicle.images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    {img.caption}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {img.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAddPhoto}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 h-fit"
          >
            <h3 className="text-sm font-bold text-slate-900">
              Add Vehicle Photo / Document
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={imgCategory}
                onChange={(e) =>
                  setImgCategory(e.target.value as typeof imgCategory)
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="EXTERIOR">Exterior</option>
                <option value="INTERIOR">Interior</option>
                <option value="ENGINE">Engine Bay</option>
                <option value="DOCUMENT">Purchase / Customs Document</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                placeholder="e.g. Rear cabin & sunroof"
                value={imgCaption}
                onChange={(e) => setImgCaption(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Upload Media Item
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: VEHICLE HISTORY TIMELINE */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Chronological Vehicle Audit &amp; Activity History
          </h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
            {vehicle.history.map((h) => (
              <div key={h.id} className="relative pl-9">
                <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow absolute left-1.5 top-1.5" />
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {h.eventType.replace("_", " ")}
                    </span>
                    <p className="text-xs font-semibold text-slate-900 mt-1.5">
                      {h.description}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 shrink-0">
                    <p className="font-semibold text-slate-700">
                      {h.createdByName}
                    </p>
                    <p>{formatDate(h.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
