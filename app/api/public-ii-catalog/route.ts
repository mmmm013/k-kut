import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATALOG_URL =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/catalog/public-ii-catalog.json";

const AUDIO_PREFIX =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/";

const EXPECTED_INVENTORY_COUNT = 2611;

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

type CheckoutClass = "short_kut" | "hug" | "big_hug" | "hold";

type PublicCatalogRecord = {
  id: string;
  label: string;
  family: string;
  lane: string;
  offer: string;
  priceUsd: number | null;
  audioUrl: string;
  checkout: CheckoutClass;
  checkoutHref: string | null;
};

type RawCatalogRecord = {
  inventory_id?: unknown;
  inventory_family?: unknown;
  delivery_offer?: unknown;
  delivery_price_usd?: unknown;
  primary_use_lane?: unknown;
  public_audio_url?: unknown;
  signature_audio_logo_integral_at_end?: unknown;
  public_storage_status?: unknown;
};

type RawCatalog = {
  status?: unknown;
  inventory_count?: unknown;
  records?: unknown;
};

function cleanText(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isTrue(value: unknown) {
  return TRUE_VALUES.has(cleanText(value).toLowerCase());
}

function prettyLabel(value: unknown) {
  const text = cleanText(value, 80);
  if (!text) return "";

  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function itemLabel(inventoryId: string, index: number) {
  const match = inventoryId.match(
    /(?:ALLPOSS[-_])?(\d{1,6}).*?KK[-_](\d{1,3})$/i,
  );

  if (match) {
    return `K-KUT ${match[1].padStart(5, "0")} · ${match[2]}`;
  }

  return `K-KUT ${String(index + 1).padStart(5, "0")}`;
}

function priceNumber(value: unknown) {
  const parsed = Number.parseFloat(cleanText(value, 24).replace(/[$,]/g, ""));
  return Number.isFinite(parsed) && parsed > 0
    ? Number(parsed.toFixed(2))
    : null;
}

function checkoutClass(offer: string, priceUsd: number | null): CheckoutClass {
  const normalized = offer.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  if (normalized.includes("big_hug") || normalized.includes("bighug")) {
    return "big_hug";
  }

  if (normalized.includes("short_kut") || normalized.includes("shortkut")) {
    return "short_kut";
  }

  if (normalized.includes("hug") || priceUsd === 7.99) {
    return "hug";
  }

  if (priceUsd === 4.99) return "short_kut";
  if (priceUsd === 12.99) return "big_hug";

  return "hold";
}

function checkoutConfigured(checkout: CheckoutClass) {
  if (checkout === "hug") return true;
  if (checkout === "short_kut") {
    return Boolean(process.env.NEXT_PUBLIC_KKUT_SHORT_KUT_PAYMENT_URL);
  }
  if (checkout === "big_hug") {
    return Boolean(process.env.NEXT_PUBLIC_KKUT_BIG_HUG_PAYMENT_URL);
  }
  return false;
}

export async function GET() {
  let response: Response;

  try {
    response = await fetch(CATALOG_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "catalog_source_unreachable" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "catalog_source_failed",
        source_status: response.status,
      },
      { status: 502 },
    );
  }

  let payload: RawCatalog;
  try {
    payload = (await response.json()) as RawCatalog;
  } catch {
    return NextResponse.json(
      { ok: false, error: "catalog_source_invalid_json" },
      { status: 502 },
    );
  }

  const records = Array.isArray(payload.records)
    ? (payload.records as RawCatalogRecord[])
    : [];

  const declaredCount = Number(payload.inventory_count);
  if (
    declaredCount !== EXPECTED_INVENTORY_COUNT ||
    records.length !== EXPECTED_INVENTORY_COUNT
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "inventory_count_gate_failed",
        expected: EXPECTED_INVENTORY_COUNT,
        declared: declaredCount,
        received: records.length,
      },
      { status: 503 },
    );
  }

  let publicRecords: PublicCatalogRecord[];

  try {
    publicRecords = records.map((record, index): PublicCatalogRecord => {
      const id = cleanText(record.inventory_id, 200);
      const audioUrl = cleanText(record.public_audio_url, 900);
      const storageStatus = cleanText(record.public_storage_status, 80);
      const twinkleAtEnd = isTrue(
        record.signature_audio_logo_integral_at_end,
      );
      const offerRaw = cleanText(record.delivery_offer, 100);
      const priceUsd = priceNumber(record.delivery_price_usd);

      if (!/^[A-Za-z0-9_-]+$/.test(id)) {
        throw new Error(`unsafe_inventory_id_at_${index + 1}`);
      }

      if (!audioUrl.startsWith(AUDIO_PREFIX)) {
        throw new Error(`unsafe_audio_url_at_${index + 1}`);
      }

      if (storageStatus !== "PUBLIC_STORAGE_VERIFIED") {
        throw new Error(`storage_gate_failed_at_${index + 1}`);
      }

      if (!twinkleAtEnd) {
        throw new Error(`twinkle_gate_failed_at_${index + 1}`);
      }

      const offer = prettyLabel(offerRaw) || "K-KUT HUG";
      const checkout = checkoutClass(offerRaw || offer, priceUsd);
      const purchaseReady = checkoutConfigured(checkout);

      return {
        id,
        label: itemLabel(id, index),
        family: prettyLabel(record.inventory_family),
        lane: prettyLabel(record.primary_use_lane),
        offer,
        priceUsd,
        audioUrl,
        checkout,
        checkoutHref: purchaseReady
          ? `/checkout?ii=${encodeURIComponent(id)}&offer=${encodeURIComponent(
              checkout,
            )}`
          : null,
      };
    });
  } catch (reason) {
    return NextResponse.json(
      {
        ok: false,
        error: "public_release_gate_failed",
        reason:
          reason instanceof Error ? reason.message : "unidentified_gate_failure",
      },
      { status: 503 },
    );
  }

  const purchasableCount = publicRecords.filter(
    (record) => record.checkoutHref,
  ).length;

  return NextResponse.json(
    {
      ok: true,
      status: "BIC_PUBLIC_CATALOG_READY",
      inventoryCount: publicRecords.length,
      purchasableCount,
      generatedFrom: cleanText(payload.status, 120),
      records: publicRecords,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-KKUT-Inventory-Count": String(publicRecords.length),
      },
    },
  );
}
