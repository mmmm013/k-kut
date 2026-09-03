import { NextRequest, NextResponse } from "next/server";
import { paymentRolloutStatus } from "@/lib/paymentRolloutStatus";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied =
    request.headers.get("x-admin-token")?.trim() ||
    request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const status = paymentRolloutStatus();
  return NextResponse.json({
    mode: "operator_rollout_status",
    payment_links_enabled: status.enabled,
    current_rollout_day: status.currentRolloutDay,
    elapsed_days: status.elapsedDays,
    rollout_start_date: status.rolloutStartDate,
    force_disabled: status.forceDisabled,
    reason: status.reason || "enabled",
    checked_at_utc: new Date().toISOString(),
  });
}
