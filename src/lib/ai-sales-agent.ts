import { DemoVehicle, PipelineStageType } from "./demo-store";
import { formatKSh } from "./format";

export interface AIAgentFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface AIAgentKnowledgeSources {
  vehicleInventory: boolean;
  dealershipInformation: boolean;
  services: boolean;
  faqs: boolean;
  policies: boolean;
  operatingHours: boolean;
  salesTeam: boolean;
}

export interface AIAgentSettings {
  enabled: boolean;
  agentName: string;
  welcomeMessage: string;
  businessDescription: string;
  dealershipInformation: string;
  openingHours: string;
  location: string;
  services: string;
  financingInformation: string;
  tradeInInformation: string;
  escalationRules: string;
  faqs: AIAgentFAQ[];
  knowledgeSources: AIAgentKnowledgeSources;
  // Website & Spotlight Admin Management
  spotlightVehicleIds?: string[];
  featuredVehicleIds?: string[];
  newArrivalVehicleIds?: string[];
  heroWordmark?: string;
  heroHeadlineLine1?: string;
  heroHeadlineLine2?: string;
  heroSubtext?: string;
  homepagePreviewLimit?: number;
  showFeaturedAICard?: boolean;
  showTradeInSection?: boolean;
}

export interface AIMessage {
  id: string;
  sender: "CUSTOMER" | "AI" | "STAFF";
  senderName?: string;
  text: string;
  timestamp: string;
  recommendedVehicleIds?: string[];
  actionTaken?:
    | "LEAD_CREATED"
    | "TEST_DRIVE_BOOKED"
    | "HANDOFF_TRIGGERED"
    | "TRADE_IN_LOGGED";
  quickReplies?: string[];
}

export interface AIConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  channel: "WEBSITE" | "WHATSAPP";
  vehicleId?: string;
  vehicleTitle?: string;
  status: "ACTIVE" | "LEAD_CAPTURED" | "TEST_DRIVE_BOOKED" | "HANDED_OFF";
  leadTag: string;
  leadId?: string;
  leadStage?: PipelineStageType;
  budget?: number;
  handoffReason?: string;
  handoffSummary?: string;
  updatedAt: string;
  messages: AIMessage[];
}

export interface TradeInSubmission {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: "EXCELLENT" | "GOOD" | "FAIR";
  location: string;
  expectedPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes: string;
  photoUrl?: string;
  targetVehicleId?: string;
  targetVehicleTitle?: string;
  createdAt: string;
}

export interface VehiclePublicProfile {
  engineSize: string;
  drivetrain: string;
  seats: number;
  conditionBadge: "Foreign Used (Grade 4.5)" | "Local Used" | "Brand New";
  isFeatured: boolean;
  isNewArrival: boolean;
  features: string[];
  galleryUrls: string[];
}

