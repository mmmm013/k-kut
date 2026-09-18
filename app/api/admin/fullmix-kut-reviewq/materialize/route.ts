import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trustedProtectedPreview, validAdminToken } from '@/lib/admin/adminSession';
export const runtime = 'nodejs';
function client(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),k=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()||process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();return u&&k?createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null}
export async function POST(req:NextRequest){
  if(!trustedProtectedPreview()&&!validAdminToken(req.headers.get('x-admin-token')))return NextResponse.json({error:'not_found'},{status:404});
  const s=client();if(!s)return NextResponse.json({error:'service_client_unavailable'},{status:503});
  const result=await s.rpc('gpm_stl_materialize_active_fullmix_kuts');
  if(result.error)return NextResponse.json({error:'materialization_failed',detail:result.error.message},{status:502});
  return NextResponse.json({ok:true,...result.data});
}
