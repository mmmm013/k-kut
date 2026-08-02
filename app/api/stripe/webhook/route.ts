import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";
import {
  consumePendingH2Order,
  h2PendingOrderStoreConfigured,
} from "@/lib/h2PendingOrder";
import type { CustomerPackageCode } from "@/lib/productOfferLaw";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const isVercelProduction = Boolean(process.env.VERCEL);
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const LEGACY_CLIENT_REFERENCE_PREFIX = "H1|";
const H2_CLIENT_REFERENCE_PREFIX = "H2_";
const CUSTOMER_PACKAGE_CODES = new Set<CustomerPackageCode>([
  "hug",
  "tug",
  "bug",
]);

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

type ParsedClientReference = {
  kind: "h2" | "legacy" | "inventory_only" | "missing" | "invalid";
  token: string;
  inventoryId: string;
  personalNote: string;
  format: string;
};

function cleanString(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function safeInventoryId(value: unknown) {
  const candidate = cleanString(value, 200);
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function safeCustomerPackageCode(value: unknown): CustomerPackageCode {
  const candidate = cleanString(value, 10).toLowerCase() as CustomerPackageCode;
  return CUSTOMER_PACKAGE_CODES.has(candidate) ? candidate : "hug";
}

function countWords(value: string) {
  return value ? value.split(/\s+/u).filter(Boolean).length : 0;
}

function safePersonalNote(value: unknown) {
  const note = cleanString(value, PERSONAL_NOTE_CHARACTER_LIMIT).replace(
    /\s+/gu,
    " ",
  );
  return countWords(note) <= PERSONAL_NOTE_WORD_LIMIT ? note : "";
}

function parseClientReference(value: unknown): ParsedClientReference {
  const reference = cleanString(value, 200);

  if (!reference) {
    return {
      kind: "missing",
      token: "",
      inventoryId: "",
      personalNote: "",
      format: "missing",
    };
  }

  if (reference.startsWith(H2_CLIENT_REFERENCE_PREFIX)) {
    const token = reference.slice(H2_CLIENT_REFERENCE_PREFIX.length).toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(token)) {
      return {
        kind: "invalid",
        token: "",
        inventoryId: "",
        personalNote: "",
        format: "invalid_h2_token",
      };
    }

    return {
      kind: "h2",
      token,
      inventoryId: "",
      personalNote: "",
      format: "h2_pending_order_token",
    };
  }

  if (reference.startsWith(LEGACY_CLIENT_REFERENCE_PREFIX)) {
    const body = reference.slice(LEGACY_CLIENT_REFERENCE_PREFIX.length);
    const separatorIndex = body.indexOf("|");

    if (separatorIndex < 1) {
      return {
        kind: "invalid",
        token: "",
        inventoryId: "",
        personalNote: "",
        format: "invalid_legacy_h1",
      };
    }

    const inventoryId = safeInventoryId(body.slice(0, separatorIndex));
    const personalNote = safePersonalNote(body.slice(separatorIndex + 1));

    return {
      kind: inventoryId ? "legacy" : "invalid",
      token: "",
      inventoryId,
      personalNote,
      format: inventoryId ? "legacy_h1_with_note" : "invalid_legacy_h1",
    };
  }

  const inventoryId = safeInventoryId(reference);
  return {
    kind: inventoryId ? "inventory_only" : "invalid",
    token: "",
    inventoryId,
    personalNote: "",
    format: inventoryId ? "legacy_inventory_only" : "invalid",
  };
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
    customer_package_code: record.customer_package_code,
    public_product_name: record.public_product_name,
    bf_profile: record.bf_profile,
    origin_domain: record.origin_domain,
    selected_inventory_id: record.selected_inventory_id,
    personal_note_present: record.personal_note_present,
    personal_note_word_count: record.personal_note_word_count,
    personal_note_placement: record.personal_note_placement,
    client_reference_format: record.client_reference_format,
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
    product_family: "CUSTOMER_PACKAGE",
    product_name: "",
    public_product_name: "",
    customer_package_code: "",
    bf_profile: "",
    origin_domain: "",
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
    selected_inventory_id: "",
    selected_inventory_title: "",
    canonical_ii_kind: "",
    source_song: "",
    typed_feeling: "",
    personal_note: "",
    personal_note_present: false,
    personal_note_word_count: 0,
    personal_note_word_limit: PERSONAL_NOTE_WORD_LIMIT,
    personal_note_placement: "before_package_content",
    personal_note_status: "not_provided",
    client_reference_format: "missing",
    delivery_preference: "manual_review_required",
    package_link_status: "not_created",
    package_link_url: "",
    download_allowed: false,
    share_mode: "private_package_link",
    sms_enabled: false,
    metadata: {},
    notes:
      "Stripe Checkout is the durable paid-order authority. H2 stores the exact selected II, HUG/TUG/BUG customer package, origin attribution, and optional note server-side before checkout. Production fulfillment remains manual-reviewed until durable MIAL automation is separately approved.",
  };
}

function personalNoteFields(
  metadata: Stripe.Metadata | null | undefined,
  referenceNote = "",
) {
  const rawNote = cleanString(
    metadata?.personal_note || referenceNote,
    PERSONAL_NOTE_CHARACTER_LIMIT,
  ).replace(/\s+/gu, " ");
  const note = safePersonalNote(rawNote);
  const rawWordCount = countWords(rawNote);

  return {
    personal_note: note,
    personal_note_present: Boolean(note),
    personal_note_word_count: note ? countWords(note) : 0,
    personal_note_word_limit: PERSONAL_NOTE_WORD_LIMIT,
    personal_note_placement: "before_package_content",
    personal_note_status:
      rawWordCount > PERSONAL_NOTE_WORD_LIMIT
        ? "held_over_word_limit"
        : note
          ? "approved_for_manual_placement"
          : "not_provided",
  };
}

