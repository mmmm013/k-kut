import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const weekend = JSON.parse(fs.readFileSync(path.join(root, "data/free-canary/weekend-free-v1.json"), "utf8"));
const memorial = JSON.parse(fs.readFileSync(path.join(root, "data/themes/memorial-day-top50-v1.json"), "utf8"));

if (weekend.public_name !== "Weekend Free") throw new Error("Weekend Free public name missing");
if (weekend.access_window_hours !== 48) throw new Error("Weekend Free must preserve approved 48-hour window");
if (weekend.payments_enabled !== false || weekend.downloads_enabled !== false) throw new Error("Weekend Free must keep payments and downloads off");
if (weekend.replay_window_days !== 14) throw new Error("Weekend Free must preserve 14-day replay");
if (weekend.audio_sequence?.at(-1) !== "TWINKLE_LAST") throw new Error("TWINKLE must remain last");
if (weekend.activation_gate !== "only_STAGED_first_production_canary_IIs") throw new Error("Weekend Free must use proven canary IIs only");

if (memorial.event_container?.type !== "holiday_theme_event_container") throw new Error("Memorial Day must remain a theme/event container");
if (memorial.event_container?.track_title_mutation !== false) throw new Error("Memorial Day may not mutate track titles");
if (memorial.count !== 50 || memorial.seeds?.length !== 50) throw new Error("Memorial Day inventory must contain exactly 50 seeds");
if (new Set(memorial.seeds.map(s => s.seed_id)).size !== 50) throw new Error("Memorial Day seed IDs must be unique");
if (memorial.seeds.some(s => s.status !== "ACTIVE_RANKING_SEED")) throw new Error("All Memorial Day seeds must be active ranking seeds");

console.log("WEEKEND FREE + MEMORIAL DAY TOP 50 PASS: 48-hour free canary preserved; 50 original ranking seeds; zero track-title mutation");
