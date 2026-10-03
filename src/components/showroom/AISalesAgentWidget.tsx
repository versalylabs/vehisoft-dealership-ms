"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageSquare,
  Phone,
  UserCheck,
  CalendarCheck,
  ArrowUpRight,
  ShieldAlert,
  Car,
  CheckCircle2,
  Smartphone,
  Globe,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import {
  AIMessage,
  AIConversation,
  generateAISalesResponse,
} from "@/lib/ai-sales-agent";
import { formatKSh } from "@/lib/format";

interface AISalesAgentWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  focusedVehicleId?: string;
  initialPrompt?: string;
  onSelectVehicle?: (vehicleId: string) => void;
}

export function AISalesAgentWidget({
  isOpen,
  onClose,
  onOpen,
  focusedVehicleId,
  initialPrompt,
  onSelectVehicle,
}: AISalesAgentWidgetProps) {
  const {
    vehicles,
    aiSettings,
    addCustomer,
    addLead,
    addActivity,
    addTestDrive,
    upsertAIConversation,
  } = useDealership();

  const [channel, setChannel] = useState<"WEBSITE" | "WHATSAPP">("WEBSITE");
  const [sessionId] = useState<string>(() => `ai-live-${Date.now()}`);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [activeVehicleId, setActiveVehicleId] = useState<string | undefined>(
    focusedVehicleId
  );
  const [leadCreatedId, setLeadCreatedId] = useState<string | undefined>(
    undefined
  );
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [showQuickLeadForm, setShowQuickLeadForm] = useState<boolean>(false);
  const [leadFormName, setLeadFormName] = useState<string>("");
  const [leadFormPhone, setLeadFormPhone] = useState<string>("");

  const focusedVehicle = vehicles.find(
    (v) => v.id === (focusedVehicleId || activeVehicleId)
  );

  const [messages, setMessages] = useState<AIMessage[]>(() => [
    {
      id: "welcome-1",
      sender: "AI",
      text: aiSettings.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      quickReplies: [
        "I'm looking for a Toyota around 4M",
        "Recommend a family SUV under 4M",
        "Can I book a viewing tomorrow?",
        "Do you offer bank financing?",
      ],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusedVehicleId) {
      setActiveVehicleId(focusedVehicleId);
    }
  }, [focusedVehicleId]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, showQuickLeadForm]);

  if (!aiSettings.enabled) {
    return null;
  }

  const syncConversationToAdmin = (
    updatedMessages: AIMessage[],
    overrides?: Partial<AIConversation>
  ) => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const veh = vehicles.find((v) => v.id === activeVehicleId);
    const conv: AIConversation = {
      id: sessionId,
      customerName:
        overrides?.customerName || customerName || "Website Visitor (Live)",
      customerPhone:
        overrides?.customerPhone || customerPhone || "Pending Capture",
      channel,
      vehicleId: overrides?.vehicleId || veh?.id,
      vehicleTitle:
        overrides?.vehicleTitle ||
        (veh ? `${veh.year} ${veh.make} ${veh.model}` : "General Stock Inquiry"),
      status: overrides?.status || (leadCreatedId ? "LEAD_CAPTURED" : "ACTIVE"),
      leadTag:
        overrides?.leadTag ||
        (leadCreatedId ? "Interested • Hot Lead" : "Live Website Session"),
      leadId: overrides?.leadId || leadCreatedId,
      leadStage: overrides?.leadStage || "NEW",
      budget: overrides?.budget || veh?.askingPrice,
      handoffReason: overrides?.handoffReason,
      handoffSummary: overrides?.handoffSummary,
      updatedAt: `Today, ${nowStr}`,
      messages: updatedMessages,
    };
    upsertAIConversation(conv);
  };

  const handleSendMessage = (customText?: string) => {
    const raw = (customText ?? input).trim();
    if (!raw) return;
    if (!customText) setInput("");

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: "CUSTOMER",
      text: raw,
      timestamp: nowTime,
    };

    const result = generateAISalesResponse({
      userMessage: raw,
      vehicles,
      settings: aiSettings,
      focusedVehicleId: activeVehicleId || focusedVehicleId,
      knownCustomerName: customerName || undefined,
      knownCustomerPhone: customerPhone || undefined,
    });

    if (result.focusedVehicleId) {
      setActiveVehicleId(result.focusedVehicleId);
    }

    let actionTaken: AIMessage["actionTaken"] = undefined;
    let convOverrides: Partial<AIConversation> = {};
    const todayIso = new Date().toISOString().split("T")[0];

    // 1. Automatic CRM Lead Capture
    if (result.shouldCaptureLead) {
      const {
        customerName: cName,
        customerPhone: cPhone,
        vehicleId: vId,
        budget,
        notes,
      } = result.shouldCaptureLead;
      setCustomerName(cName);
      setCustomerPhone(cPhone);

      const targetVeh =
        vehicles.find((v) => v.id === vId) ||
        vehicles.find((v) => v.status === "AVAILABLE") ||
        vehicles[0];

      const newCust = addCustomer({
        fullName: cName,
        phone: cPhone,
        email: "",
        address: "Nairobi, Kenya",
        location: "Nairobi",
        customerType: "INDIVIDUAL",
        preferredMakes: targetVeh?.make || "Toyota",
        preferredModels: targetVeh?.model || "Any",
        budgetMin: (budget || 3500000) * 0.85,
        budgetMax: budget || 4500000,
        preferredYear: targetVeh?.year || 2020,
        preferredFuel: targetVeh?.fuelType || "Petrol",
        preferredTrans: "Automatic",
        preferredBody: targetVeh?.bodyType || "SUV",
        assignedSalespersonId: "usr-3",
        assignedSalespersonName: "Peter Mwangi",
        pipelineStage: "NEW",
        notes,
      });

      const createdLead = addLead({
        customerId: newCust.id,
        customerName: cName,
        customerPhone: cPhone,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        vehicleStockNo: targetVeh.stockNumber,
        askingPrice: targetVeh.askingPrice,
        source: channel === "WHATSAPP" ? "WHATSAPP" : "WEBSITE",
        assignedSalespersonId: "usr-3",
        assignedSalespersonName: "Peter Mwangi",
        budget: budget || targetVeh.askingPrice,
        expectedPurchaseDate: todayIso,
        stage: "NEW",
        probability: 45,
        nextFollowUpAt: todayIso,
        notes: `[Website AI Sales Agent] ${notes}`,
      });

      addActivity({
        type: "FOLLOW_UP",
        status: "DUE",
        customerId: newCust.id,
        customerName: cName,
        leadId: createdLead.id,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        staffId: "usr-3",
        staffName: "Peter Mwangi",
        scheduledAt: todayIso,
        notes: `AI Sales Agent captured high-intent buyer for ${targetVeh.year} ${targetVeh.make} ${targetVeh.model}.`,
        nextAction: "Call customer to confirm showroom viewing",
      });

      setLeadCreatedId(createdLead.id);
      actionTaken = "LEAD_CREATED";
      setStatusBanner(
        `Lead created in CRM for ${cName} • Assigned to Peter Mwangi`
      );
      convOverrides = {
        customerName: cName,
        customerPhone: cPhone,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        status: "LEAD_CAPTURED",
        leadTag: "Interested • Hot Lead",
        leadId: createdLead.id,
        leadStage: "NEW",
      };
    }

    // 2. Automatic Test-Drive Booking
    if (result.shouldBookTestDrive) {
      const {
        customerName: cName,
        customerPhone: cPhone,
        vehicleId: vId,
        slotLabel,
      } = result.shouldBookTestDrive;
      setCustomerName(cName);
      setCustomerPhone(cPhone);

      const targetVeh =
        vehicles.find((v) => v.id === vId) ||
        vehicles.find((v) => v.status === "AVAILABLE") ||
        vehicles[0];

      const newCust = addCustomer({
        fullName: cName,
        phone: cPhone,
        email: "",
        address: "Nairobi, Kenya",
        location: "Nairobi",
        customerType: "INDIVIDUAL",
        preferredMakes: targetVeh.make,
        preferredModels: targetVeh.model,
        budgetMin: targetVeh.askingPrice * 0.9,
        budgetMax: targetVeh.askingPrice * 1.1,
        preferredYear: targetVeh.year,
        preferredFuel: targetVeh.fuelType,
        preferredTrans: targetVeh.transmission,
        preferredBody: targetVeh.bodyType,
        assignedSalespersonId: "usr-3",
        assignedSalespersonName: "Peter Mwangi",
        pipelineStage: "TEST_DRIVE",
        notes: `Booked viewing via AI Agent (${slotLabel})`,
      });

      const tomorrowDate = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

      addTestDrive({
        customerId: newCust.id,
        customerName: cName,
        customerPhone: cPhone,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        stockNumber: targetVeh.stockNumber,
        salespersonId: "usr-3",
        salespersonName: "Peter Mwangi",
        scheduledAt: tomorrowDate,
        driverName: cName,
        driverLicenseNo: "DL-PENDING-VERIFY",
        mileageOut: targetVeh.mileage,
        status: "SCHEDULED",
        notes: `Booked automatically by ${aiSettings.agentName} AI Agent for ${slotLabel}`,
        outcome: "Scheduled via Website AI",
      });

      actionTaken = "TEST_DRIVE_BOOKED";
      setStatusBanner(
        `Test Drive Scheduled: ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (${slotLabel})`
      );
      convOverrides = {
        customerName: cName,
        customerPhone: cPhone,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        status: "TEST_DRIVE_BOOKED",
        leadTag: "Requested test drive",
        leadStage: "TEST_DRIVE",
      };
    }

    // 3. Human Handoff on Price Negotiation
    if (result.shouldTriggerHandoff) {
      actionTaken = "HANDOFF_TRIGGERED";
      const targetVeh = vehicles.find(
        (v) => v.id === result.shouldTriggerHandoff?.vehicleId
      );
      setStatusBanner(
        "AI → Human Handoff triggered • Sales team notified for price negotiation"
      );
      convOverrides = {
        status: "HANDED_OFF",
        leadTag: "Price Negotiation Handoff",
        leadStage: "NEGOTIATION",
        vehicleId: targetVeh?.id,
        vehicleTitle: targetVeh
          ? `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`
          : undefined,
        handoffReason: result.shouldTriggerHandoff.reason,
        handoffSummary: result.shouldTriggerHandoff.summary,
      };
    }

    const aiMsg: AIMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: "AI",
      text: result.replyText,
      timestamp: nowTime,
      recommendedVehicleIds: result.recommendedVehicleIds,
      actionTaken,
      quickReplies: result.quickReplies,
    };

    const nextMessages = [...messages, userMsg, aiMsg];
    setMessages(nextMessages);
    syncConversationToAdmin(nextMessages, convOverrides);
  };

  const handleQuickLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormName.trim() || !leadFormPhone.trim()) return;
    setShowQuickLeadForm(false);
    handleSendMessage(
      `My name is ${leadFormName.trim()}, ${leadFormPhone.trim()}. I'm interested in ${
        focusedVehicle
          ? `the ${focusedVehicle.year} ${focusedVehicle.make} ${focusedVehicle.model}`
          : "speaking with a salesperson"
      }.`
    );
    setLeadFormName("");
    setLeadFormPhone("");
  };

  return (
    <>
      {/* Floating Launcher Button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 luxury-glass-nav hover:border-amber-400/60 text-white px-5 py-3.5 rounded-2xl shadow-2xl transition-all hover:scale-105 group cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-xl luxury-gold-btn flex items-center justify-center">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#070a12] animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black tracking-wider uppercase text-amber-300">
              {aiSettings.agentName} • 24/7 AI Concierge
            </span>
            <span className="block text-[11px] text-slate-300">
              Ask about stock, prices, financing & test drives
            </span>
          </div>
        </button>
      )}

      {/* AI Sales Consultant Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[640px] max-h-[calc(100vh-3rem)] rb-liquid-glass rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className={`px-4 py-3.5 text-white shrink-0 transition-colors ${
              channel === "WHATSAPP"
                ? "bg-gradient-to-r from-emerald-700 to-teal-700"
                : "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                    channel === "WHATSAPP"
                      ? "bg-emerald-500/20 border border-emerald-400/30"
                      : "bg-blue-600/30 border border-blue-400/30"
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      {aiSettings.agentName}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      24/7 AI Sales Consultant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Connected to Live Showroom Inventory & Dealership CRM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close AI Sales Agent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Switcher (Website AI vs WhatsApp AI Shared Engine) */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChannel("WEBSITE")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    channel === "WEBSITE"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Website AI
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("WHATSAPP")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    channel === "WHATSAPP"
                      ? "bg-emerald-500 text-white shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  WhatsApp AI
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowQuickLeadForm((v) => !v)}
                className="text-[11px] font-semibold text-blue-200 hover:text-white underline underline-offset-2"
              >
                {customerPhone ? `✓ ${customerName}` : "+ Share Contact"}
              </button>
            </div>
          </div>

          {/* Active Vehicle Context Bar (if viewing a specific car) */}
          {focusedVehicle && (
            <div className="px-3.5 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  Discussing: {focusedVehicle.year} {focusedVehicle.make}{" "}
                  {focusedVehicle.model} ({formatKSh(focusedVehicle.askingPrice)})
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Can I come see the ${focusedVehicle.year} ${focusedVehicle.make} ${focusedVehicle.model} tomorrow?`
                  )
                }
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 shrink-0 bg-white px-2 py-0.5 rounded border border-blue-200"
              >
                Book Viewing
              </button>
            </div>
          )}

          {/* Live CRM Sync Status Banner */}
          {statusBanner && (
            <div className="px-3.5 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{statusBanner}</span>
              </div>
              <Link
                href="/ai-conversations"
                className="text-[10px] font-bold text-emerald-700 underline shrink-0"
              >
                View in CRM →
              </Link>
            </div>
          )}

          {/* Quick Contact Capture Form Drawer */}
          {showQuickLeadForm && (
            <form
              onSubmit={handleQuickLeadSubmit}
              className="p-3.5 bg-slate-100 border-b border-slate-200 space-y-2 shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Leave your details for our sales team
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickLeadForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your Name (e.g. John Kamau)"
                  value={leadFormName}
                  onChange={(e) => setLeadFormName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone (e.g. 0722 419 880)"
                  value={leadFormPhone}
                  onChange={(e) => setLeadFormPhone(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Connect with Sales & Save to CRM
              </button>
            </form>
          )}

          {/* Messages Stream */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              channel === "WHATSAPP" ? "bg-[#efeae2]/60" : "bg-slate-50/70"
            }`}
          >
            {messages.map((msg) => {
              const isCustomer = msg.sender === "CUSTOMER";
              const recommendedVehicles = (msg.recommendedVehicleIds || [])
                .map((id) => vehicles.find((v) => v.id === id))
                .filter(Boolean);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isCustomer ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isCustomer
                        ? channel === "WHATSAPP"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action Badge if CRM Lead / Test Drive / Handoff occurred */}
                    {msg.actionTaken && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                        {msg.actionTaken === "LEAD_CREATED" && (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lead automatically created in Dealership CRM</span>
                          </>
                        )}
                        {msg.actionTaken === "TEST_DRIVE_BOOKED" && (
                          <>
                            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-blue-700">
                              Test Drive appointment logged in CRM schedule
                            </span>
                          </>
                        )}
                        {msg.actionTaken === "HANDOFF_TRIGGERED" && (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-amber-700">
                              AI → Human Handoff • Stage: Negotiation
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline Recommended Vehicle Cards */}
                  {recommendedVehicles.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      {recommendedVehicles.map((veh) => {
                        if (!veh) return null;
                        return (
                          <div
                            key={veh.id}
                            className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex items-center gap-3 hover:border-blue-300 transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={veh.imageUrl}
                              alt={`${veh.make} ${veh.model}`}
                              className="w-16 h-12 rounded-lg object-cover shrink-0 bg-slate-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {veh.year} {veh.make} {veh.model}
                              </p>
                              <p className="text-xs font-extrabold text-blue-600">
                                {formatKSh(veh.askingPrice)}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {veh.mileage.toLocaleString()} km •{" "}
                                {veh.transmission} • {veh.location.split(" ")[0]}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              {onSelectVehicle ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectVehicle(veh.id)}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-semibold rounded-md flex items-center gap-1 transition-colors"
                                >
                                  <span>Details</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <Link
                                  href={`/showroom/vehicles/${veh.id}`}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-semibold rounded-md flex items-center gap-1 transition-colors"
                                >
                                  <span>Details</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveVehicleId(veh.id);
                                  handleSendMessage(
                                    `I'm interested in the ${veh.year} ${veh.make} ${veh.model}`
                                  );
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-md transition-colors"
                              >
                                Enquire
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Reply Suggestion Chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => handleSendMessage(qr)}
                          className="text-[11px] font-medium bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 shadow-2xs transition-colors"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {isCustomer ? "You" : aiSettings.agentName} • {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about budget, SUVs, sunroof, financing, or viewing..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
