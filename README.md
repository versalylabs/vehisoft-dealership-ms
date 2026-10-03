# Vehisoft — Vehicle Dealership Management System

> **A dealership management system that helps you manage your vehicles, customers, and sales from enquiry to completed sale.**
> **Core Value Proposition:** Inventory + CRM + Sales Pipeline + Deal Tracking (Standardized in **KSh. / KES**).

---

## 1. Included V1 Modules

| Module | Route | Key Capabilities |
|---|---|---|
| **Executive Dashboard** | `/` | 8 KPI Cards, Monthly Sales vs Profit Chart, Pipeline Funnel, Salesperson Leaderboard, Inventory Aging Buckets (`0–30`, `31–60`, `61–90`, `90+` days) |
| **Vehicle Inventory** | `/inventory` | Searchable & multi-filter table + card grid, Stock No (`VH-1001`), Reg No, Status badges, KSh. pricing, and aging |
| **Add Vehicle** | `/inventory/add` | Vehicle intake form with live Landed Cost, Expected Gross Profit & Margin % calculator in `KSh.` |
| **360° Vehicle Detail** | `/inventory/[id]` | Full specs, acquisition source, itemized expenses, categorized photo gallery, and chronological audit history |
| **Vehicle Costs & Profit** | `/inventory/costs` | Log transport, repairs, detailing, inspection & registration costs; computes `Total Cost = Purchase + Expenses` |
| **Customers Database** | `/customers` | Individual, Company, Dealer & Fleet customer directory with preferences & budget in `KSh.` |
| **360° Customer Profile** | `/customers/[id]` | Contact details, buyer preferences, automated matching inventory suggestions, and interaction timeline |
| **Sales Pipeline (Kanban)** | `/pipeline` | Interactive 8-stage board (`New → Contacted → Qualified → Viewing → Test Drive → Negotiation → Reserved → Sold / Lost`) |
| **Leads & Enquiries** | `/leads` | Lead attribution by source (*Walk-in, Instagram, Website, Referral, Dealer*) and enquiry creation |
| **Follow-ups & Activities** | `/follow-ups` | "Today's Follow-ups" queue (*Call, WhatsApp, SMS, Viewing*) with one-click completion |
| **Test Drives** | `/test-drives` | Schedule & complete test drives with Driver License verification and **Mileage Out → Mileage In** tracking |
| **Reservations** | `/reservations` | Deposit holds in `KSh.` that auto-sync vehicle status (`Available ↔ Reserved`) + Vercel Cron expiry endpoint |
| **Completed Sales** | `/sales` | Formal sale register, payment statuses (*Paid, Partially Paid, Unpaid*), balance tracking, and realized gross profit |
| **Suppliers** | `/suppliers` | Manage importers, overseas auctions, local trade-ins, and corporate fleet sources |
| **Reports Suite** | `/reports` | Sales, Inventory Aging, Zero-Enquiry Stock, CRM Conversion, and Profitability reports with **CSV Export** |
| **Settings & RBAC** | `/settings` | Dealership profile, branches, Users & Roles (`Owner/Admin`, `Manager`, `Salesperson`, `Inventory Staff`), and catalogs |

---

## 2. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the live development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3. Connecting Neon PostgreSQL & Deploying to Vercel

### Step A: Provision Neon PostgreSQL
1. Create a free project at [https://neon.tech](https://neon.tech).
2. Copy both your **Pooled Connection String** (`DATABASE_URL`) and **Direct Connection String** (`DIRECT_URL`).
3. Paste them into your local `.env` file (or Vercel Environment Variables):
   ```env
   DATABASE_URL="postgresql://neondb_owner:...@ep-...-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://neondb_owner:...@ep-....region.aws.neon.tech/neondb?sslmode=require"
   AUTH_SECRET="your-production-secret-key"
   NEXT_PUBLIC_DEFAULT_CURRENCY="KSh."
   NEXT_PUBLIC_DEFAULT_CURRENCY_CODE="KES"
   ```
4. Push the Prisma schema and seed the initial dealership data into Neon:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Step B: Deploy Live to Vercel
**Option 1 — Via GitHub + Vercel Dashboard (Recommended for CI/CD):**
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/vehisoft-dealership-ms.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new) and import your `vehisoft-dealership-ms` repository.
3. Add the Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_DEFAULT_CURRENCY="KSh."`).
4. Click **Deploy** — Vercel will automatically run `prisma generate && next build` (configured in `vercel.json`) and activate the daily reservation-expiry cron job (`/api/cron/expire-reservations`).

**Option 2 — Direct Deployment via Vercel CLI:**
```bash
npx vercel
# For production deployment:
npx vercel --prod
```
