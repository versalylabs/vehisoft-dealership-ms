/**
 * Resilient Data Store & Neon Postgres Hybrid Layer
 * Automatically uses live Neon PostgreSQL via Prisma when a real DATABASE_URL is configured,
 * and falls back to an interactive seeded store when DATABASE_URL is still the template placeholder.
 */

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL || "";
  return (
    Boolean(url) &&
    !url.includes("ep-example") &&
    !url.includes("user:password@")
  );
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "MANAGER" | "SALESPERSON" | "INVENTORY_STAFF";
  branchName: string;
  isActive: boolean;
}

export type ExpenseCategoryType =
  | "PURCHASE"
  | "TRANSPORT"
  | "REPAIRS"
  | "DETAILING"
  | "INSPECTION"
  | "REGISTRATION"
  | "INSURANCE"
  | "ADVERTISING"
  | "OTHER";

export interface DemoExpense {
  id: string;
  vehicleId: string;
  category: ExpenseCategoryType;
  description: string;
  amount: number;
  incurredAt: string;
  loggedByName: string;
}

export interface DemoVehicleImage {
  id: string;
  url: string;
  category: "EXTERIOR" | "INTERIOR" | "ENGINE" | "DOCUMENT";
  caption: string;
}

export interface DemoVehicleHistoryItem {
  id: string;
  eventType:
    | "PRICE_CHANGE"
    | "STATUS_CHANGE"
    | "RESERVATION"
    | "ENQUIRY"
    | "OFFER"
    | "SALE"
    | "EXPENSE"
    | "ACQUISITION";
  description: string;
  previousVal?: string;
  newVal?: string;
  createdByName: string;
  createdAt: string;
}

export type VehicleStatusType =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "PENDING_ACQUISITION"
  | "IN_TRANSIT"
  | "ARCHIVED";

export interface DemoVehicle {
  id: string;
  stockNumber: string;
  registrationNumber: string;
  vin: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  status: VehicleStatusType;
  location: string;
  purchasePrice: number;
  askingPrice: number;
  minimumPrice: number;
  actualSalePrice?: number | null;
  supplierId: string;
  supplierName: string;
  dateAcquired: string;
  notes: string;
  imageUrl: string;
  images: DemoVehicleImage[];
  expenses: DemoExpense[];
  history: DemoVehicleHistoryItem[];
}

export interface DemoSupplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type:
    | "LOCAL_OWNER"
    | "IMPORTER"
    | "AUCTION"
    | "DEALER"
    | "TRADE_IN"
    | "COMPANY_FLEET";
  notes: string;
}

export type CustomerTypeEnum = "INDIVIDUAL" | "COMPANY" | "DEALER" | "FLEET";

export interface DemoCustomer {
  id: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  email: string;
  address: string;
  location: string;
  idPassportNo?: string;
  customerType: CustomerTypeEnum;
  preferredMakes: string;
  preferredModels: string;
  budgetMin: number;
  budgetMax: number;
  preferredYear: number;
  preferredFuel: string;
  preferredTrans: string;
  preferredBody: string;
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  lastInteraction: string;
  pipelineStage: PipelineStageType;
  notes?: string;
}

export type PipelineStageType =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "VIEWING"
  | "TEST_DRIVE"
  | "NEGOTIATION"
  | "RESERVED"
  | "SOLD"
  | "LOST";

export type LeadSourceType =
  | "WALK_IN"
  | "WEBSITE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "WHATSAPP"
  | "PHONE"
  | "REFERRAL"
  | "DEALER"
  | "MARKETPLACE"
  | "OTHER";

export interface DemoLead {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleStockNo: string;
  askingPrice: number;
  source: LeadSourceType;
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  budget: number;
  expectedPurchaseDate: string;
  stage: PipelineStageType;
  probability: number;
  lastContactAt: string;
  nextFollowUpAt: string;
  notes: string;
  lostReason?: string;
}

export type ActivityTypeEnum =
  | "CALL"
  | "WHATSAPP"
  | "SMS"
  | "EMAIL"
  | "MEETING"
  | "VEHICLE_VIEWING"
  | "TEST_DRIVE"
  | "FOLLOW_UP"
  | "NOTE";

export type ActivityStatusEnum = "DUE" | "COMPLETED" | "OVERDUE" | "CANCELLED";

export interface DemoActivity {
  id: string;
  type: ActivityTypeEnum;
  status: ActivityStatusEnum;
  customerId: string;
  customerName: string;
  leadId?: string;
  vehicleId?: string;
  vehicleTitle: string;
  staffId: string;
  staffName: string;
  scheduledAt: string;
  notes: string;
  nextAction: string;
}

export type TestDriveStatusEnum = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface DemoTestDrive {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleTitle: string;
  stockNumber: string;
  salespersonId: string;
  salespersonName: string;
  scheduledAt: string;
  driverName: string;
  driverLicenseNo: string;
  mileageOut: number;
  mileageIn?: number | null;
  status: TestDriveStatusEnum;
  notes: string;
  outcome: string;
}

export type PaymentStatusEnum =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "REFUNDED";

export interface DemoReservation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleTitle: string;
  stockNumber: string;
  reservedById: string;
  reservedByName: string;
  reservationDate: string;
  expiryDate: string;
  depositAmount: number;
  depositStatus: PaymentStatusEnum;
  isActive: boolean;
  notes: string;
}

export interface DemoSale {
  id: string;
  saleNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleTitle: string;
  stockNumber: string;
  registrationNumber: string;
  vin: string;
  salespersonId: string;
  salespersonName: string;
  salePrice: number;
  discount: number;
  depositPaid: number;
  balanceDue: number;
  paymentMethod: string;
  paymentStatus: PaymentStatusEnum;
  purchaseCostSnapshot: number;
  expensesSnapshot: number;
  grossProfit: number;
  saleDate: string;
  notes: string;
}

const daysAgoISO = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();
const daysAheadISO = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString();

