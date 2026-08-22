import crypto from "node:crypto";
import fs from "node:fs";

const stop = (message) => { throw new Error(message); };
const sha256 = (path) => crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");

const policy = JSON.parse(fs.readFileSync("data/audio-law/twinkle-volume-policy.json", "utf8"));
const packet = JSON.parse(fs.readFileSync("data/kkr/canary/thank-you-ch1-medium75-release-packet.json", "utf8"));
const route = fs.readFileSync("app/api/public-ii-catalog/route.ts", "utf8");
const audioPath = "public" + packet.customer_audio_url;

if (policy.default_delivery_gain !== 0.75) stop("MEDIUM Audio Logo gain must equal 0.75");
if (policy.default_delivery_gain_label !== "75% · MEDIUM") stop("MEDIUM Audio Logo label missing");
if (packet.release_scope !== "PREVIEW_PLAYBACK_ONLY") stop("canary scope escaped Preview");
if (packet.production_eligible !== false) stop("canary became production eligible");
if (packet.checkout_enabled !== false) stop("canary checkout opened");
if (packet.pricing?.HUG_KK_USD !== 9.99) stop("HUG price must equal $9.99");
if (packet.lt_pix_ssot_parent_id !== null) stop("unproven LT-PIX ID was invented");
if (packet.human_customer_audio_qa !== "CANARY_LISTENING_REQUIRED") stop("human listening gate weakened");
if (!fs.existsSync(audioPath)) stop("canary audio missing");
if (sha256(audioPath) !== packet.customer_audio_sha256) stop("canary audio SHA mismatch");
if (!route.includes('process.env.VERCEL_ENV === "preview"')) stop("Preview environment gate missing");
if (!route.includes('process.env.VERCEL_GIT_COMMIT_REF === CANARY_BRANCH')) stop("exact branch gate missing");
if (!route.includes('checkoutHref: ""')) stop("checkout must remain disabled");
if (!route.includes("priceUsd: 9.99")) stop("buyer-visible HUG price must equal $9.99");
if (!route.includes("inventoryCount: 0") || !route.includes("purchasableCount: 0") || !route.includes("records: []")) stop("Production hold literals missing");

console.log("THANK YOU MEDIUM75 PREVIEW CANARY AUDIT PASS");
console.log("PREVIEW AUDIO: 1");
console.log("PURCHASABLE IIS: 0");
console.log("PRODUCTION ELIGIBLE: NO");
