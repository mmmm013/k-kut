import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATALOG_URL =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/catalog/public-ii-catalog.json";
const KK_AUDIO_PREFIX =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/";

const EXPECTED_KK_COUNT = 2611;
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

type PublicCatalogRecord = {
  id: string;
  label: string;
  family: "KK";
  lane: string;
  offer: "K-KUT HUG";
  priceUsd: 7.99;
  audioUrl: string;
  checkout: "kk";
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

function normalizedFamily(value: unknown) {
  return cleanText(value, 20)
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
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
    return `KK ${match[1].padStart(5, "0")} · ${match[2]}`;
  }

  return `KK ${String(index + 1).padStart(5, "0")}`;
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

  const seenIds = new Set<string>();
  const publicRecords: PublicCatalogRecord[] = [];

  try {
    records.forEach((record, sourceIndex) => {
      if (normalizedFamily(record.inventory_family) !== "KK") {
        return;
      }

      const id = cleanText(record.inventory_id, 200);
      const audioUrl = cleanText(record.public_audio_url, 900);
      const storageStatus = cleanText(record.public_storage_status, 80);
      const twinkleAtEnd = isTrue(
        record.signature_audio_logo_integral_at_end,
      );

      if (!/^[A-Za-z0-9_-]+$/.test(id)) {
        throw new Error(`unsafe_kk_inventory_id_at_${sourceIndex + 1}`);
      }

      if (seenIds.has(id)) {
        throw new Error(`duplicate_kk_inventory_id_at_${sourceIndex + 1}`);
      }

      if (!audioUrl.startsWith(KK_AUDIO_PREFIX)) {
        throw new Error(`unsafe_kk_audio_url_at_${sourceIndex + 1}`);
      }

      if (storageStatus !== "PUBLIC_STORAGE_VERIFIED") {
        throw new Error(`kk_storage_gate_failed_at_${sourceIndex + 1}`);
      }

      if (!twinkleAtEnd) {
        throw new Error(`kk_twinkle_gate_failed_at_${sourceIndex + 1}`);
      }

      seenIds.add(id);

      publicRecords.push({
        id,
        label: itemLabel(id, publicRecords.length),
        family: "KK",
        lane: prettyLabel(record.primary_use_lane),
        offer: "K-KUT HUG",
        priceUsd: 7.99,
        audioUrl,
        checkout: "kk",
        checkoutHref: `/checkout?ii=${encodeURIComponent(id)}&offer=kk`,
        personalNoteWordLimit: PERSONAL_NOTE_WORD_LIMIT,
      });
    });
  } catch (reason) {
    return NextResponse.json(
      {
        ok: false,
        error: "public_kk_release_gate_failed",
        reason:
          reason instanceof Error
            ? reason.message
            : "unidentified_gate_failure",
      },
      { status: 503 },
    );
  }

  if (
    seenIds.size !== EXPECTED_KK_COUNT ||
    publicRecords.length !== EXPECTED_KK_COUNT
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "kk_inventory_count_gate_failed",
        expectedKK: EXPECTED_KK_COUNT,
        receivedKK: seenIds.size,
      },
      { status: 503 },
    );
  }

  const declaredCount = Number(payload.inventory_count);

  return NextResponse.json(
    {
      ok: true,
      status: "BIC_PUBLIC_KK_CATALOG_READY_2611_HUGS",
      sourceDeclaredCount: Number.isFinite(declaredCount)
        ? declaredCount
        : null,
      sourceRecordCount: records.length,
      inventoryCount: publicRecords.length,
      purchasableCount: publicRecords.length,
      kkCount: publicRecords.length,
      heldPublicSkAssumption: true,
      productMapping: {
        personalNoteWordLimit: PERSONAL_NOTE_WORD_LIMIT,
        products: [
          {
            inventoryFamily: "KK",
            publicProduct: "K-KUT HUG",
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
        "X-KKUT-Inventory-Count": String(publicRecords.length),
        "X-KKUT-Purchasable-Count": String(publicRecords.length),
        "X-KKUT-KK-Count": String(publicRecords.length),
      },
    },
  );
}
