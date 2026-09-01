# 🏗️ Crea8or — Master Application Blueprint & Engineering Roadmap

This document is the **Single Source of Truth** for the entire Crea8or platform (The Operating System for African & Global Creative Professionals). It defines every module, section, feature card, tech stack, API route, database table, and completion status so we can build and verify the app card-by-card.

---

## 📊 High-Level Status Dashboard

| Module | Domain | Sections & Focus | Status | Target |
|---|---|---|---|---|
| **Module 1** | Core Architecture, Multi-Tenancy & 2FA | Auth, Session Guard, Security Center | ✅ **COMPLETED** | 100% |
| **Module 2** | CRM, Client Directory & Leads Pipeline | Client CRM, Kanban Inquiries, Stage Math | 🚀 **READY TO START** | 0% |
| **Module 3** | Services, Quotes & Paystack Invoicing | Pricing Packages, Proposals, Auto-Reconciliation | ⏳ Pending | 0% |
| **Module 4** | Project Operations, Call Sheets & Logistics | Digital Call Sheet, Gear Checklist, Messaging | ⏳ Pending | 0% |
| **Module 5** | 4K Photo Galleries & Frame-Accurate Video Review | Proofing, EXIF Reader, SMPTE Timecode HUD | ⏳ Pending | 0% |
| **Module 6** | Studio Expenses, Gear Tracking & P&L Margins | Expense Categories, Net Margin %, P&L Analytics | ⏳ Pending | 0% |
| **Module 7** | Public Creator Showroom & Booking Engine | Public Portfolio, Interactive Add-on Picker, Deposit | ⏳ Pending | 0% |
| **Module 8** | Studio Automations & WhatsApp Engine | WhatsApp Cloud API, Automated Reminder Flows | ⏳ Pending | 0% |

---

## 🏛️ System Architecture & Tech Stack

```
c:\Users\hp\Downloads\cre80r
├── apps/
│   ├── web/                     # Next.js 15 (App Router) + React 19 + Tailwind CSS v4
│   │   ├── src/app/             # Route pages, layouts, and public client portals
│   │   ├── src/components/      # Reusable UI primitives & dark luxury components
│   │   └── src/lib/             # Auth client, API client & helper utilities
│   └── api/                     # Bun + Hono v4 REST API server
│       ├── src/middleware/      # Auth & RBAC multi-tenant guards
│       └── src/routes/          # CRUD endpoints for all business entities
└── packages/
    ├── db/                      # PostgreSQL + Drizzle ORM schemas & migrations
    ├── auth/                    # Better Auth server config & React hooks
    └── validators/              # Shared Zod validation schemas (web + api)
```

### 🛠️ Core Technologies
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React, Sonner (Toasts), TanStack Query v5, React Hook Form, Zod.
- **Backend & Database**: Bun, Hono REST API v4, PostgreSQL, Drizzle ORM, Drizzle Kit.
- **Authentication**: Better Auth with Drizzle adapter, Argon2id passwords, TOTP 2FA, session-based multi-tenancy.
- **Payments & Regional Rails**: Paystack API & HMAC-SHA512 Webhooks, Multi-currency engine (NGN ₦, GHS GH₵, KES KSh, ZAR R, USD $, GBP £).
- **Media & Delivery**: 4K Proofing Gallery, EXIF reader, JSZip client packaging, Frame.io-style frame-accurate video review HUD.

---

# 📦 Module Breakdown & Detailed Cards

---

### 🔐 MODULE 1: Core Architecture, Multi-Tenancy & Security
*Enterprise-grade identity, studio organization partitioning, and 2FA protection.*
- **Tech Stack**: Better Auth, PostgreSQL, Drizzle ORM, Zod, Argon2id, TOTP Authenticator.

- [x] **Card 1.1 — Database Multi-Tenant Schema**
  - **Files**: `packages/db/src/schema/index.ts`
  - **Tables**: `users`, `sessions`, `accounts`, `organizations`, `members`, `twoFactors`, `verifications`
  - **Features**: Row-level isolation via `organizationId`, TOTP secrets, text-based Better Auth IDs.

- [x] **Card 1.2 — Better Auth Server & Dynamic React Client**
  - **Files**: `packages/auth/src/index.ts`, `packages/auth/src/client.ts`, `apps/web/src/app/api/auth/[...all]/route.ts`
  - **Features**: Organization plugin (RBAC), TwoFactor plugin (TOTP), dynamic window origin resolution.

