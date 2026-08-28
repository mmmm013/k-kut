import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createPendingH2Order } from "@/lib/h2PendingOrder";
import { findApprovedPublicOptionByInventoryId } from "@/lib/publication-bridge/approvedPublicOptions";

export const runtime = "nodejs";

const CATALOG_URL =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/catalog/public-ii-catalog.json";

const SK_HUG_PRICE_CENTS = 499;
const KK_HUG_PRICE_CENTS = 799;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const CLIENT_REFERENCE_LIMIT = 200;
const H2_CLIENT_REFERENCE_PREFIX = "H2_";
const BF_PROFILE = "k-kut";
const STRIPE_REDIRECT_STATUS = 303;

const TRUE_VALUES = new Set([
  "1",
  "true",
  "yes",
  "pass",
  "passed",
  "present",
  "verified",
  "at_end",
  "end",
]);

type InventoryFamily = "SK" | "KK";
type OfferCode = "sk" | "kk";

type OfferConfig = {
  code: OfferCode;
  family: InventoryFamily;
  publicProductName: "sK HUG" | "KK HUG";
  priceCents: 499 | 799;
};

type RawCatalogRecord = {
  inventory_id?: unknown;
  inventory_family?: unknown;
  signature_audio_logo_integral_at_end?: unknown;
  public_storage_status?: unknown;
};

type RawCatalog = {
  records?: unknown;
};

function cleanText(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isTrue(value: unknown) {
  return TRUE_VALUES.has(cleanText(value, 40).toLowerCase());
}

function inventoryFamily(value: unknown): InventoryFamily | "" {
  const normalized = cleanText(value, 20)
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();

  if (normalized === "SK") return "SK";
  if (normalized === "KK") return "KK";
  return "";
}

function offerConfig(offer: OfferCode): OfferConfig {
  if (offer === "sk") {
    return {
      code: "sk",
      family: "SK",
      publicProductName: "sK HUG",
      priceCents: SK_HUG_PRICE_CENTS,
    };
  }

  return {
    code: "kk",
    family: "KK",
    publicProductName: "KK HUG",
    priceCents: KK_HUG_PRICE_CENTS,
  };
}

function returnToStore(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = `?checkout=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url, STRIPE_REDIRECT_STATUS);
}

function safeInventoryId(value: FormDataEntryValue | string | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function safeOffer(value: FormDataEntryValue | string | null): OfferCode | null {
  return value === "sk" || value === "kk" ? value : null;
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

async function verifiedInventoryFamily(
  inventoryId: string,
): Promise<InventoryFamily | ""> {
  try {
    const response = await fetch(CATALOG_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return "";

    const payload = (await response.json()) as RawCatalog;
    const records = Array.isArray(payload.records)
      ? (payload.records as RawCatalogRecord[])
      : [];

    const record = records.find(
      (candidate) =>
        cleanText(candidate.inventory_id, 200) === inventoryId,
    );

    if (!record) return "";

    if (
      cleanText(record.public_storage_status, 80) !==
      "PUBLIC_STORAGE_VERIFIED"
    ) {
      return "";
    }

    if (!isTrue(record.signature_audio_logo_integral_at_end)) {
      return "";
    }

    return inventoryFamily(record.inventory_family);
  } catch {
    return "";
  }
}

async function governedCheckout(
  request: NextRequest,
  inventoryId: string,
  offer: OfferCode,
  personalNote: string,
) {
  // Preview and local builds must never open a live payment surface.
  if (process.env.VERCEL_ENV !== "production") {
    return returnToStore(request, "preview-payment-disabled");
  }

  const personalNoteWordCount = countWords(personalNote);

  if (personalNoteWordCount > PERSONAL_NOTE_WORD_LIMIT) {
    return returnToStore(request, "personal-note-over-13-words");
  }

  const publicationOption = findApprovedPublicOptionByInventoryId(inventoryId);
  const verifiedFamily =
    (await verifiedInventoryFamily(inventoryId)) ||
    (publicationOption ? "KK" : "");

  if (!verifiedFamily) {
    return returnToStore(request, "selection-unavailable");
  }

  const config = offerConfig(offer);

  if (verifiedFamily !== config.family) {
    return returnToStore(request, "offer-inventory-mismatch");
  }


  let token: string;

  try {
    token = await createPendingH2Order({
      inventoryId,
      personalNote,
      bfProfile: BF_PROFILE,
      originDomain: originDomain(request),
      publicProductName: config.publicProductName,
    });
  } catch (reason) {
    console.error(
      "H2_PENDING_ORDER_CREATE_FAILED",
      reason instanceof Error ? reason.message : "unidentified_error",
    );
    return returnToStore(request, "pending-order-unavailable");
  }

  const clientReference = `${H2_CLIENT_REFERENCE_PREFIX}${token}`;

  if (
    clientReference.length > CLIENT_REFERENCE_LIMIT ||
    !/^[A-Za-z0-9_-]+$/.test(clientReference)
  ) {
    return returnToStore(request, "pending-order-reference-invalid");
  }

  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();

  if (!stripeSecretKey) {
    return returnToStore(request, "stripe-not-configured");
  }

  const siteOrigin = new URL(request.url).origin;
  const stripe = new Stripe(stripeSecretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: clientReference,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: config.priceCents,
            product_data: {
              name: `K-KUT ${config.publicProductName}`,
              description:
                "A private, stream-only music moment from G Putnam Music.",
              images: ["https://www.k-kut.com/logo.png"],
            },
          },
        },
      ],
      success_url: `${siteOrigin}/?checkout=paid&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/hug?checkout=cancelled`,
      custom_text: {
        submit: {
          message:
            "K-KUT by G Putnam Music · private, stream-only delivery · no download.",
        },
      },
      metadata: {
        selected_hug_id: inventoryId,
        public_product_name: config.publicProductName,
        bf_profile: BF_PROFILE,
        origin_domain: originDomain(request),
        locked_price_cents: String(config.priceCents),
      },
      payment_intent_data: {
        description: `K-KUT ${config.publicProductName}`,
        metadata: {
          selected_hug_id: inventoryId,
          public_product_name: config.publicProductName,
          bf_profile: BF_PROFILE,
          origin_domain: originDomain(request),
          locked_price_cents: String(config.priceCents),
        },
      },
    });

    if (!session.url) {
      return returnToStore(request, "stripe-session-url-missing");
    }

    return NextResponse.redirect(session.url, STRIPE_REDIRECT_STATUS);
  } catch (reason) {
    console.error(
      "K_KUT_CHECKOUT_SESSION_CREATE_FAILED",
      reason instanceof Error ? reason.message : "unidentified_error",
    );
    return returnToStore(request, "stripe-session-unavailable");
  }
}

export async function GET(request: NextRequest) {
  const inventoryId = safeInventoryId(request.nextUrl.searchParams.get("ii"));
  const offer = safeOffer(request.nextUrl.searchParams.get("offer"));

  if (!inventoryId) {
    return returnToStore(request, "invalid-selection");
  }

  if (!offer) {
    return returnToStore(request, "invalid-offer");
  }

  return governedCheckout(request, inventoryId, offer, "");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const inventoryId = safeInventoryId(formData.get("ii"));
  const offer = safeOffer(formData.get("offer"));
  const personalNote = normalizePersonalNote(formData.get("personal_note"));

  if (!inventoryId) {
    return returnToStore(request, "invalid-selection");
  }

  if (!offer) {
    return returnToStore(request, "invalid-offer");
  }

  return governedCheckout(request, inventoryId, offer, personalNote);
}
