"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  Car,
  Compass,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { getVehiclePublicProfile } from "@/lib/ai-sales-agent";
import { AISalesAgentWidget } from "@/components/showroom/AISalesAgentWidget";
import { formatKSh } from "@/lib/format";
import { VehisoftIcon } from "@/components/brand/VehisoftLogo";

type VehicleCatalogTab = "ALL" | "NEW_ARRIVALS" | "FEATURED";

export default function PublicDealershipShowroomPage() {
  const {
    vehicles,
    aiSettings,
    addCustomer,
    addLead,
    addTradeInRequest,
  } = useDealership();
  const { isAuthenticated } = useAuth();

  // Filter states
  const [selectedMake, setSelectedMake] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("ALL");
  const [selectedBudget, setSelectedBudget] = useState<string>("ALL");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("ALL");
  const [catalogTab, setCatalogTab] = useState<VehicleCatalogTab>("ALL");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Hero showcase vehicle selector
  const [spotlightIdx, setSpotlightIdx] = useState<number>(0);

  // Origin Hero Natural Language Prompt Input
  const [heroPromptInput, setHeroPromptInput] = useState<string>("");

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
  const [tiModel, setTiModel] = useState("Harrier");
  const [tiYear, setTiYear] = useState(2018);
  const [tiMileage, setTiMileage] = useState(62000);
  const [tiCondition, setTiCondition] = useState<"EXCELLENT" | "GOOD" | "FAIR">(
    "GOOD"
  );
  const [tiLocation, setTiLocation] = useState("Nairobi");
  const [tiExpectedPrice, setTiExpectedPrice] = useState(3200000);
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

  // Smooth scroll helper
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    setMobileNavOpen(false);
    const target = document.getElementById(sectionId);
    if (!target) return;

    const startY = window.scrollY;
    const rect = target.getBoundingClientRect();
    const targetY = Math.max(0, startY + rect.top - 24);
    const distance = targetY - startY;
    const duration = 750;
    let startTime: number | null = null;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Only Available and In Transit vehicles are showcased on the public website
  const publicInventory = useMemo(() => {
    return vehicles.filter(
      (v) => v.status === "AVAILABLE" || v.status === "IN_TRANSIT"
    );
  }, [vehicles]);

  const soldCount = useMemo(() => {
    return vehicles.filter((v) => v.status === "SOLD").length;
  }, [vehicles]);

  const availableMakes = useMemo(() => {
    const set = new Set<string>();
    publicInventory.forEach((v) => set.add(v.make));
    return Array.from(set).sort();
  }, [publicInventory]);

  const availableModels = useMemo(() => {
    const set = new Set<string>();
    publicInventory
      .filter((v) => selectedMake === "ALL" || v.make === selectedMake)
      .forEach((v) => set.add(v.model));
    return Array.from(set).sort();
  }, [publicInventory, selectedMake]);

  // Spotlight vehicles
  const spotlightVehicles = useMemo(() => {
    const curated = (aiSettings?.spotlightVehicleIds || [])
      .map((id) => publicInventory.find((v) => v.id === id))
      .filter((v): v is NonNullable<typeof v> => Boolean(v));

    if (curated.length > 0) return curated;
    return publicInventory.slice(0, 4);
  }, [publicInventory, aiSettings?.spotlightVehicleIds]);

  const safeSpotlightIdx =
    spotlightVehicles.length === 0
      ? 0
      : Math.min(spotlightIdx, spotlightVehicles.length - 1);
  const activeSpotlight = spotlightVehicles[safeSpotlightIdx];

  const handlePrevSpotlight = () => {
    if (spotlightVehicles.length === 0) return;
    setSpotlightIdx((curr) =>
      curr === 0 ? spotlightVehicles.length - 1 : curr - 1
    );
  };

  const handleNextSpotlight = () => {
    if (spotlightVehicles.length === 0) return;
    setSpotlightIdx((curr) =>
      curr === spotlightVehicles.length - 1 ? 0 : curr + 1
    );
  };

  const isVehicleNewArrival = (vehicleId: string) => {
    if ((aiSettings?.newArrivalVehicleIds || []).includes(vehicleId)) return true;
    const v = publicInventory.find((item) => item.id === vehicleId);
    if (!v) return false;
    const diffDays =
      (Date.now() - new Date(v.dateAcquired).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 21;
  };

  const isVehicleFeatured = (vehicleId: string, askingPrice: number) => {
    if ((aiSettings?.featuredVehicleIds || []).includes(vehicleId)) return true;
    return askingPrice >= 6500000;
  };

  const filteredVehicles = useMemo(() => {
    return publicInventory.filter((v) => {
      if (catalogTab === "NEW_ARRIVALS" && !isVehicleNewArrival(v.id)) {
        return false;
      }
      if (
        catalogTab === "FEATURED" &&
        !isVehicleFeatured(v.id, v.askingPrice)
      ) {
        return false;
      }

      if (selectedMake !== "ALL" && v.make !== selectedMake) return false;
      if (selectedModel !== "ALL" && v.model !== selectedModel) return false;
      if (selectedBodyType !== "ALL" && v.bodyType !== selectedBodyType) {
        return false;
      }

      if (selectedBudget === "UNDER_3M" && v.askingPrice > 3000000)
        return false;
      if (
        selectedBudget === "2M_4M" &&
        (v.askingPrice < 2000000 || v.askingPrice > 4200000)
      ) {
        return false;
      }
      if (
        selectedBudget === "4M_6M" &&
        (v.askingPrice < 4000000 || v.askingPrice > 6000000)
      ) {
        return false;
      }
      if (selectedBudget === "ABOVE_6M" && v.askingPrice < 6000000)
        return false;

      return true;
    });
  }, [
    publicInventory,
    catalogTab,
    selectedMake,
    selectedModel,
    selectedBodyType,
    selectedBudget,
    aiSettings?.featuredVehicleIds,
    aiSettings?.newArrivalVehicleIds,
  ]);

  const homepageVehicles = useMemo(() => {
    return filteredVehicles.slice(0, 9);
  }, [filteredVehicles]);

  const resetFilters = () => {
    setSelectedMake("ALL");
    setSelectedModel("ALL");
    setSelectedBudget("ALL");
    setSelectedBodyType("ALL");
    setCatalogTab("ALL");
  };

  const openAIWithPrompt = (prompt?: string, vehicleId?: string) => {
    setAiFocusedVehicleId(vehicleId);
    setAiInitialPrompt(prompt);
    setAiOpen(true);
  };

  const handleHeroPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPromptInput.trim()) return;
    openAIWithPrompt(heroPromptInput.trim());
    setHeroPromptInput("");
  };

  const handleTradeInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiName.trim() || !tiPhone.trim()) return;

    const submission = addTradeInRequest({
      make: tiMake,
      model: tiModel,
      year: tiYear,
      mileage: tiMileage,
      condition: tiCondition,
      location: tiLocation,
      expectedPrice: tiExpectedPrice,
      customerName: tiName,
      customerPhone: tiPhone,
      targetVehicleId: tiTargetVehicleId || undefined,
      notes: tiNotes,
    });

    setTiSubmittedBanner(
      `Acquisition request submitted. Reference: ${submission.id}. A sales consultant will contact you within 30 minutes.`
    );
    setTiName("");
    setTiPhone("");
    setTiNotes("");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const cust = addCustomer({
      fullName: contactName.trim(),
      phone: contactPhone.trim(),
      email: "",
      address: "Nairobi",
      location: "Nairobi",
      customerType: "INDIVIDUAL",
      preferredMakes: selectedMake !== "ALL" ? selectedMake : "Toyota",
      preferredModels: "",
      budgetMin: 2000000,
      budgetMax: 7000000,
      preferredYear: 2021,
      preferredFuel: "PETROL",
      preferredTrans: "AUTOMATIC",
      preferredBody: "SUV",
      pipelineStage: "NEW",
      notes: `[Website Contact Inquiry] ${contactMessage.trim()}`,
      assignedSalespersonId: "usr-brian",
      assignedSalespersonName: "Brian Ochieng",
    });

    const targetVehicle = vehicles.find((v) => v.id === contactVehicleId);
    const todayIso = new Date().toISOString();

    addLead({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: targetVehicle?.id || contactVehicleId || publicInventory[0]?.id || "veh-1001",
      vehicleTitle: targetVehicle
        ? `${targetVehicle.year} ${targetVehicle.make} ${targetVehicle.model}`
        : "General Showroom Inquiry",
      vehicleStockNo: targetVehicle?.stockNumber || "GEN-001",
      askingPrice: targetVehicle?.askingPrice || 0,
      source: "WEBSITE",
      assignedSalespersonId: "usr-brian",
      assignedSalespersonName: "Brian Ochieng",
      budget: targetVehicle?.askingPrice || 4000000,
      expectedPurchaseDate: todayIso,
      stage: "NEW",
      probability: 35,
      nextFollowUpAt: todayIso,
      notes: `[Website Contact Form] ${contactMessage.trim()}`,
    });

    setContactSubmitted(true);
    setContactName("");
    setContactPhone("");
    setContactMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0f1011] text-[#ffffff] flex flex-col overflow-x-hidden selection:bg-[#847dff] selection:text-[#ffffff]">
      {/* ====================================================================
          1. ORIGIN FINANCIAL — NOCTURNAL GALLERY HERO & STICKY GLASS NAV
          ==================================================================== */}
      <section id="top" className="origin-sky-atmosphere relative overflow-hidden border-b border-white/10">
        {/* Atmospheric Low-Opacity Automotive Hero Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=85"
            alt="Vehisoft Showroom Atmosphere"
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity scale-105 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1011]/90 via-[#0f1011]/45 to-[#0f1011]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0f1011_92%)]" />
        </div>

        {/* Sticky Frosted Glass Top Navigation */}
        <header className="sticky top-0 z-40 origin-nav-glass relative">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 sm:gap-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 shrink-0 group focus:outline-none"
                aria-label="Vehisoft Home"
              >
                <VehisoftIcon
                  size={32}
                  className="transition-transform group-hover:scale-105"
                />
                <span className="font-serif italic font-normal text-[22px] tracking-tight text-[#ffffff]">
                  Vehisoft<sup className="text-[11px] ml-0.5 not-italic text-[#847dff]">®</sup>
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6 text-[15px] text-[#9f9fa0] font-sans">
                <a
                  href="#vehicles-catalog"
                  onClick={(e) => scrollToSection(e, "vehicles-catalog")}
                  className="hover:text-[#ffffff] transition-colors"
                >
                  Showroom Vault
                </a>
                <Link
                  href="/showroom/vehicles"
                  className="hover:text-[#ffffff] transition-colors"
                >
                  All Products
                </Link>
                <a
                  href="#featured-ai"
                  onClick={(e) => scrollToSection(e, "featured-ai")}
                  className="hover:text-[#ffffff] transition-colors"
                >
                  AI Specialist
                </a>
                <a
                  href="#standards"
                  onClick={(e) => scrollToSection(e, "standards")}
                  className="hover:text-[#ffffff] transition-colors"
                >
                  Standards
                </a>
                <a
                  href="#sell-trade-in"
                  onClick={(e) => scrollToSection(e, "sell-trade-in")}
                  className="hover:text-[#ffffff] transition-colors"
                >
                  Trade-In
                </a>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "contact")}
                  className="hover:text-[#ffffff] transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => openAIWithPrompt()}
                className="origin-btn-primary !py-2 !px-4 !text-[14px]"
              >
                <Sparkles className="w-4 h-4 text-[#847dff]" />
                <span>Consult AI</span>
              </button>
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="origin-btn-ghost !py-2 !px-4 !text-[14px] hidden sm:inline-flex"
              >
                <span>{isAuthenticated ? "Staff Portal" : "Staff Login"}</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen((v) => !v)}
                className="md:hidden w-9 h-9 rounded-[8px] bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center shrink-0 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileNavOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && (
          <div className="max-w-[1200px] mx-auto px-6 py-5 border-b border-white/10 bg-[#0f1011]/95 backdrop-blur-xl relative z-40">
            <div className="flex flex-col gap-3 text-[16px] text-[#9f9fa0] font-sans">
              <a
                href="#vehicles-catalog"
                onClick={(e) => scrollToSection(e, "vehicles-catalog")}
                className="hover:text-white"
              >
                Live Showroom ({publicInventory.length} Available)
              </a>
              <Link
                href="/showroom/vehicles"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-white"
              >
                Full Products Catalog
              </Link>
              <a
                href="#featured-ai"
                onClick={(e) => scrollToSection(e, "featured-ai")}
                className="hover:text-white"
              >
                24/7 AI Sales Concierge
              </a>
              <a
                href="#standards"
                onClick={(e) => scrollToSection(e, "standards")}
                className="hover:text-white"
              >
                Dealership Standards & Provenance
              </a>
              <a
                href="#sell-trade-in"
                onClick={(e) => scrollToSection(e, "sell-trade-in")}
                className="hover:text-white"
              >
                Sell / Trade-In Desk
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "contact")}
                className="hover:text-white"
              >
                Nairobi HQ Location
              </a>
              <Link href="/login" className="text-white font-medium pt-2 border-t border-white/10">
                Staff CRM Login →
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section — Whisper-Soft Authority in Lyon Display 80-96px */}
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-16 pb-20 text-center relative z-10">
          {/* Promo Eyebrow Badge (Roboto Mono 11px uppercase, tracked 0.182em) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono tracking-[0.182em] uppercase text-[#f5f5f7] mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00b3dd] animate-pulse" />
            <span>NAIROBI MOTOR VAULT</span>
            <span className="text-white/40">·</span>
            <span>{publicInventory.length} LIVE UNITS AVAILABLE</span>
          </div>

          {/* Hero Display Headline (Lyon Display light 300/400 at 80-96px with italic word) */}
          <h1 className="origin-display max-w-[980px] mx-auto text-[#ffffff]">
            <em>Curate</em> Your Next Drive With Quiet Authority.
          </h1>

          {/* Hero Subhead (Suisse Int'l 18px light 300 in Ash #9f9fa0) */}
          <p className="origin-subheading max-w-[640px] mx-auto mt-6 text-[#9f9fa0]">
            Browse Kenya&apos;s verified automotive collection, inspect genuine technical telemetry, and consult our 24/7 AI sales specialist in complete confidence.
          </p>

          {/* Natural-Language AI Prompt Input Field (Origin AI Prompt Pattern with Liquid Glass) */}
          <form
            onSubmit={handleHeroPromptSubmit}
            className="max-w-[580px] mx-auto mt-8 w-full"
          >
            <div className="relative flex items-center rb-liquid-glass-dark border border-white/20 rounded-[12px] p-1.5 focus-within:border-[#847dff] transition-all duration-300">
              <input
                type="text"
                value={heroPromptInput}
                onChange={(e) => setHeroPromptInput(e.target.value)}
                placeholder="Where can I find an SUV under 4M? Ask AI..."
                className="w-full bg-transparent text-white placeholder-[#9f9fa0] text-[15px] font-sans pl-4 pr-12 py-2.5 focus:outline-none"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#847dff] hover:bg-[#847dff]/90 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-md"
                aria-label="Submit prompt to AI Sales Agent"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[12px] text-[#9f9fa0] font-sans">
              <span>Try:</span>
              <button
                type="button"
                onClick={() => openAIWithPrompt("I need a family SUV under 4 million")}
                className="text-[#847dff] hover:underline"
              >
                &ldquo;SUV under 4M&rdquo;
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => openAIWithPrompt("Tell me about the Land Cruiser 300")}
                className="text-[#847dff] hover:underline"
              >
                &ldquo;Land Cruiser 300&rdquo;
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => openAIWithPrompt("Do you offer bank asset financing?")}
                className="text-[#847dff] hover:underline"
              >
                &ldquo;Bank asset financing&rdquo;
              </button>
            </div>
          </form>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <a
              href="#vehicles-catalog"
              onClick={(e) => scrollToSection(e, "vehicles-catalog")}
              className="origin-btn-primary"
            >
              <span>Explore Live Vault</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => openAIWithPrompt()}
              className="origin-btn-ghost"
            >
              <span>Talk to an Agent</span>
            </button>
          </div>
        </div>

        {/* Sculptural Spotlight Carousel in Machined Dark Chrome with Liquid Glass */}
        {activeSpotlight && (
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pb-16 relative z-10">
            <div className="origin-card-graphite rb-liquid-glass-dark overflow-hidden border border-white/15 rounded-[24px]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Vehicle Photography */}
                <div className="lg:col-span-8 relative h-[340px] sm:h-[460px] bg-[#090a0b] overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={activeSpotlight.id}
                    src={activeSpotlight.imageUrl}
                    alt={`${activeSpotlight.year} ${activeSpotlight.make} ${activeSpotlight.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Carousel Page Selector */}
                  <div className="absolute top-5 left-5 flex items-center gap-2">
                    <span className="origin-pill-chip !bg-[#0f1011]/85 !border-white/20 backdrop-blur-md">
                      SPOTLIGHT 0{safeSpotlightIdx + 1} / 0{spotlightVehicles.length}
                    </span>
                  </div>

                  {/* Overlaid Navigation Arrows */}
                  <div className="absolute bottom-5 right-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevSpotlight}
                      className="w-10 h-10 rounded-full bg-[#0f1011]/80 hover:bg-[#847dff] border border-white/20 text-white flex items-center justify-center transition-all duration-200"
                      aria-label="Previous Vehicle"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSpotlight}
                      className="w-10 h-10 rounded-full bg-[#0f1011]/80 hover:bg-[#847dff] border border-white/20 text-white flex items-center justify-center transition-all duration-200"
                      aria-label="Next Vehicle"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Technical Telemetry Panel */}
                <div className="lg:col-span-4 p-8 sm:p-10 flex flex-col justify-between bg-[#151618]/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase pb-3 border-b border-white/10">
                      <span>STOCK #{activeSpotlight.stockNumber}</span>
                      <span className="text-[#00b3dd]">{activeSpotlight.status}</span>
                    </div>

                    <h3 className="origin-heading-lg mt-4 text-[#ffffff]">
                      {activeSpotlight.year} {activeSpotlight.make}{" "}
                      <em>{activeSpotlight.model}</em>
                    </h3>

                    <p className="text-[14px] text-[#9f9fa0] mt-3 leading-relaxed font-sans">
                      {activeSpotlight.variant} · {activeSpotlight.mileage.toLocaleString()} km ·{" "}
                      {activeSpotlight.transmission} · {activeSpotlight.fuelType}
                    </p>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <span className="text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase block">
                        Direct Showroom Acquisition
                      </span>
                      <span className="font-mono text-[24px] sm:text-[28px] font-medium text-[#ffffff] block mt-1">
                        {formatKSh(activeSpotlight.askingPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2.5">
                    <Link
                      href={`/showroom/vehicles/${activeSpotlight.id}`}
                      className="origin-btn-primary flex-1"
                    >
                      <span>Examine Record</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        openAIWithPrompt(
                          `Tell me about the ${activeSpotlight.year} ${activeSpotlight.make} ${activeSpotlight.model}`,
                          activeSpotlight.id
                        )
                      }
                      className="origin-btn-ghost"
                    >
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ====================================================================
          2. FEATURE CATEGORY TILES (Unified Luxury Dark Liquid Glass Palette)
          ==================================================================== */}
      <section id="featured-ai" className="py-20 max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="origin-mono-label text-[#847dff] block mb-2">
              01 / ARCHITECTURE & CAPABILITIES
            </span>
            <h2 className="origin-heading-lg text-[#ffffff]">
              Precision Automotive Systems.
            </h2>
          </div>
          <p className="text-[15px] text-[#9f9fa0] max-w-[420px] font-sans">
            A cohesive suite of autonomous sales intelligence, real-time vehicle telemetry, and direct trade-in credit appraisal.
          </p>
        </div>

        {/* 4 Feature Category Cards — Single Unified Luxury Liquid Glass Palette with Interactive Hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Tile 1: Autonomous Sales Concierge */}
          <div
            onClick={() =>
              openAIWithPrompt(
                "I'm looking for a luxury SUV around 5 million KSh. What is available?"
              )
            }
            className="rb-liquid-glass-dark group relative rounded-[28px] p-8 flex flex-col justify-between cursor-pointer min-h-[320px] border border-white/10 hover:border-[#847dff]/60 transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 text-[#847dff] group-hover:bg-[#847dff] group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 shadow-sm">
                <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-serif text-[26px] leading-[1.1] text-white group-hover:text-white transition-colors">
                Autonomous Sales Concierge
              </h3>
            </div>
            <div>
              <p className="text-[14px] text-[#9f9fa0] group-hover:text-[#d1c9ff] leading-relaxed font-sans mt-6 transition-colors">
                24/7 AI sales specialist trained on exact vehicle records, live pricing, specifications, and CRM lead capture.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[13px] font-medium text-[#847dff] group-hover:text-white transition-colors">
                <span>Engage Consultant</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* Tile 2: Live Inventory Telemetry */}
          <div
            onClick={() => {
              const el = document.getElementById("vehicles-catalog");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="rb-liquid-glass-dark group relative rounded-[28px] p-8 flex flex-col justify-between cursor-pointer min-h-[320px] border border-white/10 hover:border-[#847dff]/60 transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 text-[#847dff] group-hover:bg-[#847dff] group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 shadow-sm">
                <Compass className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-serif text-[26px] leading-[1.1] text-white group-hover:text-white transition-colors">
                Live Inventory Telemetry
              </h3>
            </div>
            <div>
              <p className="text-[14px] text-[#9f9fa0] group-hover:text-[#d1c9ff] leading-relaxed font-sans mt-6 transition-colors">
                Direct sync with port arrivals, customs clearances, showroom statuses, and genuine QISJ Japanese auction grades.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[13px] font-medium text-[#847dff] group-hover:text-white transition-colors">
                <span>View Live Vault</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* Tile 3: Bespoke Trade-In Equity */}
          <div
            onClick={() => {
              const el = document.getElementById("sell-trade-in");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="rb-liquid-glass-dark group relative rounded-[28px] p-8 flex flex-col justify-between cursor-pointer min-h-[320px] border border-white/10 hover:border-[#847dff]/60 transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 text-[#847dff] group-hover:bg-[#847dff] group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 shadow-sm">
                <Car className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-serif text-[26px] leading-[1.1] text-white group-hover:text-white transition-colors">
                Bespoke Trade-In Equity
              </h3>
            </div>
            <div>
              <p className="text-[14px] text-[#9f9fa0] group-hover:text-[#d1c9ff] leading-relaxed font-sans mt-6 transition-colors">
                Submit vehicle details for rapid 30-minute appraisal and roll your current equity straight into any showroom car.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[13px] font-medium text-[#847dff] group-hover:text-white transition-colors">
                <span>Start Valuation</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* Tile 4: Tier-1 Asset Financing */}
          <div
            onClick={() =>
              openAIWithPrompt("How does your bank asset financing work?")
            }
            className="rb-liquid-glass-dark group relative rounded-[28px] p-8 flex flex-col justify-between cursor-pointer min-h-[320px] border border-white/10 hover:border-[#847dff]/60 transition-all duration-300 hover:-translate-y-1.5"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 text-[#847dff] group-hover:bg-[#847dff] group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 shadow-sm">
                <ShieldCheck className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-serif text-[26px] leading-[1.1] text-white group-hover:text-white transition-colors">
                Tier-1 Asset Financing
              </h3>
            </div>
            <div>
              <p className="text-[14px] text-[#9f9fa0] group-hover:text-[#d1c9ff] leading-relaxed font-sans mt-6 transition-colors">
                Up to 80% financing partnerships with Stanbic, NCBA, I&M, and KCB Bank with expedited 48-hour approvals.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[13px] font-medium text-[#847dff] group-hover:text-white transition-colors">
                <span>Inquire Financing</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Origin Inverted Silver Card (#cacaca) for Provenance & Trust */}
        <div id="standards" className="origin-card-inverted mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-mono tracking-widest uppercase text-black/60 block mb-2 font-medium">
                DEALERSHIP ASSURANCE STANDARD
              </span>
              <h3 className="font-serif text-[32px] sm:text-[38px] leading-tight text-[#000000]">
                Curated Provenance. <em>Zero</em> Compromise.
              </h3>
              <p className="text-[15px] text-black/80 mt-4 leading-relaxed font-sans">
                Every motor vehicle undergoes a strict 150-point diagnostic inspection before entering our Nairobi facility. We verify genuine auction sheets, confirm untampered digital odometers, and provide complete Mombasa Port CFS customs clearance documentation.
              </p>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-black/15 pt-6 lg:pt-0 lg:pl-8">
              <div>
                <span className="font-mono text-[28px] font-medium text-black block">Grade 4.5+</span>
                <span className="text-[13px] text-black/70">Verified Auction Sheet</span>
              </div>
              <div>
                <span className="font-mono text-[28px] font-medium text-black block">100%</span>
                <span className="text-[13px] text-black/70">Certified Mileage</span>
              </div>
              <div>
                <span className="font-mono text-[28px] font-medium text-black block">NTSA TIMS</span>
                <span className="text-[13px] text-black/70">Clean Logbook Transfer</span>
              </div>
              <div>
                <span className="font-mono text-[28px] font-medium text-black block">24/7 AI</span>
                <span className="text-[13px] text-black/70">Connected CRM Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. LIVE SHOWROOM INVENTORY VAULT & MULTI-FILTER
          ==================================================================== */}
      <section
        id="vehicles-catalog"
        className="bg-[#090a0b] py-20 border-t border-b border-white/10"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="origin-mono-label text-[#00b3dd] block mb-2">
                02 / LIVE SHOWROOM VAULT
              </span>
              <h2 className="origin-heading-lg text-[#ffffff]">
                Available Motor Cars.
              </h2>
            </div>
            <p className="text-[15px] text-[#9f9fa0] max-w-[420px] font-sans">
              Filter by make, model, or price category. Every unit listed is verified and physically present at our Nairobi facility or in secure transit.
            </p>
          </div>

          {/* Filter Bar (Graphite surfaces, 8px radius inputs, Roboto Mono micro-labels) */}
          <div className="origin-card-graphite p-6 sm:p-7 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Make */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-2">
                  Make
                </label>
                <select
                  value={selectedMake}
                  onChange={(e) => {
                    setSelectedMake(e.target.value);
                    setSelectedModel("ALL");
                  }}
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                >
                  <option value="ALL">All Makes ({availableMakes.length})</option>
                  {availableMakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-2">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                >
                  <option value="ALL">Any Model</option>
                  {availableModels.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-2">
                  Budget (KSh.)
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                >
                  <option value="ALL">Any Budget</option>
                  <option value="UNDER_3M">Under KSh. 3.0M</option>
                  <option value="2M_4M">KSh. 2.0M – 4.2M</option>
                  <option value="4M_6M">KSh. 4.0M – 6.0M</option>
                  <option value="ABOVE_6M">Above KSh. 6.0M</option>
                </select>
              </div>

              {/* Body Style */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-2">
                  Body Style
                </label>
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                >
                  <option value="ALL">Any Body Style</option>
                  <option value="SUV">SUV / 4x4</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Double Cab Pickup">Pickup / Double Cab</option>
                </select>
              </div>

              {/* Reset Action */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="origin-btn-ghost w-full !py-2.5 !text-[13px]"
                >
                  <span>Reset All ({filteredVehicles.length})</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCatalogTab("ALL")}
                  className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                    catalogTab === "ALL"
                      ? "bg-white text-black font-medium"
                      : "bg-white/5 text-[#9f9fa0] hover:text-white"
                  }`}
                >
                  All Vehicles ({publicInventory.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogTab("NEW_ARRIVALS")}
                  className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                    catalogTab === "NEW_ARRIVALS"
                      ? "bg-white text-black font-medium"
                      : "bg-white/5 text-[#9f9fa0] hover:text-white"
                  }`}
                >
                  New Arrivals
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogTab("FEATURED")}
                  className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                    catalogTab === "FEATURED"
                      ? "bg-white text-black font-medium"
                      : "bg-white/5 text-[#9f9fa0] hover:text-white"
                  }`}
                >
                  Featured Premium
                </button>
              </div>

              <span className="text-[12px] font-mono text-[#9f9fa0]">
                Showing {homepageVehicles.length} of {filteredVehicles.length}
              </span>
            </div>
          </div>

          {/* Vehicle Grid (Elevated Graphite Cards, 16px radius, Steel hover) */}
          {homepageVehicles.length === 0 ? (
            <div className="origin-card-graphite p-12 text-center">
              <h3 className="font-serif text-[24px] text-white">
                No matching vehicles found.
              </h3>
              <p className="text-[#9f9fa0] text-[14px] mt-2">
                Try widening your search filters or ask our AI sales consultant to locate a matching unit.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="origin-btn-primary mt-6"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homepageVehicles.map((vehicle) => {
                const profile = getVehiclePublicProfile(vehicle);
                const newArrival = isVehicleNewArrival(vehicle.id);
                const featured = isVehicleFeatured(vehicle.id, vehicle.askingPrice);

                return (
                  <article
                    key={vehicle.id}
                    className="origin-card-graphite overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Container */}
                      <Link
                        href={`/showroom/vehicles/${vehicle.id}`}
                        className="block relative h-[240px] bg-[#090a0b] overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-[6px] bg-[#0f1011]/90 text-white text-[11px] font-mono font-medium">
                            {vehicle.year}
                          </span>
                          {newArrival && (
                            <span className="px-2.5 py-1 rounded-[6px] bg-[#847dff] text-white text-[11px] font-mono font-medium">
                              NEW ARRIVAL
                            </span>
                          )}
                          {featured && !newArrival && (
                            <span className="px-2.5 py-1 rounded-[6px] bg-[#00b3dd] text-white text-[11px] font-mono font-medium">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Content Body */}
                      <div className="p-6">
                        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase">
                          <span>STOCK #{vehicle.stockNumber}</span>
                          <span className="text-[#00b3dd]">{vehicle.bodyType}</span>
                        </div>

                        <h3 className="font-serif text-[22px] text-white mt-2 group-hover:text-[#847dff] transition-colors">
                          {vehicle.make} {vehicle.model}
                        </h3>

                        <p className="text-[13px] text-[#9f9fa0] mt-1 line-clamp-1 font-sans">
                          {vehicle.variant} · {vehicle.mileage.toLocaleString()} km · {vehicle.transmission}
                        </p>

                        <div className="mt-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] font-mono tracking-widest text-[#9f9fa0] uppercase block">
                              Direct Showroom Price
                            </span>
                            <span className="font-mono text-[20px] font-medium text-white block mt-0.5">
                              {formatKSh(vehicle.askingPrice)}
                            </span>
                          </div>
                          <span className="text-[12px] text-[#9f9fa0]">
                            {vehicle.location.split("(")[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="px-6 pb-6 pt-2 flex items-center gap-2">
                      <Link
                        href={`/showroom/vehicles/${vehicle.id}`}
                        className="origin-btn-primary flex-1 !py-2 !text-[13px]"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          openAIWithPrompt(
                            `Is this ${vehicle.year} ${vehicle.make} ${vehicle.model} available for viewing?`,
                            vehicle.id
                          )
                        }
                        className="origin-btn-ghost !py-2 !px-3 !text-[13px]"
                      >
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Full Catalog Redirect Banner */}
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif text-[22px] text-white">
                Explore Full Showroom Vault ({publicInventory.length} Curated Motor Cars)
              </p>
              <p className="text-[14px] text-[#9f9fa0] mt-1 font-sans">
                Filter by fuel type, transmission, compare vehicles side-by-side, and examine complete QISJ inspection records.
              </p>
            </div>
            <Link href="/showroom/vehicles" className="origin-btn-primary shrink-0">
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. 24/7 AI SALES AGENT DEMONSTRATION & AUTOMATION WORKFLOWS
          ==================================================================== */}
      <section className="py-20 max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        <div className="origin-card-graphite p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <span className="origin-mono-label text-[#847dff] block mb-2">
                03 / DIGITAL SALES ENGINE
              </span>
              <h2 className="origin-heading-lg text-[#ffffff]">
                {aiSettings.agentName}® Digital Sales Specialist.
              </h2>
              <p className="text-[15px] text-[#9f9fa0] mt-4 leading-relaxed font-sans max-w-[560px]">
                Unlike a simple FAQ bot, {aiSettings.agentName}® searches live dealership database inventory, answers specific questions regarding vehicle options and condition, books test drive appointments directly, and captures structured CRM leads for our executive sales team.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openAIWithPrompt(
                      "I need a 7-seater SUV under 6 million KSh. What do you recommend?"
                    )
                  }
                  className="origin-btn-primary"
                >
                  <Sparkles className="w-4 h-4 text-[#847dff]" />
                  <span>Test AI Vehicle Match</span>
                </button>
                <Link href="/ai-conversations" className="origin-btn-ghost">
                  <span>Inspect AI CRM Pipeline</span>
                </Link>
              </div>
            </div>

            {/* Test Scenarios */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
              <p className="text-[13px] font-mono tracking-wider uppercase text-[#9f9fa0] mb-4">
                Click a live scenario to test AI → CRM workflow:
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  "I'm looking for a Toyota around 4 million",
                  "Can I book a test drive for tomorrow at 2 PM?",
                  "I want to negotiate the price on the Land Cruiser 300",
                  "Do you accept trade-ins against the Harrier?",
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    onClick={() => openAIWithPrompt(promptText)}
                    className="origin-btn-ghost text-left !justify-between !w-full !py-2.5 !px-3.5 !text-[13px]"
                  >
                    <span className="truncate">&ldquo;{promptText}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. SELL / TRADE-IN ACQUISITION DESK
          ==================================================================== */}
      <section
        id="sell-trade-in"
        className="bg-[#090a0b] py-20 border-t border-b border-white/10"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="origin-mono-label text-[#dd90d8] block mb-2">
                04 / ACQUISITION & EXCHANGE
              </span>
              <h2 className="origin-heading-lg text-[#ffffff]">
                Trade In Your Current Vehicle.
              </h2>
              <p className="text-[15px] text-[#9f9fa0] mt-4 leading-relaxed font-sans">
                Submit your current vehicle details for a rapid 30-minute appraisal at our Ngong Road or Westlands facility. Apply your equity credit straight toward any unit in our live showroom inventory.
              </p>

              <div className="mt-8 p-6 rounded-[12px] bg-[#0f1011] border border-white/10">
                <h4 className="font-serif text-[18px] text-white">Direct Valuation Desk</h4>
                <p className="text-[13px] text-[#9f9fa0] mt-2 font-sans">
                  Transparent market pricing based on current auction telemetry and recent Kenyan NTSA transfer indices.
                </p>
              </div>
            </div>

            {/* Evaluation Form */}
            <div className="lg:col-span-7 origin-card-graphite p-8">
              <h3 className="font-serif text-[22px] text-white mb-6">
                Start Equity Evaluation
              </h3>

              {tiSubmittedBanner && (
                <div className="mb-6 p-4 rounded-[8px] bg-[#847dff]/20 border border-[#847dff] text-white text-[14px]">
                  {tiSubmittedBanner}
                </div>
              )}

              <form onSubmit={handleTradeInSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Make
                    </label>
                    <input
                      type="text"
                      value={tiMake}
                      onChange={(e) => setTiMake(e.target.value)}
                      required
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Model
                    </label>
                    <input
                      type="text"
                      value={tiModel}
                      onChange={(e) => setTiModel(e.target.value)}
                      required
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Year
                    </label>
                    <input
                      type="number"
                      value={tiYear}
                      onChange={(e) => setTiYear(Number(e.target.value))}
                      required
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      value={tiMileage}
                      onChange={(e) => setTiMileage(Number(e.target.value))}
                      required
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Condition
                    </label>
                    <select
                      value={tiCondition}
                      onChange={(e) =>
                        setTiCondition(
                          e.target.value as "EXCELLENT" | "GOOD" | "FAIR"
                        )
                      }
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    >
                      <option value="EXCELLENT">Excellent (Flawless paint & mechanical)</option>
                      <option value="GOOD">Good (Minor wear, well maintained)</option>
                      <option value="FAIR">Fair (Needs light service / cosmetic touch)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={tiName}
                      onChange={(e) => setTiName(e.target.value)}
                      required
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
                      value={tiPhone}
                      onChange={(e) => setTiPhone(e.target.value)}
                      required
                      placeholder="+254 7XX XXX XXX"
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                    Target Showroom Upgrade Vehicle (Optional)
                  </label>
                  <select
                    value={tiTargetVehicleId}
                    onChange={(e) => setTiTargetVehicleId(e.target.value)}
                    className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                  >
                    <option value="">Select target vehicle (or general trade-in)</option>
                    {publicInventory.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} — {formatKSh(v.askingPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="origin-btn-primary w-full mt-2">
                  <span>Submit for Valuation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CONTACT & SHOWROOM VIEWING CONCIERGE
          ==================================================================== */}
      <section id="contact" className="py-20 max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="origin-mono-label text-[#847dff] block mb-2">
              05 / SHOWROOM LIAISON
            </span>
            <h2 className="origin-heading-lg text-[#ffffff]">
              Private Showroom Viewing.
            </h2>
            <p className="text-[15px] text-[#9f9fa0] mt-4 leading-relaxed font-sans">
              Schedule an exclusive appointment at our flagship Ngong Road or Westlands facilities. Our sales associates prepare vehicles for private test drives and arrange financing pre-qualification.
            </p>

            <div className="mt-8 space-y-4">
              <div className="p-4 rounded-[10px] bg-[#2e2e2e] border border-white/10">
                <span className="text-[11px] font-mono text-[#00b3dd] uppercase block">HQ Address</span>
                <p className="text-[14px] text-white mt-1">Ngong Road Showroom, Nairobi, Kenya</p>
                <p className="text-[12px] text-[#9f9fa0] mt-0.5">Operating Hours: Mon - Sat 8:00 AM - 6:30 PM</p>
              </div>

              <div className="p-4 rounded-[10px] bg-[#2e2e2e] border border-white/10">
                <span className="text-[11px] font-mono text-[#00b3dd] uppercase block">Direct Line & Concierge</span>
                <p className="text-[14px] text-white mt-1">
                  <a href="tel:+254704611033" className="hover:text-[#00b3dd] transition-colors">+254 704 611 033</a>
                  {" / "}
                  <a href="tel:+25492986825" className="hover:text-[#00b3dd] transition-colors">+254 929 868 25</a>
                </p>
                <p className="text-[12px] text-[#9f9fa0] mt-1 font-mono">
                  Email: <a href="mailto:versalylabs@gmail.com" className="text-white hover:text-[#00b3dd] transition-colors">versalylabs@gmail.com</a>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 origin-card-graphite p-8">
            <h3 className="font-serif text-[22px] text-white mb-6">
              Arrange Showroom Appointment
            </h3>

            {contactSubmitted ? (
              <div className="p-6 rounded-[8px] bg-white/10 border border-white/20 text-white text-center">
                <CheckCircle2 className="w-8 h-8 text-[#00b3dd] mx-auto mb-2" />
                <h4 className="font-serif text-[18px]">Appointment Request Received</h4>
                <p className="text-[13px] text-[#9f9fa0] mt-1 font-sans">
                  Our sales specialist Brian Ochieng has received your inquiry and will reach out shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setContactSubmitted(false)}
                  className="origin-btn-ghost mt-4 !text-[13px]"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
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
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      placeholder="+254 7XX XXX XXX"
                      className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                    Vehicle of Interest (Optional)
                  </label>
                  <select
                    value={contactVehicleId}
                    onChange={(e) => setContactVehicleId(e.target.value)}
                    className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                  >
                    <option value="">General Showroom Consultation</option>
                    {publicInventory.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.stockNumber}) — {formatKSh(v.askingPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                    Notes or Preferred Date
                  </label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us what you're looking for or your preferred viewing date..."
                    className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#847dff]"
                  />
                </div>

                <button type="submit" className="origin-btn-primary w-full mt-2">
                  <span>Confirm Appointment Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. MONUMENTAL NOCTURNAL FOOTER TERMINAL
          ==================================================================== */}
      <footer className="bg-[#090a0b] border-t border-white/10 pt-16 pb-12">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10 text-[14px] font-sans">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-white uppercase block mb-3">
                Showroom Vault
              </span>
              <ul className="space-y-2 text-[#9f9fa0]">
                <li>
                  <Link href="/showroom/vehicles" className="hover:text-white transition-colors">
                    All Motor Vehicles
                  </Link>
                </li>
                <li>
                  <a href="#vehicles-catalog" onClick={(e) => scrollToSection(e, "vehicles-catalog")} className="hover:text-white transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#standards" onClick={(e) => scrollToSection(e, "standards")} className="hover:text-white transition-colors">
                    Auction Inspection Grades
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-white uppercase block mb-3">
                Client Services
              </span>
              <ul className="space-y-2 text-[#9f9fa0]">
                <li>
                  <a href="#sell-trade-in" onClick={(e) => scrollToSection(e, "sell-trade-in")} className="hover:text-white transition-colors">
                    Trade-In Valuation Desk
                  </a>
                </li>
                <li>
                  <button type="button" onClick={() => openAIWithPrompt("How does asset financing work?")} className="hover:text-white transition-colors text-left">
                    Bank Asset Financing
                  </button>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="hover:text-white transition-colors">
                    Private Viewing Appointments
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-white uppercase block mb-3">
                Staff & Operations
              </span>
              <ul className="space-y-2 text-[#9f9fa0]">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Staff Portal Login
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Executive CRM Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/ai-conversations" className="hover:text-white transition-colors">
                    AI Lead Pipeline
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-white uppercase block mb-3">
                Flagship & Contact
              </span>
              <p className="text-[#9f9fa0] leading-relaxed">
                Ngong Road & Westlands, Nairobi, Kenya
              </p>
              <div className="mt-3 space-y-1 text-[13px] font-mono">
                <p className="text-white">
                  <a href="tel:+254704611033" className="hover:text-[#00b3dd] transition-colors">+254 704 611 033</a>
                  {" / "}
                  <a href="tel:+25492986825" className="hover:text-[#00b3dd] transition-colors">+254 929 868 25</a>
                </p>
                <p className="text-[#00b3dd]">
                  <a href="mailto:versalylabs@gmail.com" className="hover:underline">versalylabs@gmail.com</a>
                </p>
              </div>
              <p className="text-[#9f9fa0] font-mono text-[11px] mt-2">
                NTSA TIMS Registered Dealer
              </p>
            </div>
          </div>

          {/* Monumental Wordmark & Emblem */}
          <div className="pt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <VehisoftIcon size={46} className="text-white shrink-0" />
              <span className="font-serif italic text-[42px] sm:text-[56px] text-white tracking-tight leading-none select-none">
                Vehisoft<sup className="text-[16px] ml-1 not-italic text-[#847dff]">®</sup>
              </span>
            </div>
            <p className="text-[13px] text-[#9f9fa0] font-sans">
              © {new Date().getFullYear()} Vehisoft® Motor Dealership Management System. All rights reserved.
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