export const INITIAL_USERS: DemoUser[] = [
  {
    id: "usr-admin",
    name: "David Mwangi (Versaly Admin)",
    email: "versalylabs@gmail.com",
    phone: "+254 704 611 033",
    role: "ADMIN",
    branchName: "Ngong Road Showroom (HQ)",
    isActive: true,
  },
  {
    id: "usr-manager",
    name: "Grace Wanjiku",
    email: "manager@vehisoft.co.ke",
    phone: "+254 722 111 002",
    role: "MANAGER",
    branchName: "Ngong Road Showroom (HQ)",
    isActive: true,
  },
  {
    id: "usr-brian",
    name: "Brian Ochieng",
    email: "brian@vehisoft.co.ke",
    phone: "+254 722 111 003",
    role: "SALESPERSON",
    branchName: "Ngong Road Showroom (HQ)",
    isActive: true,
  },
  {
    id: "usr-peter",
    name: "Peter Kiprop",
    email: "peter@vehisoft.co.ke",
    phone: "+254 722 111 004",
    role: "SALESPERSON",
    branchName: "Ngong Road Showroom (HQ)",
    isActive: true,
  },
  {
    id: "usr-inv",
    name: "Samuel Njoroge",
    email: "inventory@vehisoft.co.ke",
    phone: "+254 722 111 005",
    role: "INVENTORY_STAFF",
    branchName: "Ngong Road Showroom (HQ)",
    isActive: true,
  },
];

export const INITIAL_SUPPLIERS: DemoSupplier[] = [
  {
    id: "sup-1",
    name: "Yokohama Auto Auction Imports",
    phone: "+81 45 000 1122",
    email: "exports@yokohama-auto.jp",
    address: "Yokohama Port, Japan / Mombasa CFS",
    type: "IMPORTER",
    notes: "Primary direct exporter for Grade 4.5+ Japanese SUVs & sedans.",
  },
  {
    id: "sup-2",
    name: "USS Tokyo Auto Auction",
    phone: "+81 3 5500 9900",
    email: "bidding@usstokyo.jp",
    address: "Chiba / Tokyo, Japan",
    type: "AUCTION",
    notes: "Direct auction house bidding for clean low-mileage units.",
  },
  {
    id: "sup-3",
    name: "Dr. Anthony Mutua (Trade-In)",
    phone: "+254 733 888 999",
    email: "amutua@gmail.com",
    address: "Karen, Nairobi",
    type: "TRADE_IN",
    notes: "Traded in 2019 Subaru Forester against a new Land Cruiser Prado.",
  },
  {
    id: "sup-4",
    name: "East Africa Corporate Fleet Disposals",
    phone: "+254 711 222 333",
    email: "fleet@eacorporate.co.ke",
    address: "Industrial Area, Nairobi",
    type: "COMPANY_FLEET",
    notes: "Dealer-maintained executive corporate lease returns.",
  },
];

