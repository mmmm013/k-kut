import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { fourPeServiceClient } from "@/lib/fourPe/service";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) {
  const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const result = await supabase.rpc("gpm_4pe_begin_next_run", { p_trigger_kind: "MANUAL" });
  if (result.error) return NextResponse.json({ error: "next_run_failed", detail: result.error.message }, { status: 502 });
  return NextResponse.json({ ok: true, runId: result.data, empty: result.data == null });
}
