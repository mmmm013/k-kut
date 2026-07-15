import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const REGULAR_HUG_PAYMENT_URL =
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";
const REGULAR_HUG_PRICE_CENTS = 799;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

type RegularHugLineItem = {
  price: string;
  quantity: number;
};

let regularHugLineItemsCache: RegularHugLineItem[] | null = null;

function returnToBrowse(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = `?checkout=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url);
}

function safeInventoryId(value: FormDataEntryValue | string | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function safeOffer(value: FormDataEntryValue | string | null) {
  return value === "hug" ? "hug" : null;
}

function normalizePersonalNote(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/gu, " ").trim().slice(0, PERSONAL_NOTE_CHARACTER_LIMIT);
}

function countWords(value: string) {
  return value ? value.split(/\s+/u).filter(Boolean).length : 0;
}

function directRegularHugCheckout(inventoryId: string) {
  const checkoutUrl = new URL(REGULAR_HUG_PAYMENT_URL);
  checkoutUrl.searchParams.set("client_reference_id", inventoryId);
  checkoutUrl.searchParams.set("utm_source", "k-kut");
  checkoutUrl.searchParams.set("utm_medium", "storefront");
  checkoutUrl.searchParams.set("utm_campaign", "ii_catalog");
  checkoutUrl.searchParams.set("utm_content", "hug");
  return NextResponse.redirect(checkoutUrl);
}

async function regularHugLineItems() {
  if (!stripe) {
    throw new Error("stripe_not_configured");
  }

  if (regularHugLineItemsCache) return regularHugLineItemsCache;

  const links = await stripe.paymentLinks.list({ active: true, limit: 100 });
  const regularHugLink = links.data.find(
    (paymentLink) => paymentLink.url === REGULAR_HUG_PAYMENT_URL,
  );

  if (!regularHugLink) {
    throw new Error("regular_hug_payment_link_not_found");
  }

  const sourceItems = await stripe.paymentLinks.listLineItems(regularHugLink.id, {
    limit: 100,
  });

  const lineItems: RegularHugLineItem[] = [];
  let totalCents = 0;

  for (const item of sourceItems.data) {
    const price = item.price;
    const quantity = item.quantity || 1;

    if (!price?.id || price.currency !== "usd" || price.unit_amount === null) {
      throw new Error("regular_hug_price_authority_invalid");
    }

    lineItems.push({ price: price.id, quantity });
    totalCents += price.unit_amount * quantity;
  }

  if (!lineItems.length || totalCents !== REGULAR_HUG_PRICE_CENTS) {
    throw new Error("regular_hug_price_is_not_7_99");
  }

  regularHugLineItemsCache = lineItems;
  return lineItems;
}

async function personalizedRegularHugCheckout(
  request: NextRequest,
  inventoryId: string,
  personalNote: string,
) {
  if (!stripe) {
    return returnToBrowse(request, "personal-note-checkout-held");
  }

  const personalNoteWordCount = countWords(personalNote);
  if (personalNoteWordCount > PERSONAL_NOTE_WORD_LIMIT) {
    return returnToBrowse(request, "personal-note-over-13-words");
  }

  let lineItems: RegularHugLineItem[];
  try {
    lineItems = await regularHugLineItems();
  } catch {
    return returnToBrowse(request, "regular-hug-price-authority-held");
  }

  const orderMetadata = {
    selected_hug_id: inventoryId,
    offer: "hug",
    price_usd: "7.99",
    personal_note: personalNote,
    personal_note_word_count: String(personalNoteWordCount),
    personal_note_placement: "before_hug_content",
    manual_review_required: "true",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    client_reference_id: inventoryId,
    metadata: orderMetadata,
    payment_intent_data: { metadata: orderMetadata },
    success_url: `${request.nextUrl.origin}/browse?checkout=paid`,
    cancel_url: `${request.nextUrl.origin}/browse?checkout=cancelled`,
  });

  if (!session.url) {
    return returnToBrowse(request, "stripe-session-url-missing");
  }

  return NextResponse.redirect(session.url, 303);
}

export function GET(request: NextRequest) {
  const inventoryId = safeInventoryId(request.nextUrl.searchParams.get("ii"));
  const offer = safeOffer(request.nextUrl.searchParams.get("offer"));

  if (!inventoryId) {
    return returnToBrowse(request, "invalid-selection");
  }

  if (!offer) {
    return returnToBrowse(request, "invalid-offer");
  }

  return directRegularHugCheckout(inventoryId);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const inventoryId = safeInventoryId(formData.get("ii"));
  const offer = safeOffer(formData.get("offer"));
  const personalNote = normalizePersonalNote(formData.get("personal_note"));

  if (!inventoryId) {
    return returnToBrowse(request, "invalid-selection");
  }

  if (!offer) {
    return returnToBrowse(request, "invalid-offer");
  }

  if (!personalNote) {
    return directRegularHugCheckout(inventoryId);
  }

  return personalizedRegularHugCheckout(request, inventoryId, personalNote);
}