export const INITIAL_VEHICLES: DemoVehicle[] = [
  {
    id: "veh-1001",
    stockNumber: "VH-1001",
    registrationNumber: "KDR 450X",
    vin: "ZSU60-0084921",
    make: "Toyota",
    model: "Harrier",
    variant: "2.0 Premium Elegance",
    year: 2021,
    color: "Pearl White",
    mileage: 42000,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 3550000,
    askingPrice: 4200000,
    minimumPrice: 4050000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(18),
    notes:
      "Grade 4.5B import. Panoramic sunroof, power tailgate, half-leather seats, JBL premium audio, Toyota Safety Sense.",
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-101",
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Front 3/4 Showroom View",
      },
      {
        id: "img-102",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
        category: "INTERIOR",
        caption: "Premium Leather & Alcantara Cabin",
      },
      {
        id: "img-103",
        url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
        category: "ENGINE",
        caption: "2.0L Valvematic Engine Bay",
      },
      {
        id: "img-104",
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
        category: "DOCUMENT",
        caption: "QISJ Inspection Certificate & Mombasa Customs Entry",
      },
    ],
    expenses: [
      {
        id: "exp-1",
        vehicleId: "veh-1001",
        category: "TRANSPORT",
        description: "Mombasa CFS to Nairobi showroom car carrier",
        amount: 45000,
        incurredAt: daysAgoISO(17),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-2",
        vehicleId: "veh-1001",
        category: "REGISTRATION",
        description: "NTSA TIMS registration & KDR number plates",
        amount: 30000,
        incurredAt: daysAgoISO(15),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-3",
        vehicleId: "veh-1001",
        category: "DETAILING",
        description: "3-stage machine polish & interior ozone treatment",
        amount: 25000,
        incurredAt: daysAgoISO(14),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-1",
        eventType: "ACQUISITION",
        description:
          "Acquired from Yokohama Auto Auction Imports at KSh. 3,550,000",
        createdByName: "Samuel Njoroge",
        createdAt: daysAgoISO(18),
      },
      {
        id: "hist-2",
        eventType: "EXPENSE",
        description:
          "Logged KSh. 100,000 in transport, NTSA registration & detailing costs",
        createdByName: "Samuel Njoroge",
        createdAt: daysAgoISO(14),
      },
      {
        id: "hist-3",
        eventType: "ENQUIRY",
        description:
          "John Kamau enquired (Walk-in) — scheduled viewing & test drive with Brian",
        createdByName: "Brian Ochieng",
        createdAt: daysAgoISO(1),
      },
    ],
  },
  {
    id: "veh-1002",
    stockNumber: "VH-1002",
    registrationNumber: "KDS 118A",
    vin: "KF2P-304910",
    make: "Mazda",
    model: "CX-5",
    variant: "2.2 XD Proactive SkyActiv-D",
    year: 2020,
    color: "Soul Red Crystal",
    mileage: 58000,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "RESERVED",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 2650000,
    askingPrice: 3250000,
    minimumPrice: 3100000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(35),
    notes:
      "Heads-up display, radar cruise control, BOSE 10-speaker sound system, 360 view monitor.",
    imageUrl:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-201",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Soul Red Crystal Exterior",
      },
    ],
    expenses: [
      {
        id: "exp-4",
        vehicleId: "veh-1002",
        category: "TRANSPORT",
        description: "Mombasa port clearance & carrier transport",
        amount: 42000,
        incurredAt: daysAgoISO(33),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-5",
        vehicleId: "veh-1002",
        category: "INSPECTION",
        description: "Injector calibration & DPF health diagnostics",
        amount: 18000,
        incurredAt: daysAgoISO(30),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-4",
        eventType: "ACQUISITION",
        description:
          "Acquired from Yokohama Auto Auction Imports at KSh. 2,650,000",
        createdByName: "Samuel Njoroge",
        createdAt: daysAgoISO(35),
      },
      {
        id: "hist-5",
        eventType: "RESERVATION",
        description:
          "Reserved by Mary Atieno with KSh. 300,000 deposit (Status: Available → Reserved)",
        previousVal: "AVAILABLE",
        newVal: "RESERVED",
        createdByName: "Peter Kiprop",
        createdAt: daysAgoISO(2),
      },
    ],
  },
  {
    id: "veh-1003",
    stockNumber: "VH-1003",
    registrationNumber: "KDQ 889Z",
    vin: "GDJ150-992104",
    make: "Toyota",
    model: "Land Cruiser Prado",
    variant: "2.8 TX-L Package (7 Seater)",
    year: 2020,
    color: "Attitude Black",
    mileage: 51200,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "SOLD",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 6800000,
    askingPrice: 7900000,
    minimumPrice: 7650000,
    actualSalePrice: 7800000,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(25),
    notes:
      "Beige leather interior, sunroof, 360 camera, cooled center console box.",
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-301",
        url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Prado TX-L Attitude Black",
      },
    ],
    expenses: [
      {
        id: "exp-6",
        vehicleId: "veh-1003",
        category: "TRANSPORT",
        description: "Enclosed flatbed transport from Mombasa",
        amount: 65000,
        incurredAt: daysAgoISO(23),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-7",
        vehicleId: "veh-1003",
        category: "DETAILING",
        description: "Ceramic coating & underbody rust protection",
        amount: 35000,
        incurredAt: daysAgoISO(21),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-6",
        eventType: "SALE",
        description:
          "Sold to Apex Executive Holdings Ltd for KSh. 7,800,000 (Gross Profit: KSh. 900,000)",
        previousVal: "RESERVED",
        newVal: "SOLD",
        createdByName: "Brian Ochieng",
        createdAt: daysAgoISO(4),
      },
    ],
  },
  {
    id: "veh-1004",
    stockNumber: "VH-1004",
    registrationNumber: "KDP 712M",
    vin: "SK9-019283",
    make: "Subaru",
    model: "Forester",
    variant: "2.5i-L EyeSight AWD",
    year: 2019,
    color: "Dark Blue Pearl",
    mileage: 69000,
    fuelType: "Petrol",
    transmission: "CVT",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 2450000,
    askingPrice: 2950000,
    minimumPrice: 2800000,
    actualSalePrice: null,
    supplierId: "sup-3",
    supplierName: "Dr. Anthony Mutua (Trade-In)",
    dateAcquired: daysAgoISO(74),
    notes:
      "Local trade-in unit. X-Mode, EyeSight v4, power boot, new Bridgestone tyres.",
    imageUrl:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-401",
        url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Subaru Forester SK9 Exterior",
      },
    ],
    expenses: [
      {
        id: "exp-8",
        vehicleId: "veh-1004",
        category: "REPAIRS",
        description: "Major service, brake pads & suspension bushes",
        amount: 55000,
        incurredAt: daysAgoISO(68),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-9",
        vehicleId: "veh-1004",
        category: "ADVERTISING",
        description: "Featured listing boost on marketplace & Instagram",
        amount: 15000,
        incurredAt: daysAgoISO(15),
        loggedByName: "Grace Wanjiku",
      },
    ],
    history: [
      {
        id: "hist-7",
        eventType: "PRICE_CHANGE",
        description:
          "Reduced asking price from KSh. 3,100,000 to KSh. 2,950,000 (60+ days stock optimization)",
        previousVal: "KSh. 3,100,000",
        newVal: "KSh. 2,950,000",
        createdByName: "Grace Wanjiku",
        createdAt: daysAgoISO(12),
      },
    ],
  },
  {
    id: "veh-1005",
    stockNumber: "VH-1005",
    registrationNumber: "KDR 902P",
    vin: "WDD205-441092",
    make: "Mercedes-Benz",
    model: "C200",
    variant: "AMG Line 9G-Tronic",
    year: 2020,
    color: "Selenite Grey",
    mileage: 44500,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Sedan",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 3900000,
    askingPrice: 4650000,
    minimumPrice: 4450000,
    actualSalePrice: null,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(11),
    notes:
      "Digital cockpit, Burmester surround sound, AMG 18-inch alloys, cranberry red leather.",
    imageUrl:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-501",
        url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Mercedes-Benz C200 AMG Line",
      },
    ],
    expenses: [
      {
        id: "exp-10",
        vehicleId: "veh-1005",
        category: "TRANSPORT",
        description: "Mombasa to Nairobi carrier transport",
        amount: 45000,
        incurredAt: daysAgoISO(10),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-11",
        vehicleId: "veh-1005",
        category: "REGISTRATION",
        description: "NTSA registration & plates",
        amount: 30000,
        incurredAt: daysAgoISO(9),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-8",
        eventType: "ACQUISITION",
        description:
          "Acquired from USS Tokyo Auto Auction at KSh. 3,900,000",
        createdByName: "Samuel Njoroge",
        createdAt: daysAgoISO(11),
      },
    ],
  },
  {
    id: "veh-1006",
    stockNumber: "VH-1006",
    registrationNumber: "Pending KDS",
    vin: "GUN125-882310",
    make: "Toyota",
    model: "Hilux",
    variant: "2.8 GD-6 Rocco Double Cab 4x4",
    year: 2022,
    color: "Oxide Bronze",
    mileage: 31000,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "Double Cab Pickup",
    status: "IN_TRANSIT",
    location: "Mombasa Port CFS",
    purchasePrice: 5400000,
    askingPrice: 6350000,
    minimumPrice: 6150000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(5),
    notes:
      "Clearing at Mombasa Port CFS. Expected at Ngong Road Showroom in 3 days.",
    imageUrl:
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-601",
        url: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Hilux GD-6 Rocco 4x4",
      },
    ],
    expenses: [
      {
        id: "exp-12",
        vehicleId: "veh-1006",
        category: "INSURANCE",
        description: "Marine & transit insurance cover",
        amount: 38000,
        incurredAt: daysAgoISO(5),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-9",
        eventType: "ACQUISITION",
        description:
          "Vessel docked at Mombasa Port — Status set to In Transit",
        createdByName: "Samuel Njoroge",
        createdAt: daysAgoISO(5),
      },
    ],
  },
  {
    id: "veh-1007",
    stockNumber: "VH-1007",
    registrationNumber: "KDR 334K",
    vin: "MXAA54-209184",
    make: "Toyota",
    model: "RAV4",
    variant: "2.0 Adventure 4WD",
    year: 2019,
    color: "Urban Khaki",
    mileage: 49500,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "SOLD",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 3150000,
    askingPrice: 3900000,
    minimumPrice: 3750000,
    actualSalePrice: 3850000,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(29),
    notes:
      "Adventure trim with torque-vectoring AWD, orange-stitched leather cabin, roof rails, and Toyota Safety Sense.",
    imageUrl:
      "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-701",
        url: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "Toyota RAV4 Adventure 4WD",
      },
    ],
    expenses: [
      {
        id: "exp-13",
        vehicleId: "veh-1007",
        category: "TRANSPORT",
        description: "Mombasa port to Nairobi carrier transport",
        amount: 45000,
        incurredAt: daysAgoISO(27),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-14",
        vehicleId: "veh-1007",
        category: "REGISTRATION",
        description: "NTSA TIMS registration & number plates",
        amount: 30000,
        incurredAt: daysAgoISO(25),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-10",
        eventType: "SALE",
        description:
          "Sold to Dr. Cynthia Wambui for KSh. 3,850,000 (Gross Profit: KSh. 625,000)",
        previousVal: "AVAILABLE",
        newVal: "SOLD",
        createdByName: "Peter Kiprop",
        createdAt: daysAgoISO(1),
      },
    ],
  },
  {
    id: "veh-1008",
    stockNumber: "VH-1008",
    registrationNumber: "KDQ 505T",
    vin: "GDJ150-884120",
    make: "Toyota",
    model: "Land Cruiser Prado",
    variant: "2.8 VX-L 4WD (7 Seater)",
    year: 2021,
    color: "Pearl White",
    mileage: 38200,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 7100000,
    askingPrice: 8250000,
    minimumPrice: 7950000,
    actualSalePrice: null,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(95),
    notes:
      "Top-of-the-line VX-L with kinetic dynamic suspension (KDSS), sunroof, 360 camera, cool box, and heated/ventilated seats.",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    images: [
      {
        id: "img-801",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
        category: "EXTERIOR",
        caption: "2021 Land Cruiser Prado VX-L Pearl White",
      },
    ],
    expenses: [
      {
        id: "exp-15",
        vehicleId: "veh-1008",
        category: "TRANSPORT",
        description: "Mombasa port clearance & enclosed flatbed delivery",
        amount: 60000,
        incurredAt: daysAgoISO(92),
        loggedByName: "Samuel Njoroge",
      },
      {
        id: "exp-16",
        vehicleId: "veh-1008",
        category: "DETAILING",
        description: "Showroom ceramic coating & leather conditioning",
        amount: 35000,
        incurredAt: daysAgoISO(90),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-11",
        eventType: "ACQUISITION",
        description:
          "Acquired from USS Tokyo Auto Auction at KSh. 7,100,000",
        createdByName: "Samuel Njoroge",
        createdAt: daysAgoISO(95),
      },
    ],
  },
  {
    id: "veh-1009",
    stockNumber: "VH-1009",
    registrationNumber: "KDS 101A",
    vin: "VJA300-0019284",
    make: "Toyota",
    model: "Land Cruiser 300",
    variant: "3.5L Twin Turbo V6 ZX (7 Seater)",
    year: 2022,
    color: "Attitude Black Metallic",
    mileage: 22000,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 18500000,
    askingPrice: 21500000,
    minimumPrice: 20800000,
    actualSalePrice: null,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(8),
    notes:
      "Flagship LC300 ZX. Fingerprint ignition, dual rear entertainment, Modellista aero kit, JBL 14-speaker synthesis, refrigerated coolbox, adaptive variable suspension.",
    imageUrl:
      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-901",
        url: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Land Cruiser 300 ZX Front Profile",
      },
      {
        id: "img-902",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        category: "INTERIOR",
        caption: "Semi-Aniline Saddle Tan Leather Cabin",
      },
    ],
    expenses: [
      {
        id: "exp-17",
        vehicleId: "veh-1009",
        category: "TRANSPORT",
        description: "VIP Enclosed transport from Mombasa Port CFS",
        amount: 85000,
        incurredAt: daysAgoISO(7),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-12",
        eventType: "ACQUISITION",
        description: "Acquired from USS Tokyo Auto Auction at KSh. 18,500,000",
        createdByName: "David Mwangi",
        createdAt: daysAgoISO(8),
      },
    ],
  },
  {
    id: "veh-1010",
    stockNumber: "VH-1010",
    registrationNumber: "KDS 344L",
    vin: "WP1AA2AY5PDA0291",
    make: "Porsche",
    model: "Cayenne",
    variant: "4.0 V8 Twin-Turbo GTS Tiptronic",
    year: 2022,
    color: "Carrara White Metallic",
    mileage: 19500,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 12600000,
    askingPrice: 14800000,
    minimumPrice: 14200000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(14),
    notes:
      "453 hp twin-turbo V8 with sport exhaust system. Sport Chrono Package, 21-inch RS Spyder wheels in satin black, GTS interior package in Carmine Red stitching, Burmester 3D Sound.",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1001",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Porsche Cayenne GTS Front 3/4",
      },
    ],
    expenses: [
      {
        id: "exp-18",
        vehicleId: "veh-1010",
        category: "DETAILING",
        description: "Gtechniq Crystal Serum Ultra ceramic paint protection",
        amount: 45000,
        incurredAt: daysAgoISO(12),
        loggedByName: "Samuel Njoroge",
      },
    ],
    history: [
      {
        id: "hist-13",
        eventType: "ACQUISITION",
        description: "Acquired at KSh. 12,600,000",
        createdByName: "Grace Wanjiku",
        createdAt: daysAgoISO(14),
      },
    ],
  },
  {
    id: "veh-1011",
    stockNumber: "VH-1011",
    registrationNumber: "KDR 780D",
    vin: "W1N1671591A39102",
    make: "Mercedes-Benz",
    model: "GLE 450",
    variant: "3.0 EQ-Boost 4MATIC AMG Line",
    year: 2021,
    color: "Obsidian Black Metallic",
    mileage: 34000,
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 9400000,
    askingPrice: 11200000,
    minimumPrice: 10800000,
    actualSalePrice: null,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(20),
    notes:
      "MBUX dual 12.3-inch widescreen displays, heads-up display, panoramic sunroof, Airmatic air suspension, 21-inch AMG multi-spoke wheels.",
    imageUrl:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1101",
        url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Mercedes-Benz GLE 450 AMG Line",
      },
    ],
    expenses: [],
    history: [],
  },
  {
    id: "veh-1012",
    stockNumber: "VH-1012",
    registrationNumber: "KDR 622B",
    vin: "WBAJU81050L90412",
    make: "BMW",
    model: "X5",
    variant: "xDrive40i M Sport 3.0L B58",
    year: 2021,
    color: "Mineral White Metallic",
    mileage: 38500,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 8300000,
    askingPrice: 9800000,
    minimumPrice: 9500000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(16),
    notes:
      "BMW Laserlights, Harman Kardon surround audio, panoramic Sky Lounge LED roof, M Sport brakes with blue calipers, Cognac Vernasca leather.",
    imageUrl:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1201",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "BMW X5 xDrive40i M Sport",
      },
    ],
    expenses: [],
    history: [],
  },
  {
    id: "veh-1013",
    stockNumber: "VH-1013",
    registrationNumber: "KDS 488W",
    vin: "SALWR2V42MA89201",
    make: "Land Rover",
    model: "Range Rover Sport",
    variant: "3.0 D300 Dynamic HSE AWD",
    year: 2021,
    color: "Carpathian Grey Metallic",
    mileage: 31000,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 11800000,
    askingPrice: 13900000,
    minimumPrice: 13400000,
    actualSalePrice: null,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(22),
    notes:
      "Black Exterior Pack, sliding panoramic glass roof, Meridian 825W Surround Sound, 22-inch Style 5004 gloss black wheels, Ebony Windsor leather seats.",
    imageUrl:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1301",
        url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Range Rover Sport Dynamic HSE",
      },
    ],
    expenses: [],
    history: [],
  },
  {
    id: "veh-1014",
    stockNumber: "VH-1014",
    registrationNumber: "KDS 888Q",
    vin: "JTJHY7AX4N400921",
    make: "Lexus",
    model: "LX 600",
    variant: "VIP Executive 4-Seater Twin Turbo",
    year: 2022,
    color: "Sonic Titanium",
    mileage: 16800,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 22800000,
    askingPrice: 26000000,
    minimumPrice: 25200000,
    actualSalePrice: null,
    supplierId: "sup-2",
    supplierName: "USS Tokyo Auto Auction",
    dateAcquired: daysAgoISO(6),
    notes:
      "Ultra-exclusive VIP 4-seater with independent rear reclining massage Ottoman seats, Mark Levinson 25-speaker audio, dual 11.6-inch rear displays, adaptive variable suspension.",
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1401",
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Lexus LX 600 VIP Executive",
      },
    ],
    expenses: [],
    history: [],
  },
  {
    id: "veh-1015",
    stockNumber: "VH-1015",
    registrationNumber: "KDR 119H",
    vin: "WAUZZZ4M1LD01928",
    make: "Audi",
    model: "Q7",
    variant: "50 TDI Quattro S-Line (7 Seater)",
    year: 2020,
    color: "Daytona Grey Pearl",
    mileage: 46000,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 6200000,
    askingPrice: 7400000,
    minimumPrice: 7100000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(33),
    notes:
      "Audi Virtual Cockpit Plus, Matrix LED headlights, panoramic sunroof, Valcona leather with S-embossing, Bose 3D sound system.",
    imageUrl:
      "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1501",
        url: "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Audi Q7 50 TDI Quattro S-Line",
      },
    ],
    expenses: [],
    history: [],
  },
  {
    id: "veh-1016",
    stockNumber: "VH-1016",
    registrationNumber: "KDQ 940R",
    vin: "KF2P-201948",
    make: "Mazda",
    model: "CX-5",
    variant: "2.2 SkyActiv-D AWD L-Package",
    year: 2020,
    color: "Soul Red Crystal",
    mileage: 52000,
    fuelType: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    status: "AVAILABLE",
    location: "Ngong Road Showroom (HQ)",
    purchasePrice: 2750000,
    askingPrice: 3350000,
    minimumPrice: 3200000,
    actualSalePrice: null,
    supplierId: "sup-1",
    supplierName: "Yokohama Auto Auction Imports",
    dateAcquired: daysAgoISO(17),
    notes:
      "Top-tier L-Package in iconic Soul Red. Pure white Nappa leather, ventilated front seats, Bose 10-speaker sound, 360-degree monitor, adaptive LED headlights.",
    imageUrl:
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        id: "img-1601",
        url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
        category: "EXTERIOR",
        caption: "Mazda CX-5 Soul Red Crystal L-Package",
      },
    ],
    expenses: [],
    history: [],
  },
];

