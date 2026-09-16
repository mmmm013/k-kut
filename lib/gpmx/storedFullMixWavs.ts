import type { SupabaseClient } from "@supabase/supabase-js";

// DISCO IDs belong to the FM registry's stl_track_id column, not tracks.id.
// Only follow recorded storage references; never derive a path from a title.
export async function storedFullMixWavs(service: SupabaseClient, ids: string[]) {
  const sources = new Map<string, { bucket: string; path: string }>();
  if (!ids.length) return sources;
  const rows = await service.from("gpmc_4pe_fm_registry_ee")
    .select("stl_track_id,wav_bucket,wav_object_path")
    .in("stl_track_id", ids).eq("fm_state", "ACTIVE").eq("source_lane", "FULLMIX")
    .not("wav_bucket", "is", null).not("wav_object_path", "is", null);
  if (rows.error) throw new Error("Stored FullMix references could not be read");
  const grouped = new Map<string, NonNullable<typeof rows.data>>();
  for (const row of rows.data || []) {
    const id = String(row.stl_track_id);
    grouped.set(id, [...(grouped.get(id) || []), row]);
  }
  await Promise.all([...grouped].map(async ([id, matches]) => {
    if (matches.length !== 1) return; // Conflicting identity is not auto-resolved.
    const row = matches[0];
    const bucket = String(row.wav_bucket), path = String(row.wav_object_path);
    if (!path.toLowerCase().endsWith(".wav")) return;
    const info = await service.storage.from(bucket).info(path);
    if (info.error || !info.data || !(Number(info.data.size) > 0)) return;
    sources.set(id, { bucket, path });
  }));
  return sources;
}
