"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  Save,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Database,
  ShieldAlert,
  Plus,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  Star,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { formatKSh } from "@/lib/format";

export default function AIAgentSettingsPage() {
  const { vehicles, aiSettings, updateAISettings } = useDealership();
  const [savedBanner, setSavedBanner] = useState(false);

  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "AVAILABLE"),
    [vehicles]
  );

  const spotlightIds = useMemo(
    () =>
      aiSettings.spotlightVehicleIds || [
        "veh-1001",
        "veh-1003",
        "veh-1002",
        "veh-1006",
      ],
    [aiSettings.spotlightVehicleIds]
  );

  const featuredIds = useMemo(
    () =>
      aiSettings.featuredVehicleIds || [
        "veh-1001",
        "veh-1002",
        "veh-1003",
        "veh-1005",
      ],
    [aiSettings.featuredVehicleIds]
  );

  const newArrivalIds = useMemo(
    () =>
      aiSettings.newArrivalVehicleIds || ["veh-1001", "veh-1005", "veh-1006"],
    [aiSettings.newArrivalVehicleIds]
  );

  const spotlightVehiclesOrdered = useMemo(() => {
    return spotlightIds
      .map((id) => availableVehicles.find((v) => v.id === id))
      .filter((v): v is NonNullable<typeof v> => Boolean(v));
  }, [spotlightIds, availableVehicles]);

  const toggleSpotlightVehicle = (vehicleId: string) => {
    const exists = spotlightIds.includes(vehicleId);
    const updated = exists
      ? spotlightIds.filter((id) => id !== vehicleId)
      : [...spotlightIds, vehicleId];
    updateAISettings({ spotlightVehicleIds: updated });
  };

  const moveSpotlightVehicle = (index: number, direction: "UP" | "DOWN") => {
    const currentIds = spotlightVehiclesOrdered.map((v) => v.id);
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentIds.length) return;
    const copy = [...currentIds];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    updateAISettings({ spotlightVehicleIds: copy });
  };

  const toggleFeaturedVehicle = (vehicleId: string) => {
    const exists = featuredIds.includes(vehicleId);
    const updated = exists
      ? featuredIds.filter((id) => id !== vehicleId)
      : [...featuredIds, vehicleId];
    updateAISettings({ featuredVehicleIds: updated });
  };

  const toggleNewArrivalVehicle = (vehicleId: string) => {
    const exists = newArrivalIds.includes(vehicleId);
    const updated = exists
      ? newArrivalIds.filter((id) => id !== vehicleId)
      : [...newArrivalIds, vehicleId];
    updateAISettings({ newArrivalVehicleIds: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  const toggleKnowledgeSource = (
    key: keyof typeof aiSettings.knowledgeSources
  ) => {
    updateAISettings({
      knowledgeSources: {
        ...aiSettings.knowledgeSources,
        [key]: !aiSettings.knowledgeSources[key],
      },
    });
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    updateAISettings({
      faqs: [
        ...aiSettings.faqs,
        {
          id: `faq-${Date.now()}`,
          question: newFaqQ.trim(),
          answer: newFaqA.trim(),
        },
      ],
    });
    setNewFaqQ("");
    setNewFaqA("");
  };

  const handleDeleteFaq = (id: string) => {
    updateAISettings({
      faqs: aiSettings.faqs.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
            Public Website, Spotlight Carousel & AI Controls
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Website & AI Agent Settings ({aiSettings.agentName})
          </h1>
          <p className="text-sm text-slate-500">
            Manage Homepage Spotlight carousel vehicles, Featured/New Arrival
            badges, Hero headlines, and your 24/7 AI sales consultant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/showroom/vehicles"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Products Page</span>
          </Link>
          <Link
            href="/ai-conversations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Conversations</span>
          </Link>
          <Link
            href="/showroom"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#000d10] hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Website</span>
          </Link>
        </div>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>
            Website & AI settings saved! Spotlight carousel order, vehicle
            badges, and hero settings are immediately live on the public
            showroom.
          </span>
        </div>
      )}

      {/* ====================================================================
          SECTION 1: PUBLIC WEBSITE & HOMEPAGE SPOTLIGHT CAROUSEL MANAGER
          ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#000d10] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Homepage Spotlight Carousel & Website Features
              </h2>
              <p className="text-xs text-slate-500">
                Choose and reorder the vehicles displayed in the interactive
                Spotlight carousel on the homepage, plus manage Featured & New
                Arrival tags.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
            {spotlightVehiclesOrdered.length} Vehicles in Spotlight Carousel
          </span>
        </div>

        {/* Active Spotlight Carousel Order (with Up/Down Reordering) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Active Spotlight Carousel Sequence (Use Arrows to Reorder Slides)
            </h3>
            <Link
              href="/showroom#spotlight"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Preview Spotlight on Homepage →
            </Link>
          </div>

          {spotlightVehiclesOrdered.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              No vehicles selected for Spotlight. Select at least one available
              vehicle from the table below.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {spotlightVehiclesOrdered.map((veh, idx) => (
                <div
                  key={veh.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-[#000d10] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={veh.imageUrl}
                      alt={`${veh.year} ${veh.make} ${veh.model}`}
                      className="w-14 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {veh.year} {veh.make} {veh.model}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Stock #{veh.stockNumber} · {formatKSh(veh.askingPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSpotlightVehicle(idx, "UP")}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 cursor-pointer"
                      title="Move Earlier in Carousel"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === spotlightVehiclesOrdered.length - 1}
                      onClick={() => moveSpotlightVehicle(idx, "DOWN")}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 cursor-pointer"
                      title="Move Later in Carousel"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSpotlightVehicle(veh.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold ml-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Available Vehicles Placement Matrix (Spotlight / Featured / New Arrival toggles) */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Assign Available Vehicles to Website Sections (Spotlight /
              Featured / New Arrival)
            </span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Homepage Spotlight</th>
                  <th className="py-2.5 px-3">Featured Tab</th>
                  <th className="py-2.5 px-3">New Arrival Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {availableVehicles.map((v) => {
                  const inSpotlight = spotlightIds.includes(v.id);
                  const inFeatured = featuredIds.includes(v.id);
                  const inNewArrival = newArrivalIds.includes(v.id);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {v.year} {v.make} {v.model}{" "}
                        <span className="text-slate-400 font-normal">
                          (#{v.stockNumber})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {formatKSh(v.askingPrice)}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSpotlightVehicle(v.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            inSpotlight
                              ? "bg-[#000d10] text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {inSpotlight ? "★ In Spotlight" : "+ Add to Spotlight"}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleFeaturedVehicle(v.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            inFeatured
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {inFeatured ? "✓ Featured" : "Mark Featured"}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleNewArrivalVehicle(v.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            inNewArrival
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {inNewArrival ? "✓ New Arrival" : "Mark New Arrival"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Website Hero Headlines & Catalog Display Controls */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-slate-700" />
            <span>Homepage Hero Copy & Inventory Display Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Wordmark
              </label>
              <input
                type="text"
                value={aiSettings.heroWordmark || "Vehisoft"}
                onChange={(e) =>
                  updateAISettings({ heroWordmark: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Statement Line 1
              </label>
              <input
                type="text"
                value={aiSettings.heroHeadlineLine1 || "Beyond"}
                onChange={(e) =>
                  updateAISettings({ heroHeadlineLine1: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Statement Line 2
              </label>
              <input
                type="text"
                value={aiSettings.heroHeadlineLine2 || "Showroom."}
                onChange={(e) =>
                  updateAISettings({ heroHeadlineLine2: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Homepage Cars Before &ldquo;Explore More&rdquo;
              </label>
              <select
                value={aiSettings.homepagePreviewLimit || 6}
                onChange={(e) =>
                  updateAISettings({
                    homepagePreviewLimit: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-white"
              >
                <option value={3}>3 Vehicles</option>
                <option value={6}>6 Vehicles (Recommended)</option>
                <option value={9}>9 Vehicles</option>
                <option value={12}>All Vehicles (12)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Homepage Hero Subtext
            </label>
            <input
              type="text"
              value={
                aiSettings.heroSubtext ||
                "Browse our live QISJ-verified inventory, compare specifications, and consult our 24/7 AI sales specialist anytime."
              }
              onChange={(e) =>
                updateAISettings({ heroSubtext: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECTION 2: AI SALES AGENT CONFIGURATION & KNOWLEDGE SOURCES
          ==================================================================== */}
      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left 8 Columns: Core Configuration Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            {/* Enabled Toggle + Agent Name */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    AI Sales Agent Status
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enable or pause the 24/7 digital salesperson on the public
                    website
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateAISettings({ enabled: !aiSettings.enabled })
                }
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                  aiSettings.enabled
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {aiSettings.enabled ? "ENABLED • ON" : "PAUSED • OFF"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={aiSettings.agentName}
                  onChange={(e) =>
                    updateAISettings({ agentName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Showroom Location
                </label>
                <input
                  type="text"
                  value={aiSettings.location}
                  onChange={(e) =>
                    updateAISettings({ location: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Welcome Message
              </label>
              <textarea
                rows={2}
                value={aiSettings.welcomeMessage}
                onChange={(e) =>
                  updateAISettings({ welcomeMessage: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Description
              </label>
              <textarea
                rows={2}
                value={aiSettings.businessDescription}
                onChange={(e) =>
                  updateAISettings({ businessDescription: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dealership Information & Contacts
              </label>
              <textarea
                rows={2}
                value={aiSettings.dealershipInformation}
                onChange={(e) =>
                  updateAISettings({ dealershipInformation: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={aiSettings.openingHours}
                onChange={(e) =>
                  updateAISettings({ openingHours: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Services Offered
              </label>
              <textarea
                rows={3}
                value={aiSettings.services}
                onChange={(e) => updateAISettings({ services: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Financing Information
                </label>
                <textarea
                  rows={4}
                  value={aiSettings.financingInformation}
                  onChange={(e) =>
                    updateAISettings({ financingInformation: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trade-In Information
                </label>
                <textarea
                  rows={4}
                  value={aiSettings.tradeInInformation}
                  onChange={(e) =>
                    updateAISettings({ tradeInInformation: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Escalation & Human Handoff Rules</span>
              </label>
              <textarea
                rows={2}
                value={aiSettings.escalationRules}
                onChange={(e) =>
                  updateAISettings({ escalationRules: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#000d10] hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Website & AI Configuration</span>
              </button>
            </div>
          </div>

          {/* Approved FAQs Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Approved Dealership FAQs ({aiSettings.faqs.length})
            </h2>
            <div className="space-y-3">
              {aiSettings.faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Q: {faq.question}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      A: {faq.answer}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <p className="text-xs font-bold text-slate-700">
                Add New Approved FAQ
              </p>
              <input
                type="text"
                placeholder="Question (e.g. Do you deliver outside Nairobi?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                placeholder="Approved Answer..."
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-4 py-2 rounded-full bg-[#000d10] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Controlled Knowledge Sources */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Knowledge Sources
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Control which live dealership records{" "}
              <strong>{aiSettings.agentName}</strong> is authorized to read when
              answering customer inquiries.
            </p>

            <div className="space-y-2.5 pt-2">
              {(
                [
                  {
                    key: "vehicleInventory",
                    label: "Vehicle Inventory (Live Stock, Prices, Specs)",
                  },
                  {
                    key: "dealershipInformation",
                    label: "Dealership Information",
                  },
                  { key: "services", label: "Services & Financing" },
                  { key: "faqs", label: "Approved FAQs" },
                  { key: "policies", label: "Trade-In & Reservation Policies" },
                  { key: "operatingHours", label: "Operating Hours & Branches" },
                  {
                    key: "salesTeam",
                    label: "Sales Team & Human Handoff Routing",
                  },
                ] as const
              ).map((item) => {
                const checked = aiSettings.knowledgeSources[item.key];
                return (
                  <label
                    key={item.key}
                    onClick={() => toggleKnowledgeSource(item.key)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      checked
                        ? "bg-blue-50/60 border-blue-200 text-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs ${
                        checked ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Anti-Hallucination Policy Card */}
          <div className="bg-[#000d10] text-white rounded-2xl p-6 space-y-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300">
              Strict Data Grounding Active
            </span>
            <h3 className="text-sm font-extrabold">
              Zero-Hallucination Guardrail
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a customer asks for details not present in the vehicle
              record, {aiSettings.agentName} automatically responds:
            </p>
            <blockquote className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs italic text-blue-200">
              &ldquo;I don&apos;t have that information in our current vehicle
              records. I can have a salesperson confirm it for you.&rdquo;
            </blockquote>
          </div>
        </div>
      </form>
    </div>
  );
}
