import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const isVercelProduction = Boolean(process.env.VERCEL);

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

function cleanString(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function safeInventoryId(value: unknown) {
  const candidate = cleanString(value, 200);
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function moneyFromCents(value: number | null | undefined) {
  if (typeof value !== "number") return "";
  return (value / 100).toFixed(2);
}

function writeLocalPaidFulfillmentPacket(record: Record<string, unknown>) {
  const inboxDir = path.join(
    process.cwd(),
    "inbox",
    "4pe-fulfillment",
    "stripe-paid",
  );
  fs.mkdirSync(inboxDir, { recursive: true });

  const createdAt =
    cleanString(record.created_at, 80) || new Date().toISOString();
  const eventId =
    cleanString(record.stripe_event_id, 120) || `stripe_${Date.now()}`;

  const filePath = path.join(
    inboxDir,
    `${createdAt.replace(/[:.]/g, "-")}-${eventId}.json`,
  );

  fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`);
  return "local_mial_import_packet_written";
}

function stagePaidFulfillmentRecord(record: Record<string, unknown>) {
  if (!isVercelProduction) {
    return writeLocalPaidFulfillmentPacket(record);
  }

  const productionEvidence = {
    fulfillment_id: record.fulfillment_id,
    created_at: record.created_at,
    status: record.status,
    stripe_event_id: record.stripe_event_id,
    stripe_event_type: record.stripe_event_type,
    stripe_checkout_session_id: record.stripe_checkout_session_id,
    stripe_payment_intent_id: record.stripe_payment_intent_id,
    amount_paid_usd: record.amount_paid_usd,
    selected_hug_id: record.selected_hug_id,
    customer_email_present: record.customer_email_present,
    customer_phone_present: record.customer_phone_present,
    delivery_preference: record.delivery_preference,
    durable_order_authority: "stripe_checkout_session",
    manual_review_required: true,
  };

  console.info(
    "K_KUT_PAID_FULFILLMENT_EVIDENCE",
    JSON.stringify(productionEvidence),
  );

  return "stripe_durable_manual_review_queue";
}

function basePaidRecord(event: Stripe.Event) {
  return {
    fulfillment_id: `stripe_paid_${event.id}`,
    created_at: new Date().toISOString(),
    status: "paid_needs_manual_fulfillment",
    source: "stripe_webhook",
    durable_order_authority: "stripe_checkout_session",
    manual_review_required: true,
    product_family: "HUG",
    product_name: "",
    amount_paid_usd: "",
    net_amount_usd: "",
    stripe_payment_status: "succeeded",
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    stripe_checkout_session_id: "",
    stripe_payment_intent_id: "",
    stripe_charge_id: "",
    stripe_customer_id: "",
    customer_email_present: false,
    customer_phone_present: false,
    selected_hug_id: "",
    selected_hug_title: "",
    source_song: "",
    typed_feeling: "",
    delivery_preference: "manual_review_required",
    hug_link_status: "not_created",
    hug_link_url: "",
    download_allowed: false,
    share_mode: "private_hug_link",
    sms_enabled: false,
    metadata: {},
    notes:
      "Stripe Checkout is the durable paid-order authority. Exact selected K-KUT is preserved in client_reference_id. Production fulfillment remains manual-reviewed until durable MIAL automation is separately approved.",
  };
}

function recordFromCheckoutSession(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const record = basePaidRecord(event);
  const selectedInventoryId = safeInventoryId(session.client_reference_id);

  return {
    ...record,
    product_name: "K-KUT catalog selection",
    amount_paid_usd: moneyFromCents(session.amount_total),
    stripe_payment_status: cleanString(session.payment_status, 80) || "paid",
    stripe_checkout_session_id: cleanString(session.id, 220),
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : "",
    stripe_customer_id:
      typeof session.customer === "string" ? session.customer : "",
    customer_email_present: Boolean(
      session.customer_details?.email || session.customer_email,
    ),
    customer_phone_present: Boolean(session.customer_details?.phone),
    selected_hug_id: selectedInventoryId,
    delivery_preference: selectedInventoryId
      ? "fulfill_exact_selected_ii"
      : "manual_review_missing_selected_ii",
    metadata: {
      ...(session.metadata || {}),
      client_reference_id_present: Boolean(selectedInventoryId),
    },
  };
}

function recordFromPaymentIntent(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const record = basePaidRecord(event);

  return {
    ...record,
    product_name:
      cleanString(paymentIntent.description, 220) || "Stripe payment",
    amount_paid_usd: moneyFromCents(
      paymentIntent.amount_received || paymentIntent.amount,
    ),
    stripe_payment_status:
      cleanString(paymentIntent.status, 80) || "succeeded",
    stripe_payment_intent_id: cleanString(paymentIntent.id, 220),
    stripe_customer_id:
      typeof paymentIntent.customer === "string" ? paymentIntent.customer : "",
    metadata: paymentIntent.metadata || {},
  };
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "stripe_webhook_not_configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "missing_stripe_signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_stripe_signature" },
      { status: 400 },
    );
  }

  let fulfillmentQueueStatus = "event_acknowledged_no_fulfillment_action";

  if (event.type === "checkout.session.completed") {
    fulfillmentQueueStatus = stagePaidFulfillmentRecord(
      recordFromCheckoutSession(event),
    );
  }

  if (event.type === "payment_intent.succeeded") {
    fulfillmentQueueStatus = stagePaidFulfillmentRecord(
      recordFromPaymentIntent(event),
    );
  }

  return NextResponse.json({
    ok: true,
    received: true,
    event_type: event.type,
    fulfillment_queue_status: fulfillmentQueueStatus,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/stripe/webhook",
    status: stripe && webhookSecret ? "configured" : "missing_env",
    handles: ["checkout.session.completed", "payment_intent.succeeded"],
    exact_ii_capture: "client_reference_id_to_selected_hug_id",
    durable_order_authority: "stripe_checkout_session",
    production_fulfillment_mode: "manual_review_from_stripe_order",
    local_packet_mode: isVercelProduction
      ? "disabled_on_read_only_runtime"
      : "local_mial_import_packet",
    rule:
      "Paid capture preserves exact selected II in Stripe. No automatic SMS or download. Manual HUG fulfillment review remains required.",
  });
}
