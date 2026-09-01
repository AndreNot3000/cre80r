import { pgTable, text, timestamp, boolean, integer, pgEnum, uuid, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const creatorTypeEnum = pgEnum("creator_type", [
  "photographer",
  "videographer",
  "content_creator",
  "agency",
  "wedding_specialist",
]);

export const currencyEnum = pgEnum("currency", [
  "NGN", "GHS", "KES", "ZAR", "USD", "GBP",
]);

export const roleEnum = pgEnum("role", [
  "creator", "team_member", "client", "admin",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new", "contacted", "quote_sent", "negotiating", "booked", "completed", "lost",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", "confirmed", "cancelled", "completed",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "pre_production", "shoot", "editing", "client_review", "delivery", "completed",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft", "sent", "accepted", "rejected", "expired",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "draft", "sent", "signed", "cancelled",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft", "sent", "paid", "partially_paid", "overdue", "cancelled",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "paystack", "stripe", "manual",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "crew_fees",
  "gear_rentals",
  "transport_logistics",
  "studio_rental",
  "post_production",
  "props_styling",
  "software_subscriptions",
  "other",
]);

// ─── Organizations (Workspaces) ───────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  creatorType: creatorTypeEnum("creator_type").notNull().default("photographer"),
  logo: text("logo"),
  currency: currencyEnum("currency").notNull().default("NGN"),
  timezone: text("timezone").notNull().default("Africa/Lagos"),
  website: text("website"),
  phone: text("phone"),
  country: text("country").notNull().default("NG"),
  city: text("city"),
  location: text("location"),
  tagline: text("tagline"),
  bio: text("bio"),
  instagram: text("instagram"),
  whatsapp: text("whatsapp"),
  heroShowreelUrl: text("hero_showreel_url"),
  heroPosterUrl: text("hero_poster_url"),
  paystackPublicKey: text("paystack_public_key"),
  paystackSecretKey: text("paystack_secret_key"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  avatar: text("avatar"),
  role: roleEnum("role").notNull().default("creator"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  activeOrganizationId: text("active_organization_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(), // "credential" | "google" | "apple"
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Organization Members & RBAC ──────────────────────────────────────────────

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // "owner" | "admin" | "member" | "crew"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "rejected" | "canceled"
  inviterId: text("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const twoFactors = pgTable("two_factors", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(), // JSON stringified array of hashed backup codes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  instagram: text("instagram"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  notes: text("notes"),
  tags: text("tags").array(),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  serviceInterest: text("service_interest"),
  eventDate: timestamp("event_date"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  currency: currencyEnum("currency").notNull().default("NGN"),
  message: text("message"),
  status: leadStatusEnum("status").notNull().default("new"),
  source: text("source").default("inquiry_form"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Services & Packages ──────────────────────────────────────────────────────

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull().default("NGN"),
  durationHours: integer("duration_hours"),
  isActive: boolean("is_active").notNull().default(true),
  addOns: jsonb("add_ons"), // [{ name, price }]
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id),
  serviceId: uuid("service_id").references(() => services.id),
  leadId: uuid("lead_id").references(() => leads.id),
  status: bookingStatusEnum("status").notNull().default("pending"),
  eventDate: timestamp("event_date").notNull(),
  eventEndDate: timestamp("event_end_date"),
  location: text("location"),
  notes: text("notes"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  currency: currencyEnum("currency").notNull().default("NGN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").references(() => bookings.id),
  clientId: uuid("client_id").references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("pre_production"),
  coverImage: text("cover_image"),
  shootDate: timestamp("shoot_date"),
  deliveryDate: timestamp("delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id),
  leadId: uuid("lead_id").references(() => leads.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  quoteNumber: text("quote_number").notNull(),
  status: quoteStatusEnum("status").notNull().default("draft"),
  lineItems: jsonb("line_items").notNull(), // [{ description, quantity, unitPrice, total }]
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull().default("NGN"),
  notes: text("notes"),
  terms: text("terms"),
  expiresAt: timestamp("expires_at"),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Contracts ────────────────────────────────────────────────────────────────

export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id),
  projectId: uuid("project_id").references(() => projects.id),
  quoteId: uuid("quote_id").references(() => quotes.id),
  contractNumber: text("contract_number").notNull(),
  status: contractStatusEnum("status").notNull().default("draft"),
  content: text("content").notNull(), // full contract text / HTML
  clientSignedAt: timestamp("client_signed_at"),
  clientSignatureIp: text("client_signature_ip"),
  creatorSignedAt: timestamp("creator_signed_at"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id),
  projectId: uuid("project_id").references(() => projects.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  lineItems: jsonb("line_items").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default("0"),
  currency: currencyEnum("currency").notNull().default("NGN"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  clientId: uuid("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull().default("NGN"),
  provider: paymentProviderEnum("provider").notNull(),
  providerReference: text("provider_reference"),
  providerStatus: text("provider_status"),
  metadata: jsonb("metadata"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Galleries & Photo Delivery ───────────────────────────────────────────────

export const galleries = pgTable("galleries", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id),
  clientId: uuid("client_id").references(() => clients.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  coverPhoto: text("cover_photo"),
  password: text("password"),
  downloadPin: text("download_pin"),
  watermarkEnabled: boolean("watermark_enabled").notNull().default(false),
  allowDownloads: boolean("allow_downloads").notNull().default(true),
  status: text("status").notNull().default("published"), // "draft" | "published" | "archived"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  filename: text("filename").notNull(),
  sizeBytes: integer("size_bytes"),
  category: text("category").default("Highlights"), // e.g. "Ceremony", "Reception", "Portraits"
  exifData: jsonb("exif_data"), // { camera, lens, aperture, iso, shutterSpeed }
  isFavorite: boolean("is_favorite").notNull().default(false),
  clientNotes: text("client_notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Video Reviews (Frame.io Alternative) ─────────────────────────────────────

export const videoReviews = pgTable("video_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id),
  title: text("title").notNull(),
  version: text("version").notNull().default("Cut V1"), // "Cut V1" | "Cut V2" | "Final Master"
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: integer("duration_seconds").default(0),
  status: text("status").notNull().default("in_review"), // "in_review" | "approved" | "changes_requested"
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const videoComments = pgTable("video_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoReviewId: uuid("video_review_id").notNull().references(() => videoReviews.id, { onDelete: "cascade" }),
  timestampSeconds: integer("timestamp_seconds").notNull(),
  timecode: text("timecode").notNull(), // "01:42:08"
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull().default("client"), // "client" | "creator" | "editor"
  content: text("content").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  drawingData: jsonb("drawing_data"), // coordinates & annotations
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Call Sheets ─────────────────────────────────────────────────────────────

export const callSheets = pgTable("call_sheets", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  shootDate: timestamp("shoot_date").notNull(),
  generalCallTime: text("general_call_time").notNull(),
  locationName: text("location_name").notNull(),
  locationAddress: text("location_address"),
  locationMapsUrl: text("location_maps_url"),
  parkingNotes: text("parking_notes"),
  weatherForecast: text("weather_forecast"),
  nearestHospital: text("nearest_hospital"),
  crew: jsonb("crew").notNull(), // [{ name, role, callTime, phone }]
  schedule: jsonb("schedule").notNull(), // [{ time, scene, notes }]
  gearList: jsonb("gear_list"), // [{ category, item, packed }]
  emergencyContacts: jsonb("emergency_contacts"), // [{ role, name, phone }]
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Messages & Communication ────────────────────────────────────────────────

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  senderId: text("sender_id"),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull().default("creator"), // "creator" | "client" | "crew"
  senderAvatar: text("sender_avatar"),
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // [{ name, url, type, size }]
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Studio Expenses & Gear Rentals (P&L Tracking) ───────────────────────────

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  category: expenseCategoryEnum("category").notNull().default("other"),
  description: text("description").notNull(),
  vendor: text("vendor"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull().default("NGN"),
  receiptUrl: text("receipt_url"),
  expenseDate: timestamp("expense_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").default("bank_transfer"), // "bank_transfer" | "cash" | "debit_card" | "paystack"
  isReimbursable: boolean("is_reimbursable").notNull().default(false),
  isPaid: boolean("is_paid").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Studio Automations & WhatsApp Engine ─────────────────────────────────────

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "inquiry_created",
  "booking_confirmed",
  "deposit_paid",
  "callsheet_dispatched",
  "shoot_reminder_48h",
  "gallery_delivered",
  "review_cut_approved",
  "invoice_overdue",
]);

export const automationActionEnum = pgEnum("automation_action", [
  "send_whatsapp",
  "send_email",
  "notify_crew",
  "generate_callsheet",
  "create_invoice",
]);

export const automations = pgTable("automations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  triggerEvent: automationTriggerEnum("trigger_event").notNull(),
  actionType: automationActionEnum("action_type").notNull().default("send_whatsapp"),
  config: jsonb("config").notNull().default({}), // { templateId, templateText, delayMinutes, recipientRole, variables }
  isEnabled: boolean("is_enabled").notNull().default(true),
  runCount: integer("run_count").notNull().default(0),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const automationLogs = pgTable("automation_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  automationId: uuid("automation_id").references(() => automations.id, { onDelete: "cascade" }),
  triggerEvent: text("trigger_event").notNull(),
  recipient: text("recipient").notNull(), // phone / email / crew
  channel: text("channel").notNull().default("whatsapp"), // "whatsapp" | "email" | "sms"
  status: text("status").notNull().default("success"), // "success" | "failed" | "queued"
  payload: jsonb("payload"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});




