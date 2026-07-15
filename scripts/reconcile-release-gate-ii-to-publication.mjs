import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY = process.env.GPM_REGISTRY || "/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry";
const DEFAULTS = {
  manifest: path.join(REGISTRY, "RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531", "04_FINAL_GPMX_BRANDED_DELIVERY_CAPSULES_MP3_320K", "gpmx-branded-delivery-capsule-manifest.json"),
  queue: path.join(REGISTRY, "4PE_AUTOMATIC_REPROCESSING_RULE_V001_20260711-214143", "02_4PE_REPROCESSING_QUEUE_POPULATED_429.csv"),
  missing: path.join(REGISTRY, "LT_PIX_429_TO_439_RECONCILIATION_PACKET_20260710-152409", "03_TOP_10_TO_REVIEW_FOR_439_TARGET.csv"),
  out: path.join(REGISTRY, "II_2611_TO_439_MIAL_PUBLICATION_RECONCILIATION"),
  publication: path.join(ROOT, "data/publication-bridge/public-option-records.generated.json"),
};
const argv = process.argv.slice(2);
const apply = argv.includes("--apply-publication");

function stop(message) { console.error(`STOP: ${message}`); process.exit(1); }
function option(name, fallback = "") {
  const i = argv.indexOf(name);
  if (i < 0) return fallback;
  if (!argv[i + 1] || argv[i + 1].startsWith("--")) stop(`${name} requires a value`);
  return argv[i + 1];
}
function need(file, label) {
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) stop(`${label} missing: ${file || "NOT PROVIDED"}`);
}
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function norm(value) { return String(value || "").trim().toLowerCase(); }
function slug(value) { return norm(value).replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function first(row, fields) {
  for (const field of fields) { const value = String(row?.[field] ?? "").trim(); if (value) return value; }
  return "";
}
function parentOf(id) { return String(id || "").match(/^(LT-PIX-ALLPOSS-\d{5})-KK-\d+$/i)?.[1]?.toUpperCase() || ""; }

function parseCsv(text) {
  const raw = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); raw.push(row); row = []; field = ""; }
    else field += c;
  }
  if (quoted) stop("CSV ends inside a quoted field");
  if (field || row.length) { row.push(field.replace(/\r$/, "")); raw.push(row); }
  const rows = raw.filter((values) => values.some((value) => String(value).trim()));
  if (rows.length < 2) return [];
  const headers = rows[0].map((value) => String(value).trim());
  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) stop(`CSV row ${index + 2} has ${values.length} columns; expected ${headers.length}`);
    return Object.fromEntries(headers.map((header, column) => [header, String(values[column] ?? "").trim()]));
  });
}
function loadRows(file) {
  if (path.extname(file).toLowerCase() === ".csv") return parseCsv(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (Array.isArray(data)) return data;
  return data.rows || data.records || data.items || [];
}
function csvValue(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function writeCsv(file, rows, fields) {
  fs.writeFileSync(file, `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvValue(row[field])).join(","))].join("\n")}\n`);
}

const manifestFile = path.resolve(option("--manifest", process.env.GPMX_2611_MANIFEST || DEFAULTS.manifest));
const queueFile = path.resolve(option("--queue-429", process.env.GPMX_QUEUE_429 || DEFAULTS.queue));
const missingFile = path.resolve(option("--missing-10", process.env.GPMX_MISSING_10 || DEFAULTS.missing));
const mialValue = option("--mial", process.env.GPMX_MIAL_PATH || "");
const mialFile = mialValue ? path.resolve(mialValue) : "";
const out = path.resolve(option("--out", process.env.GPMX_RECONCILIATION_OUT || DEFAULTS.out));
const publicationFile = path.resolve(option("--publication", DEFAULTS.publication));

need(manifestFile, "2,611 manifest"); need(queueFile, "429-parent queue"); need(missingFile, "missing-10 file");
if (mialFile) need(mialFile, "MIAL");
if (apply && !mialFile) stop("--apply-publication requires --mial /absolute/path/to/current-MIAL.csv-or-json");
if (!fs.existsSync(path.join(ROOT, "package.json"))) stop("run from the K-KUT repository root");

const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
const iiRows = Array.isArray(manifest.rows) ? manifest.rows : [];
if (iiRows.length !== 2611) stop(`manifest has ${iiRows.length} rows; expected 2611`);

const parentFields = ["LT-PIX Parent ID", "lt_pix_parent_id", "lt_pix_id", "parent_lt_pix_id", "parent_id", "source_lt_pix_id"];
const queueRows = loadRows(queueFile);
const parentIds = queueRows.map((row) => first(row, parentFields).toUpperCase()).filter(Boolean);
const parentSet = new Set(parentIds);
if (parentIds.length !== 429 || parentSet.size !== 429) stop(`429 queue invalid: rows=${parentIds.length} unique=${parentSet.size}`);

const byParent = new Map(); const seenII = new Set(); const errors = [];
for (const row of iiRows) {
  const id = String(row.sales_inventory_id || "").trim(); const parent = parentOf(id);
  if (!id) errors.push("missing sales_inventory_id");
  if (seenII.has(id)) errors.push(`duplicate II: ${id}`); else seenII.add(id);
  if (!parent || !parentSet.has(parent)) errors.push(`${id}: parent not in governed 429 (${parent || "UNRESOLVED"})`);
  else byParent.set(parent, [...(byParent.get(parent) || []), row]);
  if (row.delivery_package_status !== "CUSTOMER_DELIVERY_AUDIO_MATERIALIZED") errors.push(`${id}: delivery package not materialized`);
  if (row.public_deploy_status !== "NOT_DEPLOYED") errors.push(`${id}: public_deploy_status=${row.public_deploy_status}`);
  if (row.locked_twinkle_location !== "END") errors.push(`${id}: canonical Twinkle not at END`);
}
if (errors.length) stop(errors.slice(0, 25).join("\n"));

const coverage = parentIds.map((parent) => {
  const rows = byParent.get(parent) || [];
  return {
    lt_pix_parent_id: parent,
    approved_ii_count: rows.length,
    first_sales_inventory_id: rows[0]?.sales_inventory_id || "",
    last_sales_inventory_id: rows.at(-1)?.sales_inventory_id || "",
    coverage_status: rows.length ? "RECONCILED_TO_MATERIALIZED_IIS" : "NO_MATERIALIZED_II_IN_2611_MANIFEST",
  };
});

const missingRows = loadRows(missingFile);
if (missingRows.length !== 10) stop(`missing-10 file has ${missingRows.length} rows; expected 10`);
const missingResolution = missingRows.map((row, index) => {
  const audio = first(row, ["audio_path", "source_audio_path", "clone_audio_path"]);
  const vocal = norm(first(row, ["gd_vocal_confirm_status", "vocal_confirm_status", "gd_endpoint_qa_status", "approval_status"]));
  const confirmed = ["approved", "pass", "gd_approved", "vocal_confirmed"].includes(vocal);
  const exists = Boolean(audio && fs.existsSync(audio));
  return {
    reconciliation_rank: index + 1,
    display_title: first(row, ["display_title", "title", "source_title"]),
    reconciliation_key: first(row, ["reconciliation_key", "norm_title_key", "title_key"]),
    audio_path: audio,
    audio_file_exists: exists ? "YES" : "NO",
    vocal_confirmation_status: vocal || "PENDING_GD_VOCAL_CONFIRM",
    resolution_status: confirmed && exists ? "RESOLVED_ACTIVE_LT_PIX_PARENT" : "BLOCKED_PENDING_GD_VOCAL_CONFIRM",
    next_action: confirmed && exists ? "ADD_TO_439_AUTHORITY_AND_RUN_4PE_KKr" : "GD_VOCAL_CONFIRM_THEN_KK_MANUFACTURE",
  };
});

const mialRows = mialFile ? loadRows(mialFile) : [];
const mialFields = ["sales_inventory_id", "final_ii_id", "ii_id", "inventory_id", "kk_id", "source_kk_id"];
const mialIndex = new Map(); const duplicateMial = new Set();
for (const row of mialRows) for (const field of mialFields) {
  const key = String(row?.[field] ?? "").trim(); if (!key) continue;
  if (mialIndex.has(key) && mialIndex.get(key) !== row) duplicateMial.add(key); else mialIndex.set(key, row);
}
const pass = (row, fields, values) => values.includes(norm(first(row, fields)));
const routeFor = (row) => {
  const direct = first(row, ["public_route", "buyer_route", "route"]); if (direct.startsWith("/")) return direct;
  const lane = norm(first(row, ["primary_use_lane", "intent_lane", "use_lane", "product_lane"]));
  if (/wedding|vow|ceremony|first dance/.test(lane)) return "/wedding";
  if (/kupid|passion|physical|intimate|desire/.test(lane)) return "/kupid";
  if (/anniversary/.test(lane)) return "/personal/anniversary";
  if (/apology|repair|sorry/.test(lane)) return "/personal/apology";
  if (/birthday/.test(lane)) return "/personal/birthday";
  if (/holiday/.test(lane)) return "/holiday";
  if (/romance|love|missing you/.test(lane)) return "/romance";
  return "/find";
};

const publication = []; const blocks = [];
for (const capsule of iiRows) {
  const id = capsule.sales_inventory_id; const parent = parentOf(id); const mial = mialIndex.get(id);
  const block = (reason) => blocks.push({ sales_inventory_id: id, lt_pix_parent_id: parent, reason });
  if (duplicateMial.has(id)) { block("AMBIGUOUS_DUPLICATE_MIAL_KEY"); continue; }
  if (!mial) { block("MIAL_ROW_NOT_FOUND"); continue; }
  if (!pass(mial, ["public_approval_status", "approval_status", "gd_approval_status", "release_gate_status", "customer_ready_status"], ["public_approved", "gd_public_approved", "gd_approved", "release_approved", "approved_for_publication", "customer_ready_approved"])) { block("GD_PUBLIC_APPROVAL_NOT_PROVEN"); continue; }
  if (!pass(mial, ["audio_proof_status", "delivery_audio_proof_status", "audio_status", "delivery_package_status"], ["pass", "approved", "audio_proven", "delivery_audio_materialized", "customer_delivery_audio_materialized"])) { block("AUDIO_PROOF_NOT_PASS"); continue; }
  if (!pass(mial, ["rights_status", "rights_approval_status", "authority_status", "source_authority_status"], ["pass", "approved", "rights_approved", "authority_proven", "ascap_then_gpmc_proven"])) { block("RIGHTS_OR_SOURCE_AUTHORITY_NOT_PROVEN"); continue; }
  if (!pass(mial, ["gd_match_status", "match_status", "route_fit_status", "meaning_match_status"], ["proven_match", "gd_approved", "approved", "pass", "route_fit_approved"])) { block("BUYER_ROUTE_MATCH_NOT_PROVEN"); continue; }
  const revoked = norm(first(mial, ["revocation_status", "release_revocation_status"]));
  if (revoked && !["active", "not_revoked", "none", "no"].includes(revoked)) { block("REVOKED"); continue; }

  const title = first(mial, ["display_title", "public_label", "ii_title", "title"]);
  const meaning = first(mial, ["interpretation_summary", "buyer_question", "match_rationale", "meaning_evidence"]);
  const stripe = first(mial, ["stripe_url_if_payment_allowed", "checkout_url", "approved_payment_url"]);
  const audio = String(capsule.delivery_audio_url || "").trim();
  if (!title || !meaning) { block("MIAL_PUBLIC_DESCRIPTION_INCOMPLETE"); continue; }
  if (!stripe.startsWith("https://buy.stripe.com/")) { block("APPROVED_STRIPE_RELATIONSHIP_NOT_PROVEN"); continue; }
  if (!audio.startsWith("/")) { block("PUBLIC_AUDIO_URL_NOT_STAGED"); continue; }
  const publicRoute = routeFor(mial);
  publication.push({
    public_option_id: `mial-${slug(publicRoute)}-${slug(id)}`,
    source_pix_id_or_track_id: parent,
    kk_id_or_delivery_object_id: id,
    display_title: title,
    interpretation_summary: meaning,
    action_object_meaning: {
      verb: first(mial, ["action_verb", "verb"]) || "send",
      object: first(mial, ["action_object", "object"]) || "feeling",
      situation: first(mial, ["buyer_label", "customer_need", "situation", "primary_use_lane", "intent_lane"]),
    },
    positive_connotations: [], negative_connotations: [], neutral_connotations: ["private", "music", "hug"],
    shared_emotion_ids: String(first(mial, ["shared_emotion_ids", "emotion", "sentiment"]) || "").split(/[|,;]/).map(slug).filter(Boolean),
    buyer_scenario_ids: String(first(mial, ["buyer_scenario_ids", "customer_need", "buyer_label"]) || "").split(/[|,;]/).map(slug).filter(Boolean),
    intent_lane: first(mial, ["intent_lane", "primary_use_lane", "use_lane", "product_lane"]) || "general",
    risk_level: first(mial, ["risk_level"]) || "standard",
    approval_status: "public_approved_from_mial",
    audio_delivery_url: audio,
    audio_proof_status: "pass",
    payment_allowed: true,
    stripe_url_if_payment_allowed: stripe,
    public_route: publicRoute,
    more_for_this_feeling_allowed: true,
    more_from_this_track_allowed: true,
    public_notes: "Generated from MIAL-approved II joined to the verified 2,611 delivery manifest; no hand-written title list.",
  });
}

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "00_INTEGRITY_SNAPSHOT.json"), `${JSON.stringify({
  created_at: new Date().toISOString(),
  mode: apply ? "APPLY_BRANCH_PUBLICATION" : "READ_ONLY_RECONCILIATION",
  production_deployment_actions: 0,
  source_files: {
    manifest: { path: manifestFile, sha256: sha(manifestFile) },
    queue_429: { path: queueFile, sha256: sha(queueFile) },
    missing_10: { path: missingFile, sha256: sha(missingFile) },
    mial: mialFile ? { path: mialFile, sha256: sha(mialFile) } : null,
  },
}, null, 2)}\n`);
writeCsv(path.join(out, "01_2611_TO_429_PARENT_COVERAGE.csv"), coverage, ["lt_pix_parent_id", "approved_ii_count", "first_sales_inventory_id", "last_sales_inventory_id", "coverage_status"]);
writeCsv(path.join(out, "02_MISSING_10_LT_PIX_RESOLUTION.csv"), missingResolution, ["reconciliation_rank", "display_title", "reconciliation_key", "audio_path", "audio_file_exists", "vocal_confirmation_status", "resolution_status", "next_action"]);
writeCsv(path.join(out, "03_PUBLICATION_BLOCKS.csv"), blocks, ["sales_inventory_id", "lt_pix_parent_id", "reason"]);
fs.writeFileSync(path.join(out, "04_PUBLICATION_BRIDGE_CANDIDATES.json"), `${JSON.stringify({ status: "GENERATED_FROM_MIAL_AND_VERIFIED_DELIVERY_MANIFEST", records: publication }, null, 2)}\n`);