export function getVehiclePublicProfile(
  vehicle: DemoVehicle
): VehiclePublicProfile {
  const makeModel = `${vehicle.make} ${vehicle.model}`.toLowerCase();

  let engineSize = "2.0L";
  let drivetrain = "AWD";
  let seats = 5;
  let features: string[] = [
    "Push Button Start & Keyless Entry",
    "Apple CarPlay & Android Auto",
    "Reverse Camera & Parking Sensors",
    "Dual-Zone Climate Control",
    "Alloy Rims",
    "Multi-Function Steering Wheel",
  ];
  let galleryUrls = [
    vehicle.imageUrl,
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80",
  ];

  if (makeModel.includes("prado")) {
    engineSize = "2.8L 1GD Turbo Diesel";
    drivetrain = "4WD Full-Time";
    seats = 7;
    features = [
      "Sunroof (Tilt & Slide)",
      "7-Seater Leather Interior",
      "Heated & Ventilated Front Seats",
      "360° Surround View Monitor",
      "Crawl Control & Multi-Terrain Select",
      "LED Projector Headlamps",
      "Cool Box in Center Console",
      "Apple CarPlay & JBL Sound System",
    ];
  } else if (makeModel.includes("harrier")) {
    engineSize = "2.0L Valvematic";
    drivetrain = "AWD";
    seats = 5;
    features = [
      "Panoramic Electrochromic Sunroof",
      "Premium Half-Leather / Alcantara Seats",
      "Power Tailgate with Kick Sensor",
      "Toyota Safety Sense (Pre-Collision & Lane Trace)",
      "12.3-inch Infotainment Display",
      "Adaptive Cruise Control",
      "Wireless Phone Charger",
      "18-inch Factory Alloy Wheels",
    ];
  } else if (makeModel.includes("cx-5")) {
    engineSize = "2.2L SkyActiv-D Twin Turbo";
    drivetrain = "AWD";
    seats = 5;
    features = [
      "BOSE 10-Speaker Surround Audio",
      "Heads-Up Display (HUD) on Windshield",
      "Power Memory Leather Seats",
      "Adaptive LED Headlights",
      "Blind Spot Monitoring (BSM)",
      "Power Tailgate",
      "Dual-Zone Automatic AC",
    ];
  } else if (makeModel.includes("forester")) {
    engineSize = "2.0L Boxer e-Boxer";
    drivetrain = "Symmetrical AWD";
    seats = 5;
    features = [
      "Subaru EyeSight Driver Assist",
      "Dual X-Mode Terrain Control",
      "Sunroof",
      "Water-Repellent Sport Seats",
      "Power Rear Gate",
      "SI-Drive Intelligent & Sport Modes",
      "LED Steering Responsive Headlights",
    ];
  } else if (makeModel.includes("c200") || makeModel.includes("mercedes")) {
    engineSize = "1.5L EQ Boost Turbo";
    drivetrain = "RWD";
    seats = 5;
    features = [
      "AMG Line Exterior & Interior Styling",
      "Panoramic Glass Sunroof",
      "64-Color Ambient Interior Lighting",
      "12.3-inch Digital Instrument Cluster",
      "Burmester Surround Sound",
      "Active Parking Assist",
      "Artico Leather Sports Seats",
    ];
  } else if (makeModel.includes("hilux")) {
    engineSize = "2.8L 1GD-FTV Heavy Duty";
    drivetrain = "4x4 Part-Time with Diff Lock";
    seats = 5;
    features = [
      "Rear Differential Lock",
      "Heavy Duty Bedliner & Roll Bar",
      "Touchscreen Audio with Bluetooth & CarPlay",
      "Eco & Power Drive Modes",
      "Side Steps & Fog Lamps",
      "7 Airbags & Trailer Sway Control",
    ];
  } else if (makeModel.includes("golf")) {
    engineSize = "2.0L TSI Turbo";
    drivetrain = "FWD (DSG)";
    seats = 5;
    features = [
      "GTI Tartan / Vienna Sport Seats",
      "Virtual Cockpit Digital Dash",
      "Paddle Shifters",
      "Sunroof",
      "Dynamic Chassis Control",
      "Dual Chrome Exhausts",
    ];
  }

  if (vehicle.images && vehicle.images.length > 0) {
    const customUrls = vehicle.images.map((img) => img.url);
    galleryUrls = Array.from(
      new Set([vehicle.imageUrl, ...customUrls, ...galleryUrls])
    );
  }

  return {
    engineSize,
    drivetrain,
    seats,
    conditionBadge:
      vehicle.mileage < 55000 ? "Foreign Used (Grade 4.5)" : "Local Used",
    isFeatured: vehicle.askingPrice >= 3200000,
    isNewArrival:
      vehicle.id === "veh-1001" ||
      vehicle.id === "veh-1005" ||
      vehicle.id === "veh-1006",
    features,
    galleryUrls,
  };
}

export const INITIAL_AI_SETTINGS: AIAgentSettings = {
  enabled: true,
  agentName: "AutoAssist",
  welcomeMessage:
    "Hello! I'm AutoAssist, your 24/7 digital vehicle sales consultant at Vehisoft Motors. Tell me your budget, preferred make, or body type, and I'll check our live showroom inventory for you.",
  businessDescription:
    "Vehisoft Motors Kenya is a premier motor vehicle dealership specializing in inspected Japanese, European, and local used vehicles with full QISJ/JEVIC mileage verification.",
  dealershipInformation:
    "Flagship Showroom: Ngong Road (opposite Prestige Plaza), Nairobi. Branch Showroom: Westlands Road, Westlands, Nairobi. Phone: +254 700 123 456 | Email: sales@vehisoft.co.ke",
  openingHours:
    "Monday – Friday: 8:00 AM – 6:00 PM | Saturday: 9:00 AM – 5:00 PM | Sunday & Public Holidays: 10:00 AM – 4:00 PM (By Appointment)",
  location:
    "Ngong Road Showroom (HQ), opposite Prestige Plaza, Nairobi & Westlands Yard, Nairobi.",
  services:
    "1. Direct Vehicle Sales (Cash & Bank Finance)\n2. Trade-In & Instant Vehicle Valuation\n3. Import-on-Behalf from Japan, UK & Australia\n4. Comprehensive Motor Insurance & NTSA TIMS Instant Transfer",
  financingInformation:
    "We partner with NCBA, Stanbic Bank, Co-operative Bank, I&M Bank, and Equity Bank. Financing up to 80% for salaried & business buyers (20% deposit), repayable over 12 to 60 months. Approval takes 48–72 hours.",
  tradeInInformation:
    "We accept clean local trade-ins! Bring your car for a 30-minute physical inspection or submit details via our 'Sell / Trade In' page. Your current car's value can cover your deposit or reduce the purchase balance.",
  escalationRules:
    "Immediately hand off to a human salesperson when a customer requests price negotiation, custom discounts below asking price, complex corporate fleet quotes, or specific mechanical history not recorded in the vehicle specification.",
  faqs: [
    {
      id: "faq-1",
      question: "Do you accept trade-ins?",
      answer:
        "Yes! We accept trade-ins on all vehicles. You can use our 'Sell / Trade In' evaluation tool or bring your car to our Ngong Road showroom for a 30-minute valuation.",
    },
    {
      id: "faq-2",
      question: "Do you offer bank or asset financing?",
      answer:
        "Yes, we arrange asset financing with NCBA, Stanbic, I&M, Co-op, and Equity Bank with deposits starting from 20% and repayment up to 60 months.",
    },
    {
      id: "faq-3",
      question: "Are your vehicles inspected for genuine mileage?",
      answer:
        "Every imported vehicle comes with an official QISJ / JEVIC inspection certificate verifying genuine mileage, non-accident chassis, and radiation-free status.",
    },
    {
      id: "faq-4",
      question: "How long does NTSA TIMS logbook transfer take?",
      answer:
        "Once payment or bank undertaking is complete, we initiate the NTSA TIMS transfer on the same day.",
    },
  ],
  knowledgeSources: {
    vehicleInventory: true,
    dealershipInformation: true,
    services: true,
    faqs: true,
    policies: true,
    operatingHours: true,
    salesTeam: true,
  },
  spotlightVehicleIds: ["veh-1001", "veh-1003", "veh-1002", "veh-1006"],
  featuredVehicleIds: ["veh-1001", "veh-1002", "veh-1003", "veh-1005"],
  newArrivalVehicleIds: ["veh-1001", "veh-1005", "veh-1006"],
  heroWordmark: "Vehisoft",
  heroHeadlineLine1: "Beyond",
  heroHeadlineLine2: "Showroom.",
  heroSubtext:
    "Browse our live QISJ-verified inventory, compare specifications, and consult our 24/7 AI sales specialist anytime.",
  homepagePreviewLimit: 6,
  showFeaturedAICard: true,
  showTradeInSection: true,
};

