import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) { const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(supplied) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null; }

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({error:"not_found"},{status:404});
  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({error:"server_supabase_connection_not_configured"},{status:503});
  const {data,error} = await supabase.from("gpmx_admin_in_pix_structure_tpr_v1").select("*").order("queue_order",{ascending:true}).limit(500);
  if (error) return NextResponse.json({error:"in_pix_queue_read_failed",detail:error.message},{status:502});
  return NextResponse.json({queue:data||[],total:(data||[]).length});
}
