import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = {"Cache-Control":"private, no-store, max-age=0","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow, noarchive"};
function authorized(request: NextRequest){const supplied=request.headers.get("x-admin-token")?.trim()||request.nextUrl.searchParams.get("token")?.trim();return trustedProtectedPreview()||validAdminToken(supplied)||validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);}
function serviceClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();const key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()||process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;}
function unavailable(status=404,detail?:string){return NextResponse.json({error:status===404?"not_found":"private_audio_unavailable",...(detail?{detail}:{})},{status,headers:PRIVATE_HEADERS});}
async function proxyAudio(request:NextRequest,url:string){const headers=new Headers();const range=request.headers.get("range");if(range)headers.set("range",range);const upstream=await fetch(url,{headers,cache:"no-store",redirect:"follow"});if(!upstream.ok&&upstream.status!==206)return unavailable(503,`upstream audio ${upstream.status}`);const responseHeaders=new Headers(PRIVATE_HEADERS);for(const name of ["content-type","content-length","content-range","accept-ranges","etag","last-modified"]){const value=upstream.headers.get(name);if(value)responseHeaders.set(name,value);}if(!responseHeaders.has("content-type"))responseHeaders.set("content-type","audio/mpeg");responseHeaders.set("accept-ranges",upstream.headers.get("accept-ranges")||"bytes");return new NextResponse(upstream.body,{status:upstream.status,headers:responseHeaders});}

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  if(!authorized(request))return unavailable();
  const supabase=serviceClient(); if(!supabase)return unavailable(503,"service client unavailable");
  const {id}=await params;
  const q=await supabase.from("gpmx_admin_in_pix_structure_tpr_v1").select("id,in_track_id,resolver_state,resolved_bucket_id,resolved_object_name,delivery_ready").eq("id",Number(id)).limit(1).maybeSingle();
  if(q.error||!q.data)return unavailable();
  if(q.data.resolver_state!=="RESOLVED_FROM_STORAGE_OBJECT_ID"||!q.data.resolved_object_name)return unavailable(503,"IN-PIX source did not resolve by storage_object_id");
  const signed=await supabase.storage.from(String(q.data.resolved_bucket_id||"tracks")).createSignedUrl(String(q.data.resolved_object_name),300);
  if(signed.error||!signed.data?.signedUrl)return unavailable(503,signed.error?.message||"signed audio unavailable");
  return proxyAudio(request,signed.data.signedUrl);
}
