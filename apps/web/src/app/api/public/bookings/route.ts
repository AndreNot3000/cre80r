import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { organizations, services, bookings, clients, leads, invoices } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { createPublicBookingSchema } from "@crea8or/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPublicBookingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const cleanSlug = data.slug.toLowerCase().trim();

    // 1. Resolve Organization
    let [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, cleanSlug));

    if (!org) {
      // If demo slug or newly created, find first org or create demo studio
      const allOrgs = await db.select().from(organizations).limit(1);
      if (allOrgs.length > 0) {
        org = allOrgs[0]!;
      } else {
        [org] = await db
          .insert(organizations)
          .values({
            name: `${data.slug.charAt(0).toUpperCase() + data.slug.slice(1)} Visual Studio`,
            slug: cleanSlug,
            currency: "NGN",
          })
          .returning();
      }
    }

    // 2. Find or create Client
    let [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.organizationId, org.id), eq(clients.email, data.clientEmail.trim().toLowerCase())));

    if (!client) {
      [client] = await db
        .insert(clients)
        .values({
          organizationId: org.id,
          name: data.clientName.trim(),
          email: data.clientEmail.trim().toLowerCase(),
          phone: data.clientPhone.trim(),
          instagram: data.clientInstagram?.trim() || null,
          notes: `Created via public showroom booking on ${new Date().toLocaleDateString()}`,
        })
        .returning();
    }

    // 3. Create Booking Record
    const eventDate = new Date(data.eventDate);
    const [booking] = await db
      .insert(bookings)
      .values({
        organizationId: org.id,
        clientId: client.id,
        serviceId: data.serviceId || null,
        status: "pending",
        eventDate: eventDate,
        location: data.location.trim(),
        notes: data.notes?.trim() || `Package: ${data.packageName} • Session: ${data.timeOfDay}`,
        totalAmount: data.totalAmount.toString(),
        currency: (data.currency as any) || org.currency || "NGN",
      })
      .returning();

    // 4. Generate Itemized Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const lineItems: any[] = [
      {
        description: `${data.packageName} (${data.timeOfDay.replace("_", " ")})`,
        quantity: 1,
        unitPrice: data.totalAmount - data.selectedAddOns.reduce((s, a) => s + a.price, 0) - (data.extraHours * 75000),
        total: data.totalAmount - data.selectedAddOns.reduce((s, a) => s + a.price, 0) - (data.extraHours * 75000),
      },
    ];

    data.selectedAddOns.forEach((add) => {
      lineItems.push({
        description: `Add-On: ${add.name}`,
        quantity: 1,
        unitPrice: add.price,
        total: add.price,
      });
    });

    if (data.extraHours > 0) {
      lineItems.push({
        description: `Crew Overtime Coverage (${data.extraHours} Hour${data.extraHours > 1 ? "s" : ""})`,
        quantity: data.extraHours,
        unitPrice: 75000,
        total: data.extraHours * 75000,
      });
    }

    const [invoice] = await db
      .insert(invoices)
      .values({
        organizationId: org.id,
        clientId: client.id,
        bookingId: booking.id,
        invoiceNumber: invoiceNumber,
        status: "sent",
        dueDate: new Date(Date.now() + 5 * 86400000),
        currency: (data.currency as any) || org.currency || "NGN",
        subtotal: data.totalAmount.toString(),
        taxAmount: "0.00",
        discountAmount: "0.00",
        total: data.totalAmount.toString(),
        amountPaid: "0.00",
        lineItems: lineItems,
        notes: `${data.depositMode === "50" ? "50% Commitment Deposit" : "Full Payment"} of ₦${data.depositAmount.toLocaleString()} required to confirm booking.`,
      })
      .returning();

    // 5. Create Lead in CRM
    await db
      .insert(leads)
      .values({
        organizationId: org.id,
        name: data.clientName.trim(),
        email: data.clientEmail.trim().toLowerCase(),
        phone: data.clientPhone.trim(),
        status: "booked",
        budget: data.totalAmount.toString(),
        serviceInterest: data.packageName,
        message: data.notes || `Booked for ${data.eventDate} at ${data.location}`,
        notes: `Booking Ref: ${booking.id} • Invoice: ${invoice.invoiceNumber}`,
      })
      .catch(() => {});

    // Reference ID
    const reference = `BK-${Date.now().toString().slice(-5)}-${org.slug.slice(0, 4).toUpperCase()}`;

    return NextResponse.json(
      {
        success: true,
        reference,
        booking: {
          id: booking.id,
          status: booking.status,
          eventDate: booking.eventDate,
          location: booking.location,
          packageName: data.packageName,
          totalAmount: data.totalAmount,
          depositAmount: data.depositAmount,
          depositMode: data.depositMode,
          currency: data.currency || org.currency || "NGN",
        },
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
        },
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
        },
        organization: {
          name: org.name,
          slug: org.slug,
          whatsapp: (org as any).whatsapp || "+2348030001122",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/public/bookings error:", error);
    return NextResponse.json({ error: "Failed to create shoot booking" }, { status: 500 });
  }
}
