import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { auth } from "@crea8or/auth";

// Route imports (to be added as we build each module)
import { authRoutes } from "./routes/auth.js";
import { clientRoutes } from "./routes/clients.js";
import { leadRoutes } from "./routes/leads.js";
import { serviceRoutes } from "./routes/services.js";
import { bookingRoutes } from "./routes/bookings.js";
import { quoteRoutes } from "./routes/quotes.js";
import { contractRoutes } from "./routes/contracts.js";
import { invoiceRoutes } from "./routes/invoices.js";
import { paymentRoutes } from "./routes/payments.js";
import { projectRoutes } from "./routes/projects.js";
import { messageRoutes } from "./routes/messages.js";
import { galleryRoutes } from "./routes/galleries.js";
import { reviewRoutes } from "./routes/reviews.js";
import { expenseRoutes } from "./routes/expenses.js";
import { showroomRoutes } from "./routes/showroom.js";
import { whatsappRoutes } from "./routes/whatsapp.js";

const app = new Hono();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok", service: "crea8or-api" }));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/clients", clientRoutes);
app.route("/api/leads", leadRoutes);
app.route("/api/services", serviceRoutes);
app.route("/api/bookings", bookingRoutes);
app.route("/api/quotes", quoteRoutes);
app.route("/api/contracts", contractRoutes);
app.route("/api/invoices", invoiceRoutes);
app.route("/api/payments", paymentRoutes);
app.route("/api/projects", projectRoutes);
app.route("/api/messages", messageRoutes);
app.route("/api/galleries", galleryRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/expenses", expenseRoutes);
app.route("/api/showroom", showroomRoutes);
app.route("/api/whatsapp", whatsappRoutes);

// ─── 404 Fallback ─────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 3001;

export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`🚀 Crea8or API running on http://localhost:${PORT}`);
