const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function readEnv(path) {
  const raw = fs.readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf("=");
    if (i < 0) continue;
    const k = s.slice(0, i).trim().replace(/^export\s+/, "");
    let v = s.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const env = readEnv(".env.local");

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL_PRESENT:", Boolean(url));
console.log("KEY_PRESENT:", Boolean(key));
console.log("URL_HOST:", url ? new URL(url).host : "MISSING");

if (!url || !key) process.exit(1);
if (url.includes("placeholder") || key.includes("placeholder")) {
  console.error("FAIL: placeholder present");
  process.exit(1);
}

const supabase = createClient(url, key);

function audioFields(row) {
  const hits = [];
  function walk(v, p = "") {
    if (!v || typeof v !== "object") return;
    for (const [k, val] of Object.entries(v)) {
      const path = p ? `${p}.${k}` : k;
      if (typeof val === "string") {
        const s = val.toLowerCase();
        const pk = path.toLowerCase();
        if (
          s.includes(".mp3") ||
          s.includes(".wav") ||
          s.includes(".m4a") ||
          s.includes(".aiff") ||
          s.includes(".aif") ||
          pk.includes("audio") ||
          pk.includes("url") ||
          pk.includes("path") ||
          pk.includes("file") ||
          pk.includes("storage")
        ) hits.push({ field: path, value: val });
      } else {
        walk(val, path);
      }
    }
  }
  walk(row);
  return hits;
}

(async () => {
  const { count, error: countError } = await supabase
    .from("tracks")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("TRACK COUNT ERROR:", countError);
    process.exit(1);
  }

  console.log("TRACKS_COUNT:", count);

  const pageSize = 1000;
  let all = [];

  for (let from = 0; from < Math.max(count || 0, pageSize); from += pageSize) {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("TRACK PAGE ERROR:", error);
      process.exit(1);
    }

    all = all.concat(data || []);
    if (!data || data.length < pageSize) break;
  }

  console.log("TRACKS_FETCHED:", all.length);

  const matches = all.filter(row => {
    const t = JSON.stringify(row).toLowerCase();
    return (
      t.includes("that empty chair") ||
      t.includes("the empty chair") ||
      t.includes("empty chair") ||
      t.includes("lloyd miller") ||
      t.includes("lloyd g miller")
    );
  });

  fs.writeFileSync(
    "data/fathers-day/source-pointers/that-empty-chair-tracks-direct-env.json",
    JSON.stringify(matches, null, 2)
  );

  console.log("EMPTY_CHAIR_OR_LLOYD_MATCHES:", matches.length);

  for (let i = 0; i < matches.length; i++) {
    console.log(`\n===== MATCH ${i + 1} =====`);
    console.log(JSON.stringify(matches[i], null, 2));
    console.log("AUDIO_FIELDS:");
    console.log(JSON.stringify(audioFields(matches[i]), null, 2));
  }
})();
