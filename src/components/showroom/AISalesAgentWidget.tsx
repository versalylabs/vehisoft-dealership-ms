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
import { useAuth } from "@/context/AuthContext";
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
  const { isAuthenticated } = useAuth();

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
      {/* Floating Launcher Pill Button when closed (Origin Pill Style) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 origin-btn-primary !rounded-full !px-5 !py-3.5 !bg-white !text-black shadow-2xl hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-[#847dff]" />
          <span className="font-sans font-medium text-[14px]">{aiSettings.agentName}® 24/7 AI</span>
        </button>
      )}

      {/* AI Sales Consultant Panel (Origin Dark Room Styling) */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[440px] h-[640px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] bg-[#0f1011] text-white border border-white/20 rounded-[16px] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div
            className={`px-4 sm:px-5 py-3.5 text-white shrink-0 border-b border-white/10 ${
              channel === "WHATSAPP" ? "bg-[#131d27]" : "bg-[#090a0b]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-serif text-[18px] text-white font-normal">
                    {aiSettings.agentName}®
                  </h3>
                  <span className="origin-mono-label !text-[10px] text-[#00b3dd] px-2 py-0.5 rounded-full bg-white/10">
                    24/7 CONCIERGE
                  </span>
                </div>
                <p className="text-[12px] text-[#9f9fa0] mt-0.5 truncate font-sans">
                  Connected to Live Showroom Inventory & CRM
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#9f9fa0] hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close AI Sales Agent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Switcher */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setChannel("WEBSITE")}
                  className={`rounded-full px-3 py-1 text-[12px] font-sans transition-colors cursor-pointer flex items-center gap-1.5 ${
                    channel === "WEBSITE"
                      ? "bg-white text-black font-medium"
                      : "border border-white/20 text-[#9f9fa0] hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("WHATSAPP")}
                  className={`rounded-full px-3 py-1 text-[12px] font-sans transition-colors cursor-pointer flex items-center gap-1.5 ${
                    channel === "WHATSAPP"
                      ? "bg-white text-black font-medium"
                      : "border border-white/20 text-[#9f9fa0] hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>WhatsApp AI</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowQuickLeadForm((v) => !v)}
                className="text-[12px] font-sans text-[#847dff] hover:underline cursor-pointer"
              >
                {customerPhone ? `✓ ${customerName}` : "+ Share Contact"}
              </button>
            </div>
          </div>

          {/* Active Vehicle Context Bar */}
          {focusedVehicle && (
            <div className="px-4 py-2.5 bg-[#131d27] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-[#00b3dd] shrink-0" />
                <span className="text-[13px] font-medium text-white truncate">
                  {focusedVehicle.year} {focusedVehicle.make}{" "}
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
                className="origin-btn-primary !py-1 !px-2.5 !text-[11px] shrink-0 cursor-pointer"
              >
                Book Viewing
              </button>
            </div>
          )}

          {/* Live CRM Sync Status Banner */}
          {statusBanner && (
            <div className="px-4 py-2 bg-[#847dff] text-white flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[12px] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusBanner}</span>
              </div>
              {isAuthenticated && (
                <Link
                  href="/ai-conversations"
                  className="text-[12px] font-medium text-white underline shrink-0"
                >
                  View CRM →
                </Link>
              )}
            </div>
          )}

          {/* Quick Contact Capture Form Drawer */}
          {showQuickLeadForm && (
            <form
              onSubmit={handleQuickLeadSubmit}
              className="p-5 bg-[#2e2e2e] border-b border-white/10 space-y-3 shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-white">
                  Leave your details for our sales team
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickLeadForm(false)}
                  className="text-[13px] text-[#9f9fa0] hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={leadFormName}
                  onChange={(e) => setLeadFormName(e.target.value)}
                  className="p-2 text-[14px] bg-[#0f1011] border border-white/15 text-white rounded-[6px] focus:outline-none focus:border-[#847dff]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={leadFormPhone}
                  onChange={(e) => setLeadFormPhone(e.target.value)}
                  className="p-2 text-[14px] bg-[#0f1011] border border-white/15 text-white rounded-[6px] focus:outline-none focus:border-[#847dff]"
                />
              </div>
              <button type="submit" className="origin-btn-primary w-full !py-2 !text-[13px]">
                Connect with Sales & Save to CRM
              </button>
            </form>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#090a0b]">
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
                    className={`max-w-[92%] p-3.5 text-[14px] leading-relaxed rounded-[10px] ${
                      isCustomer
                        ? "bg-[#3f4041] text-white"
                        : "bg-[#2e2e2e] text-white border border-white/10"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action Badge if CRM Lead / Test Drive / Handoff occurred */}
                    {msg.actionTaken && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 text-[12px] font-mono text-[#00b3dd]">
                        {msg.actionTaken === "LEAD_CREATED" && (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Lead automatically created in Dealership CRM</span>
                          </>
                        )}
                        {msg.actionTaken === "TEST_DRIVE_BOOKED" && (
                          <>
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Test Drive logged in CRM schedule</span>
                          </>
                        )}
                        {msg.actionTaken === "HANDOFF_TRIGGERED" && (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>AI → Human Handoff · Stage: Negotiation</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline Recommended Vehicle Cards */}
                  {recommendedVehicles.length > 0 && (
                    <div className="mt-3 w-full space-y-2">
                      {recommendedVehicles.map((veh) => {
                        if (!veh) return null;
                        return (
                          <div
                            key={veh.id}
                            className="bg-[#0f1011] border border-white/10 rounded-[8px] p-3 flex items-center gap-3"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={veh.imageUrl}
                              alt={`${veh.make} ${veh.model}`}
                              className="w-16 h-12 object-cover shrink-0 rounded-[4px] bg-[#090a0b]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-[14px] text-white truncate">
                                {veh.year} {veh.make} {veh.model}
                              </p>
                              <p className="font-mono text-[13px] text-[#00b3dd]">
                                {formatKSh(veh.askingPrice)}
                              </p>
                              <p className="text-[11px] text-[#9f9fa0] font-sans">
                                {veh.mileage.toLocaleString()} km · {veh.transmission}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1.5 shrink-0">
                              {onSelectVehicle ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectVehicle(veh.id)}
                                  className="origin-btn-primary !py-1 !px-2.5 !text-[11px]"
                                >
                                  <span>Details</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <Link
                                  href={`/showroom/vehicles/${veh.id}`}
                                  className="origin-btn-primary !py-1 !px-2.5 !text-[11px]"
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
                                className="origin-btn-ghost !py-1 !px-2.5 !text-[11px]"
                              >
                                Enquire
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Reply Suggestion Pills */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => handleSendMessage(qr)}
                          className="rounded-full border border-white/20 bg-white/5 hover:bg-white text-[#9f9fa0] hover:text-black px-3 py-1 text-[12px] font-sans transition-colors cursor-pointer"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-[#9f9fa0] mt-1">
                    {isCustomer ? "You" : aiSettings.agentName} · {msg.timestamp}
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
            className="p-3 bg-[#0f1011] border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stock, budget, or viewing..."
              className="flex-1 text-[14px] px-3.5 py-2 bg-[#000000] border border-white/15 rounded-[8px] text-white placeholder-[#9f9fa0] focus:outline-none focus:border-[#847dff]"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-white hover:opacity-90 text-black flex items-center justify-center shrink-0 transition-opacity cursor-pointer"
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

