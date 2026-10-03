import {
  VehicleStatusType,
  CustomerTypeEnum,
  PipelineStageType,
} from "./demo-store";

export const STATUS_BADGE_STYLES: Record<VehicleStatusType, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RESERVED: "bg-amber-100 text-amber-800 border-amber-200",
  SOLD: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING_ACQUISITION: "bg-purple-100 text-purple-800 border-purple-200",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  ARCHIVED: "bg-slate-200 text-slate-600 border-slate-300",
};

export const STATUS_LABELS: Record<VehicleStatusType, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
  PENDING_ACQUISITION: "Pending Acquisition",
  IN_TRANSIT: "In Transit",
  ARCHIVED: "Archived",
};

export const CUSTOMER_TYPE_BADGE: Record<CustomerTypeEnum, string> = {
  INDIVIDUAL: "bg-blue-50 text-blue-700 border-blue-200",
  COMPANY: "bg-purple-50 text-purple-700 border-purple-200",
  DEALER: "bg-amber-50 text-amber-800 border-amber-200",
  FLEET: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export const CUSTOMER_TYPE_LABEL: Record<CustomerTypeEnum, string> = {
  INDIVIDUAL: "Individual",
  COMPANY: "Company",
  DEALER: "Dealer",
  FLEET: "Fleet Customer",
};

export const STAGE_BADGE_STYLE: Record<PipelineStageType, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-indigo-100 text-indigo-700",
  VIEWING: "bg-purple-100 text-purple-700",
  TEST_DRIVE: "bg-amber-100 text-amber-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  RESERVED: "bg-emerald-100 text-emerald-800",
  SOLD: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-700",
};
