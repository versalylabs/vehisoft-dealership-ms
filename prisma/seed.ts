import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Vehisoft Dealership Management System (KSh.)...");

  // 1. Dealership Settings
  await prisma.dealershipSettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      dealershipName: "Vehisoft Motors Ltd",
      tagline: "Trusted Imported & Local Quality Vehicles",
      phone: "+254 700 123 456",
      email: "sales@vehisoft.co.ke",
      address: "Ngong Road, Opposite Prestige Plaza, Nairobi",
      currencySymbol: "KSh.",
      currencyCode: "KES",
      stockNumberPrefix: "VH-",
      nextStockSequence: 1007,
      targetInventoryDays: 60,
      defaultReservationDays: 7,
    },
  });

  // 2. Main Branch
  const mainBranch = await prisma.branch.upsert({
    where: { id: "branch-nairobi-main" },
    update: {},
    create: {
      id: "branch-nairobi-main",
      name: "Ngong Road Showroom (HQ)",
      location: "Nairobi",
      phone: "+254 700 123 456",
      isMain: true,
    },
  });

  // 3. Users across all 4 RBAC roles
  const defaultPassword = await bcrypt.hash("Vehisoft@2026", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vehisoft.co.ke" },
    update: {},
    create: {
      name: "David Mwangi (Director)",
      email: "admin@vehisoft.co.ke",
      passwordHash: defaultPassword,
      phone: "+254 722 111 001",
      role: "ADMIN",
      branchId: mainBranch.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@vehisoft.co.ke" },
    update: {},
    create: {
      name: "Grace Wanjiku (Sales Manager)",
      email: "manager@vehisoft.co.ke",
      passwordHash: defaultPassword,
      phone: "+254 722 111 002",
      role: "MANAGER",
      branchId: mainBranch.id,
    },
  });

  const brian = await prisma.user.upsert({
    where: { email: "brian@vehisoft.co.ke" },
    update: {},
    create: {
      name: "Brian Ochieng",
      email: "brian@vehisoft.co.ke",
      passwordHash: defaultPassword,
      phone: "+254 722 111 003",
      role: "SALESPERSON",
      branchId: mainBranch.id,
    },
  });

  const peter = await prisma.user.upsert({
    where: { email: "peter@vehisoft.co.ke" },
    update: {},
    create: {
      name: "Peter Kiprop",
      email: "peter@vehisoft.co.ke",
      passwordHash: defaultPassword,
      phone: "+254 722 111 004",
      role: "SALESPERSON",
      branchId: mainBranch.id,
    },
  });

  const invStaff = await prisma.user.upsert({
    where: { email: "inventory@vehisoft.co.ke" },
    update: {},
    create: {
      name: "Samuel Njoroge (Yard Operations)",
      email: "inventory@vehisoft.co.ke",
      passwordHash: defaultPassword,
      phone: "+254 722 111 005",
      role: "INVENTORY_STAFF",
      branchId: mainBranch.id,
    },
  });

  // 4. Suppliers
  const sbtJapan = await prisma.supplier.upsert({
    where: { id: "sup-sbt-japan" },
    update: {},
    create: {
      id: "sup-sbt-japan",
      name: "Yokohama Auto Auction Imports",
      phone: "+81 45 000 1122",
      email: "exports@yokohama-auto.jp",
      address: "Yokohama Port, Japan / Mombasa CFS",
      type: "IMPORTER",
      notes: "Direct Japanese auction grade 4.5+ units via Mombasa port.",
    },
  });

  const localTradeIn = await prisma.supplier.upsert({
    where: { id: "sup-local-trade" },
    update: {},
    create: {
      id: "sup-local-trade",
      name: "Dr. Anthony Mutua (Trade-In)",
      phone: "+254 733 888 999",
      email: "amutua@gmail.com",
      address: "Karen, Nairobi",
      type: "TRADE_IN",
      notes: "Well-maintained local trade-in unit.",
    },
  });

  // 5. Vehicles (Prices in KSh.)
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const harrier = await prisma.vehicle.upsert({
    where: { stockNumber: "VH-1001" },
    update: {},
    create: {
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
      supplierId: sbtJapan.id,
      branchId: mainBranch.id,
      dateAcquired: daysAgo(18),
      notes: "Panoramic sunroof, power tailgate, half-leather seats, JBL sound.",
      expenses: {
        create: [
          {
            category: "TRANSPORT",
            description: "Mombasa to Nairobi carrier transport",
            amount: 45000,
            loggedById: invStaff.id,
          },
          {
            category: "DETAILING",
            description: "Full ceramic buffing and interior valet",
            amount: 25000,
            loggedById: invStaff.id,
          },
          {
            category: "REGISTRATION",
            description: "NTSA registration & number plates",
            amount: 30000,
            loggedById: invStaff.id,
          },
        ],
      },
    },
  });

  const cx5 = await prisma.vehicle.upsert({
    where: { stockNumber: "VH-1002" },
    update: {},
    create: {
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
      supplierId: sbtJapan.id,
      branchId: mainBranch.id,
      dateAcquired: daysAgo(35),
      notes: "Heads-up display, radar cruise control, BOSE audio.",
      expenses: {
        create: [
          {
            category: "TRANSPORT",
            description: "Mombasa port clearance & transport",
            amount: 42000,
            loggedById: invStaff.id,
          },
          {
            category: "INSPECTION",
            description: "Injector & DPF health diagnostics",
            amount: 18000,
            loggedById: invStaff.id,
          },
        ],
      },
    },
  });

  const prado = await prisma.vehicle.upsert({
    where: { stockNumber: "VH-1003" },
    update: {},
    create: {
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
      supplierId: sbtJapan.id,
      branchId: mainBranch.id,
      dateAcquired: daysAgo(25),
      notes: "Beige leather interior, sunroof, 360 camera, KDSS.",
      expenses: {
        create: [
          {
            category: "TRANSPORT",
            description: "Enclosed flatbed transport from Mombasa",
            amount: 65000,
            loggedById: invStaff.id,
          },
          {
            category: "DETAILING",
            description: "Paint correction & underbody rust protection",
            amount: 35000,
            loggedById: invStaff.id,
          },
        ],
      },
    },
  });

  await prisma.vehicle.upsert({
    where: { stockNumber: "VH-1004" },
    update: {},
    create: {
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
      supplierId: localTradeIn.id,
      branchId: mainBranch.id,
      dateAcquired: daysAgo(74),
      notes: "X-Mode, EyeSight v4, power boot, new Bridgestone tyres.",
      expenses: {
        create: [
          {
            category: "REPAIRS",
            description: "Major service, brake pads & suspension bushes",
            amount: 55000,
            loggedById: invStaff.id,
          },
        ],
      },
    },
  });

  // 6. Customers
  const johnKamau = await prisma.customer.upsert({
    where: { id: "cust-john-kamau" },
    update: {},
    create: {
      id: "cust-john-kamau",
      fullName: "John Kamau",
      phone: "+254 712 345 678",
      email: "j.kamau@outlook.com",
      location: "Westlands, Nairobi",
      customerType: "INDIVIDUAL",
      preferredMakes: "Toyota",
      preferredModels: "Harrier, RAV4",
      budgetMin: 3800000,
      budgetMax: 4400000,
      preferredYear: 2021,
      preferredFuel: "Petrol",
      preferredTrans: "Automatic",
      preferredBody: "SUV",
      assignedToId: brian.id,
      lastInteraction: daysAgo(1),
    },
  });

  const maryAtieno = await prisma.customer.upsert({
    where: { id: "cust-mary-atieno" },
    update: {},
    create: {
      id: "cust-mary-atieno",
      fullName: "Mary Atieno",
      phone: "+254 720 987 654",
      email: "mary.atieno@gmail.com",
      location: "Kilimani, Nairobi",
      customerType: "INDIVIDUAL",
      preferredMakes: "Mazda",
      preferredModels: "CX-5",
      budgetMin: 3000000,
      budgetMax: 3400000,
      preferredYear: 2020,
      preferredFuel: "Diesel",
      preferredTrans: "Automatic",
      preferredBody: "SUV",
      assignedToId: peter.id,
      lastInteraction: now,
    },
  });

  const apexLogistics = await prisma.customer.upsert({
    where: { id: "cust-apex-logistics" },
    update: {},
    create: {
      id: "cust-apex-logistics",
      fullName: "Apex Executive Holdings Ltd",
      phone: "+254 733 555 222",
      email: "procurement@apexholdings.co.ke",
      location: "Upper Hill, Nairobi",
      customerType: "COMPANY",
      preferredMakes: "Toyota",
      preferredModels: "Land Cruiser Prado",
      budgetMin: 7500000,
      budgetMax: 8500000,
      assignedToId: brian.id,
      lastInteraction: daysAgo(4),
    },
  });

  // 7. Leads, Follow-ups, Reservation & Completed Sale
  const leadJohn = await prisma.lead.upsert({
    where: { id: "lead-john-harrier" },
    update: {},
    create: {
      id: "lead-john-harrier",
      customerId: johnKamau.id,
      vehicleId: harrier.id,
      source: "WALK_IN",
      assignedToId: brian.id,
      budget: 4200000,
      expectedPurchaseDate: daysAhead(5),
      stage: "TEST_DRIVE",
      probability: 70,
      notes: "Loved the Pearl White Harrier. Wants his wife to view it during the test drive.",
      lastContactAt: daysAgo(1),
      nextFollowUpAt: now,
    },
  });

  const leadMary = await prisma.lead.upsert({
    where: { id: "lead-mary-cx5" },
    update: {},
    create: {
      id: "lead-mary-cx5",
      customerId: maryAtieno.id,
      vehicleId: cx5.id,
      source: "INSTAGRAM",
      assignedToId: peter.id,
      budget: 3250000,
      expectedPurchaseDate: daysAhead(4),
      stage: "RESERVED",
      probability: 90,
      notes: "Paid KSh. 300,000 reservation deposit while Stanbic Bank processes balance.",
      lastContactAt: now,
      nextFollowUpAt: now,
    },
  });

  // Follow-ups matching Section 5 ("Today's Follow-ups" example)
  await prisma.activity.upsert({
    where: { id: "act-john-call" },
    update: {},
    create: {
      id: "act-john-call",
      type: "CALL",
      status: "DUE",
      customerId: johnKamau.id,
      leadId: leadJohn.id,
      vehicleId: harrier.id,
      staffId: brian.id,
      scheduledAt: now,
      notes: "Confirm afternoon test drive timing for the 2021 Toyota Harrier.",
      nextAction: "Complete test drive and present formal offer",
    },
  });

  await prisma.activity.upsert({
    where: { id: "act-mary-whatsapp" },
    update: {},
    create: {
      id: "act-mary-whatsapp",
      type: "WHATSAPP",
      status: "DUE",
      customerId: maryAtieno.id,
      leadId: leadMary.id,
      vehicleId: cx5.id,
      staffId: peter.id,
      scheduledAt: now,
      notes: "Share proforma invoice and logbook copy via WhatsApp for bank release.",
      nextAction: "Close sale upon bank EFT clearance",
    },
  });

  // Reservation for Mary on CX-5
  await prisma.reservation.upsert({
    where: { id: "res-mary-cx5" },
    update: {},
    create: {
      id: "res-mary-cx5",
      customerId: maryAtieno.id,
      vehicleId: cx5.id,
      reservedById: peter.id,
      reservationDate: daysAgo(2),
      expiryDate: daysAhead(5),
      depositAmount: 300000,
      depositStatus: "PAID",
      isActive: true,
      notes: "7-day vehicle hold against KSh. 300K M-Pesa/Bank deposit.",
    },
  });

  // Completed Sale on Prado
  await prisma.sale.upsert({
    where: { saleNumber: "SL-2026-001" },
    update: {},
    create: {
      saleNumber: "SL-2026-001",
      customerId: apexLogistics.id,
      vehicleId: prado.id,
      salespersonId: brian.id,
      salePrice: 7800000,
      discount: 100000,
      depositPaid: 7800000,
      balanceDue: 0,
      paymentMethod: "Bank Transfer (RTGS)",
      paymentStatus: "PAID",
      purchaseCostSnapshot: 6800000,
      expensesSnapshot: 100000,
      grossProfit: 900000,
      saleDate: daysAgo(4),
      notes: "Full RTGS payment received. NTSA TIMS transfer completed.",
    },
  });

  console.log("✅ Seed complete! Created users, suppliers, vehicles, leads, follow-ups, reservation, and sale.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
