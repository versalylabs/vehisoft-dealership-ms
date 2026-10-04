"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DemoVehicle,
  DemoSupplier,
  DemoExpense,
  DemoVehicleImage,
  DemoCustomer,
  DemoLead,
  DemoActivity,
  DemoTestDrive,
  DemoReservation,
  DemoSale,
  VehicleStatusType,
  ExpenseCategoryType,
  PipelineStageType,
  ActivityStatusEnum,
  PaymentStatusEnum,
  INITIAL_VEHICLES,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_TEST_DRIVES,
  INITIAL_RESERVATIONS,
  INITIAL_SALES,
} from "@/lib/demo-store";
import { formatKSh } from "@/lib/format";
import {
  AIAgentSettings,
  AIConversation,
  TradeInSubmission,
  INITIAL_AI_SETTINGS,
  INITIAL_AI_CONVERSATIONS,
} from "@/lib/ai-sales-agent";

interface DealershipContextType {
  vehicles: DemoVehicle[];
  suppliers: DemoSupplier[];
  customers: DemoCustomer[];
  leads: DemoLead[];
  activities: DemoActivity[];
  testDrives: DemoTestDrive[];
  reservations: DemoReservation[];
  sales: DemoSale[];
  aiSettings: AIAgentSettings;
  aiConversations: AIConversation[];
  tradeInRequests: TradeInSubmission[];
  addVehicle: (
    data: Omit<DemoVehicle, "id" | "images" | "expenses" | "history">,
    initialExpense?: {
      category: ExpenseCategoryType;
      description: string;
      amount: number;
    },
    staffName?: string
  ) => DemoVehicle;
  updateVehicleStatus: (
    vehicleId: string,
    newStatus: VehicleStatusType,
    staffName: string,
    reason?: string
  ) => void;
  updateVehiclePrice: (
    vehicleId: string,
    newAskingPrice: number,
    newMinimumPrice: number,
    staffName: string
  ) => void;
  addVehicleExpense: (
    vehicleId: string,
    expense: {
      category: ExpenseCategoryType;
      description: string;
      amount: number;
      incurredAt?: string;
    },
    staffName: string
  ) => void;
  addVehicleImage: (
    vehicleId: string,
    image: Omit<DemoVehicleImage, "id">,
    staffName: string
  ) => void;
  addSupplier: (supplier: Omit<DemoSupplier, "id">) => DemoSupplier;
  addCustomer: (
    customer: Omit<DemoCustomer, "id" | "lastInteraction">
  ) => DemoCustomer;
  addLead: (
    lead: Omit<DemoLead, "id" | "lastContactAt">,
    staffName?: string
  ) => DemoLead;
  updateLeadStage: (
    leadId: string,
    newStage: PipelineStageType,
    staffName?: string,
    lostReason?: string
  ) => void;
  addActivity: (activity: Omit<DemoActivity, "id">) => DemoActivity;
  updateActivityStatus: (
    activityId: string,
    status: ActivityStatusEnum
  ) => void;
  addTestDrive: (testDrive: Omit<DemoTestDrive, "id">) => DemoTestDrive;
  completeTestDrive: (
    testDriveId: string,
    mileageIn: number,
    outcome: string
  ) => void;
  cancelTestDrive: (testDriveId: string) => void;
  addReservation: (
    reservation: Omit<DemoReservation, "id" | "isActive">,
    staffName?: string
  ) => DemoReservation;
  releaseReservation: (reservationId: string, staffName?: string) => void;
  expireOverdueReservations: (staffName?: string) => number;
  addSale: (
    saleInput: {
      customerId: string;
      vehicleId: string;
      salespersonId: string;
      salespersonName: string;
      salePrice: number;
      discount: number;
      depositPaid: number;
      paymentMethod: string;
      paymentStatus: PaymentStatusEnum;
      notes: string;
    }
  ) => DemoSale | null;
  markSalePaid: (saleId: string) => void;
  updateAISettings: (patch: Partial<AIAgentSettings>) => void;
  upsertAIConversation: (conv: AIConversation) => void;
  sendStaffReplyToConversation: (
    convId: string,
    text: string,
    staffName: string
  ) => void;
  addTradeInRequest: (
    req: Omit<TradeInSubmission, "id" | "createdAt">
  ) => TradeInSubmission;
}

