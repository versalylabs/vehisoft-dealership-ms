"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { getVehiclePublicProfile } from "@/lib/ai-sales-agent";
import { AISalesAgentWidget } from "@/components/showroom/AISalesAgentWidget";
import { formatKSh } from "@/lib/format";
import { VehisoftIcon } from "@/components/brand/VehisoftLogo";

export default function PublicVehicleDetailPage() {
  const params = useParams();
  const vehicleId = String(params?.id || "");
  const {
    vehicles,
    aiSettings,
    addCustomer,
    addLead,
    addActivity,
    addTestDrive,
  } = useDealership();
  const { isAuthenticated } = useAuth();

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"SPECS" | "FEATURES" | "HISTORY">(
    "SPECS"
  );

  // AI Drawer state
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

  // Enquiry Drawer Modal
  const [enquireOpen, setEnquireOpen] = useState<boolean>(false);
  const [enqName, setEnqName] = useState("");
  const [enqPhone, setEnqPhone] = useState("");
  const [enqNotes, setEnqNotes] = useState("");

  // Test Drive Modal
  const [tdOpen, setTdOpen] = useState<boolean>(false);
  const [tdName, setTdName] = useState("");
  const [tdPhone, setTdPhone] = useState("");
  const [tdDate, setTdDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [tdSlot, setTdSlot] = useState("11:00 AM");
  const [tdLicense, setTdLicense] = useState("");

  // Confirmation banner state
  const [confirmationMsg, setConfirmationMsg] = useState<string | null>(null);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#0f1011] text-[#ffffff] flex flex-col justify-center items-center px-4">
        <VehisoftIcon size={48} className="mb-4" />
        <h1 className="font-serif text-[32px] text-white">
          Motor Vehicle Not Found
        </h1>
        <p className="text-[#9f9fa0] text-[15px] mt-2 text-center max-w-md font-sans">
          This vehicle record may have been archived, sold, or transferred from our active showroom vault.
        </p>
        <Link href="/showroom/vehicles" className="origin-btn-primary mt-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Showroom Catalog</span>
        </Link>
      </div>
    );
  }

  const profile = getVehiclePublicProfile(vehicle);

  const triggerAIQuestion = (prompt: string) => {
    setAiPrompt(prompt);
    setAiOpen(true);
  };

  const handleEnquireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqName.trim() || !enqPhone.trim()) return;

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
      pipelineStage: "NEW",
      notes: `[Public Vehicle Page Enquiry] ${enqNotes.trim() || "Interested in purchasing."}`,
      assignedSalespersonId: "usr-brian",
      assignedSalespersonName: "Brian Ochieng",
    });

    const todayIso = new Date().toISOString();
    const lead = addLead({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicleStockNo: vehicle.stockNumber,
      askingPrice: vehicle.askingPrice,
      source: "WEBSITE",
      assignedSalespersonId: "usr-brian",
      assignedSalespersonName: "Brian Ochieng",
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
      staffId: "usr-brian",
      staffName: "Brian Ochieng",
      scheduledAt: todayIso,
      notes: `Website Enquiry for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      nextAction: "Call buyer to discuss viewing & financing",
    });

    setEnquireOpen(false);
    setConfirmationMsg(
      `Enquiry confirmed for ${cust.fullName}. Our sales consultant Brian Ochieng will contact you shortly.`
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
      pipelineStage: "NEW",
      notes: `[Website Test Drive Booking] Slot: ${tdDate} at ${tdSlot}`,
      assignedSalespersonId: "usr-brian",
      assignedSalespersonName: "Brian Ochieng",
    });

    const todayIso = new Date().toISOString();
    const lead = addLead({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicleStockNo: vehicle.stockNumber,
      askingPrice: vehicle.askingPrice,
      source: "WEBSITE",
      assignedSalespersonId: "usr-brian",
      assignedSalespersonName: "Brian Ochieng",
      budget: vehicle.askingPrice,
      expectedPurchaseDate: tdDate,
      stage: "TEST_DRIVE",
      probability: 60,
      nextFollowUpAt: tdDate,
      notes: `Test Drive scheduled for ${tdDate} at ${tdSlot}.`,
    });

    addTestDrive({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      stockNumber: vehicle.stockNumber,
      salespersonId: "usr-brian",
      salespersonName: "Brian Ochieng",
      scheduledAt: `${tdDate}T10:00:00Z`,
      driverName: tdName.trim(),
      driverLicenseNo: tdLicense.trim() || "DL-PENDING",
      mileageOut: vehicle.mileage,
      status: "SCHEDULED",
      notes: `Website Test Drive Booking for ${tdDate} at ${tdSlot}`,
      outcome: "Scheduled via Public Website",
    });

    setTdOpen(false);
    setConfirmationMsg(
      `Test Drive appointment confirmed for ${tdDate} at ${tdSlot}. Our showroom team looks forward to hosting you.`
    );
    setTdName("");
    setTdPhone("");
    setTdLicense("");
  };

  return (
    <div className="min-h-screen bg-[#0f1011] text-[#ffffff] flex flex-col overflow-x-hidden selection:bg-[#847dff] selection:text-[#ffffff]">
      {/* ====================================================================
          1. HEADER & HERO BANNER (Origin Financial Style)
          ==================================================================== */}
      <section className="origin-sky-atmosphere border-b border-white/10">
        <header className="sticky top-0 z-40 origin-nav-glass">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 shrink-0 group focus:outline-none"
                aria-label="Vehisoft Home"
              >
                <VehisoftIcon
                  size={30}
                  className="transition-transform group-hover:scale-105"
                />
                <span className="font-serif italic text-[20px] tracking-tight text-white font-normal">
                  Vehisoft<sup className="text-[10px] ml-0.5 not-italic text-[#847dff]">®</sup>
                </span>
              </Link>

              <Link
                href="/showroom/vehicles"
                className="inline-flex items-center gap-1.5 text-[14px] text-[#9f9fa0] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Showroom Catalog</span>
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              {isAuthenticated && (
                <Link
                  href={`/inventory/${vehicle.id}`}
                  className="origin-btn-ghost !py-2 !px-3.5 !text-[13px] hidden sm:inline-flex"
                >
                  <span>Admin Record</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() =>
                  triggerAIQuestion(
                    `Tell me about this ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
                  )
                }
                className="origin-btn-primary !py-2 !px-3.5 !text-[13px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#847dff]" />
                <span>Ask {aiSettings.agentName}®</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-3">
                <span>STOCK #{vehicle.stockNumber}</span>
                <span>·</span>
                <span className="text-[#00b3dd]">{vehicle.status}</span>
                <span>·</span>
                <span>{profile.conditionBadge}</span>
              </div>
              <h1 className="origin-display text-white">
                {vehicle.year} {vehicle.make}{" "}
                <em>{vehicle.model}</em>
              </h1>
            </div>

            <div className="lg:col-span-5 lg:text-right">
              <span className="text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase block">
                Direct Showroom Acquisition
              </span>
              <span className="font-mono text-[32px] sm:text-[38px] font-medium text-white block mt-1">
                {formatKSh(vehicle.askingPrice)}
              </span>
              <p className="text-[13px] text-[#9f9fa0] mt-2 font-mono">
                {profile.engineSize} · {vehicle.fuelType} · {vehicle.transmission} · {vehicle.mileage.toLocaleString()} km
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. GALLERY & PRIMARY ACTIONS
          ==================================================================== */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-8 py-14 w-full">
        {confirmationMsg && (
          <div className="mb-8 p-4 rounded-[8px] bg-[#847dff]/20 border border-[#847dff] text-white flex items-center justify-between gap-4">
            <span className="text-[14px] font-medium">{confirmationMsg}</span>
            <button
              type="button"
              onClick={() => setConfirmationMsg(null)}
              className="text-[12px] underline text-[#9f9fa0] hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left: Gallery */}
          <div className="lg:col-span-8">
            <div className="relative h-[320px] sm:h-[500px] rounded-[16px] bg-[#090a0b] overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.galleryUrls[selectedImageIdx] || vehicle.imageUrl}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3 mt-3">
              {profile.galleryUrls.slice(0, 4).map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`h-[72px] sm:h-[96px] rounded-[8px] overflow-hidden border transition-all cursor-pointer ${
                    selectedImageIdx === idx
                      ? "border-white opacity-100 scale-[1.02]"
                      : "border-white/15 opacity-50 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Action Panel */}
          <div className="lg:col-span-4 origin-card-graphite p-8 flex flex-col justify-between">
            <div>
              <span className="origin-mono-label text-[#847dff] block mb-2">
                VERIFIED KENYAN INVENTORY
              </span>
              <h2 className="font-serif text-[24px] text-white">
                Acquire This Vehicle.
              </h2>
              <p className="text-[14px] text-[#9f9fa0] mt-3 leading-relaxed font-sans">
                Located at {vehicle.location}. Schedule a private showroom viewing, request a comprehensive walkaround video, or consult our AI sales specialist.
              </p>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => setEnquireOpen(true)}
                  className="origin-btn-primary w-full !py-3"
                >
                  <span>Enquire on This Vehicle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTdOpen(true)}
                  className="origin-btn-ghost w-full !py-3"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Private Test Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerAIQuestion(
                      `What are the full specifications and financing terms for this ${vehicle.year} ${vehicle.make} ${vehicle.model}?`
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#847dff]" />
                  <span>Consult {aiSettings.agentName}®</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <span className="text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase block">
                Provenance Verification
              </span>
              <p className="text-[12px] text-white mt-1">
                Verified Grade 4.5+ QISJ Inspection · Clear Kenyan NTSA Title
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. SPECIFICATIONS, FEATURES & VERIFICATION TABS
          ==================================================================== */}
      <section className="bg-[#090a0b] py-16 border-t border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          {/* Tab Switcher */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab("SPECS")}
              className={`pb-2 text-[14px] font-mono tracking-wider uppercase transition-colors border-b-2 -mb-[18px] cursor-pointer ${
                activeTab === "SPECS"
                  ? "border-white text-white font-medium"
                  : "border-transparent text-[#9f9fa0] hover:text-white"
              }`}
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("FEATURES")}
              className={`pb-2 text-[14px] font-mono tracking-wider uppercase transition-colors border-b-2 -mb-[18px] cursor-pointer ${
                activeTab === "FEATURES"
                  ? "border-white text-white font-medium"
                  : "border-transparent text-[#9f9fa0] hover:text-white"
              }`}
            >
              Key Features
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("HISTORY")}
              className={`pb-2 text-[14px] font-mono tracking-wider uppercase transition-colors border-b-2 -mb-[18px] cursor-pointer ${
                activeTab === "HISTORY"
                  ? "border-white text-white font-medium"
                  : "border-transparent text-[#9f9fa0] hover:text-white"
              }`}
            >
              Provenance & Documents
            </button>
          </div>

          {/* Specs Tab */}
          {activeTab === "SPECS" && (
            <div className="origin-card-graphite p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-[14px]">
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Year</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.year}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Make & Model</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.make} {vehicle.model}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Variant</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.variant}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Mileage</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Fuel Type</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Transmission</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Body Type</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.bodyType}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Color</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.color}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Location</span>
                  <span className="text-white font-medium mt-1 block">{vehicle.location}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Chassis / VIN</span>
                  <span className="text-white font-mono mt-1 block">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Registration</span>
                  <span className="text-white font-mono mt-1 block">{vehicle.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#9f9fa0] uppercase block">Condition Grade</span>
                  <span className="text-[#00b3dd] font-medium mt-1 block">{profile.conditionBadge}</span>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "FEATURES" && (
            <div className="origin-card-graphite p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(profile.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-[8px] bg-[#0f1011] border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-[#847dff] shrink-0" />
                    <span className="text-[14px] text-white font-sans">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "HISTORY" && (
            <div className="origin-card-graphite p-8">
              <div className="space-y-4">
                <div className="p-4 rounded-[8px] bg-[#0f1011] border border-white/10 flex items-start gap-4">
                  <BadgeCheck className="w-5 h-5 text-[#00b3dd] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[15px] font-medium text-white">QISJ Japan Certified Inspection</h4>
                    <p className="text-[13px] text-[#9f9fa0] mt-1 font-sans">
                      Verified export certificate issued at Yokohama port confirming genuine digital mileage and 150 mechanical checkpoints.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[8px] bg-[#0f1011] border border-white/10 flex items-start gap-4">
                  <FileText className="w-5 h-5 text-[#847dff] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[15px] font-medium text-white">Kenyan Customs & Duty Paid</h4>
                    <p className="text-[13px] text-[#9f9fa0] mt-1 font-sans">
                      Clear entry via Mombasa Port CFS with complete KRA customs declaration and duty receipt available on request.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[8px] bg-[#0f1011] border border-white/10 flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-[#00b3dd] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[15px] font-medium text-white">NTSA TIMS Logbook Transfer</h4>
                    <p className="text-[13px] text-[#9f9fa0] mt-1 font-sans">
                      Eligible for same-day digital ownership transfer on the National Transport and Safety Authority portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Enquiry Drawer Modal */}
      {enquireOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg origin-card-graphite p-8 relative">
            <button
              type="button"
              onClick={() => setEnquireOpen(false)}
              className="absolute top-5 right-5 text-[#9f9fa0] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="origin-mono-label text-[#847dff] block mb-2">
              ACQUISITION ENQUIRY
            </span>
            <h3 className="font-serif text-[24px] text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-[14px] text-[#9f9fa0] mt-1">
              Direct Price: {formatKSh(vehicle.askingPrice)} · Stock #{vehicle.stockNumber}
            </p>

            <form onSubmit={handleEnquireSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={enqName}
                  onChange={(e) => setEnqName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={enqPhone}
                  onChange={(e) => setEnqPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                  Questions / Financing Requirements
                </label>
                <textarea
                  rows={3}
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  placeholder="Ask about trade-in, financing, or delivery..."
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                />
              </div>

              <button type="submit" className="origin-btn-primary w-full mt-2">
                <span>Submit Enquiry to Sales Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Test Drive Drawer Modal */}
      {tdOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg origin-card-graphite p-8 relative">
            <button
              type="button"
              onClick={() => setTdOpen(false)}
              className="absolute top-5 right-5 text-[#9f9fa0] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="origin-mono-label text-[#00b3dd] block mb-2">
              PRIVATE TEST DRIVE
            </span>
            <h3 className="font-serif text-[24px] text-white">
              Experience the {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-[14px] text-[#9f9fa0] mt-1">
              Location: {vehicle.location} · 30-Minute Road Session
            </p>

            <form onSubmit={handleTestDriveSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={tdName}
                  onChange={(e) => setTdName(e.target.value)}
                  placeholder="e.g. David Mwangi"
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={tdPhone}
                  onChange={(e) => setTdPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tdDate}
                    onChange={(e) => setTdDate(e.target.value)}
                    className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[14px] focus:outline-none focus:border-[#847dff]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                    Preferred Slot
                  </label>
                  <select
                    value={tdSlot}
                    onChange={(e) => setTdSlot(e.target.value)}
                    className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[14px] focus:outline-none focus:border-[#847dff]"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="origin-btn-primary w-full mt-2">
                <span>Confirm Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#090a0b] border-t border-white/10 py-12">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <VehisoftIcon size={36} className="text-white" />
            <span className="font-serif italic text-[24px] text-white">
              Vehisoft<sup className="text-[12px] ml-0.5 not-italic text-[#847dff]">®</sup>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#9f9fa0]">
            <span>Ngong Road, Nairobi</span>
            <span className="text-white/20">·</span>
            <a href="tel:+254704611033" className="text-white hover:text-[#00b3dd] transition-colors">+254 704 611 033</a>
            <span>/</span>
            <a href="tel:+25492986825" className="text-white hover:text-[#00b3dd] transition-colors">+254 929 868 25</a>
            <span className="text-white/20">·</span>
            <a href="mailto:versalylabs@gmail.com" className="text-[#00b3dd] hover:underline">versalylabs@gmail.com</a>
          </div>

          <p className="text-[13px] text-[#9f9fa0] font-sans">
            © {new Date().getFullYear()} Vehisoft® Motor Dealership Management System. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 24/7 AI Sales Consultant Widget */}
      <AISalesAgentWidget
        isOpen={aiOpen}
        onOpen={() => setAiOpen(true)}
        onClose={() => setAiOpen(false)}
        focusedVehicleId={vehicle.id}
        initialPrompt={aiPrompt}
      />
    </div>
  );
}
