import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const source = "incoming/wedding-forever-and-a-day/Forever & A Day.mp3";
const outDir = "incoming/wedding-forever-and-a-day/kuts-featured";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!fs.existsSync(source)) {
  console.error(`Missing source file: ${source}`);
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cuts = [
  {
    id: "forever-and-a-day-v2-ch2-best-kombo",
    title: "FEATURED: V2 + Ch2 — Best KK-Kombo",
    startSec: 102,
    endSec: 206,
    objectName: "wedding/forever-and-a-day-v2-ch2-best-kombo.mp3",
  },
  {
    id: "forever-and-a-day-v2-end",
    title: "NEXT FEATURED: V2-End",
    startSec: 102,
    endSec: 324.3,
    objectName: "wedding/forever-and-a-day-v2-end.mp3",
  },
];

for (const cut of cuts) {
  const out = path.join(outDir, `${cut.id}.mp3`);
  const duration = cut.endSec - cut.startSec;

  console.log(`CUT ${cut.title}: ${cut.startSec}s -> ${cut.endSec}s`);

  const result = spawnSync("ffmpeg", [
    "-y",
    "-ss", String(cut.startSec),
    "-t", String(duration),
    "-i", source,
    "-vn",
    "-af", "afade=t=in:st=0:d=0.3,afade=t=out:st=" + Math.max(0, duration - 2.5) + ":d=2.5",
    "-metadata", `title=${cut.title}`,
    "-metadata", "artist=KLEIGH",
    "-metadata", "album=Forever & A Day Wedding KK-Kombos",
    "-metadata", "comment=Wedding featured KK review audio. Checkout locked until final approval.",
    "-codec:a", "libmp3lame",
    "-b:a", "192k",
    out,
  ], { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(`ffmpeg failed for ${cut.id}`);
    process.exit(result.status ?? 1);
  }

  const file = fs.readFileSync(out);

  const { error } = await supabase.storage
    .from("kuts")
    .upload(cut.objectName, file, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) {
    console.error(`Upload failed for ${cut.objectName}:`, error.message);
    process.exit(1);
  }

  const { data: pub } = supabase.storage.from("kuts").getPublicUrl(cut.objectName);

  console.log(`${cut.title}`);
  console.log(pub.publicUrl);
}

console.log("Done: featured Wedding KK audio materialized and uploaded.");
