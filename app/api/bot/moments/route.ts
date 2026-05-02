import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  return NextResponse.json({
    query: q,
    source: "emergency_static_safe_route",
    status: "inventory_pending",
    count: 0,
    moments: [],
    error: "K-KUT moment inventory is being prepared. Please use the HUG order button.",
  });
}