- [x] **Card 1.3 — Route Middleware & Session Guard**
  - **Files**: `apps/web/src/middleware.ts`, `apps/api/src/middleware/auth.ts`
  - **Features**: Guards private studio routes using genuine `better-auth.session_token`, allows public client portals.

- [x] **Card 1.4 — Shared Zod Input Validation Schemas**
  - **Files**: `packages/validators/src/index.ts`
  - **Schemas**: `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `twoFactorVerifySchema`.

- [x] **Card 1.5 — Registration with Live Password Strength Meter**
  - **Route**: `apps/web/src/app/(auth)/register/page.tsx`
  - **URL**: `http://localhost:3000/register`
  - **Features**: 4-step strength meter (8+ chars, uppercase, lowercase, numbers), creator discipline selector.

- [x] **Card 1.6 — Login & Dynamic Session Hook**
  - **Route**: `apps/web/src/app/(auth)/login/page.tsx`
  - **URL**: `http://localhost:3000/login`
  - **Features**: Dynamic session propagation to dashboard layout, header, and profile badges.

- [x] **Card 1.7 — Forgot & Reset Password Flow**
  - **Routes**: `apps/web/src/app/(auth)/forgot-password/page.tsx`, `apps/web/src/app/(auth)/reset-password/page.tsx`
  - **URLs**: `http://localhost:3000/forgot-password`, `http://localhost:3000/reset-password`

- [x] **Card 1.8 — Studio Security Control Center**
  - **Route**: `apps/web/src/app/(dashboard)/settings/security/page.tsx`
  - **URL**: `http://localhost:3000/settings/security`
  - **Features**: Password rotation, 2FA Authenticator QR code modal, active device fingerprinting, remote session revocation.

---

### 👥 MODULE 2: CRM, Client Directory & Interactive Leads Pipeline
*Turn raw social/inquiry inquiries into paid creator bookings.*
* **Tech Stack**: Drizzle ORM, TanStack Query, React Hook Form, Zod, Lucide Icons.

#### Section 2A: Client Directory & CRM (`/clients`)
- [x] **Card 2.1 — Client Database Schema & CRUD API**
  - **Files**: `packages/db/src/schema/index.ts`, `apps/api/src/routes/clients.ts`, `apps/web/src/app/api/clients/route.ts`
  - **Tables**: `clients` (name, email, phone, instagram, address, city, country, notes, tags, lifetimeSpend)
  - **Endpoints**: `GET /api/clients`, `POST /api/clients`, `GET /api/clients/:id`, `PATCH /api/clients/:id`, `DELETE /api/clients/:id`

- [x] **Card 2.2 — Client Directory UI & Search/Filter Table**
  - **Route**: `apps/web/src/app/(dashboard)/clients/page.tsx`
  - **URL**: `http://localhost:3000/clients`
  - **Features**: Search by name/email/tag, sort by lifetime spend or latest project, export to CSV, Add Client modal.

- [x] **Card 2.3 — Client Profile & History Drawer**
  - **Component**: `apps/web/src/components/clients/client-detail-drawer.tsx`
  - **Route**: `apps/web/src/app/(dashboard)/clients/page.tsx` (slide-over drawer)
  - **Features**: Past shoots list, invoice ledger, private client notes with real-time PATCH updates.

#### Section 2B: Visual Leads Kanban Pipeline (`/leads`)
- [x] **Card 2.4 — Leads Schema & Pipeline Stage Transitions**
  - **Files**: `packages/db/src/schema/index.ts`, `apps/api/src/routes/leads.ts`, `apps/web/src/app/api/leads/route.ts`
  - **Tables**: `leads` (clientId, name, email, phone, serviceInterest, eventDate, budget, currency, status, source)
  - **Stages**: `new` → `contacted` → `quote_sent` → `negotiating` → `booked` → `lost`
  - **Features**: Stage transitions, search/source filters, and 1-click conversion to Client & Project.

- [x] **Card 2.5 — Interactive Drag-and-Drop / Click Kanban Board**
  - **Route**: `apps/web/src/app/(dashboard)/leads/page.tsx`
  - **URL**: `http://localhost:3000/leads`
  - **Features**: Multi-column Kanban board with stage badges, budget tags in local currency, 1-click lead to booking/client conversion.

- [x] **Card 2.6 — Lead Quick Creation Modal**
  - **Component**: `apps/web/src/components/leads/add-lead-modal.tsx`
  - **Features**: Source attribution (Instagram DM, Referral, Website, Walk-in), estimated budget, event date picker.

---

