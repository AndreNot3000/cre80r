import { NextResponse } from "next/server";
import { WHATSAPP_STANDARD_TEMPLATES } from "@/lib/whatsapp";

// GET /api/whatsapp/templates — List registered WhatsApp message templates
export async function GET() {
  const templatesList = Object.entries(WHATSAPP_STANDARD_TEMPLATES).map(([id, tpl]) => ({
    id,
    ...tpl,
    metaStatus: "APPROVED",
    languages: ["en_US", "en_GB"],
  }));

  return NextResponse.json({
    templates: templatesList,
    total: templatesList.length,
    channel: "Meta WhatsApp Cloud API v20.0",
  });
}
