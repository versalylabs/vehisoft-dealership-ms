"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Kanban,
  List,
  Plus,
  ChevronRight,
  ChevronLeft,
  User,
  Clock,
  Car,
  CheckCircle2,
} from "lucide-react";
import { useDealership } from "@/context/DealershipContext";
import { useAuth } from "@/context/AuthContext";
import { formatCompactKSh, formatRelativeDate } from "@/lib/format";
import { PipelineStageType } from "@/lib/demo-store";

const PIPELINE_COLUMNS: {
  stage: PipelineStageType;
  label: string;
  headerColor: string;
  dotColor: string;
}[] = [
  {
    stage: "NEW",
    label: "New",
    headerColor: "border-t-slate-400",
    dotColor: "bg-slate-400",
  },
  {
    stage: "CONTACTED",
    label: "Contacted",
    headerColor: "border-t-blue-500",
    dotColor: "bg-blue-500",
  },
  {
    stage: "QUALIFIED",
    label: "Qualified",
    headerColor: "border-t-indigo-500",
    dotColor: "bg-indigo-500",
  },
  {
    stage: "VIEWING",
    label: "Viewing",
    headerColor: "border-t-purple-500",
    dotColor: "bg-purple-500",
  },
  {
    stage: "TEST_DRIVE",
    label: "Test Drive",
    headerColor: "border-t-amber-500",
    dotColor: "bg-amber-500",
  },
  {
    stage: "NEGOTIATION",
    label: "Negotiation",
    headerColor: "border-t-orange-500",
    dotColor: "bg-orange-500",
  },
  {
    stage: "RESERVED",
    label: "Reserved",
    headerColor: "border-t-emerald-500",
    dotColor: "bg-emerald-500",
  },
  {
    stage: "SOLD",
    label: "Sold",
    headerColor: "border-t-green-600",
    dotColor: "bg-green-600",
  },
  {
    stage: "LOST",
    label: "Lost",
    headerColor: "border-t-red-500",
    dotColor: "bg-red-500",
  },
];

const ORDERED_STAGES: PipelineStageType[] = PIPELINE_COLUMNS.map(
  (c) => c.stage
);

export default function SalesPipelinePage() {
  const { leads, updateLeadStage } = useDealership();
  const { user, users } = useAuth();

  const [salespersonFilter, setSalespersonFilter] = useState("ALL");
  const [toast, setToast] = useState("");

  const salespeople = users.filter(
    (u) => u.role === "SALESPERSON" || u.role === "MANAGER"
  );

  const filteredLeads = leads.filter(
    (l) =>
      salespersonFilter === "ALL" ||
      l.assignedSalespersonId === salespersonFilter
  );

  const moveStage = (leadId: string, nextStage: PipelineStageType) => {
    updateLeadStage(leadId, nextStage, user.name);
    setToast(`Lead moved to ${nextStage.replace("_", " ")} stage.`);
    setTimeout(() => setToast(""), 3000);
  };

  const totalPipelineValue = filteredLeads
    .filter((l) => l.stage !== "LOST" && l.stage !== "SOLD")
    .reduce((sum, l) => sum + l.askingPrice, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales Pipeline Board
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track deals across stages: New → Contacted → Qualified → Viewing →
            Test Drive → Negotiation → Reserved → Sold / Lost
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {toast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          <select
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-semibold text-slate-700"
          >
            <option value="ALL">All Salespeople</option>
            {salespeople.map((sp) => (
              <option key={sp.id} value={sp.id}>
                Assigned: {sp.name.split(" ")[0]}
              </option>
            ))}
          </select>

          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <List className="w-4 h-4" />
            <span>Leads List &amp; Add Enquiry</span>
          </Link>
        </div>
      </div>

      {/* Pipeline Value Summary Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Active Pipeline Deals
            </span>
            <span className="text-lg font-bold">
              {
                filteredLeads.filter(
                  (l) => l.stage !== "SOLD" && l.stage !== "LOST"
                ).length
              }{" "}
              Active Leads
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Active Pipeline Value (KSh.)
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {formatCompactKSh(totalPipelineValue)}
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-400">
          Tip: Advancing a lead to <strong className="text-white">Reserved</strong>{" "}
          automatically updates the vehicle status to Reserved.
        </span>
      </div>

      {/* Horizontal Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.stage === col.stage);
          const colValue = colLeads.reduce((s, l) => s + l.askingPrice, 0);

          return (
            <div
              key={col.stage}
              className={`w-72 shrink-0 bg-slate-100/90 rounded-xl border border-slate-200 border-t-4 ${col.headerColor} flex flex-col max-h-[680px]`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/80 bg-white/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {col.label}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                    {colLeads.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {formatCompactKSh(colValue)}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {colLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No deals in {col.label}
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const currentIdx = ORDERED_STAGES.indexOf(lead.stage);
                    const prevStage =
                      currentIdx > 0 ? ORDERED_STAGES[currentIdx - 1] : null;
                    const nextStage =
                      currentIdx < ORDERED_STAGES.length - 2
                        ? ORDERED_STAGES[currentIdx + 1]
                        : null;

                    return (
                      <div
                        key={lead.id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:border-blue-400 transition-all space-y-2.5"
                      >
                        {/* Exact Lead Card Spec from Section 4 */}
                        <div>
                          <Link
                            href={`/customers/${lead.customerId}`}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 block"
                          >
                            {lead.customerName}
                          </Link>
                          <Link
                            href={`/inventory/${lead.vehicleId}`}
                            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Car className="w-3.5 h-3.5" />
                            <span>{lead.vehicleTitle}</span>
                          </Link>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-extrabold text-emerald-700">
                            {formatCompactKSh(lead.askingPrice)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {lead.source.replace("_", " ")}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                          <p className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              Assigned:
                            </span>
                            <strong className="text-slate-800">
                              {lead.assignedSalespersonName.split(" ")[0]}
                            </strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Last contact:
                            </span>
                            <strong className="text-slate-700">
                              {formatRelativeDate(lead.lastContactAt)}
                            </strong>
                          </p>
                        </div>

                        {lead.notes && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}

                        {/* Quick Stage Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {prevStage ? (
                            <button
                              type="button"
                              onClick={() => moveStage(lead.id, prevStage)}
                              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center gap-0.5"
                              title={`Move back to ${prevStage}`}
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span>Back</span>
                            </button>
                          ) : (
                            <span />
                          )}

                          <select
                            value={lead.stage}
                            onChange={(e) =>
                              moveStage(
                                lead.id,
                                e.target.value as PipelineStageType
                              )
                            }
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700"
                          >
                            {PIPELINE_COLUMNS.map((c) => (
                              <option key={c.stage} value={c.stage}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          {nextStage ? (
                            <button
                              type="button"
                              onClick={() => moveStage(lead.id, nextStage)}
                              className="p-1.5 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                              title={`Advance to ${nextStage}`}
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
