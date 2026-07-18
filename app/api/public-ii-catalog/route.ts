import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATALOG_URL =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/catalog/public-ii-catalog.json";

const AUDIO_PREFIX_BY_FAMILY = {
  KK: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/",
  SK: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v005-sk/",
} as const;

const EXPECTED_STORAGE_INVENTORY_COUNT = 3867;
const EXPECTED_KK_COUNT = 2611;
const EXPECTED_SK_COUNT = 1256;
const PERSONAL_NOTE_WORD_LIMIT = 13;

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

type InventoryFamily = "KK" | "SK";

type PublicCatalogRecord = {
  id: string;
  label: string;
  family: InventoryFamily;
  lane: string;
  offer: "sK HUG" | "KK HUG";
  priceUsd: number;
  audioUrl: string;
  checkout: "sk" | "kk";
  checkoutHref: string;
  personalNoteWordLimit: typeof PERSONAL_NOTE_WORD_LIMIT;
};

type RawCatalogRecord = {
  inventory_id?: unknown;
  inventory_family?: unknown;
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
    .replace(/\w/g, (letter) => letter.toUpperCase());
}

function inventoryFamily(value: unknown): InventoryFamily | "" {
  const normalized = cleanText(value, 20)
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();

  if (normalized === "KK") return "KK";
  if (normalized === "SK") return "SK";
  return "";
}

function itemLabel(inventoryId: string, family: InventoryFamily, index: number) {
  const match = inventoryId.match(
    /(?:ALLPOSS[-_])?(\d{1,6}).*?(?:SK|KK)[-_](\d{1,3})$/i,
  );

  if (match) {
    return `${family} ${match[1].padStart(5, "0")} · ${match[2]}`;
  }

  return `${family} ${String(index + 1).padStart(5, "0")}`;
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
    declaredCount !== EXPECTED_STORAGE_INVENTORY_COUNT ||
    records.length !== EXPECTED_STORAGE_INVENTORY_COUNT
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "storage_inventory_count_gate_failed",
        expected: EXPECTED_STORAGE_INVENTORY_COUNT,
        declared: declaredCount,
        received: records.length,
      },
      { status: 503 },
    );
  }

  const seenIds = new Set<string>();
  const publicRecords: PublicCatalogRecord[] = [];

  let kkCount = 0;
  let skCount = 0;

  try {
    records.forEach((record, index) => {
      const id = cleanText(record.inventory_id, 200);
      const family = inventoryFamily(record.inventory_family);
      const audioUrl = cleanText(record.public_audio_url, 900);
      const storageStatus = cleanText(record.public_storage_status, 80);
      const twinkleAtEnd = isTrue(
        record.signature_audio_logo_integral_at_end,
      );

      if (!/^[A-Za-z0-9_-]+$/.test(id)) {
        throw new Error(`unsafe_inventory_id_at_${index + 1}`);
      }

      if (seenIds.has(id)) {
        throw new Error(`duplicate_inventory_id_at_${index + 1}`);
      }

      if (!family) {
        throw new Error(`unsupported_inventory_family_at_${index + 1}`);
      }

      if (!audioUrl.startsWith(AUDIO_PREFIX_BY_FAMILY[family])) {
        throw new Error(`unsafe_audio_url_at_${index + 1}`);
      }

      if (storageStatus !== "PUBLIC_STORAGE_VERIFIED") {
        throw new Error(`storage_gate_failed_at_${index + 1}`);
      }

      if (!twinkleAtEnd) {
        throw new Error(`twinkle_gate_failed_at_${index + 1}`);
      }

      seenIds.add(id);

      if (family === "SK") skCount += 1;
      if (family === "KK") kkCount += 1;

      const checkout = family === "SK" ? "sk" : "kk";
      const offer = family === "SK" ? "sK HUG" : "KK HUG";
      const priceUsd = family === "SK" ? 4.99 : 7.99;

      publicRecords.push({
        id,
        label: itemLabel(id, family, publicRecords.length),
        family,
        lane: prettyLabel(record.primary_use_lane),
        offer,
        priceUsd,
        audioUrl,
        checkout,
        checkoutHref: `/checkout?ii=${encodeURIComponent(id)}&offer=${checkout}`,
        personalNoteWordLimit: PERSONAL_NOTE_WORD_LIMIT,
      });
    });
  } catch (reason) {
    return NextResponse.json(
      {
        ok: false,
        error: "public_release_gate_failed",
        reason:
          reason instanceof Error
            ? reason.message
            : "unidentified_gate_failure",
      },
      { status: 503 },
    );
  }

  if (
    seenIds.size !== EXPECTED_STORAGE_INVENTORY_COUNT ||
    kkCount !== EXPECTED_KK_COUNT ||
    skCount !== EXPECTED_SK_COUNT ||
    publicRecords.length !== EXPECTED_STORAGE_INVENTORY_COUNT
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "inventory_family_count_gate_failed",
        expectedStorage: EXPECTED_STORAGE_INVENTORY_COUNT,
        receivedStorage: seenIds.size,
        expectedKK: EXPECTED_KK_COUNT,
        receivedKK: kkCount,
        expectedSK: EXPECTED_SK_COUNT,
        receivedSK: skCount,
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: "BIC_PUBLIC_CATALOG_READY_3867_HUGS",
      storageInventoryCount: seenIds.size,
      inventoryCount: publicRecords.length,
      purchasableCount: publicRecords.length,
      kkCount,
      skCount,
      productMapping: {
        personalNoteWordLimit: PERSONAL_NOTE_WORD_LIMIT,
        products: [
          {
            inventoryFamily: "SK",
            publicProduct: "sK HUG",
            priceUsd: 4.99,
            checkoutOffer: "sk",
          },
          {
            inventoryFamily: "KK",
            publicProduct: "KK HUG",
            priceUsd: 7.99,
            checkoutOffer: "kk",
          },
        ],
      },
      generatedFrom: cleanText(payload.status, 120),
      records: publicRecords,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-KKUT-Storage-Inventory-Count": String(seenIds.size),
        "X-KKUT-Inventory-Count": String(publicRecords.length),
        "X-KKUT-Purchasable-Count": String(publicRecords.length),
        "X-KKUT-KK-Count": String(kkCount),
        "X-KKUT-SK-Count": String(skCount),
      },
    },
  );
}
