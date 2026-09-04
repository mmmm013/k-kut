import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
const VALID = new Set(["PENDING_HUMAN_TPR","STRUCTURE_IDENTIFIED","HOLD"]);
function authorized(request: NextRequest){const supplied=request.headers.get("x-admin-token")?.trim()||request.nextUrl.searchParams.get("token")?.trim();return trustedProtectedPreview()||validAdminToken(supplied)||validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);}
function serviceClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();const key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()||process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;}

export async function POST(request:NextRequest){
  if(!authorized(request))return NextResponse.json({error:"not_found"},{status:404});
  const body=await request.json().catch(()=>null) as {id?:number;reviewState?:string;structureNotes?:string}|null;
  if(!body?.id||!body.reviewState||!VALID.has(body.reviewState))return NextResponse.json({error:"invalid_request"},{status:400});
  const supabase=serviceClient(); if(!supabase)return NextResponse.json({error:"server_supabase_connection_not_configured"},{status:503});
  const {error}=await supabase.schema("gpmx_backend").from("in_pix_structure_tpr_ee").update({review_state:body.reviewState,structure_notes:body.structureNotes||null,updated_at:new Date().toISOString()}).eq("id",body.id);
  if(error)return NextResponse.json({error:"in_pix_decision_persist_failed",detail:error.message},{status:502});
  return NextResponse.json({ok:true,id:body.id,reviewState:body.reviewState});
}