const DealershipContext = createContext<DealershipContextType | undefined>(
  undefined
);

const STORAGE_VEHICLES_KEY = "vehisoft_vehicles_v2";
const STORAGE_SUPPLIERS_KEY = "vehisoft_suppliers_v2";
const STORAGE_CUSTOMERS_KEY = "vehisoft_customers_v2";
const STORAGE_LEADS_KEY = "vehisoft_leads_v2";
const STORAGE_ACTIVITIES_KEY = "vehisoft_activities_v2";
const STORAGE_TEST_DRIVES_KEY = "vehisoft_test_drives_v2";
const STORAGE_RESERVATIONS_KEY = "vehisoft_reservations_v2";
const STORAGE_SALES_KEY = "vehisoft_sales_v2";
const STORAGE_AI_SETTINGS_KEY = "vehisoft_ai_settings_v2";
const STORAGE_AI_CONVERSATIONS_KEY = "vehisoft_ai_conversations_v2";
const STORAGE_TRADE_INS_KEY = "vehisoft_trade_ins_v2";

const STAGE_PROBABILITY: Record<PipelineStageType, number> = {
  NEW: 10,
  CONTACTED: 20,
  QUALIFIED: 40,
  VIEWING: 55,
  TEST_DRIVE: 70,
  NEGOTIATION: 80,
  RESERVED: 90,
  SOLD: 100,
  LOST: 0,
};

