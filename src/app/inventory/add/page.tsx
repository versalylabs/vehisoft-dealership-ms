"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Wallet,
  Truck,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { formatKSh, calculateVehicleFinancials } from "@/lib/format";
import { VehicleStatusType, ExpenseCategoryType } from "@/lib/demo-store";

export default function AddVehiclePage() {
  const router = useRouter();
  const { vehicles, suppliers, addVehicle } = useDealership();
  const { user } = useAuth();

  const nextSeq = 1001 + vehicles.length;

  const [form, setForm] = useState({
    stockNumber: `VH-${nextSeq}`,
    registrationNumber: "",
    vin: "",
    make: "Toyota",
    model: "",
    variant: "",
    year: 2021,
    color: "Pearl White",
    mileage: 45000,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE" as VehicleStatusType,
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 3200000,
    askingPrice: 3850000,
    minimumPrice: 3700000,
    supplierId: suppliers[0]?.id || "sup-1",
    dateAcquired: new Date().toISOString().slice(0, 10),
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    notes: "",
    initialExpenseCategory: "TRANSPORT" as ExpenseCategoryType,
    initialExpenseDesc: "Mombasa CFS clearance & carrier transport to Nairobi",
    initialExpenseAmount: 45000,
  });

  const financials = calculateVehicleFinancials({
    purchasePrice: Number(form.purchasePrice) || 0,
    expensesTotal: Number(form.initialExpenseAmount) || 0,
    askingPrice: Number(form.askingPrice) || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSupplier = suppliers.find((s) => s.id === form.supplierId);

    const created = addVehicle(
      {
        stockNumber: form.stockNumber,
        registrationNumber: form.registrationNumber || "Pending Reg",
        vin: form.vin || `VIN-${Date.now().toString().slice(-6)}`,
        make: form.make,
        model: form.model || "Prado",
        variant: form.variant || "TX-L Package",
        year: Number(form.year),
        color: form.color,
        mileage: Number(form.mileage),
        fuelType: form.fuelType,
        transmission: form.transmission,
        bodyType: form.bodyType,
        status: form.status,
        location: form.location,
        purchasePrice: Number(form.purchasePrice),
        askingPrice: Number(form.askingPrice),
        minimumPrice: Number(form.minimumPrice),
        actualSalePrice: null,
        supplierId: form.supplierId,
        supplierName: selectedSupplier?.name || "Direct Import",
        dateAcquired: new Date(form.dateAcquired).toISOString(),
        notes: form.notes,
        imageUrl: form.imageUrl,
      },
      form.initialExpenseAmount > 0
        ? {
            category: form.initialExpenseCategory,
            description: form.initialExpenseDesc,
            amount: Number(form.initialExpenseAmount),
          }
        : undefined,
      user.name
    );

    router.push(`/inventory/${created.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add Vehicle to Inventory
            </h1>
            <p className="text-sm text-slate-500">
              Record vehicle specs, acquisition source, and KSh. cost baseline.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Car className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              1. Basic Vehicle Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Number *
              </label>
              <input
                type="text"
                required
                value={form.stockNumber}
                onChange={(e) =>
                  setForm({ ...form, stockNumber: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. KDR 550A"
                value={form.registrationNumber}
                onChange={(e) =>
                  setForm({ ...form, registrationNumber: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                VIN / Chassis Number
              </label>
              <input
                type="text"
                placeholder="e.g. ZSU60-0091234"
                value={form.vin}
                onChange={(e) => setForm({ ...form, vin: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Make *
              </label>
              <select
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {[
                  "Toyota",
                  "Mazda",
                  "Subaru",
                  "Mercedes-Benz",
                  "BMW",
                  "Nissan",
                  "Volkswagen",
                  "Land Rover",
                  "Isuzu",
                  "Honda",
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Harrier, CX-5, Prado"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variant / Trim
              </label>
              <input
                type="text"
                placeholder="e.g. 2.0 Premium Elegance"
                value={form.variant}
                onChange={(e) => setForm({ ...form, variant: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Year of Manufacture *
              </label>
              <input
                type="number"
                required
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exterior Color *
              </label>
              <input
                type="text"
                required
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mileage (km) *
              </label>
              <input
                type="number"
                required
                value={form.mileage}
                onChange={(e) =>
                  setForm({ ...form, mileage: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={form.fuelType}
                onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transmission
              </label>
              <select
                value={form.transmission}
                onChange={(e) =>
                  setForm({ ...form, transmission: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Body Type
              </label>
              <select
                value={form.bodyType}
                onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Double Cab Pickup">Double Cab Pickup</option>
                <option value="Station Wagon">Station Wagon</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Financial Information (KSh.) & Live Profit Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                2. Financial Information &amp; KSh. Profitability
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              All values in KSh.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Price (KSh.) *
              </label>
              <input
                type="number"
                required
                value={form.purchasePrice}
                onChange={(e) =>
                  setForm({ ...form, purchasePrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asking Price (KSh.) *
              </label>
              <input
                type="number"
                required
                value={form.askingPrice}
                onChange={(e) =>
                  setForm({ ...form, askingPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Selling Price (KSh.)
              </label>
              <input
                type="number"
                required
                value={form.minimumPrice}
                onChange={(e) =>
                  setForm({ ...form, minimumPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Initial Expense Line Item */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Additional Cost Category
              </label>
              <select
                value={form.initialExpenseCategory}
                onChange={(e) =>
                  setForm({
                    ...form,
                    initialExpenseCategory: e.target
                      .value as ExpenseCategoryType,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="TRANSPORT">Transport &amp; Carrier</option>
                <option value="REGISTRATION">NTSA Registration</option>
                <option value="DETAILING">Detailing &amp; Valet</option>
                <option value="REPAIRS">Mechanical Repairs</option>
                <option value="INSPECTION">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Cost Description
              </label>
              <input
                type="text"
                value={form.initialExpenseDesc}
                onChange={(e) =>
                  setForm({ ...form, initialExpenseDesc: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Cost Amount (KSh.)
              </label>
              <input
                type="number"
                value={form.initialExpenseAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    initialExpenseAmount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Live Profit Preview Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Total Landed Cost (Purchase + Expenses)
              </span>
              <span className="text-lg font-bold text-white">
                {formatKSh(financials.totalCost)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Expected Gross Profit
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {formatKSh(financials.expectedProfit)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Projected Margin
              </span>
              <span className="text-lg font-bold text-blue-400">
                {financials.marginPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Acquisition & Media */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              3. Acquisition Source, Status &amp; Primary Photo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier / Source
              </label>
              <select
                value={form.supplierId}
                onChange={(e) =>
                  setForm({ ...form, supplierId: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Acquired
              </label>
              <input
                type="date"
                value={form.dateAcquired}
                onChange={(e) =>
                  setForm({ ...form, dateAcquired: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inventory Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as VehicleStatusType,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="PENDING_ACQUISITION">Pending Acquisition</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Showroom / Yard Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Vehicle Photo URL
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Showroom Notes &amp; Key Features
              </label>
              <input
                type="text"
                placeholder="Sunroof, leather seats, auction grade 4.5B..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/inventory"
            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Vehicle to Inventory</span>
          </button>
        </div>
      </form>
    </div>
  );
}
