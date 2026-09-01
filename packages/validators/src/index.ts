import { z } from "zod";

export const creatorTypeEnumSchema = z.enum([
  "photographer",
  "videographer",
  "content_creator",
  "agency",
  "wedding_specialist",
]);

export const currencyEnumSchema = z.enum([
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "USD",
  "GBP",
]);

export const roleEnumSchema = z.enum([
  "creator",
  "team_member",
  "client",
  "admin",
  "owner",
  "crew",
]);

export const leadStatusEnumSchema = z.enum([
  "new",
  "contacted",
  "quote_sent",
  "negotiating",
  "booked",
  "completed",
  "lost",
]);

export const bookingStatusEnumSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const quoteStatusEnumSchema = z.enum([
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
]);

export const contractStatusEnumSchema = z.enum([
  "draft",
  "sent",
  "signed",
  "cancelled",
]);

export const invoiceStatusEnumSchema = z.enum([
  "draft",
  "sent",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
]);

export const projectStatusEnumSchema = z.enum([
  "pre_production",
  "shoot",
  "editing",
  "client_review",
  "delivery",
  "completed",
]);

// ─── Authentication & RBAC Schemas ─────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  creatorType: creatorTypeEnumSchema.default("photographer"),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member", "crew"]),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Studio name must be at least 2 characters").optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and dashes")
    .optional(),
  currency: currencyEnumSchema.optional(),
  timezone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  paystackPublicKey: z.string().optional(),
  paystackSecretKey: z.string().optional(),
});

// ─── Shared Business Entity Schemas ─────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateClientSchema = createClientSchema.partial();


