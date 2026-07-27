import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOLD_STATUS = "STRICT_MUSIC_EMERGENCY_HOLD";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      status: HOLD_STATUS,
      error: "strict_music_proof_required",
      message:
        "Public playback and purchase are disabled until every II has explicit authorized-music proof and all MC-BOT/no-music records are isolated.",
      inventoryCount: 0,
      purchasableCount: 0,
      records: [],
      absoluteRequirements: {
        every_II_contains_authorized_music: true,
        known_MC_BOT_or_no_music_rows_allowed: 0,
        unproven_music_rows_allowed: 0,
        strict_music_proof_required_per_row: true,
        customer_audio_canary_required: true,
      },
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-KKUT-Strict-Music-Hold": "active",
        "X-KKUT-Inventory-Count": "0",
        "X-KKUT-Purchasable-Count": "0",
      },
    },
  );
}
