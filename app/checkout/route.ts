import { NextRequest, NextResponse } from "next/server";
import { createPendingH2Order } from "@/lib/h2PendingOrder";
import { findApprovedPublicOptionByInventoryId } from "@/lib/publication-bridge/approvedPublicOptions";

export const runtime = "nodejs";

const CATALOG_URL =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/catalog/public-ii-catalog.json";

const TUG_PRICE_CENTS = 499;
const HUG_PRICE_CENTS = 799;
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
  publicProductName: "TUG" | "HUG";
  priceCents: 499 | 799;
  paymentUrl: string;
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

function configuredPaymentUrl(value: string | undefined) {
  const candidate = String(value || "").trim();
  if (!candidate) return "";

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function offerConfig(offer: OfferCode): OfferConfig {
  if (offer === "sk") {
    return {
      code: "sk",
      family: "SK",
      publicProductName: "TUG",
      priceCents: TUG_PRICE_CENTS,
      paymentUrl: configuredPaymentUrl(process.env.SK_TUG_PAYMENT_URL),
    };
  }

  return {
    code: "kk",
    family: "KK",
    publicProductName: "HUG",
    priceCents: HUG_PRICE_CENTS,
    paymentUrl: configuredPaymentUrl(process.env.KK_HUG_PAYMENT_URL),
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

  const paymentUrl = config.paymentUrl;

  if (!paymentUrl) {
    return returnToStore(request, "payment-link-unavailable");
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

  const checkoutUrl = new URL(paymentUrl);

  checkoutUrl.searchParams.set("client_reference_id", clientReference);
  checkoutUrl.searchParams.set("utm_source", BF_PROFILE);
  checkoutUrl.searchParams.set("utm_medium", "storefront");
  checkoutUrl.searchParams.set("utm_campaign", `catalog_${config.code}`);
  checkoutUrl.searchParams.set(
    "utm_content",
    personalNote ? `${config.code}_with_note` : config.code,
  );

  return NextResponse.redirect(checkoutUrl, STRIPE_REDIRECT_STATUS);
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
