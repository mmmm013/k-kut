import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from '@/lib/admin/adminSession';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
const COMIN_TRUE_OBJECT = '76.5bpm.mp3';
const COMIN_TRUE_TRACK_ID = '168275759';
function authorized(request: NextRequest) { return trustedProtectedPreview() || validAdminToken(request.headers.get('x-admin-token')) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function client() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
async function signedFrom(s: NonNullable<ReturnType<typeof client>>, bucket: string, object: string) { const result = await s.storage.from(bucket).createSignedUrl(object, 300); return result.data?.signedUrl || null; }
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: HEADERS });
  const s = client(); if (!s) return NextResponse.json({ error: 'audio_unavailable' }, { status: 503, headers: HEADERS });
  // Locked Comin' True LT-PIX authority: private tracks/76.5bpm.mp3, 5,604,104 bytes.
  let url = await signedFrom(s, 'tracks', COMIN_TRUE_OBJECT);
  if (!url) {
    const resolved = await s.from('gpmx_track_storage_audio_resolver_v1').select('resolved_bucket_id,resolved_object_name').eq('track_id', COMIN_TRUE_TRACK_ID).eq('resolver_state', 'RESOLVED_FROM_STORAGE_OBJECT_ID').maybeSingle();
    if (resolved.data?.resolved_object_name) url = await signedFrom(s, String(resolved.data.resolved_bucket_id || 'tracks'), String(resolved.data.resolved_object_name));
  }
  if (!url) return NextResponse.json({ error: 'audio_unavailable', detail: 'The verified Comin True LT-PIX object is unavailable.' }, { status: 503, headers: HEADERS });
  const range = request.headers.get('range'); const upstream = await fetch(url, { headers: range ? { range } : undefined, cache: 'no-store' });
  if (!upstream.ok && upstream.status !== 206) return NextResponse.json({ error: 'audio_unavailable' }, { status: 503, headers: HEADERS });
  const headers = new Headers(HEADERS); for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges']) { const value = upstream.headers.get(name); if (value) headers.set(name, value); }
  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