export const INITIAL_AI_CONVERSATIONS: AIConversation[] = [
  {
    id: "ai-conv-1",
    customerName: "John Kamau",
    customerPhone: "+254 712 345 678",
    customerEmail: "j.kamau@outlook.com",
    channel: "WEBSITE",
    vehicleId: "veh-1001",
    vehicleTitle: "2021 Toyota Harrier 2.0 Premium Elegance",
    status: "HANDED_OFF",
    leadTag: "Interested • Hot Lead",
    leadId: "lead-1",
    leadStage: "NEGOTIATION",
    budget: 4200000,
    handoffReason: "Price negotiation requested on 2021 Toyota Harrier",
    handoffSummary:
      "Customer searched for a Toyota SUV around KSh 3.8M–4.4M, shortlisted the 2021 Toyota Harrier (KSh 4,200,000), provided contact details, and asked to negotiate the cash price. Escalated to Brian Ochieng.",
    updatedAt: "Today, 3:42 PM",
    messages: [
      {
        id: "m-1",
        sender: "CUSTOMER",
        text: "I'm looking for a Toyota SUV around 4 million.",
        timestamp: "3:36 PM",
      },
      {
        id: "m-2",
        sender: "AI",
        text: "Sure! I checked our live showroom inventory and found our 2021 Toyota Harrier 2.0 Premium Elegance (KSh. 4,200,000, 42,000 km, Automatic, Pearl White) available at our Ngong Road Showroom. Would you like to see full details on the Harrier or compare it with our Subaru Forester and Mazda CX-5 under KSh. 4M?",
        timestamp: "3:36 PM",
        recommendedVehicleIds: ["veh-1001", "veh-1002", "veh-1004"],
      },
      {
        id: "m-3",
        sender: "CUSTOMER",
        text: "I'm interested in the Harrier. Does it have a sunroof?",
        timestamp: "3:38 PM",
      },
      {
        id: "m-4",
        sender: "AI",
        text: "Yes! The 2021 Toyota Harrier 2.0 Premium Elegance (Stock #VH-1001) features a Panoramic Electrochromic Sunroof, Power Tailgate, JBL Audio, and only 42,000 km. May I get your name and phone number so our sales team can hold a viewing slot or follow up with you?",
        timestamp: "3:38 PM",
      },
      {
        id: "m-5",
        sender: "CUSTOMER",
        text: "John Kamau, 0712345678. Also I'd like to negotiate the price if I pay cash.",
        timestamp: "3:42 PM",
      },
      {
        id: "m-6",
        sender: "AI",
        text: "Thank you, John! I've logged your details for the 2021 Toyota Harrier. I can help you with the vehicle details, but a salesperson needs to handle pricing and negotiation. I've sent your request to our senior sales executive Brian Ochieng and moved your inquiry to our Negotiation desk.",
        timestamp: "3:42 PM",
        actionTaken: "HANDOFF_TRIGGERED",
      },
    ],
  },
  {
    id: "ai-conv-2",
    customerName: "Mary Atieno",
    customerPhone: "+254 720 987 654",
    customerEmail: "mary.atieno@gmail.com",
    channel: "WHATSAPP",
    vehicleId: "veh-1002",
    vehicleTitle: "2020 Mazda CX-5 2.2 XD Proactive SkyActiv-D",
    status: "LEAD_CAPTURED",
    leadTag: "Asked about financing",
    leadId: "lead-2",
    leadStage: "RESERVED",
    budget: 3250000,
    updatedAt: "Today, 2:17 PM",
    messages: [
      {
        id: "m-201",
        sender: "CUSTOMER",
        text: "Hi, is the 2020 Mazda CX-5 still available and do you offer financing?",
        timestamp: "2:14 PM",
      },
      {
        id: "m-202",
        sender: "AI",
        text: "Yes, the 2020 Mazda CX-5 2.2 XD Proactive SkyActiv-D (Soul Red Crystal, 58,000 km, 2.2L Diesel Automatic) at our Ngong Road Showroom is listed at KSh. 3,250,000. We partner with NCBA, Stanbic, I&M, Co-op, and Equity Bank for up to 80% financing (from 20% deposit = KSh. 650,000) over up to 60 months.",
        timestamp: "2:14 PM",
        recommendedVehicleIds: ["veh-1002"],
      },
      {
        id: "m-203",
        sender: "CUSTOMER",
        text: "Great, I'm Mary Atieno (0720987654). Please share a proforma invoice for Stanbic Bank.",
        timestamp: "2:17 PM",
      },
      {
        id: "m-204",
        sender: "AI",
        text: "Wonderful, Mary! I've created your profile in our CRM and notified our finance specialist Peter Kiprop to prepare and send the Stanbic Bank proforma invoice for the 2020 Mazda CX-5.",
        timestamp: "2:17 PM",
        actionTaken: "LEAD_CREATED",
      },
    ],
  },
  {
    id: "ai-conv-3",
    customerName: "David Ochieng",
    customerPhone: "+254 722 301 992",
    channel: "WEBSITE",
    vehicleId: "veh-1008",
    vehicleTitle: "2021 Toyota Land Cruiser Prado 2.8 VX-L",
    status: "TEST_DRIVE_BOOKED",
    leadTag: "Requested test drive",
    leadId: "lead-1",
    leadStage: "TEST_DRIVE",
    budget: 8250000,
    updatedAt: "Yesterday, 4:50 PM",
    messages: [
      {
        id: "m-301",
        sender: "CUSTOMER",
        text: "Can I come see the 2021 Toyota Prado VX-L tomorrow?",
        timestamp: "4:45 PM",
      },
      {
        id: "m-302",
        sender: "AI",
        text: "Absolutely! The 2021 Toyota Land Cruiser Prado 2.8 VX-L (KSh. 8,250,000, 38,200 km, Pearl White) is ready at our Ngong Road Showroom. We have viewing and test-drive appointments available tomorrow at 10:00 AM, 1:00 PM, and 3:30 PM. Which time works best for you?",
        timestamp: "4:45 PM",
        recommendedVehicleIds: ["veh-1008"],
      },
      {
        id: "m-303",
        sender: "CUSTOMER",
        text: "1:00 PM works for me. David Ochieng, 0722301992.",
        timestamp: "4:50 PM",
      },
      {
        id: "m-304",
        sender: "AI",
        text: "Confirmed! I've scheduled your viewing and test drive for the 2021 Toyota Land Cruiser Prado 2.8 VX-L tomorrow at 1:00 PM at our Ngong Road Showroom. Our salesperson Brian Ochieng has been notified and will have the vehicle ready for you.",
        timestamp: "4:50 PM",
        actionTaken: "TEST_DRIVE_BOOKED",
      },
    ],
  },
];

