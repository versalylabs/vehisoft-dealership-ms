"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";

export default function AIAgentSettingsPage() {
  const { aiSettings, updateAISettings } = useDealership();
  const [savedBanner, setSavedBanner] = useState(false);

  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Dealership AI Sales Consultant Controls
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            AI Agent Settings ({aiSettings.agentName})
          </h1>
          <p className="text-sm text-slate-500">
            Configure your 24/7 digital salesperson, approved business
            knowledge, escalation rules, and connected data sources.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/ai-conversations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>View AI Conversations</span>
          </Link>
          <Link
            href="/showroom"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test on Public Website</span>
          </Link>
        </div>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>
            AI Agent settings saved! Changes are immediately active on the
            Public Dealership Website and WhatsApp AI.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left 8 Columns: Core Configuration Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
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
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save AI Agent Configuration</span>
              </button>
            </div>
          </div>

          {/* Approved FAQs Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
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
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Controlled Knowledge Sources */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
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
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
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