### 💳 MODULE 3: Services, Quotes & Paystack Invoicing
*Automate pricing packages, digital proposals, and online deposit collection.*
* **Tech Stack**: Paystack API, HMAC-SHA512 Webhooks, Multi-currency engine, PDF generation.

#### Section 3A: Packages & Service Catalog (`/services`)
- [x] **Card 3.1 — Services Schema & Pricing Architecture**
  - **Files**: `packages/db/src/schema/index.ts`, `apps/api/src/routes/services.ts`, `apps/web/src/app/api/services/route.ts`
  - **Tables**: `services` (name, description, basePrice, currency, durationHours, isActive, addOns JSONB)
  - **Endpoints**: `GET /api/services`, `POST /api/services`, `GET /api/services/:id`, `PATCH /api/services/:id`, `DELETE /api/services/:id`

- [x] **Card 3.2 — Service Catalog Manager UI**
  - **Route**: `apps/web/src/app/(dashboard)/services/page.tsx`
  - **URL**: `http://localhost:3000/services`
  - **Features**: Tiered package cards, customizable add-on deliverables, currency toggle, duplicate service, active toggles.

#### Section 3B: Quotes & Interactive Proposals (`/quotes`, `/quotes/new`)
- [x] **Card 3.3 — Quote Builder Engine & Auto-Math**
  - **Route**: `apps/web/src/app/(dashboard)/quotes/new/page.tsx`
  - **Files**: `apps/api/src/routes/quotes.ts`, `apps/web/src/app/api/quotes/route.ts`
  - **Features**: Dynamic line items, subtotal, tax % (VAT), discount calculation, payment milestones (50% deposit, 50% on delivery), service package importing.

- [x] **Card 3.4 — Public Client Proposal Approval Portal (`/q/[id]`)**
  - **Route**: `apps/web/src/app/q/[id]/page.tsx`
  - **Endpoints**: `GET /api/public/quotes/[id]`, `POST /api/public/quotes/[id]/accept`
  - **Features**: Client view to review scope, digital signature capture, milestone payment schedule, and automatic 50% deposit invoice generation.

#### Section 3C: Invoicing & Paystack Payments (`/invoices`)
- [x] **Card 3.5 — Invoice Ledger & Status Tracker**
  - **Route**: `apps/web/src/app/(dashboard)/invoices/page.tsx`
  - **URL**: `http://localhost:3000/invoices`
  - **Features**: `Draft`, `Sent`, `Partially Paid`, `Paid`, `Overdue` filters, manual 1-click mark-as-paid with automatic payment ledger recording, invoice creation modal with auto-math.

- [x] **Card 3.6 — Paystack Online Checkout Integration**
  - **Route**: `apps/web/src/app/i/[id]/page.tsx`
  - **Endpoints**: `POST /api/payments/checkout/:invoiceId`, `GET /api/payments/verify/:reference`
  - **Features**: Instant checkout portal supporting Debit Cards, Direct Bank Transfer, Apple Pay, USSD, and Mobile Money with auto-verification.

- [x] **Card 3.7 — Paystack Webhook Handler & Auto-Reconciliation**
  - **Endpoints**: `POST /api/payments/paystack/webhook`
  - **Features**: HMAC-SHA512 webhook signature verification, automatic invoice status update to `paid`, and payment record insertion in ledger.

---

### 🎬 MODULE 4: Project Operations, Call Sheets & Production Management
*End-to-end shoot logistics from pre-production to final delivery.*
* **Tech Stack**: Date-fns, Printable CSS / PDF layout, Google Maps geolocation links.

#### Section 4A: Projects Operations Hub (`/projects`)
- [x] **Card 4.1 — Projects Schema & Multi-Stage Lifecycle**
  - **Files**: `packages/db/src/schema/index.ts`, `apps/api/src/routes/projects.ts`, `apps/web/src/app/api/projects/route.ts`
  - **Tables**: `projects` (clientId, name, description, status, shootDate, deliveryDate, notes)
  - **Stages**: `pre_production` → `shoot` → `editing` → `client_review` → `delivery` → `completed`
  - **Endpoints**: `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `PATCH /api/projects/:id/status`, `DELETE /api/projects/:id`

- [x] **Card 4.2 — Projects Dashboard & Progress Tracker**
  - **Route**: `apps/web/src/app/(dashboard)/projects/page.tsx`
  - **URL**: `http://localhost:3000/projects`
  - **Features**: Visual 6-stage milestone stepper, shoot countdown timer, New Project creation modal, 1-click stage advancement, client assignments.

