import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";
import {
  consumePendingH2Order,
  h2PendingOrderStoreConfigured,
} from "@/lib/h2PendingOrder";
import { findApprovedIiReleaseByPublicOptionId } from "@/lib/approvedIiRelease";
import { findApprovedPublicOptionByPublicOptionId } from "@/lib/publication-bridge/approvedPublicOptions";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const isVercelProduction = Boolean(process.env.VERCEL);
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const LEGACY_CLIENT_REFERENCE_PREFIX = "H1|";
const H2_CLIENT_REFERENCE_PREFIX = "H2_";

function isLiveStripeSecretKey(value: string) {
  return /^(?:sk|rk)_live_[A-Za-z0-9]+$/u.test(value.trim());
}

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
  const authorityHeld = record.status === "paid_held_current_ii_authority";

  if (!isVercelProduction) {
    writeLocalPaidFulfillmentPacket(record);
    return authorityHeld
      ? "local_paid_hold_packet_written"
      : "local_mial_import_packet_written";
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
    core_product_name: record.product_name,
    public_product_name: record.public_product_name,
    bf_profile: record.bf_profile,
    origin_domain: record.origin_domain,
    selected_hug_id: record.selected_hug_id,
    selected_public_option_id: record.selected_public_option_id,
    current_ii_authority: record.current_ii_authority,
    current_ii_product_family: record.current_ii_product_family,
    current_ii_inventory_family: record.current_ii_inventory_family,
    personal_note_present: record.personal_note_present,
    personal_note_word_count: record.personal_note_word_count,
    personal_note_placement: record.personal_note_placement,
    client_reference_format: record.client_reference_format,
    customer_email_present: record.customer_email_present,
    customer_phone_present: record.customer_phone_present,
    recipient_mobile_present: record.recipient_mobile_present,
    recipient_mobile_source: record.recipient_mobile_source,
    delivery_preference: record.delivery_preference,
    durable_order_authority: "stripe_checkout_session",
    manual_review_required: true,
  };

  console.info(
    "K_KUT_PAID_FULFILLMENT_EVIDENCE",
    JSON.stringify(productionEvidence),
  );

  return authorityHeld
    ? "paid_held_current_ii_authority"
    : "stripe_durable_manual_review_queue";
}

function enforceCurrentIiAuthority(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const inventoryId = safeInventoryId(record.selected_hug_id);
  const publicOptionId = safeInventoryId(record.selected_public_option_id);
  const option = publicOptionId
    ? findApprovedPublicOptionByPublicOptionId(publicOptionId)
    : null;
  const approvedSubsetOption =
    findApprovedIiReleaseByPublicOptionId(publicOptionId) ||
    findApprovedIiReleaseByPublicOptionId(inventoryId);

  const approvedSubsetAuthorized = Boolean(
    approvedSubsetOption &&
      approvedSubsetOption.publicOptionId === inventoryId &&
      record.amount_paid_usd ===
        (approvedSubsetOption.priceCents / 100).toFixed(2),
  );

  if (approvedSubsetAuthorized && approvedSubsetOption) {
    return {
      ...record,
      selected_public_option_id: approvedSubsetOption.publicOptionId,
      current_ii_authority: "STAGE",
      current_ii_product_family: approvedSubsetOption.productFamily,
      current_ii_inventory_family: approvedSubsetOption.inventoryFamily,
    };
  }

  if (!option || option.kk_id_or_delivery_object_id !== inventoryId) {
    return {
      ...record,
      status: "paid_held_current_ii_authority",
      current_ii_authority: "HOLD",
      current_ii_product_family: "",
      current_ii_inventory_family: "",
      delivery_preference: "manual_review_no_delivery",
      hug_link_status: "blocked_current_ii_hold",
      manual_review_required: true,
    };
  }

  return {
    ...record,
    current_ii_authority: "STAGE",
    current_ii_product_family: option.product_family,
    current_ii_inventory_family: option.inventory_family,
  };
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
    public_product_name: "",
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
    recipient_mobile: "",
    recipient_mobile_present: false,
    recipient_mobile_source: "not_provided",
    selected_hug_id: "",
    selected_public_option_id: "",
    selected_hug_title: "",
    source_song: "",
    typed_feeling: "",
    personal_note: "",
    personal_note_present: false,
    personal_note_word_count: 0,
    personal_note_word_limit: PERSONAL_NOTE_WORD_LIMIT,
    personal_note_placement: "before_hug_content",
    personal_note_status: "not_provided",
    client_reference_format: "missing",
    delivery_preference: "manual_review_required",
    hug_link_status: "not_created",
    hug_link_url: "",
    download_allowed: false,
    share_mode: "private_hug_link",
    sms_enabled: false,
    metadata: {},
    notes:
      "Stripe Checkout is the durable paid-order authority. H2 stores the exact selected II and optional note server-side before checkout; legacy H1 and inventory-only references remain readable during migration. Production fulfillment remains manual-reviewed until durable MIAL automation is separately approved.",
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
    personal_note_placement: "before_hug_content",
    personal_note_status:
      rawWordCount > PERSONAL_NOTE_WORD_LIMIT
        ? "held_over_word_limit"
        : note
          ? "approved_for_manual_placement"
          : "not_provided",
  };
}