const resolved10 = missingResolution.filter((row) => row.resolution_status === "RESOLVED_ACTIVE_LT_PIX_PARENT").length;
const summary = {
  manifest_rows: iiRows.length,
  unique_manifest_ids: seenII.size,
  governed_429_parents: parentIds.length,
  parents_with_materialized_iis: coverage.filter((row) => row.approved_ii_count > 0).length,
  parents_without_materialized_iis: coverage.filter((row) => row.approved_ii_count === 0).length,
  missing_10_fully_resolved: resolved10,
  missing_10_blocked_pending_vocal_confirmation: 10 - resolved10,
  mial_rows_loaded: mialRows.length,
  publication_records_approved: publication.length,
  publication_records_blocked: blocks.length,
  production_deployment_actions: 0,
};
fs.writeFileSync(path.join(out, "05_RECONCILIATION_SUMMARY.json"), `${JSON.stringify(summary, null, 2)}\n`);

if (apply) {
  if (resolved10 !== 10) stop(`missing LT-PIX reconciliation incomplete: ${resolved10}/10; publication unchanged`);
  if (!publication.length) stop("no MIAL-approved publication records; publication unchanged");
  fs.writeFileSync(publicationFile, `${JSON.stringify({
    status: "generated",
    source: "MIAL + verified 2,611 delivery manifest",
    generated_at: new Date().toISOString(),
    records: publication,
  }, null, 2)}\n`);
}

console.log("PASS: 2,611 manifest reconciled to governed 429 parents");
console.log(`PARENTS WITH IIS: ${summary.parents_with_materialized_iis}`);
console.log(`PARENTS WITHOUT IIS: ${summary.parents_without_materialized_iis}`);
console.log(`MISSING 10 FULLY RESOLVED: ${resolved10}/10`);
console.log(`MIAL PUBLICATION RECORDS: ${publication.length}`);
console.log(`PUBLICATION BLOCKS: ${blocks.length}`);
console.log(`OUTPUT: ${out}`);
console.log(`PUBLICATION FILE CHANGED: ${apply ? "YES (BRANCH ONLY)" : "NO"}`);
console.log("PRODUCTION DEPLOYMENTS: 0");
