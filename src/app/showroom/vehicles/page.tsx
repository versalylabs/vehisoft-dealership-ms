"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Search,
  X,
  Check,
  Plus,
  Sparkles,
  Compass,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { getVehiclePublicProfile } from "@/lib/ai-sales-agent";
import { AISalesAgentWidget } from "@/components/showroom/AISalesAgentWidget";
import { formatKSh } from "@/lib/format";
import { VehisoftIcon } from "@/components/brand/VehisoftLogo";

type CatalogCategory = "ALL" | "SPOTLIGHT" | "NEW_ARRIVALS" | "FEATURED";
type SortOption =
  | "FEATURED"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "YEAR_DESC"
  | "MILEAGE_ASC";

export default function ShowroomAllVehiclesPage() {
  const { vehicles, aiSettings } = useDealership();
  const { isAuthenticated } = useAuth();

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMake, setSelectedMake] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("ALL");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("ALL");
  const [selectedFuel, setSelectedFuel] = useState<string>("ALL");
  const [selectedTrans, setSelectedTrans] = useState<string>("ALL");
  const [selectedBudget, setSelectedBudget] = useState<string>("ALL");
  const [category, setCategory] = useState<CatalogCategory>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("FEATURED");

  // Side-by-Side Vehicle Comparison State (up to 3 vehicles)
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // AI Agent Drawer State
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiFocusedVehicleId, setAiFocusedVehicleId] = useState<
    string | undefined
  >(undefined);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(
    undefined
  );

  const openAIWithPrompt = (prompt?: string, vehicleId?: string) => {
    setAiFocusedVehicleId(vehicleId);
    setAiInitialPrompt(prompt);
    setAiOpen(true);
  };

  // Live AVAILABLE inventory
  const publicInventory = useMemo(() => {
    return vehicles.filter(
      (v) => v.status === "AVAILABLE" || v.status === "IN_TRANSIT"
    );
  }, [vehicles]);

  const isSpotlight = (id: string) =>
    (
      aiSettings?.spotlightVehicleIds || [
        "veh-1001",
        "veh-1003",
        "veh-1002",
        "veh-1006",
        "veh-1009",
        "veh-1010",
      ]
    ).includes(id);

  const isFeatured = (id: string, askingPrice: number) => {
    if (aiSettings?.featuredVehicleIds && aiSettings.featuredVehicleIds.length > 0) {
      return aiSettings.featuredVehicleIds.includes(id);
    }
    return askingPrice >= 6500000;
  };

  const isNewArrival = (id: string) => {
    if (aiSettings?.newArrivalVehicleIds && aiSettings.newArrivalVehicleIds.length > 0) {
      return aiSettings.newArrivalVehicleIds.includes(id);
    }
    const v = publicInventory.find((item) => item.id === id);
    if (!v) return false;
    const diffDays =
      (Date.now() - new Date(v.dateAcquired).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 21;
  };

  const availableMakes = useMemo(() => {
    const set = new Set<string>();
    publicInventory.forEach((v) => set.add(v.make));
    return Array.from(set).sort();
  }, [publicInventory]);

  const availableModels = useMemo(() => {
    const base =
      selectedMake === "ALL"
        ? publicInventory
        : publicInventory.filter((v) => v.make === selectedMake);
    return Array.from(new Set(base.map((v) => v.model))).sort();
  }, [publicInventory, selectedMake]);

  const filteredAndSortedVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = publicInventory.filter((v) => {
      if (category === "SPOTLIGHT" && !isSpotlight(v.id)) return false;
      if (category === "NEW_ARRIVALS" && !isNewArrival(v.id)) return false;
      if (category === "FEATURED" && !isFeatured(v.id, v.askingPrice))
        return false;

      if (selectedMake !== "ALL" && v.make !== selectedMake) return false;
      if (selectedModel !== "ALL" && v.model !== selectedModel) return false;
      if (selectedBodyType !== "ALL" && v.bodyType !== selectedBodyType)
        return false;
      if (selectedFuel !== "ALL" && v.fuelType !== selectedFuel) return false;
      if (selectedTrans !== "ALL" && v.transmission !== selectedTrans)
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

      if (q) {
        const haystack =
          `${v.year} ${v.make} ${v.model} ${v.variant} ${v.stockNumber} ${v.color} ${v.bodyType} ${v.location} ${v.fuelType}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (sortBy === "PRICE_ASC") {
      sorted.sort((a, b) => a.askingPrice - b.askingPrice);
    } else if (sortBy === "PRICE_DESC") {
      sorted.sort((a, b) => b.askingPrice - a.askingPrice);
    } else if (sortBy === "YEAR_DESC") {
      sorted.sort((a, b) => b.year - a.year);
    } else if (sortBy === "MILEAGE_ASC") {
      sorted.sort((a, b) => a.mileage - b.mileage);
    }
    return sorted;
  }, [
    publicInventory,
    searchQuery,
    category,
    selectedMake,
    selectedModel,
    selectedBodyType,
    selectedFuel,
    selectedTrans,
    selectedBudget,
    sortBy,
    aiSettings?.spotlightVehicleIds,
    aiSettings?.featuredVehicleIds,
    aiSettings?.newArrivalVehicleIds,
  ]);

  const comparedVehicles = useMemo(() => {
    return compareIds
      .map((id) => publicInventory.find((v) => v.id === id))
      .filter((v): v is NonNullable<typeof v> => Boolean(v));
  }, [compareIds, publicInventory]);

  const toggleCompare = (vehicleId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), vehicleId];
      }
      return [...prev, vehicleId];
    });
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedMake("ALL");
    setSelectedModel("ALL");
    setSelectedBodyType("ALL");
    setSelectedFuel("ALL");
    setSelectedTrans("ALL");
    setSelectedBudget("ALL");
    setCategory("ALL");
    setSortBy("FEATURED");
  };

  return (
    <div className="min-h-screen bg-[#0f1011] text-[#ffffff] flex flex-col overflow-x-hidden selection:bg-[#847dff] selection:text-[#ffffff]">
      {/* ====================================================================
          1. NOCTURNAL PRODUCTS HEADER (Origin Financial Style)
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
                href="/showroom"
                className="inline-flex items-center gap-1.5 text-[14px] text-[#9f9fa0] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Showroom Home</span>
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => openAIWithPrompt()}
                className="origin-btn-primary !py-2 !px-3.5 !text-[13px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#847dff]" />
                <span>Ask {aiSettings.agentName}®</span>
              </button>
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="origin-btn-ghost !py-2 !px-3.5 !text-[13px] hidden sm:inline-flex"
              >
                <span>{isAuthenticated ? "Staff CRM" : "Staff Login"}</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="origin-mono-label text-[#00b3dd] block mb-3">
                ORIGIN MOTOR VAULT · COMPLETE CATALOG
              </span>
              <h1 className="origin-display text-white">
                <em>Curated</em> Products.
              </h1>
              <p className="text-[14px] text-[#9f9fa0] mt-3 font-mono">
                {publicInventory.length} Verified Vehicles Available · Kenya & Japan Certified Imports · Nairobi Facility
              </p>
            </div>

            <div className="lg:col-span-5 lg:text-right">
              <p className="text-[15px] text-[#9f9fa0] font-sans leading-relaxed">
                Filter our complete collection by make, powertrain, or price tier, and compare up to three motor cars side-by-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. MULTI-FILTER MATRIX & CATALOG GRID
          ==================================================================== */}
      <section className="bg-[#090a0b] py-16 max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        {/* Category Pill Switcher & Keyword Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                category === "ALL"
                  ? "bg-white text-black font-medium"
                  : "bg-white/5 text-[#9f9fa0] hover:text-white"
              }`}
            >
              All Cars ({publicInventory.length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("SPOTLIGHT")}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                category === "SPOTLIGHT"
                  ? "bg-white text-black font-medium"
                  : "bg-white/5 text-[#9f9fa0] hover:text-white"
              }`}
            >
              Spotlight Selection
            </button>
            <button
              type="button"
              onClick={() => setCategory("NEW_ARRIVALS")}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                category === "NEW_ARRIVALS"
                  ? "bg-white text-black font-medium"
                  : "bg-white/5 text-[#9f9fa0] hover:text-white"
              }`}
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setCategory("FEATURED")}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                category === "FEATURED"
                  ? "bg-white text-black font-medium"
                  : "bg-white/5 text-[#9f9fa0] hover:text-white"
              }`}
            >
              Featured Stock
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-[340px]">
            <Search className="w-4 h-4 text-[#9f9fa0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, stock #, color..."
              className="w-full pl-10 pr-9 py-2 bg-[#0f1011] border border-white/15 text-white placeholder-[#9f9fa0] text-[14px] rounded-[8px] focus:outline-none focus:border-[#847dff]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9f9fa0] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Specification Matrix */}
        <div className="origin-card-graphite p-6 my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Make */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Make
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("ALL");
                }}
                className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#847dff]"
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
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#847dff]"
              >
                <option value="ALL">Any Model</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Body Style
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#847dff]"
              >
                <option value="ALL">Any Body Style</option>
                <option value="SUV">SUV / 4x4</option>
                <option value="Sedan">Sedan</option>
                <option value="Double Cab Pickup">Pickup / Double Cab</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Fuel System
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#847dff]"
              >
                <option value="ALL">Any Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Budget (KSh.)
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#847dff]"
              >
                <option value="ALL">Any Budget</option>
                <option value="UNDER_3M">Under KSh. 3.0M</option>
                <option value="2M_4M">KSh. 2.0M – 4.2M</option>
                <option value="4M_6M">KSh. 4.0M – 6.0M</option>
                <option value="ABOVE_6M">Above KSh. 6.0M</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase mb-1.5">
                Sort Order
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-[#0f1011] border border-white/15 text-white rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#847dff]"
              >
                <option value="FEATURED">Showroom Priority</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="YEAR_DESC">Year: Newest First</option>
                <option value="MILEAGE_ASC">Mileage: Lowest First</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <p className="text-[#9f9fa0] font-sans">
              Showing {filteredAndSortedVehicles.length} of {publicInventory.length} Verified Motor Cars
              {compareIds.length > 0 && (
                <span className="text-[#847dff] ml-3 font-mono font-medium">
                  · {compareIds.length}/3 In Comparison Queue
                </span>
              )}
            </p>
            {(searchQuery ||
              selectedMake !== "ALL" ||
              selectedModel !== "ALL" ||
              selectedBodyType !== "ALL" ||
              selectedFuel !== "ALL" ||
              selectedTrans !== "ALL" ||
              selectedBudget !== "ALL" ||
              category !== "ALL") && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[#847dff] hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Comparison Drawer (Appears when 1+ vehicles selected) */}
        {comparedVehicles.length > 0 && (
          <div className="mb-12 p-6 sm:p-8 rounded-[16px] bg-[#0f1011] border border-[#847dff]/40">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="origin-mono-label text-[#847dff] block">
                  TECHNICAL COMPARISON ({comparedVehicles.length}/3)
                </span>
                <h3 className="font-serif text-[22px] text-white mt-1">
                  Side-by-Side Vehicle Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="origin-btn-ghost !py-1.5 !px-3 !text-[12px]"
              >
                Clear Comparison
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {comparedVehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-[10px] bg-[#2e2e2e] border border-white/10">
                  <div className="relative h-[120px] rounded-[6px] overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-serif text-[16px] text-white">
                    {v.year} {v.make} {v.model}
                  </h4>
                  <p className="font-mono text-[16px] text-[#00b3dd] mt-1">
                    {formatKSh(v.askingPrice)}
                  </p>
                  <div className="mt-3 text-[12px] text-[#9f9fa0] space-y-1 font-mono">
                    <p>Mileage: {v.mileage.toLocaleString()} km</p>
                    <p>Fuel: {v.fuelType}</p>
                    <p>Trans: {v.transmission}</p>
                    <p>Body: {v.bodyType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle Catalog Grid */}
        {filteredAndSortedVehicles.length === 0 ? (
          <div className="origin-card-graphite p-12 text-center">
            <h3 className="font-serif text-[24px] text-white">
              No matching motor cars in current stock.
            </h3>
            <p className="text-[#9f9fa0] text-[14px] mt-2 font-sans">
              Adjust your search keywords or request an import query with our 24/7 AI agent.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="origin-btn-primary mt-6"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedVehicles.map((vehicle) => {
              const profile = getVehiclePublicProfile(vehicle);
              const newArrival = isNewArrival(vehicle.id);
              const featured = isFeatured(vehicle.id, vehicle.askingPrice);
              const isCompared = compareIds.includes(vehicle.id);

              return (
                <article
                  key={vehicle.id}
                  className="origin-card-graphite overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo */}
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

                    {/* Meta info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#9f9fa0] uppercase">
                        <span>STOCK #{vehicle.stockNumber}</span>
                        <span className="text-[#00b3dd]">{vehicle.bodyType}</span>
                      </div>

                      <h3 className="font-serif text-[22px] text-white mt-2 group-hover:text-[#847dff] transition-colors">
                        {vehicle.make} {vehicle.model}
                      </h3>

                      <p className="text-[13px] text-[#9f9fa0] mt-1 line-clamp-1 font-sans">
                        {vehicle.variant} · {vehicle.mileage.toLocaleString()} km · {vehicle.transmission} · {vehicle.fuelType}
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

                  {/* Actions & Compare Toggle */}
                  <div className="px-6 pb-6 pt-1 space-y-2.5">
                    <div className="flex items-center gap-2">
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
                            `Is this ${vehicle.year} ${vehicle.make} ${vehicle.model} available for inspection?`,
                            vehicle.id
                          )
                        }
                        className="origin-btn-ghost !py-2 !px-3 !text-[13px]"
                      >
                        <span>Ask AI</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCompare(vehicle.id)}
                      className={`w-full py-1.5 rounded-[6px] text-[12px] font-mono flex items-center justify-center gap-1.5 transition-colors ${
                        isCompared
                          ? "bg-[#847dff]/20 text-[#847dff] border border-[#847dff]/40"
                          : "text-[#9f9fa0] hover:text-white"
                      }`}
                    >
                      {isCompared ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected in Comparison</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Comparison</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

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
        focusedVehicleId={aiFocusedVehicleId}
        initialPrompt={aiInitialPrompt}
      />
    </div>
  );
}
