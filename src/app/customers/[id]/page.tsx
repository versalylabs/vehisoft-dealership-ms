"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Car,
  PhoneCall,
  Plus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatKSh,
  formatCompactKSh,
  formatDate,
  formatRelativeDate,
} from "@/lib/format";
import {
  CUSTOMER_TYPE_BADGE,
  CUSTOMER_TYPE_LABEL,
  STAGE_BADGE_STYLE,
} from "@/lib/badges";
import { ActivityTypeEnum } from "@/lib/demo-store";

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params?.id as string;

  const { customers, leads, activities, vehicles, addActivity } =
    useDealership();
  const { user } = useAuth();

  const customer = customers.find((c) => c.id === customerId);

  const [actType, setActType] = useState<ActivityTypeEnum>("CALL");
  const [actNotes, setActNotes] = useState("");
  const [actNext, setActNext] = useState("");
  const [toast, setToast] = useState("");

  if (!customer) {
    return (
      <div className="p-10 bg-white rounded-xl border border-slate-200 text-center max-w-xl mx-auto mt-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Customer Profile Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Could not locate customer record <span className="font-mono font-bold text-slate-700">{customerId}</span> in the CRM directory.
        </p>
        <Link
          href="/customers"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers Directory</span>
        </Link>
      </div>
    );
  }

  const customerLeads = leads.filter((l) => l.customerId === customer.id);
  const customerActivities = activities.filter(
    (a) => a.customerId === customer.id
  );

  // Match available vehicles in inventory against customer's budget or make preference
  const matchingStock = vehicles.filter((v) => {
    if (v.status !== "AVAILABLE" && v.status !== "IN_TRANSIT") return false;
    const makeMatch = customer.preferredMakes
      .toLowerCase()
      .includes(v.make.toLowerCase());
    const budgetMatch =
      v.askingPrice >= customer.budgetMin * 0.85 &&
      v.askingPrice <= customer.budgetMax * 1.15;
    return makeMatch || budgetMatch;
  });

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actNotes.trim()) return;
    const primaryLead = customerLeads[0];

    addActivity({
      type: actType,
      status: "COMPLETED",
      customerId: customer.id,
      customerName: customer.fullName,
      leadId: primaryLead?.id,
      vehicleId: primaryLead?.vehicleId,
      vehicleTitle: primaryLead?.vehicleTitle || "General Enquiry",
      staffId: user.id,
      staffName: user.name,
      scheduledAt: new Date().toISOString(),
      notes: actNotes.trim(),
      nextAction: actNext.trim() || "Follow up with customer",
    });

    setActNotes("");
    setActNext("");
    setToast("Customer interaction logged to timeline.");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  CUSTOMER_TYPE_BADGE[customer.customerType]
                }`}
              >
                {CUSTOMER_TYPE_LABEL[customer.customerType]}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  STAGE_BADGE_STYLE[customer.pipelineStage]
                }`}
              >
                Stage: {customer.pipelineStage.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {customer.fullName}
            </h1>
          </div>
        </div>

        {toast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Contact Info + Buyer Preferences Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Contact Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Contact Information
          </h2>
          <dl className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Primary Phone
              </dt>
              <dd className="font-bold text-slate-900">{customer.phone}</dd>
            </div>
            {customer.altPhone && (
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Alternative Phone</dt>
                <dd className="font-semibold text-slate-700">
                  {customer.altPhone}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </dt>
              <dd className="font-semibold text-slate-800">{customer.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Address / City
              </dt>
              <dd className="font-semibold text-slate-800">
                {customer.address || customer.location}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> ID / Passport / Reg
              </dt>
              <dd className="font-mono font-bold text-slate-800">
                {customer.idPassportNo || "—"}
              </dd>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <dt className="text-slate-400">Assigned Salesperson</dt>
              <dd className="font-bold text-blue-600">
                {customer.assignedSalespersonName}
              </dd>
            </div>
          </dl>
        </div>

        {/* 2. Vehicle Preferences (KSh.) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Buyer Vehicle Preferences
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Preferred Makes</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {customer.preferredMakes}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Preferred Models</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {customer.preferredModels}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 col-span-2">
              <span className="text-emerald-700 font-semibold block">
                Target Budget Range (KSh.)
              </span>
              <span className="text-base font-bold text-emerald-900 mt-0.5 block">
                {formatKSh(customer.budgetMin)} –{" "}
                {formatKSh(customer.budgetMax)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Preferred Year</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {customer.preferredYear}+
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="text-slate-400 block">Specs</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {customer.preferredBody} • {customer.preferredFuel} •{" "}
                {customer.preferredTrans}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Interested / Negotiating / Purchased Vehicles */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Linked Deals &amp; Matching Stock
          </h2>

          <div className="space-y-2.5">
            {customerLeads.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/inventory/${l.vehicleId}`}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600"
                  >
                    {l.vehicleTitle} ({l.vehicleStockNo})
                  </Link>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      STAGE_BADGE_STYLE[l.stage]
                    }`}
                  >
                    {l.stage.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs font-bold text-emerald-700">
                  Asking: {formatKSh(l.askingPrice)} • Offer/Budget:{" "}
                  {formatCompactKSh(l.budget)}
                </p>
                <p className="text-[11px] text-slate-500">{l.notes}</p>
              </div>
            ))}
          </div>

          {matchingStock.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-blue-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Matching Inventory Units ({matchingStock.length})
              </p>
              {matchingStock.slice(0, 2).map((v) => (
                <Link
                  key={v.id}
                  href={`/inventory/${v.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-xs"
                >
                  <span className="font-semibold text-slate-800">
                    {v.stockNumber} • {v.year} {v.make} {v.model}
                  </span>
                  <span className="font-bold text-blue-700">
                    {formatCompactKSh(v.askingPrice)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline & Quick Interaction Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Customer Activity Timeline (Calls, WhatsApp, Viewings, Offers)
          </h2>

          {customerActivities.length === 0 ? (
            <p className="text-xs text-slate-500">
              No logged activities yet for this customer.
            </p>
          ) : (
            <div className="space-y-3">
              {customerActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {act.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {act.vehicleTitle}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          act.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">
                      {act.notes}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Next Action: <strong>{act.nextAction}</strong>
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 shrink-0">
                    <p className="font-semibold text-slate-700">
                      {act.staffName}
                    </p>
                    <p>{formatDate(act.scheduledAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Interaction Form */}
        <form
          onSubmit={handleLogActivity}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3.5 h-fit"
        >
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Log Call / WhatsApp / Note
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interaction Type
            </label>
            <select
              value={actType}
              onChange={(e) => setActType(e.target.value as ActivityTypeEnum)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="CALL">Phone Call</option>
              <option value="WHATSAPP">WhatsApp Message</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
              <option value="VEHICLE_VIEWING">Vehicle Viewing</option>
              <option value="TEST_DRIVE">Test Drive</option>
              <option value="NOTE">Internal Note</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Summary Notes *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Discussed financing options and KSh. deposit terms..."
              value={actNotes}
              onChange={(e) => setActNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Action Step
            </label>
            <input
              type="text"
              placeholder="e.g. Send proforma invoice on Monday"
              value={actNext}
              onChange={(e) => setActNext(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Save Customer Activity</span>
          </button>
        </form>
      </div>
    </div>
  );
}
