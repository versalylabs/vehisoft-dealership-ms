# Vehisoft Dealership Management System — Architecture & Tech Stack (Phase 1)

## 1. Core Technology Stack

| Layer | Technology | Rationale for Vercel Deployment |
|---|---|---|
| **Framework** | **Next.js (App Router, TypeScript)** | Native first-class support on Vercel; Server Components for fast data tables & KPI dashboards; Server Actions for mutations. |
| **Database** | **Neon Serverless PostgreSQL** | Serverless Postgres with connection pooling, branching, and low-latency drivers ideal for Vercel Serverless/Edge functions. |
| **ORM** | **Prisma ORM** (`@prisma/client` + `@neondatabase/serverless`) | Type-safe relational queries, declarative schema migrations (`prisma/schema.prisma`), and straightforward seeding. |
| **Authentication & RBAC** | **Auth.js (NextAuth v5)** with Credentials & Role Middleware | Stateless JWT sessions compatible with Vercel Edge Middleware; supports the 4 dealership roles (`ADMIN`, `MANAGER`, `SALESPERSON`, `INVENTORY_STAFF`). |
| **UI & Styling** | **Tailwind CSS + Lucide Icons + shadcn/ui** | Clean, accessible enterprise dashboard components (data tables, filters, dialogs, Kanban cards). |
| **Charts & Analytics** | **Recharts** | Composable responsive charts for monthly sales, salesperson performance, pipeline stages, and inventory aging buckets. |
| **File & Photo Storage** | **Vercel Blob / UploadThing** (with local/URL fallback) | Serverless-friendly image uploads for vehicle interior/exterior/engine photos and purchase documents. |

---

## 2. Currency, Locale & Formatting Standards

- **Primary Currency:** Kenyan Shilling (`KSh.` / ISO `KES`)
- **Standard Display Format:**
  - Exact figures (Tables, Invoices, Sale Records, Costs): `KSh. 4,200,000`
  - Compact figures (Dashboard KPI Cards, Kanban Pipeline Cards): `KSh. 4.2M` or `KSh. 850K`
- **Timezone & Date Format:** `Africa/Nairobi` (EAT, UTC+3), formatted as `DD MMM YYYY` (e.g., `03 Oct 2026`).

---

## 3. Application Directory Structure

```text
vehisoft-dealership-ms/
├── prisma/
│   ├── schema.prisma          # Neon Postgres relational schema
│   └── seed.ts                # Initial seed data (Admin user, sample vehicles in KSh., leads)
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Authentication screens
│   │   ├── (dashboard)/       # Protected dealership layout & modules
│   │   │   ├── page.tsx       # 1. Executive Dashboard
│   │   │   ├── inventory/     # 2. Vehicles, Add Vehicle, Vehicle Detail, Vehicle Costs
│   │   │   ├── customers/     # 3. Customer List & 360° Customer Profile
│   │   │   ├── leads/         # 4. Sales Pipeline (Kanban + List)
│   │   │   ├── follow-ups/    # 5. Today's Follow-ups & Activity Logger
│   │   │   ├── test-drives/   # 6. Test Drive Scheduling & Mileage Tracking
│   │   │   ├── reservations/  # 7. Vehicle Reservations & Expiry Sync
│   │   │   ├── sales/         # 8. Completed Sales & Payment Status
│   │   │   ├── suppliers/     # 10. Suppliers / Vehicle Sources
│   │   │   ├── reports/       # 11. Sales, Inventory, Leads & Profitability Reports
│   │   │   └── settings/      # 12 & 13. Dealership Profile, Users & Roles, System Config
│   │   └── api/
│   │       ├── auth/          # NextAuth route handlers
│   │       └── cron/          # Vercel Cron endpoint (auto-expire reservations)
│   ├── components/
│   │   ├── layout/            # Sidebar, Header, Role Badge, Quick Actions
│   │   ├── ui/                # Reusable UI primitives (Buttons, Badges, Modals, Tables)
│   │   └── modules/           # Domain-specific components (KanbanBoard, CostCalculator, etc.)
│   ├── lib/
│   │   ├── db.ts              # Prisma + Neon singleton client
│   │   ├── auth.ts            # Auth configuration & RBAC helpers
│   │   ├── format.ts          # KSh. currency & date formatting utilities
│   │   └── validations/       # Zod schemas for forms & server actions
│   └── types/                 # Shared TypeScript interfaces
├── .env.example               # Template for Neon DB & Auth environment variables
├── vercel.json                # Vercel deployment & cron configuration
└── package.json
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Module / Capability | Owner / Admin | Manager | Salesperson | Inventory Staff |
|---|:---:|:---:|:---:|:---:|
| **Dashboard & KPIs** | Full (All Financials) | Full (All Financials) | Sales & Pipeline KPIs | Inventory KPIs |
| **Vehicle Inventory (View)** | Yes | Yes | Yes | Yes |
| **Vehicle Acquisition & Costs** | Full CRUD | Full CRUD | View Asking Price Only | Full CRUD |
| **Customers & Leads Pipeline** | Full CRUD | Full CRUD | Full CRUD | No |
| **Follow-ups, Test Drives, Reservations** | Full CRUD | Full CRUD | Full CRUD | View Status |
| **Sales & Profitability** | Full CRUD | Full CRUD | Create / View Own Sales | No |
| **Suppliers** | Full CRUD | Full CRUD | No | Full CRUD |
| **Reports** | All Reports | All Reports | CRM & Own Sales | Inventory Reports |
| **Settings & Users/Roles** | Full CRUD | View Staff | No | No |

---

## 5. Neon Postgres & Vercel Environment Configuration

To run locally and on Vercel, the system uses two Neon connection strings:
- `DATABASE_URL`: Pooled connection string (`-pooler` hostname with `?pgbouncer=true&connect_timeout=15`) for serverless runtime queries.
- `DIRECT_URL`: Direct connection string for running `prisma migrate deploy` during Vercel builds.
- `AUTH_SECRET`: Secret key for signing session tokens.