export const createLeadSchema = z.object({
  clientId: z.string().uuid().optional(),
  name: z.string().min(1, "Lead name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  serviceInterest: z.string().optional(),
  eventDate: z.string().optional(),
  budget: z.coerce.number().positive().optional(),
  currency: currencyEnumSchema.default("NGN"),
  message: z.string().optional(),
  status: leadStatusEnumSchema.default("new"),
  source: z.string().default("inquiry_form"),
  notes: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateLeadStageSchema = z.object({
  status: leadStatusEnumSchema,
});


export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().nullable().optional(),
  basePrice: z.coerce.number().positive("Base price must be positive"),
  currency: currencyEnumSchema.default("NGN"),
  durationHours: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  addOns: z.array(z.object({ name: z.string(), price: z.coerce.number() })).nullable().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();


export const createBookingSchema = z.object({
  clientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  status: bookingStatusEnumSchema.default("pending"),
  eventDate: z.string().min(1, "Event date is required"),
  eventEndDate: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  totalAmount: z.coerce.number().positive().optional(),
  currency: currencyEnumSchema.default("NGN"),
});

export const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
});

export const createQuoteSchema = z.object({
  clientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.coerce.number().default(0),
  discountAmount: z.coerce.number().default(0),
  currency: currencyEnumSchema.default("NGN"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial().extend({
  status: quoteStatusEnumSchema.optional(),
});


export const createContractSchema = z.object({
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  content: z.string().min(10, "Contract content is required"),
  status: contractStatusEnumSchema.default("draft"),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.coerce.number().default(0),
  discountAmount: z.coerce.number().default(0),
  currency: currencyEnumSchema.default("NGN"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: invoiceStatusEnumSchema.optional(),
  amountPaid: z.coerce.number().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project title is required"),
  description: z.string().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  bookingId: z.string().uuid().nullable().optional(),
  status: projectStatusEnumSchema.default("pre_production"),
  coverImage: z.string().nullable().optional(),
  shootDate: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
export const updateProjectStatusSchema = z.object({
  status: projectStatusEnumSchema,
});

export const crewMemberSchema = z.object({
  name: z.string().min(1, "Crew name is required"),
  role: z.string().min(1, "Role is required"),
  callTime: z.string().min(1, "Call time is required"),
  phone: z.string().optional(),
});

export const scheduleItemSchema = z.object({
  time: z.string().min(1, "Time is required"),
  scene: z.string().min(1, "Scene / event is required"),
  notes: z.string().optional(),
});

export const gearItemSchema = z.object({
  category: z.string().min(1),
  item: z.string().min(1),
  packed: z.boolean().default(false),
});

export const emergencyContactSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
});

export const createCallSheetSchema = z.object({
  projectId: z.string().uuid("Valid project ID is required"),
  title: z.string().min(1, "Call sheet title is required"),
  shootDate: z.string().min(1, "Shoot date is required"),
  generalCallTime: z.string().min(1, "General call time is required"),
  locationName: z.string().min(1, "Location name is required"),
  locationAddress: z.string().nullable().optional(),
  locationMapsUrl: z.string().nullable().optional(),
  parkingNotes: z.string().nullable().optional(),
  weatherForecast: z.string().nullable().optional(),
  nearestHospital: z.string().nullable().optional(),
  crew: z.array(crewMemberSchema).default([]),
  schedule: z.array(scheduleItemSchema).default([]),
  gearList: z.array(gearItemSchema).nullable().optional(),
  emergencyContacts: z.array(emergencyContactSchema).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateCallSheetSchema = createCallSheetSchema.partial();

export const createMessageSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  content: z.string().min(1, "Message content is required"),
  senderRole: z.enum(["creator", "client", "crew"]).default("creator"),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string().optional(),
    size: z.string().optional(),
  })).nullable().optional(),
});

export const createGallerySchema = z.object({
  title: z.string().min(1, "Gallery title is required"),
  slug: z.string().optional(),
  projectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  coverPhoto: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  downloadPin: z.string().nullable().optional(),
  watermarkEnabled: z.boolean().default(false),
  allowDownloads: z.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const updateGallerySchema = createGallerySchema.partial();

export const uploadGalleryPhotoSchema = z.object({
  url: z.string().min(1, "Photo URL is required"),
  thumbnailUrl: z.string().nullable().optional(),
  filename: z.string().min(1, "Filename is required"),
  sizeBytes: z.coerce.number().optional(),
  category: z.string().default("Highlights"),
  exifData: z.record(z.any()).nullable().optional(),
});

export const createVideoReviewSchema = z.object({
  title: z.string().min(1, "Video review title is required"),
  projectId: z.string().uuid().nullable().optional(),
  version: z.string().default("Cut V1"),
  videoUrl: z.string().min(1, "Video URL is required"),
  thumbnailUrl: z.string().nullable().optional(),
  durationSeconds: z.coerce.number().int().optional(),
  status: z.enum(["in_review", "approved", "changes_requested"]).default("in_review"),
});

export const updateVideoReviewSchema = createVideoReviewSchema.partial().extend({
  approvedAt: z.string().nullable().optional(),
});

export const createVideoCommentSchema = z.object({
  timestampSeconds: z.coerce.number().min(0, "Timestamp must be >= 0"),
  timecode: z.string().min(1, "Timecode is required"),
  authorName: z.string().min(1, "Author name is required"),
  authorRole: z.enum(["client", "creator", "editor"]).default("client"),
  content: z.string().min(1, "Comment text is required"),
  drawingData: z.record(z.any()).nullable().optional(),
});

export const updateVideoCommentSchema = createVideoCommentSchema.partial().extend({
  resolved: z.boolean().optional(),
});

// ─── Studio Expenses & Gear Rentals (P&L Tracking) ───────────────────────────

export const expenseCategoryEnumSchema = z.enum([
  "crew_fees",
  "gear_rentals",
  "transport_logistics",
  "studio_rental",
  "post_production",
  "props_styling",
  "software_subscriptions",
  "other",
]);

export const createExpenseSchema = z.object({
  projectId: z.string().uuid("Invalid project ID").nullable().optional(),
  category: expenseCategoryEnumSchema.default("other"),
  description: z.string().min(1, "Description is required"),
  vendor: z.string().nullable().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: currencyEnumSchema.default("NGN"),
  receiptUrl: z.string().nullable().optional(),
  expenseDate: z.string().optional(),
  paymentMethod: z.string().default("bank_transfer"),
  isReimbursable: z.boolean().default(false),
  isPaid: z.boolean().default(true),
  notes: z.string().nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// ─── Public Booking & Checkout ───────────────────────────────────────────────

export const createPublicBookingSchema = z.object({
  slug: z.string().min(1, "Studio slug is required"),
  serviceId: z.string().optional(),
  packageName: z.string().min(1, "Package name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  timeOfDay: z.string().default("full_day"),
  location: z.string().min(1, "Location is required"),
  clientName: z.string().min(1, "Full name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().min(1, "Phone number is required"),
  clientInstagram: z.string().optional(),
  notes: z.string().optional(),
  selectedAddOns: z.array(z.object({ name: z.string(), price: z.number() })).default([]),
  extraHours: z.number().default(0),
  totalAmount: z.number().positive(),
  depositAmount: z.number().positive(),
  depositMode: z.enum(["50", "100"]).default("50"),
  currency: currencyEnumSchema.default("NGN"),
});

// ─── Studio Automations & WhatsApp Engine ─────────────────────────────────────

export const automationTriggerEnumSchema = z.enum([
  "inquiry_created",
  "booking_confirmed",
  "deposit_paid",
  "callsheet_dispatched",
  "shoot_reminder_48h",
  "gallery_delivered",
  "review_cut_approved",
  "invoice_overdue",
]);

export const automationActionEnumSchema = z.enum([
  "send_whatsapp",
  "send_email",
  "notify_crew",
  "generate_callsheet",
  "create_invoice",
]);

export const createAutomationSchema = z.object({
  name: z.string().min(1, "Automation recipe name is required"),
  description: z.string().nullable().optional(),
  triggerEvent: automationTriggerEnumSchema,
  actionType: automationActionEnumSchema.default("send_whatsapp"),
  config: z.record(z.any()).default({}),
  isEnabled: z.boolean().default(true),
});

export const updateAutomationSchema = createAutomationSchema.partial();

