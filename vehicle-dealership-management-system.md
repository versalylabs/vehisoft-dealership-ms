# Vehicle Dealership Management System

## Product Summary

A focused dealership management system for managing:

- Vehicle inventory
- Customer records
- Sales leads and pipeline
- Follow-ups and activities
- Test drives
- Reservations
- Completed sales
- Vehicle costs and profitability
- Basic reports

The system should answer four core questions:

1. What vehicles do we have?
2. Who is interested in buying them?
3. Where is each sale in the pipeline?
4. What did we sell, to whom, and for how much?

---

# 1. Dashboard

The dashboard provides an immediate snapshot of dealership performance.

## Key Cards

- Vehicles in stock
- Vehicles reserved
- Vehicles sold this month
- Total inventory value
- Sales value this month
- Gross profit this month
- Active leads
- Pending follow-ups

## Charts / Widgets

- Sales this month vs previous months
- Sales by salesperson
- Sales pipeline by stage
- Inventory by vehicle type
- Inventory age: 0–30, 31–60, 61–90, 90+ days
- Recent enquiries
- Upcoming follow-ups
- Recently sold vehicles

---

# 2. Vehicle Inventory

One of the two main parts of the system.

## Vehicle List

A searchable and filterable table containing:

| Field | Description |
|---|---|
| Vehicle | Make and model |
| Stock No. | Internal stock number |
| Registration No. | Vehicle registration |
| Make | Vehicle manufacturer |
| Model | Vehicle model |
| Year | Manufacturing/model year |
| Price | Current asking price |
| Status | Current inventory status |

## Filters

- Make
- Model
- Year
- Price range
- Body type
- Fuel type
- Transmission
- Mileage
- Status
- Location
- Date acquired
- Salesperson

## Vehicle Statuses

- Available
- Reserved
- Sold
- Pending Acquisition
- In Transit
- Archived

## Vehicle Detail Page

### Basic Information

- Stock number
- Registration number
- VIN/chassis number
- Make
- Model
- Variant
- Year
- Color
- Mileage
- Fuel type
- Transmission
- Body type

### Financial Information

- Purchase price
- Additional costs
- Total cost
- Asking price
- Minimum selling price
- Expected profit
- Actual selling price
- Actual profit

### Acquisition

- Supplier/source
- Date acquired
- Acquisition location
- Purchase documents

### Images

- Multiple vehicle photos
- Interior
- Exterior
- Engine
- Documents/photos

### History

- Price changes
- Status changes
- Reservations
- Enquiries
- Offers
- Sales
- Expenses

---

# 3. Customers

A centralized customer database.

## Customer List

- Name
- Phone
- Email
- Location
- Customer type
- Assigned salesperson
- Last interaction
- Pipeline stage
- Purchase history

## Customer Types

- Individual
- Company
- Dealer
- Fleet customer

## Customer Profile

### Contact Information

- Full name
- Phone
- Alternative phone
- Email
- Address
- ID/passport number, if required for the dealership workflow

### Preferences

- Preferred makes
- Preferred models
- Budget
- Preferred year
- Fuel type
- Transmission
- Body type

### Activity

- Enquiries
- Calls
- Messages
- Appointments
- Test drives
- Offers
- Purchases

### Vehicles

- Interested vehicles
- Currently negotiating
- Purchased vehicles

---

# 4. Leads / Sales Pipeline

A lightweight CRM specifically for vehicle sales.

## Pipeline

Recommended stages:

**New → Contacted → Qualified → Viewing → Test Drive → Negotiation → Reserved → Sold / Lost**

Each lead card can show:

- Customer
- Vehicle
- Asking price
- Assigned salesperson
- Last contact

Example:

```text
John Kamau
Toyota Harrier 2021
KSh 4.2M
Assigned: Brian
Last contact: Yesterday
```

## Lead Information

- Customer
- Vehicle(s) interested in
- Lead source
- Assigned salesperson
- Budget
- Expected purchase date
- Current stage
- Probability, optional
- Notes
- Next follow-up
- Lost reason

## Lead Sources

- Walk-in
- Website
- Instagram
- Facebook
- WhatsApp
- Phone
- Referral
- Dealer
- Marketplace
- Other

---

# 5. Follow-ups / Activities

A simple activity system for salespeople.

## Activity Types

- Call
- WhatsApp
- SMS
- Email
- Meeting
- Vehicle viewing
- Test drive
- Follow-up
- Note

Each activity contains:

- Customer
- Lead
- Vehicle
- Date/time
- Staff member
- Notes
- Next action

## Follow-up Page

A "Today's Follow-ups" view should show:

| Customer | Vehicle | Follow-up | Assigned | Status |
|---|---|---|---|---|
| John | Harrier | Call | Brian | Due |
| Mary | CX-5 | WhatsApp | Peter | Due |

---

# 6. Test Drives

Test drives fit naturally into the dealership sales workflow.

## Test Drive Record

- Customer
- Vehicle
- Salesperson
- Date/time
- Driver details
- Mileage out
- Mileage in
- Notes
- Outcome

## Statuses

- Scheduled
- Completed
- Cancelled

A calendar view can be added later.

---

# 7. Reservations

Reservations handle vehicles that a customer wants but has not fully purchased.

## Reservation

