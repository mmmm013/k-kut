import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOLD_STATUS = "STRICT_MUSIC_EMERGENCY_HOLD";
const CANARY_BRANCH = "canary/thank-you-ch1-medium75";
const isThankYouCanary =
  process.env.VERCEL_ENV === "preview" &&
  process.env.VERCEL_GIT_COMMIT_REF === CANARY_BRANCH;

export async function GET() {
  if (isThankYouCanary) {
    return NextResponse.json(
      {
        ok: true,
        status: "THANK_YOU_CH1_PREVIEW_CANARY",
        inventoryCount: 1,
        purchasableCount: 0,
        records: [
          {
            id: "thank-you-sec-ch1",
            label: "Thank You · Chorus 1",
            family: "KK",
            lane: "Gratitude",
            offer: "KK HUG",
            priceUsd: 7.99,
            audioUrl: "/kkr/ii-review/thank-you/thank-you-sec-ch1-ii-pad1s-twinkle.mp3",
            checkout: "kk",
            checkoutHref: "",
            personalNoteWordLimit: 13,
          },
        ],
        canary: {
          scope: "preview_playback_only",
          audioLogoColumn: "MEDIUM",
          audioLogoGain: 0.75,
          checkoutEnabled: false,
          productionEligible: false,
          productionBlocker: "numeric_LT_PIX_parent_ID_pending",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-KKUT-Canary": "thank-you-sec-ch1-medium75",
          "X-KKUT-Inventory-Count": "1",
          "X-KKUT-Purchasable-Count": "0",
        },
      },
    );
  }

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
