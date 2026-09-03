import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createPendingH2Order } from "@/lib/h2PendingOrder";
import { paymentRolloutStatus } from "@/lib/paymentRolloutStatus";
import { findApprovedPublicOptionByPublicOptionId } from "@/lib/publication-bridge/approvedPublicOptions";

export const runtime = "nodejs";

const PRODUCT_LAW = {
  HUG: { inventoryFamily: "KK", offer: "kk", priceCents: 799 },
  TUG: { inventoryFamily: "SK", offer: "sk", priceCents: 499 },
  BUG: { inventoryFamily: "MK", offer: "mk", priceCents: 199 },
} as const;

const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const CLIENT_REFERENCE_LIMIT = 200;
const H2_CLIENT_REFERENCE_PREFIX = "H2_";
const BF_PROFILE = "k-kut";
const STRIPE_REDIRECT_STATUS = 303;

function returnToStore(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = `?checkout=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url, STRIPE_REDIRECT_STATUS);
}

function safeId(value: FormDataEntryValue | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function normalizePersonalNote(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/gu, " ").trim().slice(0, PERSONAL_NOTE_CHARACTER_LIMIT);
}

function countWords(value: string) {
  return value ? value.split(/\s+/u).filter(Boolean).length : 0;
}

function originDomain(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = (forwardedHost || request.headers.get("host") || "k-kut.com")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/u, "");
  return /^[A-Za-z0-9.-]{1,253}$/.test(host) ? host : "k-kut.com";
}

function isLiveStripeSecretKey(value: string) {
  return /^(?:sk|rk)_live_[A-Za-z0-9]+$/u.test(value);
}

export async function GET(request: NextRequest) {
  return returnToStore(request, "checkout-post-required");
}

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") {
    return returnToStore(request, "preview-payment-disabled");
  }

  const formData = await request.formData();
  const publicOptionId = safeId(formData.get("public_option_id"));
  const inventoryId = safeId(formData.get("ii"));
  const personalNote = normalizePersonalNote(formData.get("personal_note"));

  if (!publicOptionId || !inventoryId) {
    return returnToStore(request, "invalid-selection");
  }
  if (countWords(personalNote) > PERSONAL_NOTE_WORD_LIMIT) {
    return returnToStore(request, "personal-note-over-13-words");
  }

  const option = findApprovedPublicOptionByPublicOptionId(publicOptionId);
  if (!option || option.kk_id_or_delivery_object_id !== inventoryId) {
    return returnToStore(request, "selection-unavailable");
  }

  const law = PRODUCT_LAW[option.product_family];
  if (
    !law ||
    option.inventory_family !== law.inventoryFamily ||
    option.price_cents !== law.priceCents ||
    option.payment_allowed !== true
  ) {
    return returnToStore(request, "offer-inventory-price-mismatch");
  }

  let token: string;
  try {
    token = await createPendingH2Order({
      inventoryId,
      personalNote,
      bfProfile: BF_PROFILE,
      originDomain: originDomain(request),
      publicProductName: option.product_family,
    });
  } catch (reason) {
    console.error("H2_PENDING_ORDER_CREATE_FAILED", reason instanceof Error ? reason.message : "unidentified_error");
    return returnToStore(request, "pending-order-unavailable");
  }

  const clientReference = `${H2_CLIENT_REFERENCE_PREFIX}${token}`;
  if (clientReference.length > CLIENT_REFERENCE_LIMIT || !/^[A-Za-z0-9_-]+$/.test(clientReference)) {
    return returnToStore(request, "pending-order-reference-invalid");
  }

  const rollout = paymentRolloutStatus();
  console.info(
    "K_KUT_PAYMENT_ROLLOUT_STATUS",
    JSON.stringify({
      enabled: rollout.enabled,
      current_rollout_day: rollout.currentRolloutDay,
      elapsed_days: rollout.elapsedDays,
      reason: rollout.reason || "enabled",
    }),
  );
  if (!rollout.enabled) return returnToStore(request, rollout.reason || "payment-rollout-disabled");

  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!isLiveStripeSecretKey(stripeSecretKey)) {
    console.error("K_KUT_STRIPE_SECRET_KEY_INVALID");
    return returnToStore(request, "stripe-secret-key-invalid");
  }

  const stripe = new Stripe(stripeSecretKey);
  const siteOrigin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: clientReference,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: law.priceCents,
          product_data: {
            name: `K-KUT ${option.product_family}`,
            description: "A private, stream-only music moment from G Putnam Music.",
            images: ["https://www.k-kut.com/logo.png"],
          },
        },
      }],
      success_url: `${siteOrigin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}${option.public_route}?checkout=cancelled`,
      phone_number_collection: { enabled: true },
      custom_fields: [{
        key: "recipientmobile",
        label: { type: "custom", custom: "Recipient mobile number" },
        type: "text",
        text: { minimum_length: 7, maximum_length: 20 },
      }],
      custom_text: {
        submit: { message: "K-KUT by G Putnam Music · private, stream-only delivery · no download." },
      },
      metadata: {
        public_option_id: option.public_option_id,
        selected_hug_id: inventoryId,
        product_family: option.product_family,
        inventory_family: option.inventory_family,
        public_product_name: option.product_family,
        bf_profile: BF_PROFILE,
        origin_domain: originDomain(request),
        locked_price_cents: String(law.priceCents),
        checkout_authority: "current_ii_shared_product_law",
      },
      payment_intent_data: {
        description: `K-KUT ${option.product_family}`,
        metadata: {
          public_option_id: option.public_option_id,
          selected_hug_id: inventoryId,
          product_family: option.product_family,
          inventory_family: option.inventory_family,
          locked_price_cents: String(law.priceCents),
          checkout_authority: "current_ii_shared_product_law",
        },
      },
    });

    if (!session.url) return returnToStore(request, "stripe-session-url-missing");
    return NextResponse.redirect(session.url, STRIPE_REDIRECT_STATUS);
  } catch (reason) {
    console.error("K_KUT_CHECKOUT_SESSION_CREATE_FAILED", reason instanceof Error ? reason.message : "unidentified_error");
    return returnToStore(request, "stripe-session-unavailable");
  }
}