export const INITIAL_CUSTOMERS: DemoCustomer[] = [
  {
    id: "cust-1",
    fullName: "John Kamau",
    phone: "+254 712 345 678",
    altPhone: "+254 733 111 222",
    email: "j.kamau@outlook.com",
    address: "Rhapta Road, Westlands",
    location: "Westlands, Nairobi",
    idPassportNo: "29481023",
    customerType: "INDIVIDUAL",
    preferredMakes: "Toyota",
    preferredModels: "Harrier, RAV4",
    budgetMin: 3800000,
    budgetMax: 4400000,
    preferredYear: 2021,
    preferredFuel: "Petrol",
    preferredTrans: "Automatic",
    preferredBody: "SUV",
    assignedSalespersonId: "usr-brian",
    assignedSalespersonName: "Brian Ochieng",
    lastInteraction: daysAgoISO(1),
    pipelineStage: "TEST_DRIVE",
    notes:
      "Prefers Pearl White or Silver with panoramic roof. Ready cash buyer.",
  },
  {
    id: "cust-2",
    fullName: "Mary Atieno",
    phone: "+254 720 987 654",
    email: "mary.atieno@gmail.com",
    address: "Argwings Kodhek Rd, Kilimani",
    location: "Kilimani, Nairobi",
    idPassportNo: "31049281",
    customerType: "INDIVIDUAL",
    preferredMakes: "Mazda",
    preferredModels: "CX-5",
    budgetMin: 3000000,
    budgetMax: 3400000,
    preferredYear: 2020,
    preferredFuel: "Diesel",
    preferredTrans: "Automatic",
    preferredBody: "SUV",
    assignedSalespersonId: "usr-peter",
    assignedSalespersonName: "Peter Kiprop",
    lastInteraction: daysAgoISO(0),
    pipelineStage: "RESERVED",
    notes: "Paid KSh. 300,000 reservation deposit on VH-1002 Mazda CX-5.",
  },
  {
    id: "cust-3",
    fullName: "Apex Executive Holdings Ltd",
    phone: "+254 733 555 222",
    email: "procurement@apexholdings.co.ke",
    address: "Britam Tower, Upper Hill",
    location: "Upper Hill, Nairobi",
    idPassportNo: "PVT-882910",
    customerType: "COMPANY",
    preferredMakes: "Toyota, Mercedes-Benz",
    preferredModels: "Land Cruiser Prado, C200",
    budgetMin: 4500000,
    budgetMax: 8500000,
    preferredYear: 2020,
    preferredFuel: "Diesel",
    preferredTrans: "Automatic",
    preferredBody: "SUV",
    assignedSalespersonId: "usr-brian",
    assignedSalespersonName: "Brian Ochieng",
    lastInteraction: daysAgoISO(4),
    pipelineStage: "SOLD",
    notes:
      "Purchased 2020 Land Cruiser Prado (VH-1003). Interested in a C200 next.",
  },
  {
    id: "cust-4",
    fullName: "Eng. Kevin Mutua",
    phone: "+254 721 444 777",
    email: "kmutua@civilworks.co.ke",
    address: "Runda Evergreen",
    location: "Runda, Nairobi",
    idPassportNo: "24910294",
    customerType: "FLEET",
    preferredMakes: "Toyota, Isuzu",
    preferredModels: "Hilux Rocco, D-Max",
    budgetMin: 5800000,
    budgetMax: 6600000,
    preferredYear: 2022,
    preferredFuel: "Diesel",
    preferredTrans: "Automatic",
    preferredBody: "Double Cab Pickup",
    assignedSalespersonId: "usr-brian",
    assignedSalespersonName: "Brian Ochieng",
    lastInteraction: daysAgoISO(2),
    pipelineStage: "NEGOTIATION",
    notes: "Negotiating on the incoming 2022 Hilux Rocco (VH-1006).",
  },
  {
    id: "cust-5",
    fullName: "c/o Rift Valley Auto Mart",
    phone: "+254 725 800 900",
    email: "traders@rvautomart.co.ke",
    address: "Kenyatta Avenue, Nakuru",
    location: "Nakuru",
    idPassportNo: "BN-440192",
    customerType: "DEALER",
    preferredMakes: "Subaru, Toyota",
    preferredModels: "Forester, Fielder",
    budgetMin: 2500000,
    budgetMax: 3100000,
    preferredYear: 2019,
    preferredFuel: "Petrol",
    preferredTrans: "CVT",
    preferredBody: "SUV",
    assignedSalespersonId: "usr-peter",
    assignedSalespersonName: "Peter Kiprop",
    lastInteraction: daysAgoISO(3),
    pipelineStage: "VIEWING",
    notes: "Trade partner looking to inspect VH-1004 Subaru Forester.",
  },
  {
    id: "cust-6",
    fullName: "Dr. Cynthia Wambui",
    phone: "+254 718 654 321",
    email: "cwambui@nairobihospital.org",
    address: "Lavington Green",
    location: "Lavington, Nairobi",
    idPassportNo: "28192044",
    customerType: "INDIVIDUAL",
    preferredMakes: "Mercedes-Benz, BMW",
    preferredModels: "C200, X3",
    budgetMin: 4300000,
    budgetMax: 4800000,
    preferredYear: 2020,
    preferredFuel: "Petrol",
    preferredTrans: "Automatic",
    preferredBody: "Sedan",
    assignedSalespersonId: "usr-peter",
    assignedSalespersonName: "Peter Kiprop",
    lastInteraction: daysAgoISO(0),
    pipelineStage: "QUALIFIED",
    notes: "Pre-approved asset finance with NCBA Bank up to KSh. 4.7M.",
  },
];

