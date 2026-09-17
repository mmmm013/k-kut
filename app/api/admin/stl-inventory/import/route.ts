import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { trustedProtectedPreview, validAdminToken } from "@/lib/admin/adminSession";
import { fullmixSummary, parseCsv } from "@/lib/inventory/stlFullmixCsv";
export const runtime = "nodejs";
function client(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),k=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()||process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();return u&&k?createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null}
export async function POST(req:NextRequest){
  if(!trustedProtectedPreview()&&!validAdminToken(req.headers.get('x-admin-token')))return NextResponse.json({error:'not_found'},{status:404});
  const form=await req.formData();const file=form.get('file');
  if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.csv'))return NextResponse.json({error:'csv_file_required'},{status:400});
  const text=(await file.text()).replace(/^\uFEFF/,''); const rows=parseCsv(text);
  if(!rows.length)return NextResponse.json({error:'csv_has_no_rows'},{status:400});
  const s=client();if(!s)return NextResponse.json({error:'service_client_unavailable'},{status:503});
  const source_sha256=createHash('sha256').update(text).digest('hex'); const totals=fullmixSummary(rows);
  const persisted=await s.rpc('gpm_stl_activate_fullmix_import',{p_source_name:file.name,p_source_sha256:source_sha256,p_totals:totals,p_rows:rows});
  if(persisted.error)return NextResponse.json({error:'fullmix_import_failed',detail:persisted.error.message},{status:502});
  return NextResponse.json({ok:true,source:file.name,...(persisted.data||{}),totals});
}
