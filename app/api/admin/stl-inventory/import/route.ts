import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { trustedProtectedPreview, validAdminToken } from "@/lib/admin/adminSession";

export const runtime = "nodejs";

type Lane = "FULLMIX" | "INSTRO_ONLY";
type CsvRecord = Record<string, string>;
type ImportRow = {
  source_import_id: string;
  disco_track_id: string;
  inventory_lane: Lane;
  source_ordinal: number;
  track_name: string;
  album: string | null;
  artist: string | null;
  isrc: string | null;
  wav_url: string | null;
  wav_url_state: "MISSING" | "PRESENT_UNVERIFIED";
  staging_state: "ACTIVE" | "DUP";
  dup_reasons: string[];
  conflict_state: "CLEAR" | "QUARANTINED_CROSS_LIST" | "QUARANTINED_LANE_LABEL_CONFLICT";
  source_record: CsvRecord;
};

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
  for (const required of ["Track ID", "Track name"]) {
    if (!headers?.includes(required)) throw new Error(`required ${required} header is missing`);
  }
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function parseFile(file: File, text: string, lane: Lane): ImportRow[] {
  const records = csv(text.replace(/^\uFEFF/, ""))
    .map((sourceRecord, index): ImportRow => ({
      source_import_id: "",
      disco_track_id: String(sourceRecord["Track ID"] || "").trim(),
      inventory_lane: lane,
      source_ordinal: index + 1,
      track_name: String(sourceRecord["Track name"] || "").trim(),
      album: String(sourceRecord.Album || "").trim() || null,
      artist: String(sourceRecord.Artist || "").trim() || null,
      isrc: String(sourceRecord.ISRC || "").trim() || null,
      wav_url: String(sourceRecord["WAV URL"] || "").trim() || null,
      wav_url_state: String(sourceRecord["WAV URL"] || "").trim() ? "PRESENT_UNVERIFIED" : "MISSING",
      staging_state: "ACTIVE",
      dup_reasons: [],
      conflict_state: "CLEAR",
      source_record: sourceRecord,
    }))
    .filter((record) => record.disco_track_id && record.track_name);

  const duplicateIds = [...new Set(records.map((record) => record.disco_track_id).filter((id, index, ids) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) throw new Error(`${file.name}: duplicate Track IDs inside one source file: ${duplicateIds.join(", ")}`);

  return records;
}

function stageKnownIssues(fullmix: ImportRow[], instro: ImportRow[]) {
  const all = [...fullmix, ...instro];
  const groups = new Map<string, ImportRow[]>();
  for (const row of all) {
    const group = groups.get(row.disco_track_id) || [];
    group.push(row);
    groups.set(row.disco_track_id, group);
  }

  const instrumentalLabel = /\b(instro|instrumental|no vocals?)\b/i;
  for (const row of fullmix) {
    if (!instrumentalLabel.test(row.track_name)) continue;
    row.staging_state = "DUP";
    row.dup_reasons = ["WRONG_LANE_INSTRO_LABEL"];
    row.conflict_state = "QUARANTINED_LANE_LABEL_CONFLICT";
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const instrumentalNamed = group.some((row) => instrumentalLabel.test(row.track_name));
    const canonical = group.find((row) =>
      instrumentalNamed ? row.inventory_lane === "INSTRO_ONLY" : row.inventory_lane === "FULLMIX"
    ) || group[0];

    for (const row of group) {
      if (row === canonical) continue;
      row.staging_state = "DUP";
      row.dup_reasons = [...new Set([...row.dup_reasons, "DUP_TRACK_ID_REDUNDANT"])];
      row.conflict_state = "QUARANTINED_CROSS_LIST";
    }
  }
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
    stageKnownIssues(fullmix, instro);

    const inputs = [
      { lane: "FULLMIX" as const, text: fullmixText, rows: fullmix },
      { lane: "INSTRO_ONLY" as const, text: instroText, rows: instro },
    ];
    const importIds: Record<Lane, string> = { FULLMIX: "", INSTRO_ONLY: "" };
    for (const input of inputs) {
      const hash = createHash("sha256").update(input.text.replace(/^\uFEFF/, "")).digest("hex");
      const dupStaged = input.rows.filter((row) => row.staging_state === "DUP").length;
      const sourceName = `GPMx STL ${input.lane === "FULLMIX" ? "FullMix" : "INSTRO-ONLY"} ${snapshotDate}.csv`;
      const imported = await service.from("gpm_stl_playlist_imports").upsert({
        source_name: sourceName,
        source_sha256: hash,
        inventory_lane: input.lane,
        is_current: false,
        source_row_count: input.rows.length,
        totals: {
          rows: input.rows.length,
          active_inventory: input.rows.length - dupStaged,
          dup_staged: dupStaged,
          wav_present: input.rows.filter((row) => row.wav_url_state === "PRESENT_UNVERIFIED").length,
          wav_missing: input.rows.filter((row) => row.wav_url_state === "MISSING").length,
          kkr_ready: 0,
        },
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

    const registryRows = inputs.flatMap((input) =>
      input.lane !== "FULLMIX"
        ? []
        : input.rows
            .filter((row) => row.staging_state === "ACTIVE")
            .map((row) => ({
              disco_track_id: row.disco_track_id,
              track_name: row.track_name,
              album: row.album,
              artist: row.artist,
              isrc: row.isrc,
              classification: "VOCAL_LT_PIX_CANDIDATE" as const,
              source_import_id: importIds.FULLMIX,
              last_seen_at: new Date().toISOString(),
            }))
    );
    for (let start = 0; start < registryRows.length; start += 100) {
      const registry = await service
        .from("gpm_stl_track_registry")
        .upsert(registryRows.slice(start, start + 100), { onConflict: "disco_track_id" });
      if (registry.error) throw new Error(registry.error.message);
    }

    return NextResponse.json({
      ok: true,
      snapshotDate,
      fullmix: {
        total: fullmix.length,
        activeInventory: fullmix.filter((row) => row.staging_state === "ACTIVE").length,
        dupStaged: fullmix.filter((row) => row.staging_state === "DUP").length,
      },
      instro: {
        total: instro.length,
        activeInventory: instro.filter((row) => row.staging_state === "ACTIVE").length,
        dupStaged: instro.filter((row) => row.staging_state === "DUP").length,
      },
      wavUrlsPresent: [...fullmix, ...instro].filter((row) => row.wav_url_state === "PRESENT_UNVERIFIED").length,
      wavUrlsMissing: [...fullmix, ...instro].filter((row) => row.wav_url_state === "MISSING").length,
      kkrReady: 0,
      note: "FullMix inventory continues when WAV URLs are missing. Only verified FullMix LT-PIX can enter KKr. INSTRO-ONLY inventory never feeds KUT production.",
      source: "GPMx split inventory",
    });
  } catch (error) {
    return NextResponse.json({ error: "split_inventory_import_failed", detail: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
