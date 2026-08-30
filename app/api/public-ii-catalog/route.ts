import { NextResponse } from "next/server";
import { loadAllApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const records = loadAllApprovedPublicOptions().map((record) => ({
    public_option_id: record.public_option_id,
    ii_id: record.kk_id_or_delivery_object_id,
    product_family: record.product_family,
    inventory_family: record.inventory_family,
    price_cents: record.price_cents,
    display_title: record.display_title,
    interpretation_summary: record.interpretation_summary,
    intent_lane: record.intent_lane,
    audio_delivery_url: record.audio_delivery_url,
    public_route: record.public_route,
    payment_allowed: record.payment_allowed,
  }));

  return NextResponse.json(
    {
      ok: true,
      status: "CONTROLLED_PURCHASE_CANARY_ACTIVE",
      message:
        "Only explicitly STAGE-authorized IIs are returned. Every other II remains held.",
      inventoryCount: records.length,
      purchasableCount: records.filter((record) => record.payment_allowed).length,
      records,
      controls: {
        unapproved_records_returned: 0,
        permanent_public_storage_urls: 0,
        checkout_authority: "server_created_stripe_checkout_session",
        fulfillment_mode: "manual_review_private_delivery",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-KKUT-Controlled-Canary": "active",
        "X-KKUT-Inventory-Count": String(records.length),
        "X-KKUT-Purchasable-Count": String(
          records.filter((record) => record.payment_allowed).length,
        ),
      },
    },
  );
}