export const INITIAL_LEADS: DemoLead[] = [
  {
    id: "lead-1",
    customerId: "cust-1",
    customerName: "John Kamau",
    customerPhone: "+254 712 345 678",
    vehicleId: "veh-1001",
    vehicleTitle: "Toyota Harrier 2021",
    vehicleStockNo: "VH-1001",
    askingPrice: 4200000,
    source: "WALK_IN",
    assignedSalespersonId: "usr-brian",
    assignedSalespersonName: "Brian Ochieng",
    budget: 4200000,
    expectedPurchaseDate: daysAheadISO(5),
    stage: "TEST_DRIVE",
    probability: 70,
    lastContactAt: daysAgoISO(1),
    nextFollowUpAt: daysAgoISO(0),
    notes: "Viewed Pearl White Harrier yesterday. Test drive booked for today.",
  },
  {
    id: "lead-2",
    customerId: "cust-2",
    customerName: "Mary Atieno",
    customerPhone: "+254 720 987 654",
    vehicleId: "veh-1002",
    vehicleTitle: "Mazda CX-5 2020",
    vehicleStockNo: "VH-1002",
    askingPrice: 3250000,
    source: "INSTAGRAM",
    assignedSalespersonId: "usr-peter",
    assignedSalespersonName: "Peter Kiprop",
    budget: 3250000,
    expectedPurchaseDate: daysAheadISO(4),
    stage: "RESERVED",
    probability: 90,
    lastContactAt: daysAgoISO(0),
    nextFollowUpAt: daysAgoISO(0),
    notes: "Paid KSh. 300,000 deposit. Awaiting bank financing undertaking.",
  },
  {
    id: "lead-3",
    customerId: "cust-4",
    customerName: "Eng. Kevin Mutua",
    customerPhone: "+254 721 444 777",
    vehicleId: "veh-1006",
    vehicleTitle: "Toyota Hilux 2022",
    vehicleStockNo: "VH-1006",
    askingPrice: 6350000,
    source: "REFERRAL",
    assignedSalespersonId: "usr-brian",
    assignedSalespersonName: "Brian Ochieng",
    budget: 6250000,
    expectedPurchaseDate: daysAheadISO(7),
    stage: "NEGOTIATION",
    probability: 80,
    lastContactAt: daysAgoISO(2),
    nextFollowUpAt: daysAheadISO(1),
    notes: "Offered KSh. 6.25M upon arrival from Mombasa CFS.",
  },
  {
    id: "lead-4",
    customerId: "cust-5",
    customerName: "c/o Rift Valley Auto Mart",
    customerPhone: "+254 725 800 900",
    vehicleId: "veh-1004",
    vehicleTitle: "Subaru Forester 2019",
    vehicleStockNo: "VH-1004",
    askingPrice: 2950000,
    source: "DEALER",
    assignedSalespersonId: "usr-peter",
    assignedSalespersonName: "Peter Kiprop",
    budget: 2850000,
    expectedPurchaseDate: daysAheadISO(6),
    stage: "VIEWING",
    probability: 55,
    lastContactAt: daysAgoISO(3),
    nextFollowUpAt: daysAgoISO(0),
    notes: "Scheduled showroom inspection at Ngong Road.",
  },
  {
    id: "lead-5",
    customerId: "cust-6",
    customerName: "Dr. Cynthia Wambui",
    customerPhone: "+254 718 654 321",
    vehicleId: "veh-1005",
    vehicleTitle: "Mercedes-Benz C200 2020",
    vehicleStockNo: "VH-1005",
    askingPrice: 4650000,
    source: "WEBSITE",
    assignedSalespersonId: "usr-peter",
    assignedSalespersonName: "Peter Kiprop",
    budget: 4600000,
    expectedPurchaseDate: daysAheadISO(10),
    stage: "QUALIFIED",
    probability: 45,
    lastContactAt: daysAgoISO(0),
    nextFollowUpAt: daysAheadISO(2),
    notes: "Shared proforma invoice for NCBA asset finance.",
  },
  {
    id: "lead-6",
    customerId: "cust-3",
    customerName: "Apex Executive Holdings Ltd",
    customerPhone: "+254 733 555 222",
    vehicleId: "veh-1003",
    vehicleTitle: "Toyota Land Cruiser Prado 2020",
    vehicleStockNo: "VH-1003",
    askingPrice: 7900000,
    source: "WALK_IN",
    assignedSalespersonId: "usr-brian",
    assignedSalespersonName: "Brian Ochieng",
    budget: 7800000,
    expectedPurchaseDate: daysAgoISO(4),
    stage: "SOLD",
    probability: 100,
    lastContactAt: daysAgoISO(4),
    nextFollowUpAt: daysAheadISO(30),
    notes: "Closed sale at KSh. 7,800,000 via RTGS.",
  },
];

