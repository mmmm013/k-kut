import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { trustedProtectedPreview, validAdminToken } from "@/lib/admin/adminSession";
import { loadGpmxWavSources } from "@/lib/gpmx/stlWavResolver";
import { buildFullMixListeningInventory } from "@/lib/gpmx/fullmixListeningInventory";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export async function GET(request: NextRequest) {
  if (!trustedProtectedPreview() && !validAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const service = client();
  if (!service) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });

  const rows = await service
    .from("gpm_stl_current_split_inventory_v2")
    .select("disco_track_id,track_name,album,artist,isrc,wav_url_state")
    .eq("inventory_lane", "FULLMIX")
    .order("track_name")
    .limit(500);

  if (rows.error) {
    return NextResponse.json({ error: "inventory_read_failed", detail: rows.error.message }, { status: 502 });
  }

  let wavSources = new Map<string, unknown>();
  let resolutionError: string | null = null;
  try {
    wavSources = await loadGpmxWavSources();
  } catch (error) {
    resolutionError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(
    buildFullMixListeningInventory(rows.data || [], wavSources, resolutionError),
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } },
  );
}