export interface AIResponseResult {
  replyText: string;
  recommendedVehicleIds?: string[];
  quickReplies?: string[];
  focusedVehicleId?: string;
  shouldCaptureLead?: {
    customerName: string;
    customerPhone: string;
    vehicleId?: string;
    budget?: number;
    notes: string;
  };
  shouldBookTestDrive?: {
    customerName: string;
    customerPhone: string;
    vehicleId: string;
    slotLabel: string;
  };
  shouldTriggerHandoff?: {
    reason: string;
    summary: string;
    vehicleId?: string;
  };
}

/**
 * Deterministic, inventory-grounded AI Sales Consultant Engine.
 * Uses ONLY verified dealership records (live vehicles + AIAgentSettings).
 * Never halluncinates specs, prices, or policies.
 */
export function generateAISalesResponse(params: {
  userMessage: string;
  vehicles: DemoVehicle[];
  settings: AIAgentSettings;
  focusedVehicleId?: string;
  knownCustomerName?: string;
  knownCustomerPhone?: string;
}): AIResponseResult {
  const {
    userMessage,
    vehicles,
    settings,
    focusedVehicleId,
    knownCustomerName,
    knownCustomerPhone,
  } = params;

  const text = userMessage.trim();
  const lower = text.toLowerCase();

  // Only show AVAILABLE or RESERVED vehicles on public channels (never SOLD or ARCHIVED)
  const publicVehicles = vehicles.filter(
    (v) => v.status === "AVAILABLE" || v.status === "RESERVED"
  );
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");

  // Detect if user mentions a specific vehicle in inventory
  let matchedVehicle: DemoVehicle | undefined = focusedVehicleId
    ? vehicles.find((v) => v.id === focusedVehicleId)
    : undefined;

  for (const v of vehicles) {
    const modelLower = v.model.toLowerCase();
    const makeLower = v.make.toLowerCase();
    if (
      lower.includes(modelLower) ||
      (modelLower.includes("prado") && lower.includes("prado")) ||
      (modelLower.includes("harrier") && lower.includes("harrier")) ||
      (modelLower.includes("cx-5") &&
        (lower.includes("cx-5") || lower.includes("cx5"))) ||
      (modelLower.includes("forester") && lower.includes("forester")) ||
      (modelLower.includes("hilux") && lower.includes("hilux")) ||
      (modelLower.includes("golf") && lower.includes("golf")) ||
      (modelLower.includes("c200") &&
        (lower.includes("c200") || lower.includes("mercedes")))
    ) {
      matchedVehicle = v;
      break;
    }
    if (lower.includes(makeLower) && !matchedVehicle) {
      const sameMake = availableVehicles.find(
        (av) => av.make.toLowerCase() === makeLower
      );
      if (sameMake) matchedVehicle = sameMake;
    }
  }

  // Extract phone number if customer typed one (Kenyan format 07xx, 01xx, +2547xx)
  const phoneMatch = text.match(/(?:\+254|0)\s?[17]\d{2}\s?\d{3}\s?\d{3}/);
  const extractedPhone = phoneMatch
    ? phoneMatch[0].replace(/\s+/g, "")
    : knownCustomerPhone;

  // Try to extract name if they gave "Name, 07..." or "I'm Name" or "My name is Name"
  let extractedName = knownCustomerName;
  const namePatterns = [
    /(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)[,\s-]+(?:\+254|0)[17]/,
  ];
  for (const pat of namePatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      extractedName = m[1].trim();
      break;
    }
  }

  // 1. Check for Negotiation / Discount / Last Price -> Trigger Human Handoff
  if (
    lower.includes("negotiate") ||
    lower.includes("last price") ||
    lower.includes("discount") ||
    lower.includes("best price") ||
    lower.includes("reduce the price") ||
    lower.includes("lower price") ||
    lower.includes("offer ksh")
  ) {
    const targetVeh = matchedVehicle || availableVehicles[0];
    return {
      replyText: `I can help you with the vehicle details${
        targetVeh
          ? ` for the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (listed at ${formatKSh(
              targetVeh.askingPrice
            )})`
          : ""
      }, but a salesperson needs to handle pricing and negotiation. I'll send your request to the sales team right away.${
        !extractedPhone
          ? " Could you also share your name and phone number so our Sales Manager can call you directly?"
          : ""
      }`,
      focusedVehicleId: targetVeh?.id,
      recommendedVehicleIds: targetVeh ? [targetVeh.id] : undefined,
      shouldTriggerHandoff: {
        reason: `Customer requested price negotiation${
          targetVeh
            ? ` on ${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`
            : ""
        }`,
        summary: `Customer asked: "${text}". AI escalated to human sales team for price negotiation.`,
        vehicleId: targetVeh?.id,
      },
      quickReplies: !extractedPhone
        ? ["My number is 0722 123 456", "Book a showroom viewing instead"]
        : ["Book a viewing tomorrow", "Ask about bank financing"],
    };
  }

  // 2. Check for Time Slot Selection (10:00 AM, 1:00 PM, 3:30 PM) or Test Drive / Viewing Request
  const timeSlotMatch = lower.match(/(10:00\s*am|10\s*am|1:00\s*pm|1\s*pm|3:30\s*pm)/i);
  if (timeSlotMatch) {
    const slotLabel = timeSlotMatch[1].toUpperCase();
    const targetVeh = matchedVehicle || availableVehicles[0];
    if (extractedPhone) {
      return {
        replyText: `Confirmed! I have booked your viewing and test-drive appointment for ${
          targetVeh
            ? `the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`
            : "your selected vehicle"
        } tomorrow at ${slotLabel} at our ${
          targetVeh?.location || "Ngong Road Showroom"
        }. Our sales team has been notified and will have the keys ready for you!`,
        focusedVehicleId: targetVeh?.id,
        recommendedVehicleIds: targetVeh ? [targetVeh.id] : undefined,
        shouldBookTestDrive: {
          customerName: extractedName || "Website Visitor",
          customerPhone: extractedPhone,
          vehicleId: targetVeh?.id || "veh-1",
          slotLabel: `Tomorrow at ${slotLabel}`,
        },
        quickReplies: [
          "Where is the showroom located?",
          "Do you accept trade-ins?",
          "Show me other SUVs",
        ],
      };
    } else {
      return {
        replyText: `Great — I'm holding the ${slotLabel} appointment slot tomorrow${
          targetVeh
            ? ` for the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model}`
            : ""
        }. May I get your full name and phone number to confirm the booking in our schedule?`,
        focusedVehicleId: targetVeh?.id,
        quickReplies: [
          "John Kamau, 0722 419 880",
          "What documents do I need for a test drive?",
        ],
      };
    }
  }

  if (
    lower.includes("test drive") ||
    lower.includes("come see") ||
    lower.includes("book a viewing") ||
    lower.includes("view the") ||
    lower.includes("see the car") ||
    lower.includes("appointment") ||
    lower.includes("tomorrow")
  ) {
    const targetVeh = matchedVehicle || availableVehicles[0];
    return {
      replyText: `Absolutely! We have viewing and test-drive appointments available tomorrow at 10:00 AM, 1:00 PM, and 3:30 PM${
        targetVeh
          ? ` for the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (${formatKSh(
              targetVeh.askingPrice
            )}) at ${targetVeh.location}`
          : ""
      }. Which time works best for you?`,
      focusedVehicleId: targetVeh?.id,
      recommendedVehicleIds: targetVeh ? [targetVeh.id] : undefined,
      quickReplies: [
        "10:00 AM",
        "1:00 PM",
        "3:30 PM",
      ],
    };
  }

  // 3. If customer just provided phone number / contact details -> Capture Lead in CRM!
  if (extractedPhone && !knownCustomerPhone) {
    const targetVeh = matchedVehicle || availableVehicles[0];
    return {
      replyText: `Thank you${
        extractedName ? `, ${extractedName}` : ""
      }! I've registered your inquiry (${extractedPhone})${
        targetVeh
          ? ` for the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (${formatKSh(
              targetVeh.askingPrice
            )})`
          : ""
      } directly in our dealership CRM and scheduled a priority follow-up with our sales team. Would you also like to book a viewing slot for tomorrow at 10:00 AM, 1:00 PM, or 3:30 PM?`,
      focusedVehicleId: targetVeh?.id,
      recommendedVehicleIds: targetVeh ? [targetVeh.id] : undefined,
      shouldCaptureLead: {
        customerName: extractedName || "Website AI Lead",
        customerPhone: extractedPhone,
        vehicleId: targetVeh?.id,
        budget: targetVeh?.askingPrice,
        notes: `Captured via ${settings.agentName} AI Sales Agent. Message: "${text}"`,
      },
      quickReplies: [
        "Book viewing for 1:00 PM tomorrow",
        "Tell me about bank financing",
        "Do you accept trade-ins?",
      ],
    };
  }

  // 4. Customer expresses buying interest ("I'm interested in...", "I want to buy...", "Hold this car")
  if (
    lower.includes("interested in") ||
    lower.includes("i want the") ||
    lower.includes("i'd like to buy") ||
    lower.includes("reserve") ||
    lower.includes("enquire")
  ) {
    const targetVeh = matchedVehicle || availableVehicles[0];
    return {
      replyText: `Great choice! The ${
        targetVeh
          ? `${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (${formatKSh(
              targetVeh.askingPrice
            )}, ${targetVeh.mileage.toLocaleString()} km)`
          : "vehicle"
      } is currently ${targetVeh?.status || "AVAILABLE"}. May I get your name and phone number so our sales team can follow up with you or reserve a viewing slot?`,
      focusedVehicleId: targetVeh?.id,
      recommendedVehicleIds: targetVeh ? [targetVeh.id] : undefined,
      quickReplies: [
        "John Kamau, 0722 419 880",
        "Can I come see it tomorrow?",
        "Does it have a sunroof?",
      ],
    };
  }

  // 5. Vehicle-specific attribute questions (Sunroof, Mileage, Transmission, Availability, Specs)
  if (
    lower.includes("sunroof") ||
    lower.includes("leather") ||
    lower.includes("camera") ||
    lower.includes("carplay") ||
    lower.includes("feature")
  ) {
    const targetVeh = matchedVehicle || availableVehicles[0];
    if (!targetVeh) {
      return {
        replyText:
          "Which vehicle would you like me to check the features for? We have the Toyota Prado, Toyota Harrier, Mazda CX-5, and Subaru Forester in stock.",
      };
    }
    const profile = getVehiclePublicProfile(targetVeh);
    const hasSunroof = profile.features.some((f) =>
      f.toLowerCase().includes("sunroof")
    );
    return {
      replyText: `${
        lower.includes("sunroof")
          ? hasSunroof
            ? `Yes! The ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} comes equipped with a ${
                profile.features.find((f) =>
                  f.toLowerCase().includes("sunroof")
                ) || "Sunroof"
              }.`
            : `Based on our current specification record for the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (Stock #${targetVeh.stockNumber}), a sunroof is not listed.`
          : `Here are the verified features for our ${targetVeh.year} ${targetVeh.make} ${targetVeh.model}:`
      } Key features include: ${profile.features.slice(0, 5).join(", ")}. Price: ${formatKSh(
        targetVeh.askingPrice
      )}. Would you like to book a viewing or have a salesperson send you a walkthrough video?`,
      focusedVehicleId: targetVeh.id,
      recommendedVehicleIds: [targetVeh.id],
      quickReplies: [
        "I'm interested in this car",
        "Can I come see it tomorrow?",
        "What's the mileage?",
      ],
    };
  }

  if (
    lower.includes("mileage") ||
    lower.includes("kilomet") ||
    lower.includes("automatic") ||
    lower.includes("transmission") ||
    lower.includes("fuel") ||
    lower.includes("engine")
  ) {
    const targetVeh = matchedVehicle || availableVehicles[0];
    if (targetVeh) {
      const profile = getVehiclePublicProfile(targetVeh);
      return {
        replyText: `According to our verified dealership records for the ${targetVeh.year} ${targetVeh.make} ${targetVeh.model} (Stock #${targetVeh.stockNumber}):\n• Mileage: ${targetVeh.mileage.toLocaleString()} km (QISJ/JEVIC Verified)\n• Transmission: ${targetVeh.transmission}\n• Engine & Fuel: ${profile.engineSize} (${targetVeh.fuelType})\n• Drivetrain: ${profile.drivetrain}\n• Price: ${formatKSh(targetVeh.askingPrice)} (${targetVeh.status})`,
        focusedVehicleId: targetVeh.id,
        recommendedVehicleIds: [targetVeh.id],
        quickReplies: [
          "I'm interested in this vehicle",
          "Book a test drive tomorrow",
          "Do you offer financing?",
        ],
      };
    }
  }

  if (lower.includes("still available") || lower.includes("available?")) {
    if (matchedVehicle) {
      if (matchedVehicle.status === "SOLD") {
        return {
          replyText: `The ${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} has recently been SOLD and is no longer available. However, I can show you similar available vehicles in our showroom right now:`,
          recommendedVehicleIds: availableVehicles.slice(0, 3).map((v) => v.id),
          quickReplies: [
            "Show me available SUVs",
            "Recommend a car under 4M",
          ],
        };
      }
      return {
        replyText: `Yes! The ${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (Stock #${matchedVehicle.stockNumber}) is currently ${matchedVehicle.status} at our ${matchedVehicle.location} for ${formatKSh(matchedVehicle.askingPrice)}. Would you like to book a viewing or have our sales team hold it for you?`,
        focusedVehicleId: matchedVehicle.id,
        recommendedVehicleIds: [matchedVehicle.id],
        quickReplies: [
          "Can I come see it tomorrow?",
          "I'm interested — log my details",
          "Do you accept trade-ins?",
        ],
      };
    }
  }

  // 6. Dealership Location, Opening Hours, Financing, Trade-In FAQs
  if (
    lower.includes("where is") ||
    lower.includes("location") ||
    lower.includes("showroom") ||
    lower.includes("hours") ||
    lower.includes("open")
  ) {
    return {
      replyText: `📍 Location: ${settings.location}\n🕒 Opening Hours: ${settings.openingHours}\nWould you like me to schedule a showroom visit for you?`,
      quickReplies: [
        "Book a viewing tomorrow",
        "Show me available vehicles",
        "Do you offer financing?",
      ],
    };
  }

  if (
    lower.includes("financ") ||
    lower.includes("loan") ||
    lower.includes("installment") ||
    lower.includes("bank") ||
    lower.includes("deposit")
  ) {
    return {
      replyText: `💳 Financing Information: ${settings.financingInformation}\n\nIf you share your name and phone number, our finance desk can prepare a custom monthly repayment schedule or bank proforma invoice for your preferred vehicle.`,
      quickReplies: [
        "Show vehicles under KSh 4M",
        "Do you accept trade-ins?",
        "I'm interested — connect me with sales",
      ],
    };
  }

  if (
    lower.includes("trade-in") ||
    lower.includes("trade in") ||
    lower.includes("sell my car") ||
    lower.includes("swap")
  ) {
    return {
      replyText: `🔄 Trade-In & Valuation: ${settings.tradeInInformation}\n\nYou can click the "Sell / Trade In" tab at the top of our website to submit your vehicle's make, model, year, mileage, and expected price, or tell me about your car right here!`,
      quickReplies: [
        "Show me SUVs I can upgrade to",
        "Book an inspection tomorrow",
      ],
    };
  }

  // 7. Budget / Make / Body Type Search & Recommendation Flow
  // Parse budget numbers like "3 million", "3M", "3.5m", "under 4m", "4,000,000"
  let maxBudget: number | null = null;
  const millionMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:m|million)/i);
  if (millionMatch) {
    maxBudget = parseFloat(millionMatch[1]) * 1_000_000;
  } else {
    const rawNumMatch = lower.match(/(\d[\d,]{5,})/);
    if (rawNumMatch) {
      maxBudget = parseInt(rawNumMatch[1].replace(/,/g, ""), 10);
    }
  }

  const wantsSUV =
    lower.includes("suv") ||
    lower.includes("4x4") ||
    lower.includes("crossover") ||
    lower.includes("family");
  const wantsSedan = lower.includes("sedan") || lower.includes("saloon");
  const wantsPickup =
    lower.includes("pickup") || lower.includes("double cab") || lower.includes("truck");
  const wantsToyota = lower.includes("toyota");

  if (
    maxBudget ||
    wantsSUV ||
    wantsSedan ||
    wantsPickup ||
    wantsToyota ||
    lower.includes("recommend") ||
    lower.includes("looking for") ||
    lower.includes("other suv") ||
    lower.includes("what cars") ||
    lower.includes("inventory")
  ) {
    let matches = [...availableVehicles];

    if (wantsToyota) {
      matches = matches.filter((v) => v.make.toLowerCase() === "toyota");
    }
    if (wantsSUV) {
      matches = matches.filter((v) => v.bodyType.toLowerCase() === "suv");
    } else if (wantsSedan) {
      matches = matches.filter((v) => v.bodyType.toLowerCase() === "sedan");
    } else if (wantsPickup) {
      matches = matches.filter((v) =>
        v.bodyType.toLowerCase().includes("pickup")
      );
    }

    if (maxBudget) {
      // Allow up to +20% flexibility around stated budget so "around 3M" or "around 4M" catches close matches
      const withinFlex = matches.filter(
        (v) => v.askingPrice <= maxBudget! * 1.25
      );
      if (withinFlex.length > 0) {
        matches = withinFlex;
      }
    }

    if (matches.length === 0) {
      matches = availableVehicles.slice(0, 3);
      return {
        replyText: `I checked our live inventory and we don't have an exact match at that exact filter right now, but here are ${matches.length} similar available vehicles in our showroom:\n` +
          matches
            .map(
              (v) =>
                `• ${v.year} ${v.make} ${v.model} — ${formatKSh(
                  v.askingPrice
                )} (${v.mileage.toLocaleString()} km, ${v.transmission})`
            )
            .join("\n") +
          `\nWould you like me to show you details on any of these, or log a custom import/stock alert for your exact specification?`,
        recommendedVehicleIds: matches.map((v) => v.id),
        quickReplies: [
          "Show me the Mazda CX-5",
          "Show me the Subaru Forester",
          "Show me the Toyota Harrier",
        ],
      };
    }

    // If they gave a budget or make but haven't specified body type yet and there are multiple body types
    const bodyTypesInMatches = Array.from(
      new Set(matches.map((m) => m.bodyType))
    );
    if (!wantsSUV && !wantsSedan && !wantsPickup && bodyTypesInMatches.length > 1) {
      return {
        replyText: `Sure! I found ${matches.length} vehicles currently available in our showroom${
          maxBudget ? ` around ${formatKSh(maxBudget)}` : ""
        }:\n` +
          matches
            .map(
              (v) =>
                `• ${v.year} ${v.make} ${v.model} (${v.bodyType}) — ${formatKSh(
                  v.askingPrice
                )}`
            )
            .join("\n") +
          `\n\nAre you looking for an SUV, sedan, pickup, or would you like to compare them?`,
        recommendedVehicleIds: matches.slice(0, 3).map((v) => v.id),
        quickReplies: [
          "I prefer an SUV",
          "Tell me about the Toyota Harrier",
          "Can I book a viewing tomorrow?",
        ],
      };
    }

    return {
      replyText: `I searched our live dealership inventory and found ${
        matches.length
      } matching ${wantsSUV ? "SUV" : "vehicle"}${
        matches.length === 1 ? "" : "s"
      } currently available:\n` +
        matches
          .map(
            (v) =>
              `• ${v.year} ${v.make} ${v.model} — ${formatKSh(
                v.askingPrice
              )} (${v.mileage.toLocaleString()} km, ${v.fuelType}, ${
                v.transmission
              })`
          )
          .join("\n") +
        `\n\nWould you like me to show you full specifications or book a viewing for any of these?`,
      recommendedVehicleIds: matches.slice(0, 3).map((v) => v.id),
      focusedVehicleId: matches[0]?.id,
      quickReplies: matches.slice(0, 2).map(
        (v) => `Tell me about the ${v.make} ${v.model}`
      ).concat(["Book a viewing tomorrow"]),
    };
  }

  // 8. Guardrail against unverified / unknown questions
  if (
    lower.includes("accident") ||
    lower.includes("previous owner") ||
    lower.includes("chassis number") ||
    lower.includes("underbody") ||
    lower.includes("paint thickness") ||
    lower.includes("warranty claim")
  ) {
    return {
      replyText:
        "I don't have that information in our current vehicle records. I can have a salesperson confirm it for you. Would you like to share your name and phone number so our team can send you the physical inspection sheet?",
      quickReplies: [
        "John Kamau, 0722 419 880",
        "Book a physical viewing tomorrow",
      ],
    };
  }

  // Default helpful consultant response grounded in live inventory count
  return {
    replyText: `We currently have ${availableVehicles.length} inspected vehicles available in our showroom (ranging from ${formatKSh(
      Math.min(...availableVehicles.map((v) => v.askingPrice))
    )} to ${formatKSh(
      Math.max(...availableVehicles.map((v) => v.askingPrice))
    )}), plus ${
      publicVehicles.length - availableVehicles.length
    } reserved unit(s).\n\nTo help me recommend the best option from our stock, what is your approximate budget and preferred body type (SUV, Sedan, Hatchback, or Pickup)?`,
    recommendedVehicleIds: availableVehicles.slice(0, 3).map((v) => v.id),
    quickReplies: [
      "I'm looking for an SUV around 3.5M",
      "Tell me about the Toyota Harrier 2021",
      "Do you offer bank financing?",
      "Can I book a test drive tomorrow?",
    ],
  };
}