export const INITIAL_ACTIVITIES: DemoActivity[] = [
  {
    id: "act-1",
    type: "CALL",
    status: "DUE",
    customerId: "cust-1",
    customerName: "John Kamau",
    leadId: "lead-1",
    vehicleId: "veh-1001",
    vehicleTitle: "Toyota Harrier 2021",
    staffId: "usr-brian",
    staffName: "Brian Ochieng",
    scheduledAt: daysAgoISO(0),
    notes: "Call John to confirm 2:30 PM test drive arrival with his spouse.",
    nextAction: "Execute test drive and present KSh. 4.2M offer sheet",
  },
  {
    id: "act-2",
    type: "WHATSAPP",
    status: "DUE",
    customerId: "cust-2",
    customerName: "Mary Atieno",
    leadId: "lead-2",
    vehicleId: "veh-1002",
    vehicleTitle: "Mazda CX-5 2020",
    staffId: "usr-peter",
    staffName: "Peter Kiprop",
    scheduledAt: daysAgoISO(0),
    notes:
      "Send scanned logbook & valuation report via WhatsApp for bank release.",
    nextAction: "Follow up on balance payment clearance",
  },
  {
    id: "act-3",
    type: "VEHICLE_VIEWING",
    status: "DUE",
    customerId: "cust-5",
    customerName: "c/o Rift Valley Auto Mart",
    leadId: "lead-4",
    vehicleId: "veh-1004",
    vehicleTitle: "Subaru Forester 2019",
    staffId: "usr-peter",
    staffName: "Peter Kiprop",
    scheduledAt: daysAgoISO(0),
    notes: "Host buyer mechanic inspection at Ngong Road yard.",
    nextAction: "Agree on trade price above KSh. 2.85M",
  },
  {
    id: "act-4",
    type: "EMAIL",
    status: "COMPLETED",
    customerId: "cust-6",
    customerName: "Dr. Cynthia Wambui",
    leadId: "lead-5",
    vehicleId: "veh-1005",
    vehicleTitle: "Mercedes-Benz C200 2020",
    staffId: "usr-peter",
    staffName: "Peter Kiprop",
    scheduledAt: daysAgoISO(1),
    notes:
      "Emailed official proforma invoice (KSh. 4,650,000) to Dr. Cynthia & NCBA relationship manager.",
    nextAction: "Schedule showroom viewing once bank letter is issued",
  },
];