function checkoutTextField(session: Stripe.Checkout.Session, key: string) {
  const field = session.custom_fields?.find((candidate) => candidate.key === key);
  return field?.type === "text" ? cleanString(field.text?.value, 40) : "";
}

async function recordFromCheckoutSession(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const record = basePaidRecord(event);
  const parsedReference = parseClientReference(session.client_reference_id);

  let selectedInventoryId = parsedReference.inventoryId;
  let referenceNote = parsedReference.personalNote;
  let publicProductName = "K-KUT HUG";
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
    bfProfile = pendingOrder.bfProfile;
    originDomain = pendingOrder.originDomain;
  }

  const noteFields = personalNoteFields(session.metadata, referenceNote);
  const recipientMobile = checkoutTextField(session, "recipientmobile");

  return {
    ...record,
    ...noteFields,
    product_name: "K-KUT HUG",
    public_product_name: publicProductName,
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
    customer_phone_present: Boolean(
      session.customer_details?.phone || recipientMobile,
    ),
    recipient_mobile: recipientMobile,
    recipient_mobile_present: Boolean(recipientMobile),
    recipient_mobile_source: recipientMobile
      ? "stripe_checkout_custom_field"
      : "not_provided",
    selected_hug_id: selectedInventoryId,
    selected_public_option_id: safeInventoryId(
      session.metadata?.public_option_id,
    ),
    client_reference_format: parsedReference.format,
    delivery_preference: selectedInventoryId
      ? recipientMobile
        ? "fulfill_exact_selected_ii_to_recipient_mobile"
        : "manual_review_missing_recipient_mobile"
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
      recipient_mobile_present: Boolean(recipientMobile),
    },
  };
}

function recordFromPaymentIntent(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const record = basePaidRecord(event);
  const selectedInventoryId = safeInventoryId(
    paymentIntent.metadata?.selected_hug_id,
  );
  const noteFields = personalNoteFields(paymentIntent.metadata);

  return {
    ...record,
    ...noteFields,
    product_name:
      cleanString(paymentIntent.description, 220) || "K-KUT HUG payment",
    public_product_name:
      cleanString(paymentIntent.metadata?.public_product_name, 120) ||
      "K-KUT HUG",
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
    selected_hug_id: selectedInventoryId,
    selected_public_option_id: safeInventoryId(
      paymentIntent.metadata?.public_option_id,
    ),
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
      const record = enforceCurrentIiAuthority(
        await recordFromCheckoutSession(event),
      );
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
    const record = enforceCurrentIiAuthority(recordFromPaymentIntent(event));
    console.info(
      "K_KUT_PAYMENT_INTENT_AUTHORITY_EVIDENCE",
      JSON.stringify({
        stripe_event_id: record.stripe_event_id,
        selected_hug_id: record.selected_hug_id,
        selected_public_option_id: record.selected_public_option_id,
        current_ii_authority: record.current_ii_authority,
        fulfillment_authority: "checkout.session.completed",
      }),
    );
    fulfillmentQueueStatus =
      "event_acknowledged_checkout_session_is_fulfillment_authority";
  }

  return NextResponse.json({
    ok: true,
    received: true,
    event_type: event.type,
    fulfillment_queue_status: fulfillmentQueueStatus,
  });
}

export async function GET() {
  const checkoutSessionCreationReady = isLiveStripeSecretKey(stripeSecretKey);
  const webhookReady = Boolean(stripe && webhookSecret);

  return NextResponse.json({
    ok: true,
    route: "/api/stripe/webhook",
    status:
      webhookReady && checkoutSessionCreationReady
        ? "configured"
        : webhookReady
          ? "webhook_configured_checkout_blocked"
          : "missing_env",
    checkout_session_creation: checkoutSessionCreationReady
      ? "configured"
      : "invalid_or_missing_live_secret_key",
    handles: ["checkout.session.completed", "payment_intent.succeeded"],
    exact_ii_capture:
      "h2_pending_order_token_to_selected_hug_id_plus_server_stripe_public_option_id",
    personal_note_capture: "optional_13_words_before_hug_content",
    client_reference_format: "H2_safe_order_token",
    legacy_client_reference_formats: [
      "H1|inventory_id|personal_note",
      "inventory_id",
    ],
    h2_pending_order_store: h2PendingOrderStoreConfigured()
      ? "configured"
      : "missing_env",
    durable_order_authority: "stripe_checkout_session",
    payment_intent_rule:
      "Evidence only; payment_intent.succeeded never creates a second fulfillment packet.",
    production_fulfillment_mode: "manual_review_from_stripe_order",
    local_packet_mode: isVercelProduction
      ? "disabled_on_read_only_runtime"
      : "local_mial_import_packet",
    rule:
      "H2 recovers the exact selected II, optional 13-word note, BF profile, origin domain, and public product identity from a server-only pending-order record. No automatic SMS or download. Manual HUG fulfillment review remains required.",
  });
}
