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
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { getVehiclePublicProfile } from "@/lib/ai-sales-agent";
import { AISalesAgentWidget } from "@/components/showroom/AISalesAgentWidget";
import { formatKSh } from "@/lib/format";

type CatalogCategory = "ALL" | "SPOTLIGHT" | "NEW_ARRIVALS" | "FEATURED";
type SortOption =
  | "FEATURED"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "YEAR_DESC"
  | "MILEAGE_ASC";

export default function ShowroomAllVehiclesPage() {
  const { vehicles, aiSettings } = useDealership();

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

  // Live AVAILABLE inventory (automatically synced with Admin Inventory)
  const publicInventory = useMemo(() => {
    return vehicles.filter((v) => v.status === "AVAILABLE");
  }, [vehicles]);

  const isSpotlight = (id: string) =>
    (aiSettings.spotlightVehicleIds || ["veh-1001", "veh-1003", "veh-1002", "veh-1006"]).includes(id);

  const isFeatured = (id: string, askingPrice: number) => {
    if (aiSettings.featuredVehicleIds && aiSettings.featuredVehicleIds.length > 0) {
      return aiSettings.featuredVehicleIds.includes(id);
    }
    return askingPrice >= 3200000;
  };

  const isNewArrival = (id: string) => {
    if (aiSettings.newArrivalVehicleIds && aiSettings.newArrivalVehicleIds.length > 0) {
      return aiSettings.newArrivalVehicleIds.includes(id);
    }
    return id === "veh-1001" || id === "veh-1005" || id === "veh-1006";
  };

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
    aiSettings.spotlightVehicleIds,
    aiSettings.featuredVehicleIds,
    aiSettings.newArrivalVehicleIds,
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
    <div className="min-h-screen bg-[#ffffff] text-[#000d10] flex flex-col selection:bg-[#000d10] selection:text-[#ffffff]">
      {/* ====================================================================
          1. PALE DAWN-SKY TO PARCHMENT PRODUCTS HEADER (Hyer Aviation Style)
          ==================================================================== */}
      <section className="hyer-sky-hero border-b border-[#d5d3d4]">
        <header className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-[23px] pb-[16px] flex items-center justify-between">
          <div className="flex items-center gap-[23px]">
            <Link href="/showroom" className="hyer-nav-link flex items-center gap-[8px]">
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              <span>Back to Showroom</span>
            </Link>
            <Link
              href="/showroom#featured-ai"
              className="hyer-nav-link hidden sm:inline"
            >
              AI Concierge
            </Link>
            <Link
              href="/showroom#sell-trade-in"
              className="hyer-nav-link hidden md:inline"
            >
              Trade-In Desk
            </Link>
          </div>

          <div className="flex items-center gap-[13px]">
            <button
              type="button"
              onClick={() => openAIWithPrompt()}
              className="hyer-pill-dark"
            >
              <span>{aiSettings.agentName}® AI</span>
            </button>
            <Link
              href="/dashboard"
              className="hyer-pill-ghost-ink hidden sm:inline-flex"
            >
              <span>Staff CRM</span>
            </Link>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-[38px] pb-[59px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[34px] items-start">
            {/* Flush-Left Monumental Wordmark */}
            <div className="lg:col-span-7">
              <h1 className="hyer-wordmark select-none">
                Vehicles
                <sup className="text-[0.28em] font-bold align-super ml-1 tracking-normal">
                  ®
                </sup>
              </h1>
              <p className="mt-[15px] text-[17px] font-bold text-[#000d10]">
                Complete Dealership Catalog &nbsp;·&nbsp; {publicInventory.length}{" "}
                Available Units &nbsp;·&nbsp; QISJ 4.5+ Verified
              </p>
            </div>

            {/* Right-Aligned Two-Line Statement */}
            <div className="lg:col-span-5 lg:text-right flex flex-col lg:items-end justify-end pt-[11px]">
              <h2 className="hyer-display text-[#000d10]">
                Complete
                <br />
                Inventory.
              </h2>
              <p className="hyer-body text-[#000d10] mt-[22px] max-w-[420px] lg:text-right">
                Filter our entire Nairobi fleet by make, body architecture, fuel
                system, or budget, and compare up to three vehicles
                side-by-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ARCHITECTURAL MULTI-FILTER & CATALOG GRID
          ==================================================================== */}
      <section className="bg-[#ffffff] py-[68px] max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        {/* Category Pill Switcher & Keyword Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[22px] pb-[31px] border-b border-[#d5d3d4]">
          <div className="flex flex-wrap items-center gap-[11px]">
            <button
              type="button"
              onClick={() => setCategory("ALL")}
              className={
                category === "ALL" ? "hyer-pill-dark" : "hyer-pill-ghost-ink"
              }
            >
              All Cars ({publicInventory.length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("SPOTLIGHT")}
              className={
                category === "SPOTLIGHT"
                  ? "hyer-pill-dark"
                  : "hyer-pill-ghost-ink"
              }
            >
              Spotlight Selection
            </button>
            <button
              type="button"
              onClick={() => setCategory("NEW_ARRIVALS")}
              className={
                category === "NEW_ARRIVALS"
                  ? "hyer-pill-dark"
                  : "hyer-pill-ghost-ink"
              }
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setCategory("FEATURED")}
              className={
                category === "FEATURED"
                  ? "hyer-pill-dark"
                  : "hyer-pill-ghost-ink"
              }
            >
              Featured Stock
            </button>
          </div>

          {/* Minimal Hairline Search Input */}
          <div className="relative w-full lg:w-[360px]">
            <Search className="w-4 h-4 text-[#000d10] absolute left-0 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, stock #, color..."
              className="w-full pl-[26px] pr-[28px] py-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] placeholder-[#8e8e95] focus:outline-none rounded-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8e8e95] hover:text-[#000d10] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 6-Column Architectural Specification Filter Matrix */}
        <div className="py-[31px] border-b border-[#d5d3d4] mb-[59px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-[22px] items-end">
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
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none cursor-pointer"
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
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Model</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
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
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Body Style</option>
                <option value="SUV">SUV / 4x4</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup">Pickup / Double Cab</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Fuel System
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
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
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="ALL">Any Budget</option>
                <option value="UNDER_3M">Under KSh 3.0M</option>
                <option value="2M_4M">KSh 2.0M – 4.2M</option>
                <option value="4M_6M">KSh 4.0M – 6.0M</option>
                <option value="ABOVE_6M">Above KSh 6.0M</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[17px] font-bold text-[#000d10] mb-[11px]">
                Sort Order
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full pb-[11px] border-b border-[#000d10] bg-transparent text-[18px] text-[#000d10] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="FEATURED">Showroom Priority</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="YEAR_DESC">Year: Newest First</option>
                <option value="MILEAGE_ASC">Mileage: Lowest First</option>
              </select>
            </div>
          </div>

          {/* Active Results Counter & Filter Reset */}
          <div className="mt-[23px] flex flex-wrap items-center justify-between gap-[15px]">
            <p className="text-[17px] font-bold text-[#8e8e95]">
              Showing {filteredAndSortedVehicles.length} of{" "}
              {publicInventory.length} QISJ-Verified Vehicles
              {compareIds.length > 0 && (
                <span className="text-[#000d10] ml-[15px]">
                  · &nbsp;{compareIds.length} Selected for Comparison
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
                className="text-[17px] font-bold text-[#000d10] underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix (Appears when 1+ vehicles selected) */}
        {comparedVehicles.length > 0 && (
          <div className="mb-[68px] p-[34px] bg-[#0f0f1c] text-[#ffffff]">
            <div className="flex flex-wrap items-center justify-between gap-[16px] pb-[22px] border-b border-[#d5d3d4]/25">
              <div>
                <span className="text-[17px] font-bold text-[#8e8e95] block">
                  Side-by-Side Specification Comparison ({comparedVehicles.length}
                  /3)
                </span>
                <h3 className="hyer-heading-sm text-[#ffffff] mt-[6px]">
                  Compare Selected Vehicles.
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="hyer-pill-ghost-white"
              >
                <span>Clear Comparison</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[31px] mt-[31px]">
              {comparedVehicles.map((v) => {
                const prof = getVehiclePublicProfile(v);
                return (
                  <div
                    key={v.id}
                    className="border-t border-[#d5d3d4]/30 pt-[21px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-[11px]">
                        <h4 className="hyer-subheading text-[#ffffff]">
                          {v.year} {v.make} {v.model}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleCompare(v.id)}
                          className="text-[#8e8e95] hover:text-[#ffffff] cursor-pointer"
                          aria-label="Remove from comparison"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-[20px] font-bold text-[#ffffff] mt-[8px]">
                        {formatKSh(v.askingPrice)}
                      </p>

                      <div className="mt-[21px] space-y-[11px] text-[17px] border-t border-[#d5d3d4]/20 pt-[16px]">
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Trim / Variant</span>
                          <span className="font-bold">{v.variant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Mileage</span>
                          <span className="font-bold">
                            {v.mileage.toLocaleString()} km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Engine & Drive</span>
                          <span className="font-bold">
                            {prof.engineSize} · {prof.drivetrain}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Transmission</span>
                          <span className="font-bold">{v.transmission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Fuel Type</span>
                          <span className="font-bold">{v.fuelType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Body / Seats</span>
                          <span className="font-bold">
                            {v.bodyType} · {prof.seats} Seats
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8e8e95]">Location</span>
                          <span className="font-bold">{v.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-[23px] pt-[16px] border-t border-[#d5d3d4]/20 flex gap-[11px]">
                      <Link
                        href={`/showroom/vehicles/${v.id}`}
                        className="hyer-pill-ghost-white flex-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Complete Vehicle Catalog Grid */}
        {filteredAndSortedVehicles.length === 0 ? (
          <div className="hyer-white-card py-[59px]">
            <h3 className="hyer-heading text-[#000d10]">
              No matching vehicles found.
            </h3>
            <p className="hyer-body text-[#8e8e95] mt-[16px] max-w-[540px]">
              Clear your filters or ask {aiSettings.agentName}® to source a
              custom import matching your specification.
            </p>
            <div className="mt-[31px] flex flex-wrap gap-[13px]">
              <button
                type="button"
                onClick={resetAllFilters}
                className="hyer-pill-dark"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt(
                    "I'm looking for a vehicle not listed in my filter search. Can you help me find the closest match?"
                  )
                }
                className="hyer-pill-ghost-ink"
              >
                Ask {aiSettings.agentName}® AI
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[38px] gap-y-[68px]">
            {filteredAndSortedVehicles.map((vehicle) => {
              const profile = getVehiclePublicProfile(vehicle);
              const isSelectedForCompare = compareIds.includes(vehicle.id);
              const spotlightBadge = isSpotlight(vehicle.id);
              const newArrivalBadge = isNewArrival(vehicle.id);
              const featuredBadge = isFeatured(vehicle.id, vehicle.askingPrice);

              return (
                <article
                  key={vehicle.id}
                  className="bg-[#ffffff] flex flex-col justify-between group"
                >
                  <div>
                    {/* Product-Crop Image (0px radius) */}
                    <div className="relative h-[260px] bg-[#f3eee5] overflow-hidden mb-[22px]">
                      <Link
                        href={`/showroom/vehicles/${vehicle.id}`}
                        className="block w-full h-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Top-Left Pill Badges */}
                      <div className="absolute top-[16px] left-[16px] flex flex-wrap gap-[8px] pointer-events-none">
                        <span className="rounded-full bg-[#000d10] text-[#ffffff] px-[15px] py-[8px] text-[14px] font-bold leading-none">
                          {vehicle.year}
                        </span>
                        {spotlightBadge && (
                          <span className="rounded-full bg-[#bc7155] text-[#ffffff] px-[15px] py-[8px] text-[14px] font-bold leading-none">
                            Spotlight
                          </span>
                        )}
                        {newArrivalBadge && (
                          <span className="rounded-full bg-[#ffffff] text-[#000d10] px-[15px] py-[8px] text-[14px] font-bold leading-none">
                            New Arrival
                          </span>
                        )}
                        {featuredBadge && !newArrivalBadge && !spotlightBadge && (
                          <span className="rounded-full bg-[#ffffff] text-[#000d10] px-[15px] py-[8px] text-[14px] font-bold leading-none">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Top-Right Compare Pill Button */}
                      <button
                        type="button"
                        onClick={() => toggleCompare(vehicle.id)}
                        className={`absolute bottom-[16px] right-[16px] rounded-full px-[15px] py-[9px] text-[14px] font-bold leading-none flex items-center gap-[6px] transition-colors cursor-pointer ${
                          isSelectedForCompare
                            ? "bg-[#000d10] text-[#ffffff]"
                            : "bg-[#ffffff] text-[#000d10] hover:bg-[#000d10] hover:text-[#ffffff]"
                        }`}
                      >
                        {isSelectedForCompare ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Comparing</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Compare</span>
                          </>
                        )}
                      </button>
                    </div>

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
                        {profile.engineSize} {profile.drivetrain}
                      </p>

                      <div className="mt-[13px] pt-[13px] border-t border-[#d5d3d4]/60 flex items-center justify-between text-[16px] text-[#8e8e95]">
                        <span>
                          {vehicle.color} · {vehicle.bodyType}
                        </span>
                        <span>Stock #{vehicle.stockNumber}</span>
                      </div>

                      <p className="text-[16px] font-bold text-[#000d10] mt-[8px]">
                        {vehicle.location} &nbsp;·&nbsp; {profile.conditionBadge}
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
                          `Tell me about the ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stockNumber}).`,
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
      <section className="max-w-[1200px] mx-auto px-6 sm:px-8 pb-[80px] w-full">
        <div className="hyer-clay-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[38px] items-center">
            <div className="lg:col-span-8">
              <span className="text-[17px] font-bold uppercase tracking-wider text-[#ffffff] block mb-[15px]">
                Bespoke Vehicle Advisory · {aiSettings.agentName}®
              </span>
              <h2 className="hyer-heading text-[#ffffff]">
                Need Help Choosing Between Models?
              </h2>
              <p className="hyer-body text-[#ffffff] mt-[17px] max-w-[620px]">
                Ask our 24/7 digital sales consultant to compare fuel economy,
                maintenance costs, ground clearance, or bank financing deposits
                across any vehicles in our catalog.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-[13px]">
              <button
                type="button"
                onClick={() =>
                  openAIWithPrompt(
                    "Help me compare your available SUVs and recommend the best option for my budget."
                  )
                }
                className="hyer-pill-dark"
              >
                <span>Launch AI Advisor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. FOOTER TERMINAL — DEEP INK (#000d10)
          ==================================================================== */}
      <footer className="bg-[#000d10] text-[#ffffff] pt-[68px] pb-[52px] mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-[23px]">
          <div>
            <div className="hyer-hero-scale text-[#ffffff] select-none">
              {aiSettings.heroWordmark || "Vehisoft"}
              <sup className="text-[0.25em] font-bold align-super ml-1 tracking-normal">
                ®
              </sup>
            </div>
            <p className="text-[17px] text-[#8e8e95] mt-[16px]">
              {aiSettings.location}
            </p>
          </div>
          <div className="flex flex-wrap gap-[13px]">
            <Link href="/showroom" className="hyer-pill-ghost-white">
              <span>Return to Homepage</span>
            </Link>
            <Link href="/ai-settings" className="hyer-pill-ghost-white">
              <span>Manage Website in Admin</span>
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