- Customer
- Vehicle
- Reservation date
- Expiry date
- Deposit
- Deposit payment status
- Reserved by
- Notes

Vehicle status should automatically change:

**Available → Reserved**

When the reservation expires:

**Reserved → Available**

This helps prevent two salespeople from promising the same vehicle.

---

# 8. Sales

Once a deal closes, create a formal sale record.

## Sale Details

### Customer

- Buyer
- Contact information

### Vehicle

- Vehicle sold
- Registration
- VIN

### Sale

- Sale price
- Discount
- Deposit
- Balance
- Payment method
- Sale date
- Salesperson

### Profit

- Vehicle acquisition cost
- Additional costs
- Sale price
- Gross profit

## Payment Statuses

- Unpaid
- Partially Paid
- Paid
- Refunded

The product does not need to become a full accounting system.

---

# 9. Expenses / Vehicle Costs

Vehicle-level costs are important for calculating actual profitability.

## Cost Categories

- Purchase cost
- Transport
- Repairs
- Detailing
- Inspection
- Registration
- Insurance
- Advertising
- Other expenses

## Profit Calculation

```text
Total Cost = Purchase Price + Expenses

Gross Profit = Sale Price - Total Cost
```

This gives the dealership a clearer view of the profitability of each vehicle.

---

# 10. Suppliers / Vehicle Sources

A lightweight supplier module.

## Supplier

- Company/person name
- Phone
- Email
- Address
- Supplier type
- Notes

## Example Supplier Types

- Local owner
- Importer
- Auction
- Dealer
- Trade-in
- Company fleet

Vehicles should be linked to their original source.

---

# 11. Reports

Keep reporting focused in V1.

## Sales Reports

- Sales by month
- Sales by salesperson
- Sales by vehicle make
- Sales by model
- Sales by price range
- Gross profit

## Inventory Reports

- Current stock
- Inventory value
- Vehicles by status
- Aging inventory
- Vehicles with no enquiries
- Vehicles approaching target age

## CRM Reports

- Leads by source
- Leads by stage
- Conversion rate
- Lost leads
- Lost reasons
- Salesperson performance

## Financial Reports

- Revenue
- Cost of vehicles sold
- Gross profit
- Outstanding customer balances

---

# 12. Users & Roles

Support basic role-based access control.

## Owner / Admin

Full access to the system.

## Manager

- Inventory
- Sales
- Customers
- Reports
- Staff

## Salesperson

- Customers
- Leads
- Follow-ups
- Test drives
- Reservations
- Sales

## Inventory Staff

- Vehicles
- Acquisition
- Expenses
- Vehicle status

Permissions can become more granular in a later version.

---

# 13. Settings

Basic system configuration:

- Dealership profile
- Branches
- Users
- Roles
- Vehicle makes/models
- Body types
- Lead sources
- Pipeline stages
- Payment methods
- Expense categories
- Notification settings
- Numbering/stock-code settings

---

# Suggested Navigation

```text
Dashboard

Sales
  ├── Leads
  ├── Pipeline
  ├── Follow-ups
  ├── Test Drives
  ├── Reservations
  └── Sales

Inventory
  ├── Vehicles
  ├── Add Vehicle
  └── Vehicle Costs

Customers

Suppliers

Reports
  ├── Sales
  ├── Inventory
  ├── Leads
  └── Profitability

Settings
  ├── Dealership
  ├── Users & Roles
  ├── Pipeline
  └── System Settings
```

---

# Core Workflow

The main dealership workflow should be:

```text
VEHICLE ACQUIRED
       ↓
   INVENTORY
       ↓
CUSTOMER ENQUIRY
       ↓
      LEAD
       ↓
   CONTACTED
       ↓
    VIEWING
       ↓
  TEST DRIVE
       ↓
 NEGOTIATION
       ↓
  RESERVATION
       ↓
      SALE
       ↓
   PAYMENT
       ↓
    PROFIT
```

The customer workflow is:

```text
CUSTOMER
   ↓
ENQUIRY
   ↓
INTERESTED VEHICLE
   ↓
FOLLOW-UPS
   ↓
TEST DRIVE
   ↓
OFFER
   ↓
SALE
   ↓
PURCHASE HISTORY
```

These two workflows should form the spine of the product.

---

# V1 Scope

The first version should include:

- Dashboard
- Inventory
- Customers
- Leads / Pipeline
- Activities / Follow-ups
- Test Drives
- Reservations
- Sales
- Vehicle Costs
- Basic Reports
- Users / Roles

---

# Out of Scope for V1

Avoid turning the first version into a full automotive ERP.

Do not initially build:

- Full accounting
- Payroll
- Workshop / garage management
- Spare-parts inventory
- Insurance management
- Vehicle financing integrations
- Auction integrations
- GPS tracking
- Fleet management
- Complex procurement
- Full marketing automation
- Mobile app
- Customer portal
- AI chatbot
- WhatsApp API automation

These can become future modules or products.

---

# Product Positioning

A clear positioning statement:

> **A dealership management system that helps you manage your vehicles, customers and sales from enquiry to completed sale.**

The core value proposition is:

**Inventory + CRM + Sales Pipeline + Deal Tracking**

This makes the system a focused SaaS product rather than an overly broad automotive ERP.
