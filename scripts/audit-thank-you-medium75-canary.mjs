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
if (packet.pricing?.HUG_USD !== 7.99) stop("HUG price must equal $7.99");
if (packet.pricing?.TUG_USD !== 4.99) stop("TUG price must equal $4.99");
if (packet.pricing?.BUG_USD !== 1.99) stop("BUG price must equal $1.99");
if (packet.pricing?.BUG_TOTAL_TIMED_SENDS !== 3) stop("BUG must include exactly 3 timed Sends");
if (JSON.stringify(packet.pricing?.BUG_DELIVERY_MODES) !== JSON.stringify(["REPEAT", "STORY_ARC"])) stop("BUG delivery modes changed");
if (packet.pricing?.REPEAT_BUG_SAME_EXACT_BUG_EACH_SEND !== true) stop("Repeat BUG law missing");
if (JSON.stringify(packet.pricing?.STORY_BUG_DISTINCT_RELATED_SEQUENCE) !== JSON.stringify(["HOOK", "BUILD", "PAYOFF"])) stop("Story BUG sequence changed");
if (packet.pricing?.STORY_BUG_RANDOMIZED_ONLY_AT_ASSEMBLY !== true) stop("Story BUG randomization boundary changed");
if (packet.pricing?.STORY_BUG_SEQUENCING_ADDON_USD !== 0.99) stop("Story BUG add-on must equal $0.99");
if (packet.pricing?.STORY_BUG_TOTAL_USD !== 2.98) stop("Story BUG total must equal $2.98");
if (packet.pricing?.BUG_PACKAGE_LOCKED_BEFORE_SEND_ONE !== true) stop("BUG package-lock law missing");
if (packet.pricing?.BUG_BILLING_COUNT !== 1) stop("BUG must be billed once");
if (packet.lt_pix_ssot_parent_id !== null) stop("unproven LT-PIX ID was invented");
if (packet.human_customer_audio_qa !== "CANARY_LISTENING_REQUIRED") stop("human listening gate weakened");
if (!fs.existsSync(audioPath)) stop("canary audio missing");
if (sha256(audioPath) !== packet.customer_audio_sha256) stop("canary audio SHA mismatch");
if (!route.includes('process.env.VERCEL_ENV === "preview"')) stop("Preview environment gate missing");
if (!route.includes('process.env.VERCEL_GIT_COMMIT_REF === CANARY_BRANCH')) stop("exact branch gate missing");
if (!route.includes('checkoutHref: ""')) stop("checkout must remain disabled");
if (!route.includes("priceUsd: 7.99")) stop("buyer-visible HUG price must equal $7.99");
if (!route.includes("inventoryCount: 0") || !route.includes("purchasableCount: 0") || !route.includes("records: []")) stop("Production hold literals missing");

console.log("THANK YOU MEDIUM75 PREVIEW CANARY AUDIT PASS");
console.log("PREVIEW AUDIO: 1");
console.log("PURCHASABLE IIS: 0");
console.log("PRODUCTION ELIGIBLE: NO");
