import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { trustedProtectedPreview, validAdminToken } from "@/lib/admin/adminSession";

export const runtime = "nodejs";

type Lane = "FULLMIX" | "INSTRO_ONLY";
type CsvRecord = Record<string, string>;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

function csv(text: string): CsvRecord[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...body] = rows;
  if (!headers?.includes("Track ID") || !headers.includes("Track name")) throw new Error("required Track ID/Track name headers are missing");
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function parseFile(file: File, text: string, lane: Lane) {
  const records = csv(text.replace(/^\uFEFF/, ""))
    .map((sourceRecord, index) => ({
      source_import_id: "",
      disco_track_id: String(sourceRecord["Track ID"] || "").trim(),
      inventory_lane: lane,
      source_ordinal: index + 1,
      track_name: String(sourceRecord["Track name"] || "").trim(),
      album: String(sourceRecord.Album || "").trim() || null,
      artist: String(sourceRecord.Artist || "").trim() || null,
      isrc: String(sourceRecord.ISRC || "").trim() || null,
      conflict_state: "CLEAR",
      source_record: sourceRecord,
    }))
    .filter((record) => record.disco_track_id && record.track_name);
  const ids = records.map((record) => record.disco_track_id);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) throw new Error(`${file.name}: duplicate Track IDs: ${duplicates.join(", ")}`);
  return records;
}

export async function POST(request: NextRequest) {
  if (!trustedProtectedPreview() && !validAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const service = client();
  if (!service) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });

  try {
    const form = await request.formData();
    const fullmixFile = form.get("fullmix");
    const instroFile = form.get("instro");
    const snapshotDate = String(form.get("snapshotDate") || "").trim();
    if (!(fullmixFile instanceof File) || !(instroFile instanceof File)) {
      return NextResponse.json({ error: "both_csv_files_required" }, { status: 400 });
    }
    if (![fullmixFile, instroFile].every((file) => file.name.toLowerCase().endsWith(".csv"))) {
      return NextResponse.json({ error: "csv_files_required" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) {
      return NextResponse.json({ error: "snapshot_date_required" }, { status: 400 });
    }

    const [fullmixText, instroText] = await Promise.all([fullmixFile.text(), instroFile.text()]);
    const fullmix = parseFile(fullmixFile, fullmixText, "FULLMIX");
    const instro = parseFile(instroFile, instroText, "INSTRO_ONLY");
    const fullmixIds = new Set(fullmix.map((record) => record.disco_track_id));
    const instroIds = new Set(instro.map((record) => record.disco_track_id));
    const crossListIds = [...fullmixIds].filter((id) => instroIds.has(id));
    const crossListSet = new Set(crossListIds);
    const instrumentalLabel = /\b(instro|instrumental|no vocals?)\b/i;
    for (const record of fullmix) {
      if (crossListSet.has(record.disco_track_id)) record.conflict_state = "QUARANTINED_CROSS_LIST";
      else if (instrumentalLabel.test(record.track_name)) record.conflict_state = "QUARANTINED_LANE_LABEL_CONFLICT";
    }
    for (const record of instro) {
      if (crossListSet.has(record.disco_track_id)) record.conflict_state = "QUARANTINED_CROSS_LIST";
    }

    const inputs = [
      { lane: "FULLMIX" as const, text: fullmixText, rows: fullmix },
      { lane: "INSTRO_ONLY" as const, text: instroText, rows: instro },
    ];
    const importIds: Record<Lane, string> = { FULLMIX: "", INSTRO_ONLY: "" };
    for (const input of inputs) {
      const hash = createHash("sha256").update(input.text.replace(/^\uFEFF/, "")).digest("hex");
      const quarantined = input.rows.filter((row) => row.conflict_state !== "CLEAR").length;
      const sourceName = `GPMx STL ${input.lane === "FULLMIX" ? "FullMix" : "INSTRO-ONLY"} ${snapshotDate}.csv`;
      const imported = await service.from("gpm_stl_playlist_imports").upsert({
        source_name: sourceName,
        source_sha256: hash,
        inventory_lane: input.lane,
        is_current: false,
        source_row_count: input.rows.length,
        totals: { rows: input.rows.length, active: input.rows.length - quarantined, quarantined },
      }, { onConflict: "source_sha256" }).select("id").single();
      if (imported.error) throw new Error(imported.error.message);
      importIds[input.lane] = imported.data.id;
      const rows = input.rows.map((row) => ({ ...row, source_import_id: imported.data.id }));
      for (let start = 0; start < rows.length; start += 100) {
        const membership = await service.from("gpm_stl_track_memberships").upsert(rows.slice(start, start + 100), { onConflict: "source_import_id,disco_track_id" });
        if (membership.error) throw new Error(membership.error.message);
      }
    }

    const deactivate = await service.from("gpm_stl_playlist_imports").update({ is_current: false }).in("inventory_lane", ["FULLMIX", "INSTRO_ONLY"]);
    if (deactivate.error) throw new Error(deactivate.error.message);
    const activate = await service.from("gpm_stl_playlist_imports").update({ is_current: true }).in("id", [importIds.FULLMIX, importIds.INSTRO_ONLY]);
    if (activate.error) throw new Error(activate.error.message);

    return NextResponse.json({
      ok: true,
      snapshotDate,
      fullmix: { total: fullmix.length, active: fullmix.filter((row) => row.conflict_state === "CLEAR").length },
      instro: { total: instro.length, active: instro.filter((row) => row.conflict_state === "CLEAR").length },
      quarantinedCrossListTrackIds: crossListIds,
      source: "GPMx split inventory",
    });
  } catch (error) {
    return NextResponse.json({ error: "split_inventory_import_failed", detail: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