#### Section 4B: Shoot Call Sheet Engine (`/projects/[id]`, `/c/[id]`)
- [x] **Card 4.3 — Interactive Digital Call Sheet**
  - **Route**: `apps/web/src/app/(dashboard)/projects/[id]/page.tsx`
  - **Endpoints**: `GET /api/projects/:id/callsheet`, `POST /api/projects/:id/callsheet`, `PATCH /api/projects/:id/callsheet`
  - **Features**: Crew call times, location GPS with Google Maps navigation link, weather forecast, interactive gear checklist (Cameras, Lenses, Lights, Audio), emergency contacts, shoot timeline schedule.

- [x] **Card 4.4 — 1-Click Printable & Public Mobile Call Sheet Export**
  - **Route**: `apps/web/src/app/c/[id]/page.tsx`
  - **Features**: Public high-contrast on-set HUD for crew access without login, WhatsApp share button, and printable PDF styling.

#### Section 4C: In-App Client & Crew Messaging (`/messages`)
- [x] **Card 4.5 — Messaging Hub & File Attachments**
  - **Route**: `apps/web/src/app/(dashboard)/messages/page.tsx`
  - **Endpoints**: `GET /api/messages`, `POST /api/messages`, `GET /api/messages/channels`
  - **Features**: Real-time project & client communication channels, message persistence in PostgreSQL, moodboard attachments, 1-click Paystack invoice link sharing.

---

### 📸 MODULE 5: 4K Client Photo Galleries & Frame-Accurate Video Review
*Compete directly with Pixieset and Frame.io for photographers and filmmakers.*
* **Tech Stack**: Cloudinary / S3 storage, ExifReader, HTML5 Video Canvas HUD, JSZip for bulk downloads.

#### Section 5A: 4K Client Photo Delivery Portal (`/galleries`, `/g/[slug]`)
- [x] **Card 5.1 — Gallery Management & Upload Pipeline**
  - **Route**: `apps/web/src/app/(dashboard)/galleries/page.tsx`
  - **Endpoints**: `GET /api/galleries`, `POST /api/galleries`, `GET /api/galleries/:id`, `PATCH /api/galleries/:id`, `DELETE /api/galleries/:id`, `POST /api/galleries/:id/photos`
  - **Features**: Photo gallery dashboard, CreateGalleryModal with PIN & password protection, watermark toggles, cover photo selector, batch 4K image ingest with categories (*Highlights, Ceremony, Reception, Portraits*).

- [x] **Card 5.2 — Public Client Photo Showcase & EXIF Inspector**
  - **Route**: `apps/web/src/app/g/[slug]/page.tsx`
  - **Endpoints**: `GET /api/public/galleries/:slug`, `POST /api/public/galleries/:slug/verify-password`
  - **Features**: Dark luxury masonry grid, full-screen lightbox with keyboard controls (`←` / `→` / `Esc`), protective watermark rendering, camera EXIF inspector (Sony α1, 85mm f/1.4 GM, ISO, Shutter, Aperture), password gate modal.

- [x] **Card 5.3 — Client Favorites Proofing & 1-Click 4K ZIP Download**
  - **Endpoints**: `POST /api/public/galleries/:slug/favorite`, `POST /api/public/galleries/:slug/verify-pin`
  - **Features**: Heart selection counter for album proofing, retouching notes persistence in PostgreSQL, 4-digit PIN verification, and instant batch 4K ZIP download packaging.

- [x] **Card 5.4 — Precision Video HUD & Timeline Scrubber**
  - **Route**: `apps/web/src/app/review/[id]/page.tsx`
  - **Endpoints**: `GET /api/reviews`, `POST /api/reviews`, `GET /api/reviews/:id`, `GET /api/public/reviews/:id`
  - **Features**: SMPTE timecode sync (`00:01:24:18`), frame-by-frame stepping (`←` / `→` arrow keys at 24fps), playback speed controls (0.5x - 2x), marker pins on scrubber bar.

- [x] **Card 5.5 — Timestamped Feedback Threads & Version Approval**
  - **Endpoints**: `POST /api/reviews/:id/comments`, `PATCH /api/reviews/:id/comments/:commentId`, `POST /api/reviews/:id/approve`
  - **Features**: Frame-accurate timestamped feedback submission, jump-to-timecode comments, resolve/reopen comment toggle, 1-click "Approve Cut V2" client sign-off and revision requests.

---

