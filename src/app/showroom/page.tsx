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
  Award,
  Compass,
  Zap,
  Star,
  ChevronRight,
  Lock,
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

  // Interactive Hero Spotlight Vehicle Index
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

  // Only show AVAILABLE vehicles on public website; SOLD vehicles are automatically removed!
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
    <div className="min-h-screen luxury-obsidian-bg text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Executive Telemetry & Live CRM Sync Ribbon */}
      <div className="bg-[#04060a]/90 border-b border-white/10 text-slate-400 text-[11px] px-4 sm:px-8 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
              LIVE SHOWROOM INVENTORY ({publicInventory.length} AVAILABLE •{" "}
              {soldCount} SOLD & AUTO-ARCHIVED)
            </span>
            <span className="hidden md:inline text-white/15">|</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {aiSettings.location}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/ai-conversations"
              className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Sales Logs</span>
            </Link>
            <span className="text-white/15">•</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white px-3 py-1 rounded-full font-semibold transition-all"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Staff & Admin CRM →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Executive Liquid-Glass Navigation Bar */}
      <header className="sticky top-3 z-40 px-4 sm:px-8 mt-3">
        <div className="max-w-7xl mx-auto luxury-glass-nav rounded-2xl px-4 sm:px-7 h-20 flex items-center justify-between gap-4">
          {/* Bespoke Luxury Dealership Crest */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-[1px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#070a12] rounded-[11px] flex items-center justify-center">
                <Car className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-white block leading-none">
                VEHISOFT{" "}
                <span className="luxury-gold-text font-black">EXECUTIVE</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase block mt-1">
                Nairobi Luxury Showroom • KSh
              </span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <a
              href="#top"
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              Showroom
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
                className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all inline-flex items-center gap-1.5"
              >
                <span>Collection</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              </a>
              {vehiclesMenuOpen && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50">
                  <div className="luxury-glass-nav rounded-2xl p-2 shadow-2xl border border-white/15">
                    <a
                      href="#vehicles-catalog"
                      onClick={() => {
                        setCatalogTab("ALL");
                        setVehiclesMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-amber-300 transition-colors"
                    >
                      <span>All Available Vehicles</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold">
                        {publicInventory.length}
                      </span>
                    </a>
                    <a
                      href="#vehicles-catalog"
                      onClick={() => {
                        setCatalogTab("NEW_ARRIVALS");
                        setVehiclesMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-amber-300 transition-colors"
                    >
                      <span>New Showroom Arrivals</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Fresh Import
                      </span>
                    </a>
                    <a
                      href="#vehicles-catalog"
                      onClick={() => {
                        setCatalogTab("FEATURED");
                        setVehiclesMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-amber-300 transition-colors"
                    >
                      <span>Featured Flagship Stock</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        Curated
                      </span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#ai-concierge"
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              AI Concierge
            </a>
            <a
              href="#sell-trade-in"
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              Sell / Trade-In
            </a>
            <a
              href="#services"
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              Services
            </a>
            <a
              href="#about-us"
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              Heritage
            </a>
            <a
              href="#contact"
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              Contact
            </a>
          </nav>

          {/* AI Assistant CTA Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openAIWithPrompt()}
              className="inline-flex items-center gap-2 luxury-gold-btn px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{aiSettings.agentName} AI Concierge</span>
              <span className="w-2 h-2 rounded-full bg-emerald-900 animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. CINEMATIC EXECUTIVE HERO SECTION */}
      <section id="top" className="relative overflow-hidden pt-8 pb-20 lg:py-20">
        {/* Ambient Luxury Glow Orbs */}
        <div className="pointer-events-none absolute -top-28 left-1/4 w-[550px] h-[550px] rounded-full bg-amber-500/15 blur-[140px]" />
        <div className="pointer-events-none absolute top-16 right-10 w-[500px] h-[500px] rounded-full bg-sky-500/12 blur-[140px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline + AI Prompt Pills + Telemetry */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                24/7 AI DIGITAL SALES CONSULTANT • LIVE SHOWROOM TELEMETRY
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight text-white leading-[1.06]">
              Find Your Next Car{" "}
              <span className="luxury-gold-text block mt-1">
                With Confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              Experience East Africa&apos;s premier digital showroom. Browse our
              live QISJ-verified collection, structure tailored bank financing,
              or let <strong className="text-white">{aiSettings.agentName}</strong>{" "}
              — our 24/7 AI Sales Consultant — match you with the ideal vehicle
              and book your private test drive.
            </p>

            {/* Primary Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#vehicles-catalog"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-xl luxury-gold-btn font-black text-sm tracking-wide"
              >
                <Car className="w-4 h-4" />
                <span>Explore Collection ({publicInventory.length} Live)</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => openAIWithPrompt()}
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl luxury-glass-card text-white hover:text-amber-300 font-bold text-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Talk to AI Sales Agent (24/7)</span>
              </button>
            </div>

            {/* Interactive AI Concierge Quick Prompts */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instant AI Consultation — Click a prompt to test live inventory search:
                </p>
              </div>
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
                    className="text-xs bg-white/[0.04] hover:bg-amber-500/15 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 rounded-full px-4 py-2 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>&ldquo;{sample}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Executive Trust Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              {[
                {
                  value: "Grade 4.5+",
                  label: "QISJ / JEVIC Certified",
                },
                {
                  value: "From 20%",
                  label: "Bank Finance Deposit",
                },
                {
                  value: "24/7 Live",
                  label: "AI Sales Concierge",
                },
                {
                  value: "Same-Day",
                  label: "NTSA TIMS Transfer",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <span className="text-sm sm:text-base font-black text-amber-400 block">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Multi-Vehicle Flagship Spotlight Card */}
          <div className="lg:col-span-5">
            {activeSpotlight && (
              <div className="luxury-glass-card rounded-3xl p-5 sm:p-6 relative">
                {/* Top Header & Spotlight Selector Pills */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                    <span>Showroom Flagship Spotlight</span>
                  </div>

                  {/* Interactive 01 / 02 / 03 / 04 Vehicle Switcher */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    {spotlightVehicles.map((v, idx) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSpotlightIdx(idx)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                          spotlightIdx === idx
                            ? "bg-amber-400 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title={`${v.year} ${v.make} ${v.model}`}
                      >
                        0{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Spotlight Image */}
                <div className="relative h-60 sm:h-64 rounded-2xl overflow-hidden mb-5 bg-slate-950 border border-white/10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSpotlight.imageUrl}
                    alt={`${activeSpotlight.year} ${activeSpotlight.make} ${activeSpotlight.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-transparent to-black/30" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/75 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                      Stock #{activeSpotlight.stockNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/75 text-white border border-white/15 backdrop-blur-md">
                      {activeSpotlight.bodyType}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                        Executive Showroom Price
                      </span>
                      <span className="text-2xl font-black text-white">
                        {formatKSh(activeSpotlight.askingPrice)}
                      </span>
                    </div>
                    <div className="text-right bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                      <span className="text-[10px] text-slate-400 block">
                        Est. 48-Mo Bank Finance
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        {formatKSh(
                          Math.round(
                            (activeSpotlight.askingPrice * 0.8 * 1.24) / 48
                          )
                        )}
                        /mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Title & Telemetry Grid */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {activeSpotlight.year} {activeSpotlight.make}{" "}
                      {activeSpotlight.model}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {activeSpotlight.variant} • Located at{" "}
                      <span className="text-slate-200">
                        {activeSpotlight.location}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4 p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Mileage
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {activeSpotlight.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Transmission
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {activeSpotlight.transmission}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Powertrain
                    </span>
                    <span className="text-xs font-extrabold text-amber-300">
                      {activeSpotlight.fuelType}
                    </span>
                  </div>
                </div>

                {/* Spotlight Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/showroom/vehicles/${activeSpotlight.id}`}
                    className="py-3 px-4 rounded-xl luxury-gold-btn font-extrabold text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Vehicle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      openAIWithPrompt(
                        `Tell me about the ${activeSpotlight.year} ${activeSpotlight.make} ${activeSpotlight.model}`,
                        activeSpotlight.id
                      )
                    }
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ask AI Concierge</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. FLOATING COMMAND-CENTER VEHICLE SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-20 w-full">
        <div className="luxury-glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  What are you looking for?
                </h2>
                <p className="text-xs text-slate-400">
                  Filter our live Nairobi showroom inventory by make, model,
                  budget, or body style
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                Matching Stock:{" "}
                <strong className="text-amber-400 font-black">
                  {filteredVehicles.length}
                </strong>{" "}
                of {publicInventory.length} Vehicles
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Make */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Make / Marque
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("ALL");
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-white/15 text-sm font-semibold bg-[#0b101b] text-white focus:border-amber-400 focus:outline-none"
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
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Model Series
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-white/15 text-sm font-semibold bg-[#0b101b] text-white focus:border-amber-400 focus:outline-none"
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
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Budget Range (KSh.)
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-white/15 text-sm font-semibold bg-[#0b101b] text-white focus:border-amber-400 focus:outline-none"
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
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Body Style
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-white/15 text-sm font-semibold bg-[#0b101b] text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="ALL">Any Body Type</option>
                <option value="SUV">Executive SUV / 4x4</option>
                <option value="Sedan">Luxury Sedan</option>
                <option value="Hatchback">Compact / Hatchback</option>
                <option value="Pickup">Double Cab / Pickup</option>
              </select>
            </div>

            {/* Search Action */}
            <div className="flex items-end gap-2">
              <a
                href="#vehicles-catalog"
                className="w-full py-3 px-4 luxury-gold-btn font-extrabold text-sm rounded-xl text-center flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Vehicles</span>
              </a>
            </div>
          </div>

          {/* Quick Lifestyle Filter Pills */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Quick Filters:
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedMake === "ALL" &&
                  selectedBodyType === "ALL" &&
                  selectedBudget === "ALL" &&
                  catalogTab === "ALL"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                All Stock ({publicInventory.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setSelectedBodyType("SUV");
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedBodyType === "SUV"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                4x4 & Executive SUVs
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setSelectedMake("Toyota");
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedMake === "Toyota"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Toyota Collection
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setSelectedBudget("2M_4M");
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedBudget === "2M_4M"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Budget KSh 2M – 4.2M
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setCatalogTab("NEW_ARRIVALS");
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  catalogTab === "NEW_ARRIVALS"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Fresh Japan/UK Imports
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
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Clear Active Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. FEATURED & LIVE VEHICLES CATALOG */}
      <section
        id="vehicles-catalog"
        className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              <Compass className="w-4 h-4" />
              <span>Real-Time Dealership Collection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1.5 tracking-tight">
              Curated Showroom Inventory
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
              Synchronized directly with our Dealership Management System. When
              staff adds a vehicle, it appears here automatically; when marked
              Sold, it is removed immediately.
            </p>
          </div>

          {/* Sub-navigation Tabs: All Vehicles | New Arrivals | Featured Vehicles */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 p-1.5 rounded-2xl self-start">
            <button
              type="button"
              onClick={() => setCatalogTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                catalogTab === "ALL"
                  ? "luxury-gold-btn"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All Vehicles ({publicInventory.length})
            </button>
            <button
              type="button"
              onClick={() => setCatalogTab("NEW_ARRIVALS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                catalogTab === "NEW_ARRIVALS"
                  ? "luxury-gold-btn"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setCatalogTab("FEATURED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                catalogTab === "FEATURED"
                  ? "luxury-gold-btn"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Featured Collection
            </button>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="luxury-glass-card rounded-3xl p-12 text-center">
            <SlidersHorizontal className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">
              No vehicles match those exact filter criteria
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
              Reset your search filters or ask{" "}
              <strong className="text-white">{aiSettings.agentName}</strong> to
              recommend the closest available alternative in our showroom.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt("Recommend a vehicle from your current stock")
                }
                className="px-5 py-2.5 rounded-xl luxury-gold-btn text-xs font-extrabold cursor-pointer"
              >
                Ask AI Sales Concierge
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
                  className="luxury-glass-card rounded-3xl overflow-hidden flex flex-col group"
                >
                  {/* Large Vehicle Image */}
                  <div className="relative h-60 bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vehicle.imageUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080b13] via-transparent to-black/30" />

                    <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                      {profile.isNewArrival && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-slate-950 shadow-lg">
                          New Arrival
                        </span>
                      )}
                      {profile.isFeatured && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-lg">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/75 text-slate-200 border border-white/15 backdrop-blur-md">
                        {vehicle.bodyType}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/75 text-slate-200 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {vehicle.location}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded border border-white/10">
                        #{vehicle.stockNumber}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {vehicle.variant} • {profile.engineSize} •{" "}
                            {profile.drivetrain}
                          </p>
                        </div>
                      </div>

                      {/* Price & Deposit */}
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Showroom Price
                          </span>
                          <span className="text-2xl font-black luxury-gold-text">
                            {formatKSh(vehicle.askingPrice)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">
                            20% Finance Deposit
                          </span>
                          <span className="text-xs text-emerald-400 font-extrabold">
                            {formatKSh(vehicle.askingPrice * 0.2)}
                          </span>
                        </div>
                      </div>

                      {/* Key Specs Grid: Year, Mileage, Transmission, Fuel */}
                      <div className="grid grid-cols-2 gap-2.5 mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            Year: <strong className="text-white">{vehicle.year}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gauge className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            <strong className="text-white">
                              {vehicle.mileage.toLocaleString()}
                            </strong>{" "}
                            km
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cog className="w-3.5 h-3.5 text-amber-400" />
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-3.5 h-3.5 text-amber-400" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2.5">
                      <Link
                        href={`/showroom/vehicles/${vehicle.id}`}
                        className="flex-1 py-3 px-4 rounded-xl luxury-gold-btn font-extrabold text-xs text-center flex items-center justify-center gap-1.5"
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
                        className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Ask AI Sales Consultant about this vehicle"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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

      {/* 4. INTERACTIVE 24/7 AI DIGITAL SALES CONCIERGE SHOWCASE */}
      <section id="ai-concierge" className="py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="luxury-glass-card rounded-3xl p-8 sm:p-12 border border-amber-400/25 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>
                    Meet {aiSettings.agentName} — Your 24/7 Digital Vehicle Sales
                    Consultant
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  More Than a Chatbot.{" "}
                  <span className="luxury-gold-text">
                    A Live Digital Salesperson.
                  </span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {aiSettings.agentName} has direct read/write access to our live
                  showroom inventory, vehicle specifications, bank financing
                  structures, and test-drive calendar — capturing qualified CRM
                  leads and handing off price negotiations to human specialists
                  automatically.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      title: "Live Inventory Search",
                      desc: "Filters real stock by budget, body type & fuel in milliseconds",
                    },
                    {
                      title: "Automatic CRM Lead Capture",
                      desc: "Logs buyer contact details directly into our Sales Pipeline",
                    },
                    {
                      title: "Instant Test-Drive Booking",
                      desc: "Schedules 10:00 AM, 1:00 PM & 3:30 PM showroom viewings",
                    },
                    {
                      title: "Smart Human Handoff",
                      desc: "Escalates price negotiations to senior sales executives",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/10"
                    >
                      <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-6">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      openAIWithPrompt(
                        "I need a family car under 4M. What do you recommend?"
                      )
                    }
                    className="px-6 py-3.5 rounded-xl luxury-gold-btn font-extrabold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Interactive AI Recommendation</span>
                  </button>
                  <Link
                    href="/ai-conversations"
                    className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <span>Inspect AI Logs in Admin CRM</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Interactive Live Scenario Triggers */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
                    Click Any Scenario to Test Live AI → CRM Flow
                  </span>

                  {[
                    {
                      badge: "Inventory Match",
                      prompt: "I'm looking for a Toyota around 3.5 million",
                      desc: "Searches live Toyota SUVs & Sedans and recommends top matches",
                    },
                    {
                      badge: "Test Drive Booking",
                      prompt: "Can I come see the Harrier tomorrow?",
                      desc: "Offers viewing slots (10 AM, 1 PM, 3:30 PM) & books in CRM",
                    },
                    {
                      badge: "Lead Capture",
                      prompt:
                        "My name is John Kamau, 0722111222. I'm interested in the Harrier.",
                      desc: "Automatically creates Customer + Hot Lead in Dealership CRM",
                    },
                    {
                      badge: "Human Handoff",
                      prompt: "I'd like to negotiate the price on the Prado",
                      desc: "Triggers AI → Human Salesperson escalation in Negotiation stage",
                    },
                  ].map((sc) => (
                    <button
                      key={sc.badge}
                      type="button"
                      onClick={() => openAIWithPrompt(sc.prompt)}
                      className="w-full text-left p-3.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                          {sc.badge}
                        </span>
                        <span className="text-[11px] text-slate-400 group-hover:text-amber-300 font-semibold flex items-center gap-1">
                          Run Live <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1.5">
                        &ldquo;{sc.prompt}&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sc.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SELL / TRADE-IN YOUR CAR SECTION */}
      <section
        id="sell-trade-in"
        className="max-w-7xl mx-auto px-4 sm:px-8 py-14 w-full"
      >
        <div className="luxury-glass-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0b1120] via-[#070a12] to-[#0f172a] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Executive Acquisition & Trade-In Desk</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Want to Sell or Trade In Your Vehicle?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Upgrade effortlessly. Submit your current vehicle&apos;s details
                for a same-day physical valuation and apply its full value as
                your trade-in deposit toward any showroom car.
              </p>

              <ul className="space-y-3 pt-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    30-minute appraisal at Ngong Road HQ or Westlands Annex
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Use your current car&apos;s equity as your bank finance
                    deposit
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Instantly dispatches an Acquisition Lead into our Dealership
                    CRM
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt(
                    "I want to trade in my current car. How does the valuation work?"
                  )
                }
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask AI Concierge About Trade-In Valuation</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 sm:p-10">
            <h3 className="text-xl font-black text-white mb-1">
              Start Vehicle Valuation
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your vehicle particulars and expected value in KSh. Our
              acquisition desk will receive your file immediately.
            </p>

            {tiSubmittedBanner && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">{tiSubmittedBanner}</p>
                  <Link
                    href="/leads"
                    className="inline-block mt-1 text-amber-300 font-bold underline"
                  >
                    View this Trade-In Lead in Dealership CRM →
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleTradeInSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    required
                    value={tiMake}
                    onChange={(e) => setTiMake(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={tiModel}
                    onChange={(e) => setTiModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={tiYear}
                    onChange={(e) => setTiYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={tiMileage}
                    onChange={(e) => setTiMileage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Condition
                  </label>
                  <select
                    value={tiCondition}
                    onChange={(e) =>
                      setTiCondition(
                        e.target.value as "EXCELLENT" | "GOOD" | "FAIR"
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="EXCELLENT">Excellent (Accident-Free)</option>
                    <option value="GOOD">Good (Well Maintained)</option>
                    <option value="FAIR">Fair (Needs Minor Work)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Expected Price (KSh.)
                  </label>
                  <input
                    type="number"
                    required
                    value={tiExpectedPrice}
                    onChange={(e) => setTiExpectedPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={tiLocation}
                    onChange={(e) => setTiLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Vehicle to Upgrade Into (Optional)
                  </label>
                  <select
                    value={tiTargetVehicleId}
                    onChange={(e) => setTiTargetVehicleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Kariuki"
                    value={tiName}
                    onChange={(e) => setTiName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +254 722 000 111"
                    value={tiPhone}
                    onChange={(e) => setTiPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl luxury-gold-btn font-extrabold text-sm cursor-pointer"
              >
                Submit Valuation & Create CRM Acquisition Lead
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. EXECUTIVE DEALERSHIP SERVICES & HERITAGE SECTION */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              White-Glove Ownership Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1.5">
              Bespoke Financing & Quality Assurance
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              {aiSettings.businessDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl luxury-glass-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                <BadgeDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Tailored Bank & Asset Finance
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {aiSettings.financingInformation}
              </p>
            </div>

            <div className="p-7 rounded-3xl luxury-glass-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                QISJ Verified & Direct Imports
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every vehicle undergoes a 150-point mechanical and structural
                inspection with verified auction grade (4.0 / 4.5 / 5.0). Direct
                bespoke imports from Japan and the UK delivered in 35–45 days.
              </p>
            </div>

            <div className="p-7 rounded-3xl luxury-glass-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Same-Day NTSA TIMS & Insurance
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Seamless logbook transfer on the NTSA TIMS portal, comprehensive
                insurance valuation, and satellite tracker installation completed
                before showroom handover.
              </p>
            </div>
          </div>

          {/* About Us Anchor Block */}
          <div
            id="about-us"
            className="mt-12 p-8 sm:p-10 rounded-3xl luxury-glass-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-8 space-y-2.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                <Award className="w-4 h-4" />
                <span>About Vehisoft Executive Motors Kenya</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Where Automotive Prestige Meets 24/7 AI Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {aiSettings.dealershipInformation}
              </p>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-3xl font-black luxury-gold-text block">
                  100%
                </span>
                <span className="text-xs text-slate-300 mt-1 block">
                  QISJ Verified Mileage
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-3xl font-black text-emerald-400 block">
                  24/7
                </span>
                <span className="text-xs text-slate-300 mt-1 block">
                  AI Digital Concierge
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRIVATE VIEWING & CONTACT SECTION */}
      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Private Showroom Appointments
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Speak With Our Executive Sales Desk
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Schedule a private viewing at our Ngong Road or Westlands
              showroom, or chat with{" "}
              <strong className="text-amber-300">{aiSettings.agentName}</strong>{" "}
              for immediate assistance.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Showroom Locations
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {aiSettings.location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Showroom Hours
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {aiSettings.openingHours}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Direct Concierge & WhatsApp
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    +254 700 123 456 • concierge@vehisoft.co.ke
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 luxury-glass-card rounded-3xl p-7 sm:p-9">
            <h3 className="text-xl font-black text-white mb-1">
              Send a Direct Showroom Inquiry
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Directly creates a prioritized customer lead inside our Dealership
              CRM.
            </p>
            {contactSubmitted && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 font-semibold flex items-center justify-between">
                <span>
                  ✓ Inquiry logged! Your request has been assigned to our sales
                  team in the CRM.
                </span>
                <Link
                  href="/leads"
                  className="underline font-bold text-amber-300"
                >
                  View in CRM →
                </Link>
              </div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Grace Wambui"
                    className="w-full px-3.5 py-3 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 0722 987 654"
                    className="w-full px-3.5 py-3 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Vehicle of Interest
                </label>
                <select
                  value={contactVehicleId}
                  onChange={(e) => setContactVehicleId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Inquiry Message
                </label>
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Ask about availability, bank financing, or private viewing times..."
                  className="w-full px-3.5 py-3 rounded-xl border border-white/15 bg-[#0b101b] text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl luxury-gold-btn font-extrabold text-sm cursor-pointer"
              >
                Dispatch Inquiry to Executive Sales Desk
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-[#030508] text-slate-400 py-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white">
                VEHISOFT EXECUTIVE MOTORS KENYA
              </span>{" "}
              — Powered by Vehisoft Dealership Management System &{" "}
              <span className="text-amber-300 font-semibold">
                {aiSettings.agentName} 24/7 AI
              </span>
              .
            </div>
          </div>
          <div className="flex items-center gap-5 font-semibold">
            <Link
              href="/login"
              className="text-amber-300 hover:text-amber-200 transition-colors"
            >
              Staff Login Portal
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-white transition-colors"
            >
              Executive Dashboard
            </Link>
            <Link
              href="/ai-conversations"
              className="hover:text-white transition-colors"
            >
              AI Conversations
            </Link>
            <Link
              href="/ai-settings"
              className="hover:text-white transition-colors"
            >
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
