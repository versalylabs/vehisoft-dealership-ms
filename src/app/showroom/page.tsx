"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  Sparkles,
  Search,
  MapPin,
  Gauge,
  Fuel,
  Cog,
  Calendar,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Building2,
  Clock,
  RefreshCw,
  Handshake,
  BadgeDollarSign,
  ChevronDown,
  MessageSquare,
  SlidersHorizontal,
  LayoutDashboard,
  Bot,
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

  // Filter states for "What are you looking for?" search bar
  const [selectedMake, setSelectedMake] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("ALL");
  const [selectedBudget, setSelectedBudget] = useState<string>("ALL");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("ALL");
  const [catalogTab, setCatalogTab] = useState<VehicleCatalogTab>("ALL");
  const [vehiclesMenuOpen, setVehiclesMenuOpen] = useState<boolean>(false);

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

  // Only show AVAILABLE (and RESERVED) vehicles on public website; SOLD vehicles are automatically removed!
  const publicInventory = useMemo(() => {
    return vehicles.filter((v) => v.status === "AVAILABLE");
  }, [vehicles]);

  const soldCount = useMemo(() => {
    return vehicles.filter((v) => v.status === "SOLD").length;
  }, [vehicles]);

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
      )}). Our acquisition specialist James Omondi has been notified!`
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Dealership Sync & Admin Switcher Ribbon */}
      <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Inventory Connected ({publicInventory.length} Available •{" "}
              {soldCount} Sold & Auto-Hidden)
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">
              📍 {aiSettings.location}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/ai-conversations"
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>View AI Conversations in Admin</span>
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-full font-semibold transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Dealership Admin CRM →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Public Dealership Website Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/showroom" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/25">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                VEHISOFT <span className="text-blue-600">MOTORS</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase block mt-1">
                Premier Kenya Showroom • KSh.
              </span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <a
              href="#top"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Home
            </a>

            {/* Vehicles Dropdown (All Vehicles, New Arrivals, Featured Vehicles) */}
            <div
              className="relative"
              onMouseEnter={() => setVehiclesMenuOpen(true)}
              onMouseLeave={() => setVehiclesMenuOpen(false)}
            >
              <a
                href="#vehicles-catalog"
                onClick={() => setVehiclesMenuOpen((v) => !v)}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
              >
                <span>Vehicles</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
              {vehiclesMenuOpen && (
                <div className="absolute left-0 top-full w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <a
                    href="#vehicles-catalog"
                    onClick={() => {
                      setCatalogTab("ALL");
                      setVehiclesMenuOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span>All Vehicles</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                      {publicInventory.length}
                    </span>
                  </a>
                  <a
                    href="#vehicles-catalog"
                    onClick={() => {
                      setCatalogTab("NEW_ARRIVALS");
                      setVehiclesMenuOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span>New Arrivals</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px]">
                      Fresh Import
                    </span>
                  </a>
                  <a
                    href="#vehicles-catalog"
                    onClick={() => {
                      setCatalogTab("FEATURED");
                      setVehiclesMenuOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span>Featured Vehicles</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px]">
                      Top Picks
                    </span>
                  </a>
                </div>
              )}
            </div>

            <a
              href="#about-us"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              About Us
            </a>
            <a
              href="#services"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Services
            </a>
            <a
              href="#sell-trade-in"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Sell / Trade In
            </a>
            <a
              href="#contact"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* AI Assistant CTA Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAIWithPrompt()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>AI Assistant ({aiSettings.agentName})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section
        id="top"
        className="relative bg-slate-900 text-white overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                24/7 AI Digital Sales Consultant • Connected to Live Showroom Stock
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Find Your Next Car{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                With Confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Browse our latest vehicles, compare options and get assistance
              from our AI sales agent anytime. Every vehicle in our Ngong Road
              and Westlands showrooms is QISJ-inspected, mileage-verified, and
              ready for test drive or bank financing.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#vehicles-catalog"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                <Car className="w-4 h-4" />
                <span>Browse Vehicles ({publicInventory.length})</span>
              </a>

              <button
                type="button"
                onClick={() => openAIWithPrompt()}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Talk to an Agent (24/7 AI)</span>
              </button>
            </div>

            {/* Quick interactive AI prompt pills right in the Hero */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 mb-2.5">
                Try asking our AI Sales Consultant right now:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "I'm looking for a Toyota around 4 million",
                  "Recommend a family SUV under 4M",
                  "Can I come see the Harrier tomorrow?",
                  "Do you accept trade-ins?",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => openAIWithPrompt(sample)}
                    className="text-xs bg-slate-800/90 hover:bg-blue-600/30 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-400/50 rounded-full px-3.5 py-1.5 transition-all cursor-pointer"
                  >
                    &ldquo;{sample}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Hero Card: Featured Showroom Highlight */}
          <div className="lg:col-span-5">
            {publicInventory[0] && (
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ★ Showroom Spotlight • Available Now
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Stock #{publicInventory[0].stockNumber}
                  </span>
                </div>
                <div className="relative h-52 rounded-xl overflow-hidden mb-4 bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={publicInventory[0].imageUrl}
                    alt={publicInventory[0].model}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-xs text-slate-300 block">
                      Showroom Price
                    </span>
                    <span className="text-lg font-extrabold text-white">
                      {formatKSh(publicInventory[0].askingPrice)}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {publicInventory[0].year} {publicInventory[0].make}{" "}
                  {publicInventory[0].model} {publicInventory[0].variant}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {publicInventory[0].mileage.toLocaleString()} km •{" "}
                  {publicInventory[0].fuelType} •{" "}
                  {publicInventory[0].transmission} •{" "}
                  {publicInventory[0].location}
                </p>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <Link
                    href={`/showroom/vehicles/${publicInventory[0].id}`}
                    className="py-2.5 px-4 rounded-xl bg-white text-slate-950 font-bold text-xs text-center hover:bg-slate-100 transition-colors"
                  >
                    View Vehicle Details
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      openAIWithPrompt(
                        `Tell me about the ${publicInventory[0].year} ${publicInventory[0].make} ${publicInventory[0].model}`,
                        publicInventory[0].id
                      )
                    }
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-colors cursor-pointer"
                  >
                    Ask AI About This Car
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. VEHICLE SEARCH BAR (Right below the Hero) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 relative z-20 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                What are you looking for?
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Showing{" "}
              <strong className="text-slate-900">
                {filteredVehicles.length}
              </strong>{" "}
              live vehicles from dealership inventory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Make */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Make
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("ALL");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Makes</option>
                {availableMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Budget (KSh.)
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Any Budget</option>
                <option value="UNDER_3M">Under KSh 3M</option>
                <option value="2M_4M">KSh 2M – 4.2M</option>
                <option value="4M_6M">KSh 4M – 6M</option>
                <option value="ABOVE_6M">Above KSh 6M</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Body Type
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Any Body Type</option>
                <option value="SUV">SUV / 4x4</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup">Pickup / Double Cab</option>
              </select>
            </div>

            {/* Search Action */}
            <div className="flex items-end gap-2">
              <a
                href="#vehicles-catalog"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl text-center shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Vehicles</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED & LIVE VEHICLES CATALOG */}
      <section
        id="vehicles-catalog"
        className="max-w-7xl mx-auto px-4 sm:px-8 py-14 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Real-Time Dealership Stock
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore Our Showroom Inventory
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Connected directly to our dealership management system. Newly
              added vehicles appear automatically; sold vehicles are removed
              instantly.
            </p>
          </div>

          {/* Sub-navigation Tabs: All Vehicles | New Arrivals | Featured Vehicles */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setCatalogTab("ALL")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                catalogTab === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Vehicles ({publicInventory.length})
            </button>
            <button
              type="button"
              onClick={() => setCatalogTab("NEW_ARRIVALS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                catalogTab === "NEW_ARRIVALS"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setCatalogTab("FEATURED")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                catalogTab === "FEATURED"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Featured Vehicles
            </button>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              No vehicles match those exact filters
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Reset your search filters or ask our AI Sales Agent to recommend
              the closest match in stock.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedMake("ALL");
                  setSelectedModel("ALL");
                  setSelectedBudget("ALL");
                  setSelectedBodyType("ALL");
                  setCatalogTab("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt("Recommend a vehicle from your current stock")
                }
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Ask AI Sales Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredVehicles.map((vehicle) => {
              const profile = getVehiclePublicProfile(vehicle);
              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col group"
                >
                  {/* Large Vehicle Image */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vehicle.imageUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {profile.isNewArrival && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow">
                          New Arrival
                        </span>
                      )}
                      {profile.isFeatured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-xs">
                        {vehicle.bodyType}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-slate-800 shadow-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        {vehicle.location}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {vehicle.make} {vehicle.model} {vehicle.year}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {vehicle.variant} • {profile.engineSize} •{" "}
                            {profile.drivetrain}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-blue-600">
                          {formatKSh(vehicle.askingPrice)}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          Deposit from {formatKSh(vehicle.askingPrice * 0.2)}
                        </span>
                      </div>

                      {/* Key Specs Grid: Year, Mileage, Transmission, Fuel */}
                      <div className="grid grid-cols-2 gap-2.5 mt-4 p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Year: <strong>{vehicle.year}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            <strong>{vehicle.mileage.toLocaleString()}</strong>{" "}
                            km
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cog className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                      <Link
                        href={`/showroom/vehicles/${vehicle.id}`}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          openAIWithPrompt(
                            `I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it still available?`,
                            vehicle.id
                          )
                        }
                        className="py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Ask AI Sales Consultant about this vehicle"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. AI SALES AGENT CALLOUT BANNER */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
              <Bot className="w-4 h-4" />
              <span>Meet {aiSettings.agentName} — Your 24/7 Digital Salesperson</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Not sure which vehicle fits your budget or lifestyle?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Our AI Sales Consultant searches our actual dealership inventory in
              real time, answers vehicle specification questions, books viewing
              appointments, and connects directly with our sales team on both
              Website and WhatsApp.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                openAIWithPrompt("I need a family car under 4M. What do you recommend?")
              }
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Vehicle Recommendation</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. SELL / TRADE-IN YOUR CAR SECTION */}
      <section
        id="sell-trade-in"
        className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full"
      >
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Instant Acquisition & Trade-In Desk</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Want to Sell or Trade In Your Vehicle?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Submit your vehicle details below for a fast valuation. You can
                trade in your current car to top up for any vehicle in our
                showroom or sell it directly to us for cash.
              </p>

              <ul className="space-y-3 pt-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30-minute physical valuation at Ngong Road or Westlands</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Use your car&apos;s value as your deposit for bank finance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatically logs an Acquisition Lead in our CRM</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt(
                    "I want to trade in my current car. How does the valuation work?"
                  )
                }
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Ask AI About Trade-In Valuation</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 sm:p-10">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Start Vehicle Evaluation
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in your vehicle&apos;s details and expected price in KSh. Our
              acquisition team will receive your lead immediately.
            </p>

            {tiSubmittedBanner && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">{tiSubmittedBanner}</p>
                  <Link
                    href="/leads"
                    className="inline-block mt-1 text-emerald-700 font-bold underline"
                  >
                    View this Trade-In Lead in Dealership CRM →
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleTradeInSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    required
                    value={tiMake}
                    onChange={(e) => setTiMake(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={tiModel}
                    onChange={(e) => setTiModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={tiYear}
                    onChange={(e) => setTiYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={tiMileage}
                    onChange={(e) => setTiMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={tiCondition}
                    onChange={(e) =>
                      setTiCondition(
                        e.target.value as "EXCELLENT" | "GOOD" | "FAIR"
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="EXCELLENT">Excellent (Accident-Free)</option>
                    <option value="GOOD">Good (Well Maintained)</option>
                    <option value="FAIR">Fair (Needs Minor Work)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Price (KSh.)
                  </label>
                  <input
                    type="number"
                    required
                    value={tiExpectedPrice}
                    onChange={(e) => setTiExpectedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={tiLocation}
                    onChange={(e) => setTiLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle to Trade Into (Optional)
                  </label>
                  <select
                    value={tiTargetVehicleId}
                    onChange={(e) => setTiTargetVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="">Direct Cash Sale / Undecided</option>
                    {publicInventory.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({formatKSh(v.askingPrice)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Kariuki"
                    value={tiName}
                    onChange={(e) => setTiName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +254 722 000 111"
                    value={tiPhone}
                    onChange={(e) => setTiPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
              >
                Submit Evaluation & Create Acquisition Lead
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. SERVICES & ABOUT US SECTION */}
      <section
        id="services"
        className="bg-white border-y border-slate-200 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Dealership Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Complete Ownership & Financing Support
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {aiSettings.businessDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                <BadgeDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Bank & Asset Financing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiSettings.financingInformation}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                QISJ Verified & Direct Import
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every vehicle is inspected for genuine mileage, structural
                integrity, and clean auction grade (4.0 / 4.5 / 5.0). We also
                handle direct imports from Japan and the UK in 35–45 days.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Same-Day NTSA TIMS & Insurance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless logbook transfer on the NTSA TIMS portal, comprehensive
                insurance valuation, and tracker installation arranged before you
                drive out of our showroom.
              </p>
            </div>
          </div>

          {/* About Us Anchor Block */}
          <div
            id="about-us"
            className="mt-12 p-8 rounded-2xl bg-slate-900 text-white grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-8 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                About Vehisoft Motors Kenya
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold">
                A Modern Dealership Powered by Live Inventory & 24/7 AI
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {aiSettings.dealershipInformation}
              </p>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-2xl font-extrabold text-blue-400 block">
                  100%
                </span>
                <span className="text-[11px] text-slate-300">
                  Verified Mileage
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-2xl font-extrabold text-emerald-400 block">
                  24/7
                </span>
                <span className="text-[11px] text-slate-300">
                  AI Sales Consultant
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & SHOWROOM VISIT SECTION */}
      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Visit Our Showrooms
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Get in Touch With Our Sales Team
            </h2>
            <p className="text-sm text-slate-600">
              Send an inquiry directly to our CRM or chat with{" "}
              <strong>{aiSettings.agentName}</strong> for instant assistance.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800">
                    Showroom Locations
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {aiSettings.location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800">
                    Opening Hours
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {aiSettings.openingHours}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800">
                    Direct Sales Desk & WhatsApp
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    +254 700 123 456 • sales@vehisoft.co.ke
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Send a Direct Showroom Inquiry
            </h3>
            {contactSubmitted && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
                <span>
                  ✓ Inquiry received! A lead has been created in our Dealership
                  CRM.
                </span>
                <Link href="/leads" className="underline font-bold">
                  View in CRM →
                </Link>
              </div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Grace Wambui"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 0722 987 654"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle of Interest
                </label>
                <select
                  value={contactVehicleId}
                  onChange={(e) => setContactVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="">General Inquiry</option>
                  {publicInventory.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model} — {formatKSh(v.askingPrice)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Ask about availability, bank financing, or viewing times..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Send Inquiry to Sales Team
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-white">Vehisoft Motors Kenya</span>{" "}
            — Powered by Vehisoft Dealership Management System &{" "}
            {aiSettings.agentName} AI.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">
              Staff Dashboard
            </Link>
            <Link href="/ai-conversations" className="hover:text-white">
              AI Conversations
            </Link>
            <Link href="/ai-settings" className="hover:text-white">
              AI Agent Settings
            </Link>
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
