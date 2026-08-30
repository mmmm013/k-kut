import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const ALLOWED_EVENT_TYPES = new Set([
  "page_view",
  "mc_bot_greeted",
  "feeling_entered",
  "feeling_interpreted",
  "set_presented",
  "option_previewed",
  "option_selected",
  "delivery_preference_selected",
  "checkout_clicked",
  "support_clicked",
  "order_completed",
  "hug_link_created",
  "hug_link_shared",
]);

const ALLOWED_DELIVERY_PREFERENCES = new Set([
  "email",
  "dm",
  "social_link",
  "own_text",
  "twilio_sms_later",
  "",
  null,
]);

function cleanString(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function cleanBoolean(value: unknown) {
  return value === true;
}

function safeObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function makeSessionId() {
  return `hug_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const eventType = cleanString(body.event_type, 80);

  if (!ALLOWED_EVENT_TYPES.has(eventType)) {
    return NextResponse.json(
      { ok: false, error: "invalid_event_type" },
      { status: 400 }
    );
  }

  const deliveryPreferenceRaw = cleanString(body.delivery_preference, 80);
  const deliveryPreference = ALLOWED_DELIVERY_PREFERENCES.has(deliveryPreferenceRaw)
    ? deliveryPreferenceRaw
    : "";

  const event = {
    event_type: eventType,
    session_id: cleanString(body.session_id, 120) || makeSessionId(),
    created_at: new Date().toISOString(),
    source_page: cleanString(body.source_page, 200),
    product_family: cleanString(body.product_family, 80),
    holiday_set: cleanString(body.holiday_set, 80),
    sentiment_product_type: cleanString(body.sentiment_product_type, 80),
    typed_feeling: cleanString(body.typed_feeling, 500),
    interpreted_feeling: cleanString(body.interpreted_feeling, 200),
    selected_public_option_id: cleanString(body.selected_public_option_id, 200),
    selected_hug_id: cleanString(body.selected_hug_id, 160),
    selected_hug_title: cleanString(body.selected_hug_title, 200),
    delivery_preference: deliveryPreference,
    consent_sms: cleanBoolean(body.consent_sms),
    consent_email: cleanBoolean(body.consent_email),
    customer_email: cleanString(body.customer_email, 200),
    customer_phone: cleanString(body.customer_phone, 80),
    checkout_session_id: cleanString(body.checkout_session_id, 200),
    order_id: cleanString(body.order_id, 200),
    metadata: safeObject(body.metadata),
  };

  const inboxDir = path.join(process.cwd(), "inbox", "4pe-events");
  fs.mkdirSync(inboxDir, { recursive: true });

  const filePath = path.join(
    inboxDir,
    `${event.created_at.replace(/[:.]/g, "-")}-${event.event_type}.json`
  );

  fs.writeFileSync(filePath, JSON.stringify(event, null, 2) + "\n");

  return NextResponse.json({
    ok: true,
    event_type: event.event_type,
    session_id: event.session_id,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/4pe/events",
    status: "ready",
    sms_enabled: false,
    rule: "Capture only. No UI wiring. No SMS sending.",
  });
}
