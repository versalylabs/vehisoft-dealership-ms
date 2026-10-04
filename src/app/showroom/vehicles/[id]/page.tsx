"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
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
      `Enquiry logged in Dealership CRM for ${cust.fullName}. Assigned to Peter Mwangi.`
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
      `Test Drive scheduled for ${tdDate} at ${tdSlot}. Added to Dealership Test Drives calendar.`
    );
    setTdName("");
    setTdPhone("");
    setTdLicense("");
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000d10] flex flex-col selection:bg-[#000d10] selection:text-[#ffffff]">
      {/* ====================================================================
          1. PALE DAWN-SKY HERO HEADER (Hyer Aviation Style)
          ==================================================================== */}
      <section className="hyer-sky-hero">
        <header className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-[23px] pb-[16px] flex items-center justify-between">
          <Link href="/" className="hyer-nav-link inline-flex items-center gap-[11px]">
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
            <span>Back to Showroom</span>
          </Link>

          <div className="flex items-center gap-[13px]">
            <Link
              href={`/inventory/${vehicle.id}`}
              className="hyer-pill-ghost-ink hidden sm:inline-flex"
            >
              <span>Admin Record</span>
            </Link>
            <button
              type="button"
              onClick={() =>
                triggerAIQuestion(
                  `Hi! Tell me about this ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
                )
              }
              className="hyer-pill-dark"
            >
              <span>Ask {aiSettings.agentName}®</span>
            </button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-[34px] pb-[59px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[34px] items-end">
            <div className="lg:col-span-7">
              <span className="text-[17px] font-bold text-[#000d10] block mb-[15px]">
                Stock #{vehicle.stockNumber} &nbsp;·&nbsp; {vehicle.status}{" "}
                &nbsp;·&nbsp; {profile.conditionBadge}
              </span>
              <h1 className="hyer-display text-[#000d10]">
                {vehicle.year} {vehicle.make}
                <br />
                {vehicle.model}.
              </h1>
            </div>

            <div className="lg:col-span-5 lg:text-right">
              <span className="text-[17px] font-bold text-[#8e8e95] block">
                Direct Showroom Price
              </span>
              <span className="hyer-heading-lg text-[#000d10] block mt-[8px]">
                {formatKSh(vehicle.askingPrice)}
              </span>
              <p className="hyer-body text-[#000d10] mt-[13px]">
                {profile.engineSize} · {vehicle.fuelType} ·{" "}
                {vehicle.transmission} · {vehicle.mileage.toLocaleString()} km ·{" "}
                {profile.drivetrain}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. WHITE CANVAS — GALLERY & PRIMARY CONVERSION PILLS
          ==================================================================== */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-8 py-[68px] w-full">
        {confirmationMsg && (
          <div className="mb-[38px] p-[22px] border border-[#000d10] bg-[#ffffff] flex items-center justify-between">
            <span className="hyer-body text-[#000d10] font-bold">
              {confirmationMsg}
            </span>
            <Link href="/leads" className="text-[17px] font-bold underline">
              Open CRM →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[52px]">
          {/* Left: Product-Crop Gallery (0px radius) */}
          <div className="lg:col-span-8">
            <div className="relative h-[340px] sm:h-[480px] bg-[#f3eee5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  profile.galleryUrls[selectedImageIdx] || vehicle.imageUrl
                }
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Strip (0px radius) */}
            <div className="grid grid-cols-4 gap-[16px] mt-[16px]">
              {profile.galleryUrls.slice(0, 4).map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`h-[88px] overflow-hidden border-t-2 pt-[6px] transition-opacity cursor-pointer ${
                    selectedImageIdx === idx
                      ? "border-[#000d10] opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Editorial Action Column (0px radius, #d5d3d4 hairlines, 1000px pill buttons) */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t border-[#d5d3d4] pt-[23px]">
            <div>
              <h2 className="hyer-heading text-[#000d10]">
                Acquire This Vehicle.
              </h2>
              <p className="hyer-body text-[#8e8e95] mt-[16px]">
                Located at {vehicle.location}. Schedule a viewing appointment,
                submit a direct enquiry, or consult our 24/7 AI sales agent.
              </p>

              <div className="mt-[31px] flex flex-col gap-[13px]">
                <button
                  type="button"
                  onClick={() => setEnquireOpen(true)}
                  className="hyer-pill-dark w-full"
                >
                  <span>Enquire Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setTdOpen(true)}
                  className="hyer-pill-ghost-ink w-full"
                >
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
                  className="hyer-pill-ghost-ink w-full"
                >
                  <span>Chat with AI ({aiSettings.agentName}®)</span>
                </button>
              </div>
            </div>

            {/* Hairline Finance Summary */}
            <div className="mt-[38px] border-t border-[#d5d3d4] pt-[22px] space-y-[11px]">
              <span className="text-[17px] font-bold text-[#000d10] block">
                Bank Financing Estimate
              </span>
              <div className="flex justify-between text-[18px]">
                <span className="text-[#8e8e95]">20% Deposit</span>
                <span className="font-bold text-[#000d10]">
                  {formatKSh(vehicle.askingPrice * 0.2)}
                </span>
              </div>
              <div className="flex justify-between text-[18px]">
                <span className="text-[#8e8e95]">48 Months Est.</span>
                <span className="font-bold text-[#000d10]">
                  {formatKSh(
                    Math.round((vehicle.askingPrice * 0.8 * 1.24) / 48)
                  )}
                  /mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. WHITE CANVAS — RIGHT-ALIGNED SPECIFICATIONS & FEATURES
          ==================================================================== */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-8 py-[80px] border-t border-[#d5d3d4] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[52px]">
          <div className="lg:col-span-4">
            <span className="text-[17px] font-bold text-[#8e8e95] block">
              01 / Technical Specifications
            </span>
            <h2 className="hyer-heading text-[#000d10] mt-[16px]">
              Verified Dossier.
            </h2>
            <p className="hyer-body text-[#8e8e95] mt-[16px]">
              {vehicle.notes}
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[80px] gap-y-[38px]">
              {[
                { label: "Make & Model", value: `${vehicle.make} ${vehicle.model}` },
                { label: "Variant / Trim", value: vehicle.variant },
                { label: "Year of Manufacture", value: String(vehicle.year) },
                { label: "Verified Mileage", value: `${vehicle.mileage.toLocaleString()} km` },
                { label: "Engine Displacement", value: profile.engineSize },
                { label: "Powertrain & Fuel", value: `${vehicle.fuelType} · ${vehicle.transmission}` },
                { label: "Drivetrain", value: profile.drivetrain },
                { label: "Exterior Finish", value: `${vehicle.color} · ${vehicle.bodyType}` },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="border-t border-[#d5d3d4] pt-[21px]"
                >
                  <h3 className="hyer-subheading text-[#000d10]">
                    {spec.value}
                  </h3>
                  <p className="hyer-body text-[#8e8e95] mt-[8px]">
                    {spec.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Key Features List */}
            <div className="mt-[68px] border-t border-[#d5d3d4] pt-[38px]">
              <h3 className="hyer-heading text-[#000d10] mb-[31px]">
                Standard Equipment.
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[80px] gap-y-[23px]">
                {profile.features.map((feat) => (
                  <div
                    key={feat}
                    className="border-t border-[#d5d3d4] pt-[16px] hyer-body text-[#000d10]"
                  >
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SINGLE FEATURED CLAY CARD (#bc7155) — VEHICLE AI CONCIERGE
          ==================================================================== */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-8 pb-[80px] w-full">
        <div className="hyer-clay-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[38px] items-center">
            <div className="lg:col-span-6">
              <h2 className="hyer-heading text-[#ffffff]">
                Interested in this {vehicle.model}?
                <br />
                Ask {aiSettings.agentName}®.
              </h2>
              <p className="hyer-body text-[#ffffff] mt-[17px]">
                Our 24/7 digital sales consultant has the complete dossier for
                Stock #{vehicle.stockNumber} and can schedule your viewing or
                prepare a bank proforma invoice immediately.
              </p>
            </div>
            <div className="lg:col-span-6 flex flex-wrap gap-[11px]">
              {[
                `Does the ${vehicle.model} have a sunroof?`,
                `What's the mileage on this ${vehicle.model}?`,
                `Is this ${vehicle.model} still available?`,
                `Can I come see the ${vehicle.model} tomorrow?`,
                `I'd like to negotiate the price on the ${vehicle.model}`,
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => triggerAIQuestion(q)}
                  className="hyer-pill-ghost-white"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. FOOTER TERMINAL (#000d10)
          ==================================================================== */}
      <footer className="bg-[#000d10] text-[#ffffff] py-[68px] mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-[23px]">
          <div className="hyer-wordmark text-[#ffffff]">
            Vehisoft
            <sup className="text-[0.28em] font-bold align-super ml-1">®</sup>
          </div>
          <div className="flex flex-wrap gap-[23px] text-[20px] text-[#8e8e95]">
            <Link href="/" className="hover:text-[#ffffff]">
              Showroom
            </Link>
            <Link href="/dashboard" className="hover:text-[#ffffff]">
              Executive CRM
            </Link>
            <Link href="/ai-conversations" className="hover:text-[#ffffff]">
              AI Logs
            </Link>
          </div>
        </div>
      </footer>

      {/* Enquire Now Modal (0px radius, #ffffff surface, #000d10 border) */}
      {enquireOpen && (
        <div className="fixed inset-0 z-50 bg-[#000d10]/70 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] text-[#000d10] max-w-lg w-full p-[38px] border border-[#000d10]">
            <div className="flex items-center justify-between pb-[21px] border-b border-[#d5d3d4]">
              <h3 className="hyer-subheading text-[#000d10]">
                Enquire: {vehicle.year} {vehicle.make} {vehicle.model}.
              </h3>
              <button
                type="button"
                onClick={() => setEnquireOpen(false)}
                className="hyer-circle-btn !w-9 !h-9"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEnquireSubmit} className="mt-[23px] space-y-[21px]">
              <div>
                <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={enqName}
                  onChange={(e) => setEnqName(e.target.value)}
                  placeholder="John Kamau"
                  className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <div>
                <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={enqPhone}
                  onChange={(e) => setEnqPhone(e.target.value)}
                  placeholder="0722 419 880"
                  className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <div>
                <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  placeholder="Financing, cash offer, or trade-in question..."
                  className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <button type="submit" className="hyer-pill-dark w-full">
                Submit Enquiry to CRM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Book Test Drive Modal */}
      {tdOpen && (
        <div className="fixed inset-0 z-50 bg-[#000d10]/70 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] text-[#000d10] max-w-lg w-full p-[38px] border border-[#000d10]">
            <div className="flex items-center justify-between pb-[21px] border-b border-[#d5d3d4]">
              <h3 className="hyer-subheading text-[#000d10]">
                Book Test Drive: {vehicle.year} {vehicle.make} {vehicle.model}.
              </h3>
              <button
                type="button"
                onClick={() => setTdOpen(false)}
                className="hyer-circle-btn !w-9 !h-9"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTestDriveSubmit} className="mt-[23px] space-y-[21px]">
              <div>
                <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={tdName}
                  onChange={(e) => setTdName(e.target.value)}
                  placeholder="John Kamau"
                  className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <div>
                <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={tdPhone}
                  onChange={(e) => setTdPhone(e.target.value)}
                  placeholder="0722 419 880"
                  className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tdDate}
                    onChange={(e) => setTdDate(e.target.value)}
                    className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                    Time Slot
                  </label>
                  <select
                    value={tdSlot}
                    onChange={(e) => setTdSlot(e.target.value)}
                    className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="3:30 PM">3:30 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[17px] font-bold text-[#000d10] mb-[8px]">
                  Driver&apos;s License No. (Optional)
                </label>
                <input
                  type="text"
                  value={tdLicense}
                  onChange={(e) => setTdLicense(e.target.value)}
                  placeholder="DL-904812"
                  className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <button type="submit" className="hyer-pill-dark w-full">
                Confirm Viewing Appointment
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