export const INITIAL_TEST_DRIVES: DemoTestDrive[] = [
  {
    id: "td-1",
    customerId: "cust-1",
    customerName: "John Kamau",
    customerPhone: "+254 712 345 678",
    vehicleId: "veh-1001",
    vehicleTitle: "2021 Toyota Harrier",
    stockNumber: "VH-1001",
    salespersonId: "usr-brian",
    salespersonName: "Brian Ochieng",
    scheduledAt: daysAgoISO(0),
    driverName: "John Kamau",
    driverLicenseNo: "DL-KE-8849201",
    mileageOut: 42000,
    mileageIn: null,
    status: "SCHEDULED",
    notes: "Southern Bypass loop route from Ngong Road Showroom.",
    outcome: "Pending completion",
  },
  {
    id: "td-2",
    customerId: "cust-2",
    customerName: "Mary Atieno",
    customerPhone: "+254 720 987 654",
    vehicleId: "veh-1002",
    vehicleTitle: "2020 Mazda CX-5",
    stockNumber: "VH-1002",
    salespersonId: "usr-peter",
    salespersonName: "Peter Kiprop",
    scheduledAt: daysAgoISO(3),
    driverName: "Mary Atieno",
    driverLicenseNo: "DL-KE-5519204",
    mileageOut: 57982,
    mileageIn: 58000,
    status: "COMPLETED",
    notes: "Tested SkyActiv-D highway acceleration & radar cruise control.",
    outcome: "Very impressed — paid KSh. 300,000 reservation deposit immediately.",
  },
  {
    id: "td-3",
    customerId: "cust-3",
    customerName: "Apex Executive Holdings Ltd",
    customerPhone: "+254 733 555 222",
    vehicleId: "veh-1003",
    vehicleTitle: "2020 Toyota Land Cruiser Prado",
    stockNumber: "VH-1003",
    salespersonId: "usr-brian",
    salespersonName: "Brian Ochieng",
    scheduledAt: daysAgoISO(6),
    driverName: "Capt. Joseph Kariuki (Fleet Dir.)",
    driverLicenseNo: "DL-KE-1102938",
    mileageOut: 51175,
    mileageIn: 51200,
    status: "COMPLETED",
    notes: "Full executive test drive & AA inspection check.",
    outcome: "Approved for immediate RTGS purchase at KSh. 7.8M.",
  },
];

