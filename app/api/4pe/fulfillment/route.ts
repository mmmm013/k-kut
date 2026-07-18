import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const ALLOWED_DELIVERY = new Set([
  "email",
  "dm",
  "social_link",
  "own_text",
  "twilio_sms_later",
  "",
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

function makeFulfillmentId() {
  return `ful_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const selectedHugId = cleanString(body.selected_hug_id, 160);
  const selectedHugTitle = cleanString(body.selected_hug_title, 220);

  if (!selectedHugId) {
    return NextResponse.json(
      { ok: false, error: "missing_selected_hug_id" },
      { status: 400 }
    );
  }

  const deliveryRaw = cleanString(body.delivery_preference, 80);
  const deliveryPreference = ALLOWED_DELIVERY.has(deliveryRaw) ? deliveryRaw : "";

  const record = {
    fulfillment_id: cleanString(body.fulfillment_id, 160) || makeFulfillmentId(),
    created_at: new Date().toISOString(),
    status: "pending_checkout_or_manual_fulfillment",

    source_page: cleanString(body.source_page, 200) || "/browse",
    product_family: cleanString(body.product_family, 80) || "HUG",
    holiday_set: cleanString(body.holiday_set, 80) || "mothers_day",
    source_song: cleanString(body.source_song, 120) || "Thank You",

    selected_hug_id: selectedHugId,
    selected_hug_title: selectedHugTitle,
    sentiment_product_type: cleanString(body.sentiment_product_type, 80) || "HUG",

    typed_feeling: cleanString(body.typed_feeling, 500),
    interpreted_feeling: cleanString(body.interpreted_feeling, 220),
    promo_set_id: cleanString(body.promo_set_id, 160),

    delivery_preference: deliveryPreference,
    consent_sms: cleanBoolean(body.consent_sms),
    consent_email: cleanBoolean(body.consent_email),

    customer_email: cleanString(body.customer_email, 220),
    customer_phone: cleanString(body.customer_phone, 80),

    checkout_session_id: cleanString(body.checkout_session_id, 220),
    stripe_payment_status: cleanString(body.stripe_payment_status, 80),
    order_id: cleanString(body.order_id, 220),

    hug_link_status: "not_created",
    hug_link_url: "",

    download_allowed: false,
    share_mode: "private_hug_link",
    sms_enabled: false,

    metadata: safeObject(body.metadata),
  };

  const inboxDir = path.join(process.cwd(), "inbox", "4pe-fulfillment");
  fs.mkdirSync(inboxDir, { recursive: true });

  const filePath = path.join(
    inboxDir,
    `${record.created_at.replace(/[:.]/g, "-")}-${record.selected_hug_id}.json`
  );

  fs.writeFileSync(filePath, JSON.stringify(record, null, 2) + "\n");

  return NextResponse.json({
    ok: true,
    fulfillment_id: record.fulfillment_id,
    selected_hug_id: record.selected_hug_id,
    status: record.status,
    sms_enabled: false,
    download_allowed: false,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/4pe/fulfillment",
    status: "ready",
    rule: "Creates pending HUG fulfillment records only. No SMS. No download. No UI wiring.",
  });
}
