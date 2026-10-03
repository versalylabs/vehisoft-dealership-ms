"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Phone,
  Mail,
  Car,
  ShieldAlert,
  CheckCircle2,
  Send,
  Globe,
  Smartphone,
  ExternalLink,
  Sparkles,
  UserCheck,
  CalendarCheck,
  Settings,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { formatKSh } from "@/lib/format";

export default function AIConversationsAdminPage() {
  const {
    aiConversations,
    aiSettings,
    vehicles,
    sendStaffReplyToConversation,
  } = useDealership();
  const { user } = useAuth();

  const [selectedId, setSelectedId] = useState<string>(
    aiConversations[0]?.id || ""
  );
  const [filterChannel, setFilterChannel] = useState<
    "ALL" | "WEBSITE" | "WHATSAPP"
  >("ALL");
  const [staffReply, setStaffReply] = useState("");

  const filteredList = aiConversations.filter((c) =>
    filterChannel === "ALL" ? true : c.channel === filterChannel
  );

  const activeConv =
    aiConversations.find((c) => c.id === selectedId) || filteredList[0];

  const linkedVehicle = activeConv?.vehicleId
    ? vehicles.find((v) => v.id === activeConv.vehicleId)
    : undefined;

  const handleStaffSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !staffReply.trim()) return;
    sendStaffReplyToConversation(activeConv.id, staffReply.trim(), user.name);
    setStaffReply("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              24/7 AI Sales Agent ({aiSettings.agentName})
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Website & WhatsApp Unified
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            AI Sales Conversations & Handoffs
          </h1>
          <p className="text-sm text-slate-500">
            Inspect every customer conversation handled by{" "}
            <strong>{aiSettings.agentName}</strong>, review captured leads, and
            take over human handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/showroom"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Website</span>
          </Link>
          <Link
            href="/ai-settings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Agent Settings</span>
          </Link>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conversation List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[680px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">
                Customer Conversations ({filteredList.length})
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
              {(["ALL", "WEBSITE", "WHATSAPP"] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setFilterChannel(ch)}
                  className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                    filterChannel === ch
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {ch === "ALL"
                    ? "All"
                    : ch === "WEBSITE"
                    ? "Website"
                    : "WhatsApp"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredList.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/70 border-l-4 border-blue-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{conv.customerName}</span>
                      {conv.channel === "WHATSAPP" ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <Smartphone className="w-2.5 h-2.5" />
                          WA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                          <Globe className="w-2.5 h-2.5" />
                          Web
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {conv.updatedAt}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mt-1 truncate">
                    {conv.vehicleTitle || "General Showroom Inquiry"}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        conv.status === "HANDED_OFF"
                          ? "bg-amber-100 text-amber-800"
                          : conv.status === "TEST_DRIVE_BOOKED"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {conv.leadTag}
                    </span>
                    {conv.leadStage && (
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                        Stage: {conv.leadStage}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center/Right Column: Full Transcript + Lead & Handoff Inspector */}
        {activeConv && (
          <div className="lg:col-span-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Chat Transcript */}
            <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col h-[680px] overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{activeConv.customerName}</h3>
                  <p className="text-xs text-slate-300">
                    {activeConv.vehicleTitle} • {activeConv.channel} AI Session
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300">
                  {activeConv.leadTag}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {activeConv.messages.map((msg) => {
                  const isCustomer = msg.sender === "CUSTOMER";
                  const isStaff = msg.sender === "STAFF";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isCustomer ? "items-start" : "items-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                          isCustomer
                            ? "bg-white text-slate-900 border border-slate-200 rounded-tl-none"
                            : isStaff
                            ? "bg-emerald-700 text-white rounded-tr-none"
                            : "bg-blue-600 text-white rounded-tr-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-80 font-bold">
                          <span>
                            {isCustomer
                              ? activeConv.customerName
                              : isStaff
                              ? `${msg.senderName} (Sales Staff)`
                              : `${aiSettings.agentName} (AI Agent)`}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Human Salesperson Takeover Reply Box */}
              <form
                onSubmit={handleStaffSend}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={staffReply}
                  onChange={(e) => setStaffReply(e.target.value)}
                  placeholder={`Reply as ${user.name} (Human Sales Takeover)...`}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Staff Reply</span>
                </button>
              </form>
            </div>

            {/* Right Metadata Panel: Customer, Vehicle, Lead Status & Handoff History */}
            <div className="xl:col-span-5 space-y-4">
              {/* Customer Contact Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Captured Buyer Profile
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Customer Name:</span>
                    <span className="font-bold text-slate-900">
                      {activeConv.customerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-bold text-blue-600">
                      {activeConv.customerPhone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Source Channel:</span>
                    <span className="font-bold text-slate-800">
                      {activeConv.channel} AI Agent
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">CRM Pipeline Stage:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {activeConv.leadStage || "NEW"}
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Link
                    href="/pipeline"
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold text-center transition-colors"
                  >
                    View in Sales Pipeline
                  </Link>
                </div>
              </div>

              {/* Vehicle of Interest */}
              {linkedVehicle && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Vehicle of Interest
                  </h3>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={linkedVehicle.imageUrl}
                      alt={linkedVehicle.model}
                      className="w-16 h-12 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {linkedVehicle.year} {linkedVehicle.make}{" "}
                        {linkedVehicle.model}
                      </p>
                      <p className="text-xs font-extrabold text-blue-600">
                        {formatKSh(linkedVehicle.askingPrice)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Stock #{linkedVehicle.stockNumber} •{" "}
                        {linkedVehicle.status}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/inventory/${linkedVehicle.id}`}
                    className="block w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
                  >
                    Open Vehicle Record →
                  </Link>
                </div>
              )}

              {/* Handoff History */}
              <div
                className={`rounded-2xl border p-5 space-y-2.5 ${
                  activeConv.handoffReason
                    ? "bg-amber-50/90 border-amber-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    className={`w-4 h-4 ${
                      activeConv.handoffReason
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    AI → Human Handoff History
                  </h3>
                </div>
                {activeConv.handoffReason ? (
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-amber-900">
                      Request: {activeConv.handoffReason}
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      {activeConv.handoffSummary}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-200/70 text-amber-900 font-bold text-[11px]">
                        Lead Stage Updated → NEGOTIATION
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No human escalation triggered yet. {aiSettings.agentName} is
                    handling vehicle Q&A and qualification automatically.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
