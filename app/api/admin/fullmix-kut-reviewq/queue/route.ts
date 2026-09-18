import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trustedProtectedPreview, validAdminToken } from '@/lib/admin/adminSession';
export const runtime = 'nodejs';
function client(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),k=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()||process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();return u&&k?createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null}
export async function GET(req:NextRequest){
  if(!trustedProtectedPreview()&&!validAdminToken(req.headers.get('x-admin-token')))return NextResponse.json({error:'not_found'},{status:404});
  const s=client();if(!s)return NextResponse.json({error:'service_client_unavailable'},{status:503});
  const active=await s.from('gpm_stl_fullmix_imports').select('id,source_name,totals').eq('active',true).maybeSingle();
  if(active.error)return NextResponse.json({error:'active_inventory_read_failed',detail:active.error.message},{status:502});
  if(!active.data)return NextResponse.json({items:[],total:0,source:null});
  const result=await s.from('gpm_fullmix_kut_reviewq').select('disco_track_id,source_row_number,candidate_kind,review_state,source_row').eq('fullmix_import_id',active.data.id).order('source_row_number').limit(500);
  if(result.error)return NextResponse.json({error:'reviewq_read_failed',detail:result.error.message},{status:502});
  const items=(result.data||[]).map(({source_row,...item})=>({...item,title:source_row['Track name']||'',artist:source_row.Artist||'',format:source_row['Original format']||''}));
  return NextResponse.json({source:active.data.source_name,totals:active.data.totals,items,total:items.length});
}
