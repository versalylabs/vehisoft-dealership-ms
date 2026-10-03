"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Car,
  ArrowLeft,
  Sparkles,
   MapPin,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  CalendarCheck,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { getVehiclePublicProfile } from "@/lib/ai-sales-agent";
import { AISalesAgentWidget } from "@/components/showroom/AISalesAgentWidget";
import { formatKSh } from "@/lib/format";

export default function PublicVehicleDetailPage() {
  const params = useParams();
  const vehicleId = String(params?.id || "");
  const {
    vehicles,
    aiSettings,
    addCustomer,
    addLead,
    addTestDrive,
    addActivity,
  } = useDealership();

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  const profile = getVehiclePublicProfile(vehicle);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(
    undefined
  );

  // Enquire Now Modal
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [enqName, setEnqName] = useState("");
  const [enqPhone, setEnqPhone] = useState("");
  const [enqNotes, setEnqNotes] = useState("");

  // Book Test Drive Modal
  const [tdOpen, setTdOpen] = useState(false);
  const [tdName, setTdName] = useState("");
  const [tdPhone, setTdPhone] = useState("");
  const [tdLicense, setTdLicense] = useState("");
  const [tdDate, setTdDate] = useState(
    () => new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [tdSlot, setTdSlot] = useState("1:00 PM");

  const [confirmationMsg, setConfirmationMsg] = useState<string | null>(null);

  const triggerAIQuestion = (q: string) => {
    setAiInitialPrompt(q);
    setAiOpen(true);
  };

  const handleEnquireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqName.trim() || !enqPhone.trim()) return;
    const todayIso = new Date().toISOString().split("T")[0];
    const cust = addCustomer({
      fullName: enqName.trim(),
      phone: enqPhone.trim(),
      email: "",
      address: "Nairobi",
      location: "Nairobi",
      customerType: "INDIVIDUAL",
      preferredMakes: vehicle.make,
      preferredModels: vehicle.model,
      budgetMin: vehicle.askingPrice * 0.9,
      budgetMax: vehicle.askingPrice * 1.1,
      preferredYear: vehicle.year,
      preferredFuel: vehicle.fuelType,
      preferredTrans: vehicle.transmission,
      preferredBody: vehicle.bodyType,
      assignedSalespersonId: "usr-3",
      assignedSalespersonName: "Peter Mwangi",
      pipelineStage: "NEW",
      notes: enqNotes.trim(),
    });

    const lead = addLead({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicleStockNo: vehicle.stockNumber,
      askingPrice: vehicle.askingPrice,
      source: "WEBSITE",
      assignedSalespersonId: "usr-3",
      assignedSalespersonName: "Peter Mwangi",
      budget: vehicle.askingPrice,
      expectedPurchaseDate: todayIso,
      stage: "NEW",
      probability: 45,
      nextFollowUpAt: todayIso,
      notes: `[Public Vehicle Page Enquiry] ${enqNotes.trim() || "Interested in purchasing."}`,
    });

    addActivity({
      type: "FOLLOW_UP",
      status: "DUE",
      customerId: cust.id,
      customerName: cust.fullName,
      leadId: lead.id,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      staffId: "usr-3",
      staffName: "Peter Mwangi",
      scheduledAt: todayIso,
      notes: `Website Vehicle Page Enquiry for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      nextAction: "Call buyer to discuss viewing & financing",
    });

    setEnquireOpen(false);
    setConfirmationMsg(
      `Enquiry logged in Dealership CRM for ${cust.fullName}! Salesperson Peter Mwangi has been assigned.`
    );
    setEnqName("");
    setEnqPhone("");
    setEnqNotes("");
  };

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tdName.trim() || !tdPhone.trim()) return;
    const cust = addCustomer({
      fullName: tdName.trim(),
      phone: tdPhone.trim(),
      email: "",
      address: "Nairobi",
      location: "Nairobi",
      customerType: "INDIVIDUAL",
      preferredMakes: vehicle.make,
      preferredModels: vehicle.model,
      budgetMin: vehicle.askingPrice * 0.9,
      budgetMax: vehicle.askingPrice * 1.1,
      preferredYear: vehicle.year,
      preferredFuel: vehicle.fuelType,
      preferredTrans: vehicle.transmission,
      preferredBody: vehicle.bodyType,
      assignedSalespersonId: "usr-3",
      assignedSalespersonName: "Peter Mwangi",
      pipelineStage: "TEST_DRIVE",
      notes: `Booked test drive for ${tdDate} at ${tdSlot}`,
    });

    addTestDrive({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      stockNumber: vehicle.stockNumber,
      salespersonId: "usr-3",
      salespersonName: "Peter Mwangi",
      scheduledAt: tdDate,
      driverName: cust.fullName,
      driverLicenseNo: tdLicense.trim() || "DL-VERIFY-ON-ARRIVAL",
      mileageOut: vehicle.mileage,
      status: "SCHEDULED",
      notes: `Website Test Drive Booking for ${tdDate} at ${tdSlot}`,
      outcome: "Scheduled via Public Website",
    });

    setTdOpen(false);
    setConfirmationMsg(
      `Test Drive booked for ${tdDate} at ${tdSlot}! Added to Dealership Test Drives schedule.`
    );
    setTdName("");
    setTdPhone("");
    setTdLicense("");
  };

  return (
    <div className="min-h-screen luxury-obsidian-bg text-slate-100 flex flex-col">
      {/* Top Dealership Sync Bar */}
      <div className="bg-[#04060a]/90 text-slate-300 text-xs border-b border-white/10 px-4 sm:px-8 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Back to Executive Showroom Collection</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/inventory/${vehicle.id}`}
              className="text-amber-300 hover:text-amber-200 font-semibold"
            >
              View Internal Admin Record →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white px-3 py-1 rounded-full font-semibold"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Dealership Admin CRM</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 space-y-8">
        {confirmationMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{confirmationMsg}</span>
            </div>
            <Link href="/leads" className="text-xs font-bold text-amber-300 underline">
              Open CRM Pipeline →
            </Link>
          </div>
        )}

        {/* Header Title & Price */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  vehicle.status === "AVAILABLE"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : vehicle.status === "RESERVED"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {vehicle.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30">
                {profile.conditionBadge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Stock #{vehicle.stockNumber}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-sm text-slate-300 mt-1.5">
              {vehicle.variant} &nbsp;•&nbsp; {profile.engineSize} &nbsp;•&nbsp;{" "}
              {vehicle.fuelType} &nbsp;•&nbsp; {vehicle.transmission}{" "}
              &nbsp;•&nbsp; {vehicle.mileage.toLocaleString()} km &nbsp;•&nbsp;{" "}
              {profile.drivetrain}
            </p>
          </div>

          <div className="md:text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
              Executive Showroom Price
            </span>
            <span className="text-3xl sm:text-4xl font-black luxury-gold-text">
              {formatKSh(vehicle.askingPrice)}
            </span>
            <span className="block text-xs text-emerald-400 font-semibold mt-1">
              Bank Finance Available • From 20% Deposit (
              {formatKSh(vehicle.askingPrice * 0.2)})
            </span>
          </div>
        </div>

        {/* LARGE VEHICLE GALLERY + ACTION SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Large Gallery */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative h-[360px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  profile.galleryUrls[selectedImageIdx] || vehicle.imageUrl
                }
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Located at {vehicle.location}</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3">
              {profile.galleryUrls.slice(0, 4).map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`h-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIdx === idx
                      ? "border-amber-400 ring-2 ring-amber-400/30"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Primary Conversion Actions ([Enquire Now], [Book Test Drive], [Chat with AI]) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="luxury-glass-card rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-white">
                Acquire This {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reserve a private viewing slot, send a direct enquiry to our
                executive sales desk, or ask our 24/7 AI Concierge any question
                about this vehicle.
              </p>

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEnquireOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl luxury-gold-btn font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Enquire Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTdOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  <span>Book Test Drive</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerAIQuestion(
                      `Hi! Tell me about this ${vehicle.year} ${vehicle.make} ${vehicle.model} (${formatKSh(
                        vehicle.askingPrice
                      )}).`
                    )
                  }
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Chat with AI ({aiSettings.agentName})</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>QISJ / JEVIC Mileage & Chassis Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Trade-ins accepted towards deposit</span>
                </div>
              </div>
            </div>

            {/* Quick Finance Estimate Card */}
            <div className="luxury-glass-card text-white rounded-3xl p-6 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Estimated Bank Financing
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">20% Deposit:</span>
                <span className="text-sm font-bold text-white">
                  {formatKSh(vehicle.askingPrice * 0.2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">
                  Est. Monthly (48 mos):
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatKSh(Math.round((vehicle.askingPrice * 0.8 * 1.24) / 48))}
                  /mo
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerAIQuestion(
                    `How does bank financing work for the ${vehicle.year} ${vehicle.make} ${vehicle.model}?`
                  )
                }
                className="w-full mt-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Ask AI for Bank Proforma Details
              </button>
            </div>
          </div>
        </div>

        {/* VEHICLE DETAILS, SPECIFICATIONS, FEATURES & DESCRIPTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Specifications Table */}
            <div className="luxury-glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-white mb-4">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Make", value: vehicle.make },
                  { label: "Model", value: vehicle.model },
                  { label: "Variant / Trim", value: vehicle.variant },
                  { label: "Year of Manufacture", value: String(vehicle.year) },
                  {
                    label: "Mileage",
                    value: `${vehicle.mileage.toLocaleString()} km`,
                  },
                  { label: "Engine", value: profile.engineSize },
                  { label: "Fuel Type", value: vehicle.fuelType },
                  { label: "Transmission", value: vehicle.transmission },
                  { label: "Drivetrain", value: profile.drivetrain },
                  { label: "Body Type", value: vehicle.bodyType },
                  { label: "Exterior Color", value: vehicle.color },
                  { label: "Seating Capacity", value: `${profile.seats} Seats` },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10"
                  >
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                      {spec.label}
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="luxury-glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-white mb-4">
                Key Features & Luxury Equipment
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm font-semibold text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="luxury-glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-white mb-3">
                Showroom Provenance & Notes
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {vehicle.notes} This {vehicle.year} {vehicle.make}{" "}
                {vehicle.model} ({vehicle.variant}) has covered{" "}
                {vehicle.mileage.toLocaleString()} km and is finished in{" "}
                {vehicle.color}. Available for immediate viewing and test drive
                at our {vehicle.location}.
              </p>
            </div>

            {/* Bottom AI Contextual Banner */}
            <div className="luxury-glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-amber-400/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Interested in this {vehicle.year} {vehicle.make}{" "}
                    {vehicle.model}?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Ask our AI assistant ({aiSettings.agentName}) about this
                    vehicle anytime.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  `Does the ${vehicle.model} have a sunroof?`,
                  `What's the mileage on this ${vehicle.model}?`,
                  `Is this ${vehicle.model} still available?`,
                  `Can I come see the ${vehicle.model} tomorrow?`,
                  `Do you accept trade-ins for this ${vehicle.model}?`,
                  `I'd like to negotiate the price on the ${vehicle.model}`,
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => triggerAIQuestion(q)}
                    className="text-xs font-semibold bg-white/5 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 rounded-full px-3.5 py-2 transition-all cursor-pointer"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquire Now Modal */}
      {enquireOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="luxury-glass-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                Enquire: {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <button
                type="button"
                onClick={() => setEnquireOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEnquireSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={enqName}
                  onChange={(e) => setEnqName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={enqPhone}
                  onChange={(e) => setEnqPhone(e.target.value)}
                  placeholder="e.g. 0722 419 880"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Notes / Questions
                </label>
                <textarea
                  rows={3}
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  placeholder="Cash purchase, bank financing, or trade-in question..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl luxury-gold-btn font-extrabold text-sm cursor-pointer"
              >
                Submit Enquiry to Sales Team
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Book Test Drive Modal */}
      {tdOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="luxury-glass-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                Book Test Drive: {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <button
                type="button"
                onClick={() => setTdOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTestDriveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={tdName}
                  onChange={(e) => setTdName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={tdPhone}
                  onChange={(e) => setTdPhone(e.target.value)}
                  placeholder="e.g. 0722 419 880"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tdDate}
                    onChange={(e) => setTdDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={tdSlot}
                    onChange={(e) => setTdSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="3:30 PM">3:30 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Driver&apos;s License No. (Optional)
                </label>
                <input
                  type="text"
                  value={tdLicense}
                  onChange={(e) => setTdLicense(e.target.value)}
                  placeholder="e.g. DL-904812"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl luxury-gold-btn font-extrabold text-sm cursor-pointer"
              >
                Confirm Test Drive Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 24/7 AI Sales Agent Widget */}
      <AISalesAgentWidget
        isOpen={aiOpen}
        onOpen={() => setAiOpen(true)}
        onClose={() => setAiOpen(false)}
        focusedVehicleId={vehicle.id}
        initialPrompt={aiInitialPrompt}
      />
    </div>
  );
}