export const INITIAL_RESERVATIONS: DemoReservation[] = [
  {
    id: "res-1",
    customerId: "cust-2",
    customerName: "Mary Atieno",
    customerPhone: "+254 720 987 654",
    vehicleId: "veh-1002",
    vehicleTitle: "2020 Mazda CX-5 (KDS 118A)",
    stockNumber: "VH-1002",
    reservedById: "usr-peter",
    reservedByName: "Peter Kiprop",
    reservationDate: daysAgoISO(2),
    expiryDate: daysAheadISO(5),
    depositAmount: 300000,
    depositStatus: "PAID",
    isActive: true,
    notes:
      "7-day hold against KSh. 300,000 M-Pesa/Bank deposit while Stanbic Bank processes balance release.",
  },
];

export const INITIAL_SALES: DemoSale[] = [
  {
    id: "sale-1",
    saleNumber: "SL-2026-001",
    customerId: "cust-3",
    customerName: "Apex Executive Holdings Ltd",
    customerPhone: "+254 733 555 222",
    vehicleId: "veh-1003",
    vehicleTitle: "2020 Toyota Land Cruiser Prado TX-L",
    stockNumber: "VH-1003",
    registrationNumber: "KDQ 889Z",
    vin: "GDJ150-992104",
    salespersonId: "usr-brian",
    salespersonName: "Brian Ochieng",
    salePrice: 7800000,
    discount: 100000,
    depositPaid: 7800000,
    balanceDue: 0,
    paymentMethod: "Bank Transfer (RTGS)",
    paymentStatus: "PAID",
    purchaseCostSnapshot: 6800000,
    expensesSnapshot: 100000,
    grossProfit: 900000,
    saleDate: daysAgoISO(4),
    notes:
      "Full RTGS payment cleared. NTSA TIMS logbook transfer completed.",
  },
  {
    id: "sale-2",
    saleNumber: "SL-2026-002",
    customerId: "cust-6",
    customerName: "Dr. Cynthia Wambui",
    customerPhone: "+254 718 654 321",
    vehicleId: "veh-1007",
    vehicleTitle: "2019 Toyota RAV4 2.0 Adventure 4WD",
    stockNumber: "VH-1007",
    registrationNumber: "KDR 334K",
    vin: "MXAA54-209184",
    salespersonId: "usr-peter",
    salespersonName: "Peter Kiprop",
    salePrice: 3850000,
    discount: 50000,
    depositPaid: 2850000,
    balanceDue: 1000000,
    paymentMethod: "Asset Finance / Bank Release",
    paymentStatus: "PARTIALLY_PAID",
    purchaseCostSnapshot: 3150000,
    expensesSnapshot: 75000,
    grossProfit: 625000,
    saleDate: daysAgoISO(1),
    notes:
      "KSh. 2.85M deposit received. Balance of KSh. 1.0M awaiting NCBA Bank release upon logbook transfer.",
  },
];