### 📊 MODULE 6: Studio Expenses, Gear Tracking & P&L Margins
*Know your true net profit margin after crew fees, gear rentals, and logistics.*
* **Tech Stack**: Drizzle aggregations, SVG / Canvas charts, Multi-currency conversion.

#### Section 6A: Expense Logging & P&L Analytics (`/expenses`)
- [x] **Card 6.1 — Expense Logging Engine & Categorization**
  - **Files**: `packages/db/src/schema/index.ts`, `apps/api/src/routes/expenses.ts`, `apps/web/src/app/api/expenses/route.ts`
  - **Categories**: `Crew Fees`, `Gear Rentals`, `Transport & Logistics`, `Studio Rental`, `Post-Production / VFX`, `Props & Styling`, `Software & Cloud Services`, `General Overhead`.

- [x] **Card 6.2 — Project Net Margin Calculator**
  - **Route**: `apps/web/src/app/(dashboard)/expenses/page.tsx`
  - **URL**: `http://localhost:3000/expenses`
  - **Features**: Automatically subtracts project expenses from invoice revenue to display **Net Profit Margin %** (e.g. 74% Margin).

- [x] **Card 6.3 — Monthly Financial Health & Expense Breakdown**
  - **Features**: Visual breakdown of top cost centers, project margins table, category progress stack bar, receipt lightbox preview, and full CRUD.

---

### 🌐 MODULE 7: Public Creator Showroom & Dynamic Booking Engine
*Public-facing studio showroom to convert inbound traffic.*
* **Tech Stack**: Next.js App Router dynamic routes (`/b/[slug]`, `/p/[slug]`), SEO metadata.

#### Section 7A: Public Creator Portfolio Showroom (`/p/[slug]`)
- [x] **Card 7.1 — Studio Profile & Curated Showroom**
  - **Route**: `apps/web/src/app/p/[slug]/page.tsx`
  - **URL**: `http://localhost:3000/p/apexvisuals`
  - **Features**: Custom branding, showreel video player with audio controls, verified stats bar, curated 4K deliverables masonry, live services pricing, client testimonials, and sticky mobile booking bar.

#### Section 7B: Instant Client Booking Portal (`/b/[slug]`)
- [x] **Card 7.2 — Interactive Package & Add-On Selector**
  - **Route**: `apps/web/src/app/b/[slug]/page.tsx`
  - **URL**: `http://localhost:3000/b/apexvisuals`
  - **Features**: 3-step interactive booking wizard, live price calculation tally, add-on customizer, extra hours stepper, deposit options (50% deposit / 100% full), sticky order summary, and deep-link pre-selection support.

- [x] **Card 7.3 — Booking Confirmation & Paystack Deposit Checkout**
  - **Route**: `apps/web/src/app/b/[slug]/page.tsx`, `apps/web/src/app/api/public/bookings/route.ts`
  - **Features**: End-to-end booking creation, client upsert, itemized invoice generation with deposit tracking, CRM lead synchronization, Paystack commitment deposit checkout, 1-click Google Calendar integration, and direct WhatsApp communication.

---

### ⚡ MODULE 8: Studio Automations & WhatsApp Engine
*Save 15+ hours weekly with automated client notifications and reminders.*
* **Tech Stack**: WhatsApp Cloud API, cron/queue jobs, AI prompt generation.

#### Section 8A: Studio Automations (`/automations`)
- [x] **Card 8.1 — Visual Automation Recipes**
  - **Route**: `apps/web/src/app/(dashboard)/automations/page.tsx`
  - **URL**: `http://localhost:3000/automations`
  - **Features**: Visual trigger-and-action recipe cards, active/pause switches, test run simulator, 4 hero studio time-saved metrics, live delivery activity ledger, and custom automation builder modal.

- [x] **Card 8.2 — WhatsApp Business Cloud Integration**
  - **API Route**: `apps/api/src/routes/whatsapp.ts`, `apps/web/src/lib/whatsapp.ts`
  - **Features**: Meta WhatsApp Cloud API v20.0 helper, standard message template interpolation engine, Webhook verification & delivery status tracking (`sent` ➔ `delivered` ➔ `read`), and automated dispatch triggers on booking creation.

---

## 🔍 How to Execute This Roadmap

1. Open this file: **[`ROADMAP.md`](file:///c:/Users/hp/Downloads/cre80r/ROADMAP.md)** in your editor.
2. We tackle each module section-by-section and card-by-card.
3. Every card must have:
   - Database / Backend CRUD
   - React Frontend UI
   - Live browser & unit test verification
4. Checkboxes (`[x]` vs `[ ]`) reflect the real state of code in the repository.
