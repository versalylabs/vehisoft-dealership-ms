"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Car,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { DemoSupplier } from "@/lib/demo-store";
import { formatKSh } from "@/lib/format";

export default function SuppliersPage() {
  const { suppliers, vehicles, addSupplier } = useDealership();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "IMPORTER" as DemoSupplier["type"],
    notes: "",
  });
  const [toast, setToast] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addSupplier({
      name: form.name.trim(),
      phone: form.phone.trim() || "+254 700 000 000",
      email: form.email.trim() || "info@supplier.co.ke",
      address: form.address.trim() || "Nairobi / Mombasa",
      type: form.type,
      notes: form.notes.trim(),
    });
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "IMPORTER",
      notes: "",
    });
    setToast("New vehicle supplier added.");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Suppliers &amp; Vehicle Sources
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage importers, overseas auctions, local trade-ins, and corporate
            fleet sources linked to your inventory.
          </p>
        </div>

        {toast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => {
            const suppliedVehicles = vehicles.filter(
              (v) => v.supplierId === s.id
            );
            const totalAcquisitionValue = suppliedVehicles.reduce(
              (sum, v) => sum + v.purchasePrice,
              0
            );

            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {s.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {s.type.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {s.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {s.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {s.address}
                    </p>
                  </div>

                  {s.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {s.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Vehicles Supplied:{" "}
                      <strong className="text-slate-900">
                        {suppliedVehicles.length}
                      </strong>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatKSh(totalAcquisitionValue)}
                    </span>
                  </div>

                  {suppliedVehicles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {suppliedVehicles.map((v) => (
                        <Link
                          key={v.id}
                          href={`/inventory/${v.id}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-medium text-slate-700"
                        >
                          <Car className="w-3 h-3" />
                          {v.stockNumber} ({v.model})
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Supplier Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit"
        >
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add Vehicle Supplier
              </h2>
              <p className="text-xs text-slate-500">
                Register a new vehicle acquisition source.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Person Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kobe Motors Japan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as DemoSupplier["type"],
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="IMPORTER">Importer</option>
              <option value="AUCTION">Auction</option>
              <option value="LOCAL_OWNER">Local Owner</option>
              <option value="DEALER">Dealer</option>
              <option value="TRADE_IN">Trade-In</option>
              <option value="COMPANY_FLEET">Company Fleet</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="+254 722 000 000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="exports@kobe.jp"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address / Location
            </label>
            <input
              type="text"
              placeholder="Mombasa / Nairobi / Tokyo"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Auction terms, shipping line, inspection notes..."
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
            <span>Save Supplier</span>
          </button>
        </form>
      </div>
    </div>
  );
}