export function DealershipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vehicles, setVehicles] = useState<DemoVehicle[]>(INITIAL_VEHICLES);
  const [suppliers, setSuppliers] =
    useState<DemoSupplier[]>(INITIAL_SUPPLIERS);
  const [customers, setCustomers] =
    useState<DemoCustomer[]>(INITIAL_CUSTOMERS);
  const [leads, setLeads] = useState<DemoLead[]>(INITIAL_LEADS);
  const [activities, setActivities] =
    useState<DemoActivity[]>(INITIAL_ACTIVITIES);
  const [testDrives, setTestDrives] =
    useState<DemoTestDrive[]>(INITIAL_TEST_DRIVES);
  const [reservations, setReservations] = useState<DemoReservation[]>(
    INITIAL_RESERVATIONS
  );
  const [sales, setSales] = useState<DemoSale[]>(INITIAL_SALES);
  const [aiSettings, setAISettings] =
    useState<AIAgentSettings>(INITIAL_AI_SETTINGS);
  const [aiConversations, setAIConversations] = useState<AIConversation[]>(
    INITIAL_AI_CONVERSATIONS
  );
  const [tradeInRequests, setTradeInRequests] = useState<TradeInSubmission[]>(
    []
  );

  useEffect(() => {
    try {
      const savedV = localStorage.getItem(STORAGE_VEHICLES_KEY);
      if (savedV) setVehicles(JSON.parse(savedV));
      const savedS = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
      if (savedS) setSuppliers(JSON.parse(savedS));
      const savedC = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      if (savedC) setCustomers(JSON.parse(savedC));
      const savedL = localStorage.getItem(STORAGE_LEADS_KEY);
      if (savedL) setLeads(JSON.parse(savedL));
      const savedA = localStorage.getItem(STORAGE_ACTIVITIES_KEY);
      if (savedA) setActivities(JSON.parse(savedA));
      const savedTD = localStorage.getItem(STORAGE_TEST_DRIVES_KEY);
      if (savedTD) setTestDrives(JSON.parse(savedTD));
      const savedRes = localStorage.getItem(STORAGE_RESERVATIONS_KEY);
      if (savedRes) setReservations(JSON.parse(savedRes));
      const savedSales = localStorage.getItem(STORAGE_SALES_KEY);
      if (savedSales) setSales(JSON.parse(savedSales));
      const savedAI = localStorage.getItem(STORAGE_AI_SETTINGS_KEY);
      if (savedAI) setAISettings({ ...INITIAL_AI_SETTINGS, ...JSON.parse(savedAI) });
      const savedConvs = localStorage.getItem(STORAGE_AI_CONVERSATIONS_KEY);
      if (savedConvs) setAIConversations(JSON.parse(savedConvs));
      const savedTI = localStorage.getItem(STORAGE_TRADE_INS_KEY);
      if (savedTI) setTradeInRequests(JSON.parse(savedTI));
    } catch {}
  }, []);

  const persistVehicles = (updated: DemoVehicle[]) => {
    setVehicles(updated);
    try {
      localStorage.setItem(STORAGE_VEHICLES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistSuppliers = (updated: DemoSupplier[]) => {
    setSuppliers(updated);
    try {
      localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistCustomers = (updated: DemoCustomer[]) => {
    setCustomers(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistLeads = (updated: DemoLead[]) => {
    setLeads(updated);
    try {
      localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistActivities = (updated: DemoActivity[]) => {
    setActivities(updated);
    try {
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistTestDrives = (updated: DemoTestDrive[]) => {
    setTestDrives(updated);
    try {
      localStorage.setItem(STORAGE_TEST_DRIVES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistReservations = (updated: DemoReservation[]) => {
    setReservations(updated);
    try {
      localStorage.setItem(STORAGE_RESERVATIONS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const persistSales = (updated: DemoSale[]) => {
    setSales(updated);
    try {
      localStorage.setItem(STORAGE_SALES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const addVehicle = (
    data: Omit<DemoVehicle, "id" | "images" | "expenses" | "history">,
    initialExpense?: {
      category: ExpenseCategoryType;
      description: string;
      amount: number;
    },
    staffName = "David Mwangi"
  ): DemoVehicle => {
    const id = `veh-${Date.now()}`;
    const now = new Date().toISOString();

    const expenses: DemoExpense[] = [];
    if (initialExpense && initialExpense.amount > 0) {
      expenses.push({
        id: `exp-${Date.now()}`,
        vehicleId: id,
        category: initialExpense.category,
        description: initialExpense.description,
        amount: initialExpense.amount,
        incurredAt: now,
        loggedByName: staffName,
      });
    }

    const newVehicle: DemoVehicle = {
      ...data,
      id,
      images: [
        {
          id: `img-${Date.now()}`,
          url:
            data.imageUrl ||
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
          category: "EXTERIOR",
          caption: `${data.year} ${data.make} ${data.model} Exterior`,
        },
      ],
      expenses,
      history: [
        {
          id: `hist-${Date.now()}`,
          eventType: "ACQUISITION",
          description: `Vehicle acquired from ${data.supplierName} at purchase cost ${formatKSh(
            data.purchasePrice
          )}`,
          createdByName: staffName,
          createdAt: now,
        },
      ],
    };

    persistVehicles([newVehicle, ...vehicles]);
    return newVehicle;
  };

  const updateVehicleStatus = (
    vehicleId: string,
    newStatus: VehicleStatusType,
    staffName: string,
    reason?: string
  ) => {
    const now = new Date().toISOString();
    const updated = vehicles.map((v) => {
      if (v.id !== vehicleId) return v;
      if (v.status === newStatus) return v;

      return {
        ...v,
        status: newStatus,
        history: [
          {
            id: `hist-${Date.now()}`,
            eventType: "STATUS_CHANGE" as const,
            previousVal: v.status,
            newVal: newStatus,
            description:
              reason ||
              `Vehicle status changed from ${v.status} to ${newStatus}`,
            createdByName: staffName,
            createdAt: now,
          },
          ...v.history,
        ],
      };
    });
    persistVehicles(updated);
  };

  const updateVehiclePrice = (
    vehicleId: string,
    newAskingPrice: number,
    newMinimumPrice: number,
    staffName: string
  ) => {
    const now = new Date().toISOString();
    const updated = vehicles.map((v) => {
      if (v.id !== vehicleId) return v;
      const prev = formatKSh(v.askingPrice);
      const next = formatKSh(newAskingPrice);

      return {
        ...v,
        askingPrice: newAskingPrice,
        minimumPrice: newMinimumPrice,
        history: [
          {
            id: `hist-${Date.now()}`,
            eventType: "PRICE_CHANGE" as const,
            previousVal: prev,
            newVal: next,
            description: `Asking price updated from ${prev} to ${next} (Min price: ${formatKSh(
              newMinimumPrice
            )})`,
            createdByName: staffName,
            createdAt: now,
          },
          ...v.history,
        ],
      };
    });
    persistVehicles(updated);
  };

  const addVehicleExpense = (
    vehicleId: string,
    expense: {
      category: ExpenseCategoryType;
      description: string;
      amount: number;
      incurredAt?: string;
    },
    staffName: string
  ) => {
    const now = expense.incurredAt || new Date().toISOString();
    const updated = vehicles.map((v) => {
      if (v.id !== vehicleId) return v;
      const newExp: DemoExpense = {
        id: `exp-${Date.now()}`,
        vehicleId,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        incurredAt: now,
        loggedByName: staffName,
      };
      return {
        ...v,
        expenses: [newExp, ...v.expenses],
        history: [
          {
            id: `hist-${Date.now() + 1}`,
            eventType: "EXPENSE" as const,
            description: `Logged ${expense.category} cost of ${formatKSh(
              expense.amount
            )}: ${expense.description}`,
            createdByName: staffName,
            createdAt: now,
          },
          ...v.history,
        ],
      };
    });
    persistVehicles(updated);
  };

  const addVehicleImage = (
    vehicleId: string,
    image: Omit<DemoVehicleImage, "id">,
    staffName: string
  ) => {
    const updated = vehicles.map((v) => {
      if (v.id !== vehicleId) return v;
      const createdImg: DemoVehicleImage = {
        ...image,
        id: `img-${Date.now()}`,
      };
      return {
        ...v,
        images: [...v.images, createdImg],
        history: [
          {
            id: `hist-${Date.now()}`,
            eventType: "STATUS_CHANGE" as const,
            description: `Uploaded ${image.category} photo/document: ${image.caption}`,
            createdByName: staffName,
            createdAt: new Date().toISOString(),
          },
          ...v.history,
        ],
      };
    });
    persistVehicles(updated);
  };

  const addSupplier = (supplier: Omit<DemoSupplier, "id">): DemoSupplier => {
    const created: DemoSupplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
    };
    persistSuppliers([created, ...suppliers]);
    return created;
  };

  const addCustomer = (
    customer: Omit<DemoCustomer, "id" | "lastInteraction">
  ): DemoCustomer => {
    const created: DemoCustomer = {
      ...customer,
      id: `cust-${Date.now()}`,
      lastInteraction: new Date().toISOString(),
    };
    persistCustomers([created, ...customers]);
    return created;
  };

  const addLead = (
    lead: Omit<DemoLead, "id" | "lastContactAt">,
    staffName = "Brian Ochieng"
  ): DemoLead => {
    const now = new Date().toISOString();
    const created: DemoLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      lastContactAt: now,
    };
    persistLeads([created, ...leads]);

    persistCustomers(
      customers.map((c) =>
        c.id === lead.customerId
          ? { ...c, pipelineStage: lead.stage, lastInteraction: now }
          : c
      )
    );

    if (lead.vehicleId) {
      const updatedV = vehicles.map((v) =>
        v.id === lead.vehicleId
          ? {
              ...v,
              history: [
                {
                  id: `hist-${Date.now()}`,
                  eventType: "ENQUIRY" as const,
                  description: `New lead created for ${lead.customerName} (${
                    lead.source
                  }) — Budget ${formatKSh(lead.budget)}`,
                  createdByName: staffName,
                  createdAt: now,
                },
                ...v.history,
              ],
            }
          : v
      );
      persistVehicles(updatedV);
    }

    return created;
  };

  const updateLeadStage = (
    leadId: string,
    newStage: PipelineStageType,
    staffName = "Brian Ochieng",
    lostReason?: string
  ) => {
    const now = new Date().toISOString();
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const updatedLeads = leads.map((l) =>
      l.id === leadId
        ? {
            ...l,
            stage: newStage,
            probability: STAGE_PROBABILITY[newStage],
            lastContactAt: now,
            lostReason: lostReason || l.lostReason,
          }
        : l
    );
    persistLeads(updatedLeads);

    persistCustomers(
      customers.map((c) =>
        c.id === targetLead.customerId
          ? { ...c, pipelineStage: newStage, lastInteraction: now }
          : c
      )
    );

    if (targetLead.vehicleId) {
      if (newStage === "RESERVED") {
        updateVehicleStatus(
          targetLead.vehicleId,
          "RESERVED",
          staffName,
          `Reserved via Sales Pipeline for ${targetLead.customerName}`
        );
      } else if (newStage === "SOLD") {
        updateVehicleStatus(
          targetLead.vehicleId,
          "SOLD",
          staffName,
          `Marked Sold via Sales Pipeline to ${targetLead.customerName}`
        );
      }
    }
  };

  const addActivity = (activity: Omit<DemoActivity, "id">): DemoActivity => {
    const now = new Date().toISOString();
    const created: DemoActivity = {
      ...activity,
      id: `act-${Date.now()}`,
    };
    persistActivities([created, ...activities]);

    persistCustomers(
      customers.map((c) =>
        c.id === activity.customerId ? { ...c, lastInteraction: now } : c
      )
    );

    if (activity.leadId) {
      persistLeads(
        leads.map((l) =>
          l.id === activity.leadId ? { ...l, lastContactAt: now } : l
        )
      );
    }

    return created;
  };

  const updateActivityStatus = (
    activityId: string,
    status: ActivityStatusEnum
  ) => {
    const updated = activities.map((a) =>
      a.id === activityId ? { ...a, status } : a
    );
    persistActivities(updated);
  };

  // =========================================================================
  // 6. TEST DRIVES
  // =========================================================================

  const addTestDrive = (
    testDrive: Omit<DemoTestDrive, "id">
  ): DemoTestDrive => {
    const created: DemoTestDrive = {
      ...testDrive,
      id: `td-${Date.now()}`,
    };
    persistTestDrives([created, ...testDrives]);

    // Advance customer/lead stage to TEST_DRIVE if early in pipeline
    persistLeads(
      leads.map((l) =>
        l.customerId === testDrive.customerId &&
        l.vehicleId === testDrive.vehicleId &&
        ["NEW", "CONTACTED", "QUALIFIED", "VIEWING"].includes(l.stage)
          ? { ...l, stage: "TEST_DRIVE", probability: 70 }
          : l
      )
    );

    return created;
  };

  const completeTestDrive = (
    testDriveId: string,
    mileageIn: number,
    outcome: string
  ) => {
    const target = testDrives.find((t) => t.id === testDriveId);
    const updated = testDrives.map((t) =>
      t.id === testDriveId
        ? {
            ...t,
            status: "COMPLETED" as const,
            mileageIn,
            outcome,
          }
        : t
    );
    persistTestDrives(updated);

    if (target && mileageIn > 0) {
      persistVehicles(
        vehicles.map((v) =>
          v.id === target.vehicleId && mileageIn > v.mileage
            ? { ...v, mileage: mileageIn }
            : v
        )
      );
    }
  };

  const cancelTestDrive = (testDriveId: string) => {
    persistTestDrives(
      testDrives.map((t) =>
        t.id === testDriveId
          ? { ...t, status: "CANCELLED" as const, outcome: "Cancelled" }
          : t
      )
    );
  };

  // =========================================================================
  // 7. RESERVATIONS & AUTO VEHICLE STATUS SYNC (Available <-> Reserved)
  // =========================================================================

  const addReservation = (
    reservation: Omit<DemoReservation, "id" | "isActive">,
    staffName = "Peter Kiprop"
  ): DemoReservation => {
    const now = new Date().toISOString();
    const created: DemoReservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      isActive: true,
    };
    persistReservations([created, ...reservations]);

    // Automatically change vehicle status: Available -> Reserved
    const updatedVehicles = vehicles.map((v) => {
      if (v.id !== reservation.vehicleId) return v;
      return {
        ...v,
        status: "RESERVED" as const,
        history: [
          {
            id: `hist-${Date.now()}`,
            eventType: "RESERVATION" as const,
            previousVal: v.status,
            newVal: "RESERVED",
            description: `Reserved by ${
              reservation.customerName
            } with deposit ${formatKSh(
              reservation.depositAmount
            )} (Available → Reserved)`,
            createdByName: staffName,
            createdAt: now,
          },
          ...v.history,
        ],
      };
    });
    persistVehicles(updatedVehicles);

    // Sync Lead & Customer stage to RESERVED
    persistLeads(
      leads.map((l) =>
        l.customerId === reservation.customerId &&
        l.vehicleId === reservation.vehicleId
          ? { ...l, stage: "RESERVED", probability: 90, lastContactAt: now }
          : l
      )
    );
    persistCustomers(
      customers.map((c) =>
        c.id === reservation.customerId
          ? { ...c, pipelineStage: "RESERVED", lastInteraction: now }
          : c
      )
    );

    return created;
  };

  const releaseReservation = (
    reservationId: string,
    staffName = "Grace Wanjiku"
  ) => {
    const target = reservations.find((r) => r.id === reservationId);
    if (!target) return;

    const now = new Date().toISOString();
    persistReservations(
      reservations.map((r) =>
        r.id === reservationId ? { ...r, isActive: false } : r
      )
    );

    // Automatically revert vehicle status: Reserved -> Available (if not already Sold)
    persistVehicles(
      vehicles.map((v) => {
        if (v.id !== target.vehicleId || v.status === "SOLD") return v;
        return {
          ...v,
          status: "AVAILABLE" as const,
          history: [
            {
              id: `hist-${Date.now()}`,
              eventType: "STATUS_CHANGE" as const,
              previousVal: "RESERVED",
              newVal: "AVAILABLE",
              description: `Reservation for ${target.customerName} released/expired — Status reverted (Reserved → Available)`,
              createdByName: staffName,
              createdAt: now,
            },
            ...v.history,
          ],
        };
      })
    );
  };

  const expireOverdueReservations = (staffName = "System Cron"): number => {
    const nowMs = Date.now();
    const expiredIds = reservations
      .filter((r) => r.isActive && new Date(r.expiryDate).getTime() < nowMs)
      .map((r) => r.id);

    if (expiredIds.length === 0) return 0;

    const expiredVehicleIds = new Set(
      reservations
        .filter((r) => expiredIds.includes(r.id))
        .map((r) => r.vehicleId)
    );

    persistReservations(
      reservations.map((r) =>
        expiredIds.includes(r.id) ? { ...r, isActive: false } : r
      )
    );

    const nowISO = new Date().toISOString();
    persistVehicles(
      vehicles.map((v) => {
        if (!expiredVehicleIds.has(v.id) || v.status !== "RESERVED") return v;
        return {
          ...v,
          status: "AVAILABLE" as const,
          history: [
            {
              id: `hist-${Date.now()}`,
              eventType: "STATUS_CHANGE" as const,
              previousVal: "RESERVED",
              newVal: "AVAILABLE",
              description:
                "Reservation hold expired — Vehicle automatically reverted (Reserved → Available)",
              createdByName: staffName,
              createdAt: nowISO,
            },
            ...v.history,
          ],
        };
      })
    );

    return expiredIds.length;
  };

  // =========================================================================
  // 8. COMPLETED SALES & REALIZED GROSS PROFIT
  // =========================================================================

  const addSale = (saleInput: {
    customerId: string;
    vehicleId: string;
    salespersonId: string;
    salespersonName: string;
    salePrice: number;
    discount: number;
    depositPaid: number;
    paymentMethod: string;
    paymentStatus: PaymentStatusEnum;
    notes: string;
  }): DemoSale | null => {
    const cust = customers.find((c) => c.id === saleInput.customerId);
    const veh = vehicles.find((v) => v.id === saleInput.vehicleId);
    if (!cust || !veh) return null;

    const now = new Date().toISOString();
    const netSalePrice = saleInput.salePrice - (saleInput.discount || 0);
    const balanceDue = Math.max(0, netSalePrice - saleInput.depositPaid);
    const expensesSum = veh.expenses.reduce((s, e) => s + e.amount, 0);
    const totalCost = veh.purchasePrice + expensesSum;
    const grossProfit = netSalePrice - totalCost;

    const nextNumber = `SL-2026-00${sales.length + 1}`;
    const createdSale: DemoSale = {
      id: `sale-${Date.now()}`,
      saleNumber: nextNumber,
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      vehicleId: veh.id,
      vehicleTitle: `${veh.year} ${veh.make} ${veh.model}`,
      stockNumber: veh.stockNumber,
      registrationNumber: veh.registrationNumber || "Pending",
      vin: veh.vin || "—",
      salespersonId: saleInput.salespersonId,
      salespersonName: saleInput.salespersonName,
      salePrice: netSalePrice,
      discount: saleInput.discount || 0,
      depositPaid: saleInput.depositPaid,
      balanceDue,
      paymentMethod: saleInput.paymentMethod,
      paymentStatus: balanceDue === 0 ? "PAID" : saleInput.paymentStatus,
      purchaseCostSnapshot: veh.purchasePrice,
      expensesSnapshot: expensesSum,
      grossProfit,
      saleDate: now,
      notes: saleInput.notes,
    };

    persistSales([createdSale, ...sales]);

    // Mark vehicle as SOLD and record actualSalePrice + history
    persistVehicles(
      vehicles.map((v) =>
        v.id === veh.id
          ? {
              ...v,
              status: "SOLD" as const,
              actualSalePrice: netSalePrice,
              history: [
                {
                  id: `hist-${Date.now()}`,
                  eventType: "SALE" as const,
                  previousVal: v.status,
                  newVal: "SOLD",
                  description: `Sold to ${cust.fullName} for ${formatKSh(
                    netSalePrice
                  )} (Gross Profit: ${formatKSh(grossProfit)})`,
                  createdByName: saleInput.salespersonName,
                  createdAt: now,
                },
                ...v.history,
              ],
            }
          : v
      )
    );

    // Close any active reservation on this vehicle
    persistReservations(
      reservations.map((r) =>
        r.vehicleId === veh.id ? { ...r, isActive: false } : r
      )
    );

    // Update Lead & Customer stage to SOLD
    persistLeads(
      leads.map((l) =>
        l.vehicleId === veh.id || l.customerId === cust.id
          ? { ...l, stage: "SOLD", probability: 100, lastContactAt: now }
          : l
      )
    );
    persistCustomers(
      customers.map((c) =>
        c.id === cust.id
          ? { ...c, pipelineStage: "SOLD", lastInteraction: now }
          : c
      )
    );

    return createdSale;
  };

  const markSalePaid = (saleId: string) => {
    persistSales(
      sales.map((s) =>
        s.id === saleId
          ? {
              ...s,
              depositPaid: s.salePrice,
              balanceDue: 0,
              paymentStatus: "PAID" as const,
            }
          : s
      )
    );
  };

  const updateAISettings = (patch: Partial<AIAgentSettings>) => {
    const next = { ...aiSettings, ...patch };
    setAISettings(next);
    try {
      localStorage.setItem(STORAGE_AI_SETTINGS_KEY, JSON.stringify(next));
    } catch {}
  };

  const upsertAIConversation = (conv: AIConversation) => {
    setAIConversations((prev) => {
      const exists = prev.some((c) => c.id === conv.id);
      const updated = exists
        ? prev.map((c) => (c.id === conv.id ? conv : c))
        : [conv, ...prev];
      try {
        localStorage.setItem(
          STORAGE_AI_CONVERSATIONS_KEY,
          JSON.stringify(updated)
        );
      } catch {}
      return updated;
    });
  };

  const sendStaffReplyToConversation = (
    convId: string,
    text: string,
    staffName: string
  ) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setAIConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          updatedAt: `Today, ${nowTime}`,
          messages: [
            ...c.messages,
            {
              id: `msg-${Date.now()}`,
              sender: "STAFF" as const,
              senderName: staffName,
              text,
              timestamp: nowTime,
            },
          ],
        };
      });
      try {
        localStorage.setItem(
          STORAGE_AI_CONVERSATIONS_KEY,
          JSON.stringify(updated)
        );
      } catch {}
      return updated;
    });
  };

  const addTradeInRequest = (
    req: Omit<TradeInSubmission, "id" | "createdAt">
  ): TradeInSubmission => {
    const now = new Date().toISOString().split("T")[0];
    const created: TradeInSubmission = {
      ...req,
      id: `ti-${Date.now()}`,
      createdAt: now,
    };
    const nextList = [created, ...tradeInRequests];
    setTradeInRequests(nextList);
    try {
      localStorage.setItem(STORAGE_TRADE_INS_KEY, JSON.stringify(nextList));
    } catch {}

    // Also create a Customer + Lead in CRM so sales & acquisition team see it immediately
    const newCust = addCustomer({
      fullName: req.customerName,
      phone: req.customerPhone,
      email: req.customerEmail || "",
      address: req.location,
      location: req.location,
      customerType: "INDIVIDUAL",
      preferredMakes: req.make,
      preferredModels: req.model,
      budgetMin: req.expectedPrice,
      budgetMax: req.expectedPrice,
      preferredYear: req.year,
      preferredFuel: "Any",
      preferredTrans: "Automatic",
      preferredBody: "SUV",
      assignedSalespersonId: "usr-2",
      assignedSalespersonName: "James Omondi",
      pipelineStage: "NEW",
      notes: `Sell / Trade-In Evaluation: ${req.year} ${req.make} ${req.model} (${req.mileage.toLocaleString()} km, ${req.condition}) — Expected ${formatKSh(
        req.expectedPrice
      )}. ${req.notes}`,
    });

    const targetVeh =
      vehicles.find((v) => v.id === req.targetVehicleId) || vehicles[0];
    if (targetVeh) {
      addLead({
        customerId: newCust.id,
        customerName: newCust.fullName,
        customerPhone: newCust.phone,
        vehicleId: targetVeh.id,
        vehicleTitle: `${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`,
        vehicleStockNo: targetVeh.stockNumber,
        askingPrice: targetVeh.askingPrice,
        source: "WEBSITE",
        assignedSalespersonId: "usr-2",
        assignedSalespersonName: "James Omondi",
        budget: req.expectedPrice,
        expectedPurchaseDate: now,
        stage: "QUALIFIED",
        probability: 50,
        nextFollowUpAt: now,
        notes: `[TRADE-IN / SELL EVALUATION] Customer offering ${req.year} ${req.make} ${req.model} (${req.mileage.toLocaleString()} km, Condition: ${req.condition}) valued at ${formatKSh(
          req.expectedPrice
        )}. ${req.notes}`,
      });
    }

    return created;
  };

  return (
    <DealershipContext.Provider
      value={{
        vehicles,
        suppliers,
        customers,
        leads,
        activities,
        testDrives,
        reservations,
        sales,
        aiSettings,
        aiConversations,
        tradeInRequests,
        addVehicle,
        updateVehicleStatus,
        updateVehiclePrice,
        addVehicleExpense,
        addVehicleImage,
        addSupplier,
        addCustomer,
        addLead,
        updateLeadStage,
        addActivity,
        updateActivityStatus,
        addTestDrive,
        completeTestDrive,
        cancelTestDrive,
        addReservation,
        releaseReservation,
        expireOverdueReservations,
        addSale,
        markSalePaid,
        updateAISettings,
        upsertAIConversation,
        sendStaffReplyToConversation,
        addTradeInRequest,
      }}
    >
      {children}
    </DealershipContext.Provider>
  );
}

export function useDealership() {
  const ctx = useContext(DealershipContext);
  if (!ctx) {
    throw new Error("useDealership must be used within a DealershipProvider");
  }
  return ctx;
}
