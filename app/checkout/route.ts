import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createPendingH2Order } from "@/lib/h2PendingOrder";
import { findApprovedPublicOptionByPublicOptionId } from "@/lib/publication-bridge/approvedPublicOptions";

export const runtime = "nodejs";

const TUG_PRICE_CENTS = 499;
const HUG_PRICE_CENTS = 799;
const BUG_PRICE_CENTS = 199;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const CLIENT_REFERENCE_LIMIT = 200;
const H2_CLIENT_REFERENCE_PREFIX = "H2_";
const BF_PROFILE = "k-kut";
const STRIPE_REDIRECT_STATUS = 303;

type InventoryFamily = "SK" | "KK" | "MK";
type ProductFamily = "TUG" | "HUG" | "BUG";
type OfferCode = "sk" | "kk" | "mk";

type OfferConfig = {
  code: OfferCode;
  family: InventoryFamily;
  productFamily: ProductFamily;
  publicProductName: ProductFamily;
  priceCents: 499 | 799 | 199;
};

function offerConfig(offer: OfferCode): OfferConfig {
  if (offer === "sk") {
    return {
      code: "sk",
      family: "SK",
      productFamily: "TUG",
      publicProductName: "TUG",
      priceCents: TUG_PRICE_CENTS,
    };
  }

  if (offer === "mk") {
    return {
      code: "mk",
      family: "MK",
      productFamily: "BUG",
      publicProductName: "BUG",
      priceCents: BUG_PRICE_CENTS,
    };
  }

  return {
    code: "kk",
    family: "KK",
    productFamily: "HUG",
    publicProductName: "HUG",
    priceCents: HUG_PRICE_CENTS,
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
  return value === "sk" || value === "kk" || value === "mk" ? value : null;
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

async function governedCheckout(
  request: NextRequest,
  publicOptionId: string,
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

  const publicationOption = findApprovedPublicOptionByPublicOptionId(publicOptionId);
  if (!publicationOption) {
    return returnToStore(request, "selection-unavailable");
  }

  const config = offerConfig(offer);

  if (
    publicationOption.kk_id_or_delivery_object_id !== inventoryId ||
    publicationOption.inventory_family !== config.family ||
    publicationOption.product_family !== config.productFamily ||
    publicationOption.price_cents !== config.priceCents
  ) {
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
      success_url: `${siteOrigin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/romance?checkout=cancelled`,
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: "recipientmobile",
          label: {
            type: "custom",
            custom: "Recipient mobile number",
          },
          type: "text",
          text: {
            minimum_length: 7,
            maximum_length: 20,
          },
        },
      ],
      custom_text: {
        submit: {
          message:
            "K-KUT by G Putnam Music · private, stream-only delivery · no download.",
        },
      },
      metadata: {
        public_option_id: publicationOption.public_option_id,
        selected_hug_id: inventoryId,
        product_family: config.productFamily,
        inventory_family: config.family,
        public_product_name: config.publicProductName,
        bf_profile: BF_PROFILE,
        origin_domain: originDomain(request),
        locked_price_cents: String(config.priceCents),
        sales_canary: "one_ii_one_public_option",
      },
      payment_intent_data: {
        description: `K-KUT ${config.publicProductName}`,
        metadata: {
          public_option_id: publicationOption.public_option_id,
          selected_hug_id: inventoryId,
          product_family: config.productFamily,
          inventory_family: config.family,
          public_product_name: config.publicProductName,
          bf_profile: BF_PROFILE,
          origin_domain: originDomain(request),
          locked_price_cents: String(config.priceCents),
          sales_canary: "one_ii_one_public_option",
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
  return returnToStore(request, "checkout-post-required");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const publicOptionId = safeInventoryId(formData.get("public_option_id"));
  const inventoryId = safeInventoryId(formData.get("ii"));
  const offer = safeOffer(formData.get("offer"));
  const personalNote = normalizePersonalNote(formData.get("personal_note"));

  if (!publicOptionId) {
    return returnToStore(request, "invalid-public-option");
  }

  if (!inventoryId) {
    return returnToStore(request, "invalid-selection");
  }

  if (!offer) {
    return returnToStore(request, "invalid-offer");
  }

  return governedCheckout(
    request,
    publicOptionId,
    inventoryId,
    offer,
    personalNote,
  );
}