async function recordFromCheckoutSession(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const record = basePaidRecord(event);
  const parsedReference = parseClientReference(session.client_reference_id);

  let selectedInventoryId = parsedReference.inventoryId;
  let referenceNote = parsedReference.personalNote;
  let publicProductName = "HUG";
  let customerPackageCode: CustomerPackageCode = "hug";
  let bfProfile = "k-kut";
  let originDomain = "k-kut.com";

  if (parsedReference.kind === "h2") {
    const pendingOrder = await consumePendingH2Order({
      token: parsedReference.token,
      stripeEventId: event.id,
      stripeCheckoutSessionId: session.id,
    });

    selectedInventoryId = pendingOrder.inventoryId;
    referenceNote = pendingOrder.personalNote;
    publicProductName = pendingOrder.publicProductName;
    customerPackageCode = pendingOrder.customerPackageCode;
    bfProfile = pendingOrder.bfProfile;
    originDomain = pendingOrder.originDomain;
  }

  const noteFields = personalNoteFields(session.metadata, referenceNote);

  return {
    ...record,
    ...noteFields,
    product_name: publicProductName,
    public_product_name: publicProductName,
    customer_package_code: customerPackageCode,
    bf_profile: bfProfile,
    origin_domain: originDomain,
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
    selected_inventory_id: selectedInventoryId,
    client_reference_format: parsedReference.format,
    delivery_preference: selectedInventoryId
      ? "fulfill_exact_selected_ii"
      : "manual_review_missing_selected_ii",
    metadata: {
      ...(session.metadata || {}),
      client_reference_id_present: Boolean(session.client_reference_id),
      client_reference_format: parsedReference.format,
      exact_inventory_id_present: Boolean(selectedInventoryId),
      personal_note_valid:
        noteFields.personal_note_status !== "held_over_word_limit",
      bf_profile: bfProfile,
      origin_domain: originDomain,
      public_product_name: publicProductName,
      customer_package_code: customerPackageCode,
    },
  };
}

function recordFromPaymentIntent(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const record = basePaidRecord(event);
  const selectedInventoryId = safeInventoryId(
    paymentIntent.metadata?.selected_inventory_id ||
      paymentIntent.metadata?.selected_hug_id,
  );
  const noteFields = personalNoteFields(paymentIntent.metadata);
  const customerPackageCode = safeCustomerPackageCode(
    paymentIntent.metadata?.customer_package_code,
  );
  const fallbackPackageName = customerPackageCode.toUpperCase();

  return {
    ...record,
    ...noteFields,
    product_name:
      cleanString(paymentIntent.description, 220) ||
      `${fallbackPackageName} payment`,
    public_product_name:
      cleanString(paymentIntent.metadata?.public_product_name, 120) ||
      fallbackPackageName,
    customer_package_code: customerPackageCode,
    bf_profile:
      cleanString(paymentIntent.metadata?.bf_profile, 60) || "k-kut",
    origin_domain:
      cleanString(paymentIntent.metadata?.origin_domain, 253) || "k-kut.com",
    amount_paid_usd: moneyFromCents(
      paymentIntent.amount_received || paymentIntent.amount,
    ),
    stripe_payment_status:
      cleanString(paymentIntent.status, 80) || "succeeded",
    stripe_payment_intent_id: cleanString(paymentIntent.id, 220),
    stripe_customer_id:
      typeof paymentIntent.customer === "string" ? paymentIntent.customer : "",
    selected_inventory_id: selectedInventoryId,
    delivery_preference: selectedInventoryId
      ? "fulfill_exact_selected_ii"
      : "manual_review_missing_selected_ii",
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
    try {
      const record = await recordFromCheckoutSession(event);
      fulfillmentQueueStatus = stagePaidFulfillmentRecord(record);
    } catch (reason) {
      console.error(
        "H2_PENDING_ORDER_RESOLUTION_FAILED",
        reason instanceof Error ? reason.message : "unidentified_error",
      );
      return NextResponse.json(
        { ok: false, error: "h2_pending_order_resolution_failed" },
        { status: 500 },
      );
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const record = recordFromPaymentIntent(event);
    fulfillmentQueueStatus = record.selected_inventory_id
      ? stagePaidFulfillmentRecord(record)
      : "event_acknowledged_checkout_session_is_fulfillment_authority";
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
    exact_ii_capture: "h2_pending_order_token_to_selected_inventory_id",
    customer_package_capture: "hug_tug_or_bug_separate_from_ii_identity",
    personal_note_capture: "optional_13_words_before_package_content",
    client_reference_format: "H2_safe_order_token",
    legacy_client_reference_formats: [
      "H1|inventory_id|personal_note",
      "inventory_id",
    ],
    h2_pending_order_store: h2PendingOrderStoreConfigured()
      ? "configured"
      : "missing_env",
    durable_order_authority: "stripe_checkout_session",
    production_fulfillment_mode: "manual_review_from_stripe_order",
    local_packet_mode: isVercelProduction
      ? "disabled_on_read_only_runtime"
      : "local_mial_import_packet",
    rule:
      "H2 recovers the exact selected II, HUG/TUG/BUG customer package, optional 13-word note, BF profile, and origin domain from a server-only pending-order record. Package identity never replaces II identity. No automatic SMS or download. Manual package fulfillment review remains required.",
  });
}
