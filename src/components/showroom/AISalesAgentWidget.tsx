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
      {/* Floating Launcher Pill Button when closed (1000px radius, #000d10 bg, #ffffff text) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-50 hyer-pill-dark !px-[23px] !py-[16px]"
        >
          <Bot className="w-5 h-5 stroke-[2]" />
          <span>{aiSettings.agentName}® 24/7 AI</span>
        </button>
      )}

      {/* AI Sales Consultant Panel (0px radius, #000d10 border, no shadow) */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[640px] max-h-[calc(100vh-3rem)] bg-[#ffffff] border border-[#000d10] flex flex-col overflow-hidden">
          {/* Header (#000d10 Deep Ink or #151623 Charcoal Deck) */}
          <div
            className={`px-[22px] py-[17px] text-[#ffffff] shrink-0 ${
              channel === "WHATSAPP" ? "bg-[#151623]" : "bg-[#000d10]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-[11px]">
                  <h3 className="text-[20px] font-bold leading-none text-[#ffffff]">
                    {aiSettings.agentName}®
                  </h3>
                  <span className="rounded-full border border-[#ffffff]/40 px-[11px] py-[4px] text-[12px] font-bold text-[#ffffff]">
                    24/7 AI Concierge
                  </span>
                </div>
                <p className="text-[14px] text-[#8e8e95] mt-[6px]">
                  Connected to Live Showroom Inventory & CRM
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#8e8e95] hover:text-[#ffffff] transition-colors cursor-pointer"
                aria-label="Close AI Sales Agent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Switcher (1000px Pill Buttons) */}
            <div className="mt-[15px] pt-[13px] border-t border-[#d5d3d4]/20 flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() => setChannel("WEBSITE")}
                  className={`rounded-full px-[13px] py-[6px] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    channel === "WEBSITE"
                      ? "bg-[#ffffff] text-[#000d10]"
                      : "border border-[#d5d3d4]/30 text-[#8e8e95] hover:text-[#ffffff]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("WHATSAPP")}
                  className={`rounded-full px-[13px] py-[6px] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    channel === "WHATSAPP"
                      ? "bg-[#ffffff] text-[#000d10]"
                      : "border border-[#d5d3d4]/30 text-[#8e8e95] hover:text-[#ffffff]"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>WhatsApp AI</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowQuickLeadForm((v) => !v)}
                className="text-[13px] font-bold text-[#ffffff] underline underline-offset-2 cursor-pointer"
              >
                {customerPhone ? `✓ ${customerName}` : "+ Share Contact"}
              </button>
            </div>
          </div>

          {/* Active Vehicle Context Bar */}
          {focusedVehicle && (
            <div className="px-[22px] py-[11px] bg-[#ffffff] border-b border-[#d5d3d4] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-[#000d10] shrink-0" />
                <span className="text-[14px] font-bold text-[#000d10] truncate">
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
                className="rounded-full bg-[#000d10] text-[#ffffff] px-[13px] py-[6px] text-[12px] font-bold shrink-0 cursor-pointer"
              >
                Book Viewing
              </button>
            </div>
          )}

          {/* Live CRM Sync Status Banner */}
          {statusBanner && (
            <div className="px-[22px] py-[11px] bg-[#bc7155] text-[#ffffff] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[13px] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusBanner}</span>
              </div>
              <Link
                href="/ai-conversations"
                className="text-[12px] font-bold text-[#ffffff] underline shrink-0"
              >
                View in CRM →
              </Link>
            </div>
          )}

          {/* Quick Contact Capture Form Drawer */}
          {showQuickLeadForm && (
            <form
              onSubmit={handleQuickLeadSubmit}
              className="p-[22px] bg-[#ffffff] border-b border-[#d5d3d4] space-y-[13px] shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#000d10]">
                  Leave your details for our sales team
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickLeadForm(false)}
                  className="text-[14px] text-[#8e8e95] hover:text-[#000d10]"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-[13px]">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={leadFormName}
                  onChange={(e) => setLeadFormName(e.target.value)}
                  className="pb-[8px] text-[15px] border-b border-[#000d10] bg-transparent text-[#000d10] focus:outline-none rounded-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={leadFormPhone}
                  onChange={(e) => setLeadFormPhone(e.target.value)}
                  className="pb-[8px] text-[15px] border-b border-[#000d10] bg-transparent text-[#000d10] focus:outline-none rounded-none"
                />
              </div>
              <button type="submit" className="hyer-pill-dark w-full !py-[11px]">
                Connect with Sales & Save to CRM
              </button>
            </form>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-[22px] space-y-[21px] bg-[#ffffff]">
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
                    className={`max-w-[90%] p-[16px] text-[16px] leading-[24px] ${
                      isCustomer
                        ? "bg-[#000d10] text-[#ffffff]"
                        : "bg-[#ffffff] text-[#000d10] border border-[#d5d3d4]"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action Badge if CRM Lead / Test Drive / Handoff occurred */}
                    {msg.actionTaken && (
                      <div className="mt-[13px] pt-[11px] border-t border-[#d5d3d4] flex items-center gap-2 text-[13px] font-bold text-[#000d10]">
                        {msg.actionTaken === "LEAD_CREATED" && (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Lead automatically created in Dealership CRM</span>
                          </>
                        )}
                        {msg.actionTaken === "TEST_DRIVE_BOOKED" && (
                          <>
                            <CalendarCheck className="w-4 h-4" />
                            <span>Test Drive logged in CRM schedule</span>
                          </>
                        )}
                        {msg.actionTaken === "HANDOFF_TRIGGERED" && (
                          <>
                            <ShieldAlert className="w-4 h-4" />
                            <span>AI → Human Handoff · Stage: Negotiation</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline Recommended Vehicle Cards (0px radius, hairline border) */}
                  {recommendedVehicles.length > 0 && (
                    <div className="mt-[13px] w-full space-y-[11px]">
                      {recommendedVehicles.map((veh) => {
                        if (!veh) return null;
                        return (
                          <div
                            key={veh.id}
                            className="bg-[#ffffff] border border-[#d5d3d4] p-[13px] flex items-center gap-[13px]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={veh.imageUrl}
                              alt={`${veh.make} ${veh.model}`}
                              className="w-16 h-12 object-cover shrink-0 bg-[#f3eee5]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-bold text-[#000d10] truncate">
                                {veh.year} {veh.make} {veh.model}
                              </p>
                              <p className="text-[14px] font-bold text-[#000d10]">
                                {formatKSh(veh.askingPrice)}
                              </p>
                              <p className="text-[13px] text-[#8e8e95]">
                                {veh.mileage.toLocaleString()} km ·{" "}
                                {veh.transmission}
                              </p>
                            </div>
                            <div className="flex flex-col gap-[6px] shrink-0">
                              {onSelectVehicle ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectVehicle(veh.id)}
                                  className="rounded-full bg-[#000d10] text-[#ffffff] px-[13px] py-[6px] text-[12px] font-bold flex items-center gap-1"
                                >
                                  <span>Details</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <Link
                                  href={`/showroom/vehicles/${veh.id}`}
                                  className="rounded-full bg-[#000d10] text-[#ffffff] px-[13px] py-[6px] text-[12px] font-bold flex items-center gap-1"
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
                                className="rounded-full border border-[#000d10] text-[#000d10] px-[13px] py-[5px] text-[12px] font-bold"
                              >
                                Enquire
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Reply Suggestion Pills (1000px radius) */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-[11px] flex flex-wrap gap-[8px]">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => handleSendMessage(qr)}
                          className="rounded-full border border-[#000d10] bg-[#ffffff] hover:bg-[#000d10] text-[#000d10] hover:text-[#ffffff] px-[15px] py-[8px] text-[13px] font-bold transition-colors cursor-pointer"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[12px] text-[#8e8e95] mt-[6px]">
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
            className="p-[16px] bg-[#ffffff] border-t border-[#d5d3d4] flex items-center gap-[11px] shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stock, budget, sunroof, or viewing..."
              className="flex-1 text-[16px] pb-[8px] border-b border-[#000d10] bg-transparent text-[#000d10] focus:outline-none rounded-none"
            />
            <button
              type="submit"
              className="hyer-circle-btn !w-10 !h-10 shrink-0"
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

