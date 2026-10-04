"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Plus,
  Check,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { getVehiclePublicProfile } from "@/lib/ai-sales-agent";
import { AISalesAgentWidget } from "@/components/showroom/AISalesAgentWidget";
import { formatKSh } from "@/lib/format";

type VehicleCatalogTab = "ALL" | "NEW_ARRIVALS" | "FEATURED";

export default function PublicDealershipShowroomPage() {
  const {
    vehicles,
    aiSettings,
    addCustomer,
    addLead,
    addTradeInRequest,
  } = useDealership();

  // Filter states
  const [selectedMake, setSelectedMake] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("ALL");
  const [selectedBudget, setSelectedBudget] = useState<string>("ALL");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("ALL");
  const [catalogTab, setCatalogTab] = useState<VehicleCatalogTab>("ALL");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Hero showcase vehicle selector
  const [spotlightIdx, setSpotlightIdx] = useState<number>(0);

  // AI Agent Drawer State
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiFocusedVehicleId, setAiFocusedVehicleId] = useState<
    string | undefined
  >(undefined);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(
    undefined
  );

  // Trade-In / Sell Your Car Form State
  const [tiMake, setTiMake] = useState("Toyota");
  const [tiModel, setTiModel] = useState("Premio");
  const [tiYear, setTiYear] = useState(2017);
  const [tiMileage, setTiMileage] = useState(68000);
  const [tiCondition, setTiCondition] = useState<"EXCELLENT" | "GOOD" | "FAIR">(
    "GOOD"
  );
  const [tiLocation, setTiLocation] = useState("Nairobi");
  const [tiExpectedPrice, setTiExpectedPrice] = useState(2150000);
  const [tiTargetVehicleId, setTiTargetVehicleId] = useState("");
  const [tiName, setTiName] = useState("");
  const [tiPhone, setTiPhone] = useState("");
  const [tiNotes, setTiNotes] = useState("");
  const [tiSubmittedBanner, setTiSubmittedBanner] = useState<string | null>(
    null
  );

  // Contact Inquiry Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactVehicleId, setContactVehicleId] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Live AVAILABLE inventory (SOLD vehicles are automatically removed from public site)
  const publicInventory = useMemo(() => {
    return vehicles.filter((v) => v.status === "AVAILABLE");
  }, [vehicles]);

  const soldCount = useMemo(() => {
    return vehicles.filter((v) => v.status === "SOLD").length;
  }, [vehicles]);

  const spotlightVehicles = useMemo(() => {
    return publicInventory.slice(0, 4);
  }, [publicInventory]);

  const activeSpotlight =
    spotlightVehicles[spotlightIdx] || spotlightVehicles[0];

  const availableMakes = useMemo(() => {
    return Array.from(new Set(publicInventory.map((v) => v.make))).sort();
  }, [publicInventory]);

  const availableModels = useMemo(() => {
    const base =
      selectedMake === "ALL"
        ? publicInventory
        : publicInventory.filter((v) => v.make === selectedMake);
    return Array.from(new Set(base.map((v) => v.model))).sort();
  }, [publicInventory, selectedMake]);

  const filteredVehicles = useMemo(() => {
    return publicInventory.filter((v) => {
      const profile = getVehiclePublicProfile(v);
      if (catalogTab === "NEW_ARRIVALS" && !profile.isNewArrival) return false;
      if (catalogTab === "FEATURED" && !profile.isFeatured) return false;
      if (selectedMake !== "ALL" && v.make !== selectedMake) return false;
      if (selectedModel !== "ALL" && v.model !== selectedModel) return false;
      if (selectedBodyType !== "ALL" && v.bodyType !== selectedBodyType)
        return false;

      if (selectedBudget === "UNDER_3M" && v.askingPrice > 3000000)
        return false;
      if (
        selectedBudget === "2M_4M" &&
        (v.askingPrice < 2000000 || v.askingPrice > 4200000)
      )
        return false;
      if (
        selectedBudget === "4M_6M" &&
        (v.askingPrice < 4000000 || v.askingPrice > 6000000)
      )
        return false;
      if (selectedBudget === "ABOVE_6M" && v.askingPrice < 6000000)
        return false;

      return true;
    });
  }, [
    publicInventory,
    catalogTab,
    selectedMake,
    selectedModel,
    selectedBudget,
    selectedBodyType,
  ]);

  const openAIWithPrompt = (prompt?: string, vehicleId?: string) => {
    setAiFocusedVehicleId(vehicleId);
    setAiInitialPrompt(prompt);
    setAiOpen(true);
  };

  const resetFilters = () => {
    setSelectedMake("ALL");
    setSelectedModel("ALL");
    setSelectedBudget("ALL");
    setSelectedBodyType("ALL");
    setCatalogTab("ALL");
  };

  const handleTradeInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiName.trim() || !tiPhone.trim()) return;
    const targetVeh = vehicles.find((v) => v.id === tiTargetVehicleId);
    addTradeInRequest({
      make: tiMake,
      model: tiModel,
      year: Number(tiYear),
      mileage: Number(tiMileage),
      condition: tiCondition,
      location: tiLocation,
      expectedPrice: Number(tiExpectedPrice),
      customerName: tiName.trim(),
      customerPhone: tiPhone.trim(),
      notes: tiNotes.trim(),
      targetVehicleId: targetVeh?.id,
      targetVehicleTitle: targetVeh
        ? `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`
        : undefined,
    });
    setTiSubmittedBanner(
      `Valuation & Trade-In Lead created in Dealership CRM for your ${tiYear} ${tiMake} ${tiModel} (${formatKSh(
        tiExpectedPrice
      )}). Acquisition specialist James Omondi has been notified.`
    );
    setTiName("");
    setTiPhone("");
    setTiNotes("");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    const targetVeh =
      publicInventory.find((v) => v.id === contactVehicleId) ||
      publicInventory[0];
    const todayIso = new Date().toISOString().split("T")[0];
    const cust = addCustomer({
      fullName: contactName.trim(),
      phone: contactPhone.trim(),
      email: "",
      address: "Nairobi",
      location: "Nairobi",
      customerType: "INDIVIDUAL",
      preferredMakes: targetVeh?.make || "Any",
      preferredModels: targetVeh?.model || "Any",
      budgetMin: 2500000,
      budgetMax: targetVeh?.askingPrice || 5000000,
      preferredYear: targetVeh?.year || 2020,
      preferredFuel: "Any",
      preferredTrans: "Automatic",
      preferredBody: "SUV",
      assignedSalespersonId: "usr-3",
      assignedSalespersonName: "Peter Mwangi",
      pipelineStage: "NEW",
      notes: contactMessage.trim(),
    });
    if (targetVeh) {
      addLead({
        customerId: cust.id,
        customerName: cust.fullName,
        customerPhone: cust.phone,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        vehicleStockNo: targetVeh.stockNumber,
        askingPrice: targetVeh.askingPrice,
        source: "WEBSITE",
        assignedSalespersonId: "usr-3",
        assignedSalespersonName: "Peter Mwangi",
        budget: targetVeh.askingPrice,
        expectedPurchaseDate: todayIso,
        stage: "NEW",
        probability: 35,
        nextFollowUpAt: todayIso,
        notes: `[Website Contact Form] ${contactMessage.trim()}`,
      });
    }
    setContactSubmitted(true);
    setContactName("");
    setContactPhone("");
    setContactMessage("");
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000d10] flex flex-col selection:bg-[#000d10] selection:text-[#ffffff]">
      {/* ====================================================================
          1. PALE DAWN-SKY TO PARCHMENT HERO SECTION (Hyer Aviation Style)
          ==================================================================== */}
      <section id="top" className="hyer-sky-hero relative overflow-hidden">
        {/* Transparent Top Navigation over Hero */}
        <header className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-[23px] pb-[16px] flex items-center justify-between">
          <div className="flex items-center gap-[31px]">
            <a href="#vehicles-catalog" className="hyer-nav-link">
              Vehicles
            </a>
            <a href="#featured-ai" className="hyer-nav-link hidden sm:inline">
              AI Concierge
            </a>
            <a href="#services" className="hyer-nav-link hidden md:inline">
              Services
            </a>
            <a href="#sell-trade-in" className="hyer-nav-link hidden md:inline">
              Trade-In
            </a>
            <a href="#contact" className="hyer-nav-link hidden lg:inline">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-[13px]">
            <button
              type="button"
              onClick={() => openAIWithPrompt()}
              className="hyer-pill-dark"
            >
              <span>Vehisoft® AI</span>
            </button>
            <Link
              href="/dashboard"
              className="hyer-pill-ghost-ink hidden sm:inline-flex"
            >
              <span>Staff CRM</span>
            </Link>
            {/* Circular Icon Button (100% radius, #000d10 bg, white icon) */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="hyer-circle-btn"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? (
                <X className="w-5 h-5 stroke-[2]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2]" />
              )}
            </button>
          </div>
        </header>

        {/* Expandable Quick Navigation Panel */}
        {mobileNavOpen && (
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-[22px] border-t border-b border-[#d5d3d4] bg-[#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
              <div className="flex flex-col sm:flex-row gap-[13px] sm:gap-[31px]">
                <a
                  href="#vehicles-catalog"
                  onClick={() => setMobileNavOpen(false)}
                  className="hyer-nav-link"
                >
                  All Vehicles ({publicInventory.length})
                </a>
                <a
                  href="#featured-ai"
                  onClick={() => setMobileNavOpen(false)}
                  className="hyer-nav-link"
                >
                  24/7 AI Sales Agent
                </a>
                <a
                  href="#sell-trade-in"
                  onClick={() => setMobileNavOpen(false)}
                  className="hyer-nav-link"
                >
                  Sell / Trade-In Desk
                </a>
                <Link href="/ai-conversations" className="hyer-nav-link">
                  Admin AI Logs
                </Link>
                <Link href="/login" className="hyer-nav-link">
                  Staff Login
                </Link>
              </div>
              <span className="text-[17px] font-bold text-[#8e8e95]">
                Live Sync: {publicInventory.length} Available • {soldCount} Sold
              </span>
            </div>
          </div>
        )}

        {/* Asymmetric Hero Architecture:
            Wordmark flush-left at 131px + Right-aligned two-line 63px headline ending with a period */}
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-[38px] pb-[68px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[34px] items-start">
            {/* Flush-Left Monumental Wordmark */}
            <div className="lg:col-span-7">
              <h1 className="hyer-wordmark select-none">
                Vehisoft
                <sup className="text-[0.28em] font-bold align-super ml-1 tracking-normal">
                  ®
                </sup>
              </h1>
              <p className="mt-[15px] text-[17px] font-bold text-[#000d10] tracking-tight">
                Nairobi Showroom &nbsp;·&nbsp; {publicInventory.length} Live
                Vehicles Available &nbsp;·&nbsp; Currency: KSh.
              </p>
            </div>

            {/* Right-Side Two-Line Hero Statement Ending with a Period */}
            <div className="lg:col-span-5 lg:text-right flex flex-col lg:items-end justify-end pt-[11px]">
              <h2 className="hyer-display text-[#000d10]">
                Beyond
                <br />
                Showroom.
              </h2>
              <p className="hyer-body text-[#000d10] mt-[22px] max-w-[420px] lg:text-right">
                Browse our live QISJ-verified inventory, compare specifications,
                and consult our 24/7 AI sales specialist anytime.
              </p>
              <div className="mt-[23px] flex flex-wrap lg:justify-end gap-[13px]">
                <a href="#vehicles-catalog" className="hyer-pill-dark">
                  <span>Vehisoft® Inventory</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                </a>
                <button
                  type="button"
                  onClick={() => openAIWithPrompt()}
                  className="hyer-pill-ghost-ink"
                >
                  <span>Talk to an Agent</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sculptural Product Showcase in the Lower-Center Negative Space */}
          {activeSpotlight && (
            <div className="mt-[52px]">
              <div className="relative bg-[#ffffff] border-t border-[#d5d3d4]">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Product Crop Vehicle Photography (0px radius) */}
                  <div className="lg:col-span-8 relative h-[320px] sm:h-[460px] bg-[#f4efe6] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeSpotlight.imageUrl}
                      alt={`${activeSpotlight.year} ${activeSpotlight.make} ${activeSpotlight.model}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Minimal Pill Switcher on Image */}
                    <div className="absolute top-[22px] left-[22px] flex items-center gap-[11px]">
                      {spotlightVehicles.map((v, idx) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSpotlightIdx(idx)}
                          className={`rounded-full px-[16px] py-[11px] text-[17px] font-bold leading-none transition-colors cursor-pointer ${
                            spotlightIdx === idx
                              ? "bg-[#000d10] text-[#ffffff]"
                              : "bg-[#ffffff] text-[#000d10]"
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hard-Edged 0px Specification Panel */}
                  <div className="lg:col-span-4 p-[34px] flex flex-col justify-between bg-[#ffffff] border-t lg:border-t-0 lg:border-l border-[#d5d3d4]">
                    <div>
                      <div className="flex items-center justify-between text-[17px] font-bold text-[#8e8e95] pb-[15px] border-b border-[#d5d3d4]">
                        <span>Spotlight #{activeSpotlight.stockNumber}</span>
                        <span>{activeSpotlight.bodyType}</span>
                      </div>

                      <h3 className="hyer-heading text-[#000d10] mt-[22px]">
                        {activeSpotlight.year} {activeSpotlight.make}{" "}
                        {activeSpotlight.model}.
                      </h3>

                      <p className="hyer-body text-[#8e8e95] mt-[15px]">
                        {activeSpotlight.variant} ·{" "}
                        {activeSpotlight.mileage.toLocaleString()} km ·{" "}
                        {activeSpotlight.transmission} ·{" "}
                        {activeSpotlight.fuelType} · {activeSpotlight.location}
                      </p>

                      <div className="mt-[23px] pt-[22px] border-t border-[#d5d3d4]">
                        <span className="text-[17px] font-bold text-[#8e8e95] block">
                          Direct Showroom Price
                        </span>
                        <span className="hyer-heading text-[#000d10] block mt-[11px]">
                          {formatKSh(activeSpotlight.askingPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-[34px] flex flex-wrap gap-[11px]">
                      <Link
                        href={`/showroom/vehicles/${activeSpotlight.id}`}
                        className="hyer-pill-dark"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          openAIWithPrompt(
                            `Tell me about the ${activeSpotlight.year} ${activeSpotlight.make} ${activeSpotlight.model}`,
                            activeSpotlight.id
                          )
                        }
                        className="hyer-pill-ghost-ink"
                      >
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Prompt Pills Row */}
              <div className="mt-[23px] flex flex-wrap items-center justify-between gap-[15px] pt-[21px] border-t border-[#d5d3d4]">
                <span className="text-[17px] font-bold text-[#000d10]">
                  Ask {aiSettings.agentName}® 24/7 Digital Consultant:
                </span>
                <div className="flex flex-wrap gap-[11px]">
                  {[
                    "I'm looking for a Toyota around 4 million",
                    "Recommend a family SUV under 4M",
                    "Can I come see the Harrier tomorrow?",
                    "Do you accept trade-ins?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => openAIWithPrompt(prompt)}
                      className="rounded-full border border-[#000d10] bg-transparent hover:bg-[#000d10] text-[#000d10] hover:text-[#ffffff] px-[21px] py-[11px] text-[17px] font-bold leading-none transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          2. WHITE CANVAS SECTION — RIGHT-ALIGNED SEARCH & LIVE INVENTORY
          ==================================================================== */}
      <section
        id="vehicles-catalog"
        className="bg-[#ffffff] py-[80px] max-w-[1200px] mx-auto px-6 sm:px-8 w-full"
      >
        {/* Right-Aligned Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[38px] mb-[59px]">
          <div className="lg:col-span-5">
            <span className="text-[17px] font-bold text-[#8e8e95] block">
              01 / Live Showroom Inventory
            </span>
          </div>
          <div className="lg:col-span-7">
            <h2 className="hyer-heading-lg text-[#000d10]">
              Precision Selected.
              <br />
              Instantly Available.
            </h2>
            <p className="hyer-body text-[#8e8e95] mt-[22px]">
              Every vehicle in our Nairobi showroom is connected directly to our
              management system. When new stock arrives, it is published here
              immediately; when sold, it is archived automatically.
            </p>
          </div>
        </div>

        {/* Hairline-Ruled Architectural Search Bar (0px radius, #d5d3d4 borders) */}
        <div className="border-t border-b border-[#d5d3d4] py-[31px] mb-[59px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[22px] items-end">
            {/* Make */}
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Make
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("ALL");
                }}
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] font-normal text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">All Makes ({availableMakes.length})</option>
                {availableMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] font-normal text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Model</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Budget (KSh.)
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] font-normal text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Budget</option>
                <option value="UNDER_3M">Under KSh 3.0M</option>
                <option value="2M_4M">KSh 2.0M – 4.2M</option>
                <option value="4M_6M">KSh 4.0M – 6.0M</option>
                <option value="ABOVE_6M">Above KSh 6.0M</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Body Style
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] font-normal text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Body Style</option>
                <option value="SUV">SUV / 4x4</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup">Pickup / Double Cab</option>
              </select>
            </div>

            {/* Pill Filter Reset / Action */}
            <div className="flex items-center gap-[11px]">
              <button
                type="button"
                onClick={resetFilters}
                className="hyer-pill-dark w-full"
              >
                <span>
                  Showing {filteredVehicles.length} of {publicInventory.length}
                </span>
              </button>
            </div>
          </div>

          {/* Pill Category Switcher (1000px radius pills) */}
          <div className="mt-[31px] flex flex-wrap items-center justify-between gap-[16px]">
            <div className="flex flex-wrap items-center gap-[11px]">
              <button
                type="button"
                onClick={() => setCatalogTab("ALL")}
                className={
                  catalogTab === "ALL"
                    ? "hyer-pill-dark"
                    : "hyer-pill-ghost-ink"
                }
              >
                All Vehicles ({publicInventory.length})
              </button>
              <button
                type="button"
                onClick={() => setCatalogTab("NEW_ARRIVALS")}
                className={
                  catalogTab === "NEW_ARRIVALS"
                    ? "hyer-pill-dark"
                    : "hyer-pill-ghost-ink"
                }
              >
                New Arrivals
              </button>
              <button
                type="button"
                onClick={() => setCatalogTab("FEATURED")}
                className={
                  catalogTab === "FEATURED"
                    ? "hyer-pill-dark"
                    : "hyer-pill-ghost-ink"
                }
              >
                Featured Vehicles
              </button>
            </div>

            {(selectedMake !== "ALL" ||
              selectedModel !== "ALL" ||
              selectedBudget !== "ALL" ||
              selectedBodyType !== "ALL" ||
              catalogTab !== "ALL") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[17px] font-bold text-[#000d10] underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Standard White Card Vehicle Grid (0px radius, no shadow, #d5d3d4 hairline above titles) */}
        {filteredVehicles.length === 0 ? (
          <div className="hyer-white-card py-[59px]">
            <h3 className="hyer-heading text-[#000d10]">
              No matching vehicles in current stock.
            </h3>
            <p className="hyer-body text-[#8e8e95] mt-[16px] max-w-[540px]">
              Reset your search parameters or ask {aiSettings.agentName}® to
              locate the closest vehicle in our showroom.
            </p>
            <div className="mt-[31px] flex flex-wrap gap-[13px]">
              <button
                type="button"
                onClick={resetFilters}
                className="hyer-pill-dark"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt("Recommend a vehicle from your current stock")
                }
                className="hyer-pill-ghost-ink"
              >
                Consult AI Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[38px] gap-y-[68px]">
            {filteredVehicles.map((vehicle) => {
              const profile = getVehiclePublicProfile(vehicle);
              return (
                <article
                  key={vehicle.id}
                  className="bg-[#ffffff] flex flex-col justify-between group"
                >
                  <div>
                    {/* Product-Crop Image (0px radius, no shadow) */}
                    <Link
                      href={`/showroom/vehicles/${vehicle.id}`}
                      className="block relative h-[260px] bg-[#f3eee5] overflow-hidden mb-[22px]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-[16px] left-[16px] flex gap-[8px]">
                        <span className="rounded-full bg-[#000d10] text-[#ffffff] px-[15px] py-[8px] text-[14px] font-bold leading-none">
                          {vehicle.year}
                        </span>
                        {profile.isNewArrival && (
                          <span className="rounded-full bg-[#ffffff] text-[#000d10] px-[15px] py-[8px] text-[14px] font-bold leading-none">
                            New Arrival
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* 1px solid #d5d3d4 Hairline Divider Above Title */}
                    <div className="border-t border-[#d5d3d4] pt-[21px]">
                      <div className="flex items-baseline justify-between gap-[11px]">
                        <h3 className="hyer-subheading text-[#000d10]">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <span className="text-[17px] font-bold text-[#000d10]">
                          {formatKSh(vehicle.askingPrice)}
                        </span>
                      </div>

                      <p className="hyer-body text-[#8e8e95] mt-[13px]">
                        {vehicle.variant} · {vehicle.mileage.toLocaleString()}{" "}
                        km · {vehicle.transmission} · {vehicle.fuelType} ·{" "}
                        {profile.engineSize}
                      </p>

                      <p className="text-[17px] font-normal text-[#8e8e95] mt-[8px]">
                        {vehicle.location} &nbsp;·&nbsp; Stock #
                        {vehicle.stockNumber}
                      </p>
                    </div>
                  </div>

                  {/* Pill Buttons (1000px radius) */}
                  <div className="mt-[23px] pt-[17px] border-t border-[#d5d3d4] flex items-center gap-[11px]">
                    <Link
                      href={`/showroom/vehicles/${vehicle.id}`}
                      className="hyer-pill-dark flex-1"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        openAIWithPrompt(
                          `I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it still available?`,
                          vehicle.id
                        )
                      }
                      className="hyer-pill-ghost-ink"
                    >
                      <span>Ask AI</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ====================================================================
          3. THE SINGLE FEATURED CLAY CARD (#bc7155 — One per page, 0px radius)
          ==================================================================== */}
      <section
        id="featured-ai"
        className="max-w-[1200px] mx-auto px-6 sm:px-8 pb-[80px] w-full"
      >
        <div className="hyer-clay-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[38px] items-start">
            <div className="lg:col-span-7">
              <span className="text-[17px] font-bold uppercase tracking-wider text-[#ffffff] block mb-[17px]">
                Featured Solution · 24/7 Digital Sales Consultant
              </span>
              <h2 className="hyer-heading-lg text-[#ffffff]">
                {aiSettings.agentName}® Concierge.
                <br />
                Always On Duty.
              </h2>
              <p className="hyer-body text-[#ffffff] mt-[23px] max-w-[580px]">
                Instead of a generic FAQ bot, {aiSettings.agentName}® searches
                our live dealership database in real time, recommends vehicles
                based on your exact budget and family requirements, captures CRM
                leads automatically, books showroom test drives, and escalates
                pricing negotiations directly to our human sales desk.
              </p>

              <div className="mt-[34px] flex flex-wrap gap-[13px]">
                <button
                  type="button"
                  onClick={() =>
                    openAIWithPrompt(
                      "I need a family car under 4M. What do you recommend?"
                    )
                  }
                  className="hyer-pill-dark"
                >
                  <span>Start AI Vehicle Match</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <Link
                  href="/ai-conversations"
                  className="hyer-pill-ghost-white"
                >
                  <span>Inspect Live AI Conversations</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[#ffffff]/30 pt-[31px] lg:pt-0 lg:pl-[38px] space-y-[21px]">
              <p className="text-[17px] font-bold text-[#ffffff]">
                Click a live scenario to test AI → CRM automation:
              </p>
              <div className="flex flex-col gap-[13px]">
                {[
                  "I'm looking for a Toyota around 3.5 million",
                  "Can I come see the Harrier tomorrow?",
                  "My name is John Kamau, 0722111222. I want the Harrier.",
                  "I'd like to negotiate the price on the Prado",
                ].map((scenario) => (
                  <button
                    key={scenario}
                    type="button"
                    onClick={() => openAIWithPrompt(scenario)}
                    className="hyer-pill-ghost-white justify-between text-left w-full"
                  >
                    <span className="truncate">&ldquo;{scenario}&rdquo;</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. WHITE CANVAS SECTION — RIGHT-ALIGNED 2×2 FEATURE BLOCK GRID
          ==================================================================== */}
      <section
        id="services"
        className="bg-[#ffffff] py-[80px] max-w-[1200px] mx-auto px-6 sm:px-8 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[38px]">
          <div className="lg:col-span-4">
            <span className="text-[17px] font-bold text-[#8e8e95] block">
              02 / Dealership Standards
            </span>
          </div>

          {/* Right-Aligned Content Column with Heading + 2×2 Feature Grid (80px column gap) */}
          <div className="lg:col-span-8">
            <h2 className="hyer-heading-lg text-[#000d10] mb-[59px]">
              Ownership
              <br />
              Without Friction.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[80px] gap-y-[52px]">
              {/* Feature Block 1 */}
              <div className="border-t border-[#d5d3d4] pt-[22px]">
                <h3 className="hyer-subheading text-[#000d10]">
                  Bank & Asset Financing
                </h3>
                <p className="hyer-body text-[#8e8e95] mt-[15px]">
                  {aiSettings.financingInformation}
                </p>
              </div>

              {/* Feature Block 2 */}
              <div className="border-t border-[#d5d3d4] pt-[22px]">
                <h3 className="hyer-subheading text-[#000d10]">
                  QISJ 4.5+ Verified Grade
                </h3>
                <p className="hyer-body text-[#8e8e95] mt-[15px]">
                  Every vehicle undergoes a 150-point mechanical and structural
                  inspection with certified mileage and auction grade 4.0 to 5.0
                  before entering our Nairobi showroom.
                </p>
              </div>

              {/* Feature Block 3 */}
              <div className="border-t border-[#d5d3d4] pt-[22px]">
                <h3 className="hyer-subheading text-[#000d10]">
                  Direct Import Concierge
                </h3>
                <p className="hyer-body text-[#8e8e95] mt-[15px]">
                  Bespoke sourcing from Japan and the United Kingdom delivered
                  to Mombasa and cleared to Nairobi in 35 to 45 days with full
                  duty transparency.
                </p>
              </div>

              {/* Feature Block 4 */}
              <div className="border-t border-[#d5d3d4] pt-[22px]">
                <h3 className="hyer-subheading text-[#000d10]">
                  Same-Day NTSA TIMS
                </h3>
                <p className="hyer-body text-[#8e8e95] mt-[15px]">
                  Digital logbook transfer on the NTSA TIMS portal,
                  comprehensive insurance valuation, and satellite tracker
                  fitting completed prior to showroom release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. FULL-BLEED DARK CONTENT SECTION 1 — MIDNIGHT HULL (#0f0f1c)
             SELL / TRADE-IN ACQUISITION DESK
          ==================================================================== */}
      <section
        id="sell-trade-in"
        className="bg-[#0f0f1c] text-[#ffffff] py-[80px] w-full"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[52px]">
            <div className="lg:col-span-5">
              <span className="text-[17px] font-bold text-[#8e8e95] block">
                03 / Trade-In & Acquisition
              </span>
              <h2 className="hyer-heading text-[#ffffff] mt-[22px]">
                Trade In Your Current Vehicle.
              </h2>
              <p className="hyer-body text-[#8e8e95] mt-[22px]">
                Submit your vehicle details for a 30-minute physical valuation
                at our Ngong Road or Westlands showroom. Apply your vehicle&apos;s
                equity directly toward any car in our inventory.
              </p>
              <div className="mt-[34px]">
                <button
                  type="button"
                  onClick={() =>
                    openAIWithPrompt(
                      "I want to trade in my current car. How does the valuation work?"
                    )
                  }
                  className="hyer-pill-ghost-white"
                >
                  <span>Ask AI About Trade-In</span>
                </button>
              </div>
            </div>

            {/* Right-Aligned ~50% Width Column */}
            <div className="lg:col-span-7 border-t border-[#d5d3d4]/25 pt-[31px]">
              <h3 className="hyer-heading-sm text-[#ffffff] mb-[23px]">
                Start Vehicle Evaluation.
              </h3>

              {tiSubmittedBanner && (
                <div className="mb-[31px] p-[22px] border border-[#ffffff] text-[#ffffff]">
                  <p className="hyer-body">{tiSubmittedBanner}</p>
                  <Link
                    href="/leads"
                    className="inline-block mt-[11px] text-[17px] font-bold underline"
                  >
                    View Acquisition Lead in Dealership CRM →
                  </Link>
                </div>
              )}

              <form onSubmit={handleTradeInSubmit} className="space-y-[23px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[22px]">
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Make
                    </label>
                    <input
                      type="text"
                      required
                      value={tiMake}
                      onChange={(e) => setTiMake(e.target.value)}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Model
                    </label>
                    <input
                      type="text"
                      required
                      value={tiModel}
                      onChange={(e) => setTiModel(e.target.value)}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Year
                    </label>
                    <input
                      type="number"
                      required
                      value={tiYear}
                      onChange={(e) => setTiYear(Number(e.target.value))}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[22px]">
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      required
                      value={tiMileage}
                      onChange={(e) => setTiMileage(Number(e.target.value))}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Condition
                    </label>
                    <select
                      value={tiCondition}
                      onChange={(e) =>
                        setTiCondition(
                          e.target.value as "EXCELLENT" | "GOOD" | "FAIR"
                        )
                      }
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-[#0f0f1c] text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    >
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Expected Price (KSh.)
                    </label>
                    <input
                      type="number"
                      required
                      value={tiExpectedPrice}
                      onChange={(e) =>
                        setTiExpectedPrice(Number(e.target.value))
                      }
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Vehicle to Upgrade Into
                    </label>
                    <select
                      value={tiTargetVehicleId}
                      onChange={(e) => setTiTargetVehicleId(e.target.value)}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-[#0f0f1c] text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    >
                      <option value="">Direct Cash Sale / Undecided</option>
                      {publicInventory.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model} (
                          {formatKSh(v.askingPrice)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={tiLocation}
                      onChange={(e) => setTiLocation(e.target.value)}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Samuel Kariuki"
                      value={tiName}
                      onChange={(e) => setTiName(e.target.value)}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 722 000 111"
                      value={tiPhone}
                      onChange={(e) => setTiPhone(e.target.value)}
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                <div className="pt-[11px]">
                  <button type="submit" className="hyer-pill-ghost-white">
                    <span>Submit Evaluation to CRM</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. FULL-BLEED DARK CONTENT SECTION 2 — CHARCOAL DECK (#151623)
             SUPPORT, DESKS & DIRECT INQUIRY
          ==================================================================== */}
      <section
        id="contact"
        className="bg-[#151623] text-[#ffffff] py-[80px] border-t border-[#d5d3d4]/15 w-full"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[52px]">
            <div className="lg:col-span-5">
              <span className="text-[17px] font-bold text-[#8e8e95] block">
                04 / Global Sourcing & Support
              </span>
              <h2 className="hyer-heading text-[#ffffff] mt-[22px]">
                Personal Advisory.
              </h2>
              <p className="hyer-body text-[#ffffff] mt-[22px]">
                {aiSettings.dealershipInformation}
              </p>

              {/* Language / Regional Desk List with Flag Emoji (Per Hyer Spec) */}
              <div className="mt-[38px] space-y-[16px] border-t border-[#d5d3d4]/20 pt-[23px] text-[18px]">
                <div className="flex items-center justify-between">
                  <span>🇰🇪 &nbsp;Nairobi — Ngong Road HQ</span>
                  <span className="text-[#8e8e95]">+254 700 123 456</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🇰🇪 &nbsp;Nairobi — Westlands Annex</span>
                  <span className="text-[#8e8e95]">Mon–Sat 08:00–18:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🇯🇵 &nbsp;Yokohama — QISJ Inspection Desk</span>
                  <span className="text-[#8e8e95]">Direct Import</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🇬🇧 &nbsp;London — UK Export Desk</span>
                  <span className="text-[#8e8e95]">35–45 Days</span>
                </div>
              </div>
            </div>

            {/* Right-Aligned Column: Direct Inquiry Form */}
            <div className="lg:col-span-7 border-t border-[#d5d3d4]/25 pt-[31px]">
              <h3 className="hyer-heading text-[#ffffff] mb-[16px]">
                Direct Showroom Inquiry.
              </h3>
              <p className="hyer-body text-[#8e8e95] mb-[31px]">
                Logs a high-priority customer record directly in the Vehisoft®
                CRM pipeline.
              </p>

              {contactSubmitted && (
                <div className="mb-[23px] p-[22px] border border-[#ffffff] text-[#ffffff] flex items-center justify-between">
                  <span className="text-[18px]">
                    Inquiry logged in Dealership CRM.
                  </span>
                  <Link href="/leads" className="text-[17px] font-bold underline">
                    View in CRM →
                  </Link>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-[23px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Grace Wambui"
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0722 987 654"
                      className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                    Vehicle of Interest
                  </label>
                  <select
                    value={contactVehicleId}
                    onChange={(e) => setContactVehicleId(e.target.value)}
                    className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-[#151623] text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                  >
                    <option value="">General Showroom Inquiry</option>
                    {publicInventory.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} — {formatKSh(v.askingPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[17px] font-bold text-[#8e8e95] mb-[11px]">
                    Message
                  </label>
                  <textarea
                    rows={2}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Preferred viewing time, financing question, or vehicle request..."
                    className="w-full pb-[11px] border-b border-[#d5d3d4]/40 bg-transparent text-[18px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none rounded-none"
                  />
                </div>

                <div className="pt-[11px]">
                  <button type="submit" className="hyer-pill-ghost-white">
                    <span>Dispatch Inquiry</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. FOOTER TERMINAL — DEEP INK (#000d10) WITH MONUMENTAL WORDMARK
          ==================================================================== */}
      <footer className="bg-[#000d10] text-[#ffffff] pt-[80px] pb-[52px] mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[38px] pb-[68px] border-b border-[#d5d3d4]/20">
            <div className="space-y-[13px]">
              <span className="text-[17px] font-bold text-[#ffffff] block mb-[17px]">
                Showroom
              </span>
              <a
                href="#vehicles-catalog"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                All Vehicles
              </a>
              <a
                href="#vehicles-catalog"
                onClick={() => setCatalogTab("NEW_ARRIVALS")}
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                New Arrivals
              </a>
              <a
                href="#vehicles-catalog"
                onClick={() => setCatalogTab("FEATURED")}
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                Featured Stock
              </a>
            </div>

            <div className="space-y-[13px]">
              <span className="text-[17px] font-bold text-[#ffffff] block mb-[17px]">
                Solutions
              </span>
              <a
                href="#featured-ai"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                {aiSettings.agentName}® AI
              </a>
              <a
                href="#sell-trade-in"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                Trade-In Desk
              </a>
              <a
                href="#services"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                Bank Financing
              </a>
            </div>

            <div className="space-y-[13px]">
              <span className="text-[17px] font-bold text-[#ffffff] block mb-[17px]">
                Dealership OS
              </span>
              <Link
                href="/login"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                Staff Login
              </Link>
              <Link
                href="/dashboard"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                Executive CRM
              </Link>
              <Link
                href="/ai-conversations"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                AI Conversations
              </Link>
              <Link
                href="/ai-settings"
                className="block text-[20px] text-[#8e8e95] hover:text-[#ffffff] transition-colors"
              >
                AI Settings
              </Link>
            </div>

            <div className="space-y-[13px]">
              <span className="text-[17px] font-bold text-[#ffffff] block mb-[17px]">
                Nairobi HQ
              </span>
              <p className="text-[20px] text-[#8e8e95] leading-[29px]">
                Ngong Road & Westlands, Nairobi, Kenya
              </p>
              <p className="text-[17px] text-[#8e8e95]">Currency: KSh.</p>
            </div>
          </div>

          {/* Monumental 187px Display Wordmark in Footer Terminal */}
          <div className="pt-[52px] flex flex-col sm:flex-row sm:items-end justify-between gap-[23px]">
            <div className="hyer-hero-scale text-[#ffffff] select-none">
              Vehisoft
              <sup className="text-[0.25em] font-bold align-super ml-1 tracking-normal">
                ®
              </sup>
            </div>
            <p className="text-[17px] text-[#8e8e95]">
              © {new Date().getFullYear()} Vehisoft® Dealership Management
              System.
            </p>
          </div>
        </div>
      </footer>

      {/* 24/7 AI Sales Consultant Floating & Dockable Widget */}
      <AISalesAgentWidget
        isOpen={aiOpen}
        onOpen={() => setAiOpen(true)}
        onClose={() => setAiOpen(false)}
        focusedVehicleId={aiFocusedVehicleId}
        initialPrompt={aiInitialPrompt}
      />
    </div>
  );
}
