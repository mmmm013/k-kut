import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const source = "incoming/comin-true/COMIN_TRUE_FULL_LT_PIX_SSOT.mp3";
const twinkle = "public/signature/sti/gpm-sti-twinkle-v001-stop-at-audio-end.mp3";
const hugManifestPath = "data/ii-delivery-registry/comin-true-sell-now-v1.json";
const manifestPath = "data/ii-delivery-registry/comin-true-full-family-v1.json";
const tugOutDir = "public/ii-delivery/tugs/comin-true";
const bugOutDir = "public/ii-delivery/bugs/comin-true";

const expectedSourceSha256 = "fcf14e890b2c23c1eff1d213722332d67d282d9315c8b0e290fb2522fb092cda";
const vocalStart = 12.0;
const vocalEnd = 135.497;
const allowedSkForms = new Set(["1LNR", "HOOK", "IDIOM", "LNPR", "LNTRIO", "MTA4", "PHRZ", "TWST"]);
const allowedMkForms = new Set(["TRM", "VSND", "XCLM"]);

const tugs = [
  ["waiting-good-luck", 12.0, 15.0, "I've Been Waiting Like Good Luck", ["PHRZ", "MTA4"], "For patient hope when the wait has been long."],
  ["lights-turned-up", 15.0, 19.0, "Keep the Lights Turned Up", ["1LNR", "MTA4"], "Encouragement to keep hope and energy alive."],
  ["laying-low", 19.0, 22.0, "Laying a Little Low", ["1LNR", "PHRZ"], "A truthful way to share a quieter low point."],
  ["moving-slow", 22.0, 25.0, "Moving Through It Slow", ["1LNR", "PHRZ"], "Support for someone progressing at their own pace."],
  ["long-wait", 25.0, 28.0, "There's Just So Long I Can Wait", ["1LNR", "PHRZ"], "For naming the limit of a difficult wait."],
  ["space-and-faith", 28.41, 32.0, "Only So Much Space and Faith", ["1LNR", "MTA4"], "For the tension between patience, room, and belief."],
  ["make-room", 32.0, 35.0, "Time to Make Some Room", ["1LNR", "IDIOM"], "A positive nudge to make room for change."],
  ["flowers-bloom", 35.0, 38.0, "Let the Flowers Bloom", ["1LNR", "MTA4"], "A hopeful message for growth and possibility."],
  ["newly-new", 38.0, 42.0, "I'm Newly New", ["1LNR", "PHRZ"], "For feeling changed, renewed, and newly oneself."],
  ["coming-true-first", 42.0, 46.0, "I'm Coming True", ["1LNR", "HOOK"], "A confident message about becoming fully oneself."],
  ["old-paint-fade", 46.0, 52.0, "Old Paint About to Fade", ["1LNR", "MTA4"], "For recognizing an old identity or season that is fading."],
  ["fresh-outlook-place", 52.0, 57.0, "Put a Fresh Outlook in Its Place", ["1LNR", "MTA4", "TWST"], "For replacing what is fading with a renewed outlook."],
  ["newly-coming-true-1", 57.27, 63.0, "I'm Newly New—I'm Coming True", ["LNPR", "HOOK"], "A compact renewal and self-belief message."],
  ["coming-true-repeat", 60.0, 67.0, "I'm Coming True", ["HOOK", "PHRZ"], "A repeated lift of confidence and determination."],
  ["take-little-lot", 70.0, 73.0, "Take a Little, Take a Lot", ["1LNR", "TWST"], "A generous message that works at any needed amount."],
  ["everything-got", 73.0, 77.0, "I'll Give You Everything I've Got", ["1LNR", "PHRZ"], "A direct expression of effort and wholehearted support."],
  ["holding-on", 77.0, 80.0, "I've Been Holding On", ["1LNR", "IDIOM"], "For perseverance through uncertainty or loss."],
  ["thought-was-gone", 80.0, 82.0, "To What I Thought Was Gone", ["1LNR", "PHRZ"], "For discovering that something meaningful may remain."],
  ["no-looking-back", 82.0, 85.0, "I Won't Waste Time Looking Back", ["1LNR", "IDIOM"], "A decisive message about moving forward."],
  ["what-ive-had", 85.3, 89.0, "It Doesn't Matter What I've Had", ["1LNR", "PHRZ"], "For releasing the weight of the past."],
  ["moving-on", 89.0, 92.0, "Now I'm Moving On", ["1LNR", "IDIOM"], "A clear message of forward motion."],
  ["where-belong", 92.0, 96.0, "Getting Back Where I Belong", ["1LNR", "IDIOM"], "For returning to oneself, home, purpose, or belonging."],
  ["newly-coming-true-2", 96.0, 103.0, "I'm Newly New—I'm Coming True", ["LNPR", "HOOK"], "A second, fuller renewal and confidence lift."],
  ["old-paint-fade-2", 103.0, 109.0, "Took Off That Old Paint About to Fade", ["1LNR", "MTA4"], "A vivid message about shedding an outdated layer."],
  ["fresh-outlook-place-2", 109.41, 115.0, "Put a Fresh Outlook in Its Place", ["1LNR", "MTA4", "TWST"], "A renewed perspective replacing what no longer fits."],
  ["newly-coming-true-3", 115.0, 121.0, "I'm Newly New—I'm Coming True", ["LNPR", "HOOK"], "A strong closing lift for reinvention and self-belief."],
  ["coming-true-final", 127.0, 131.0, "I'm Coming True", ["1LNR", "HOOK"], "A final confident statement of becoming."],

  ["waiting-lights", 12.0, 19.0, "Waiting with the Lights Turned Up", ["LNPR", "MTA4"], "Patient struggle paired with active hope."],
  ["low-but-moving", 19.0, 25.0, "A Little Low, Still Moving", ["LNPR", "TWST"], "For sharing a low point without giving up."],
  ["wait-space-faith", 25.0, 32.0, "Waiting, Space and Faith", ["LNPR", "MTA4"], "For the emotional limits of waiting while still believing."],
  ["room-to-bloom", 32.0, 38.0, "Make Room—Let the Flowers Bloom", ["LNPR", "MTA4", "TWST"], "A positive progression from openness into growth."],
  ["new-to-true", 38.0, 46.0, "Newly New and Coming True", ["LNPR", "HOOK"], "Renewal joined with confidence and identity."],
  ["paint-to-outlook", 46.0, 57.0, "Old Paint, Fresh Outlook", ["LNPR", "MTA4", "TWST"], "A complete transformation from fading past to fresh outlook."],
  ["take-and-give", 70.0, 77.0, "Take What You Need—I'll Give What I've Got", ["LNPR", "TWST"], "A generous message of flexible, wholehearted support."],
  ["holding-what-remains", 77.0, 82.0, "Holding On to What I Thought Was Gone", ["LNPR", "TWST"], "For endurance, rediscovery, and refusing to surrender meaning."],
  ["past-doesnt-matter", 82.0, 89.0, "No Looking Back—The Past Doesn't Matter", ["LNPR", "TWST"], "A direct reframe away from the past."],
  ["moving-where-belong", 89.0, 96.0, "Moving On to Where I Belong", ["LNPR", "TWST"], "A forward-moving return to belonging."],
  ["renewal-refrain", 96.0, 103.0, "Newly New and Coming True", ["LNPR", "HOOK"], "A renewed confidence refrain."],
  ["shed-and-replace", 103.0, 115.0, "Shed the Old—Choose a Fresh Outlook", ["LNPR", "MTA4", "TWST"], "A full metaphorical turn from the outdated to the renewed."],
  ["closing-renewal", 115.0, 124.0, "Newly New, Coming True", ["LNTRIO", "HOOK"], "A closing statement of renewal and self-realization."],

  ["waiting-low-moving", 12.0, 25.0, "Waiting, Laying Low, Still Moving", ["LNTRIO", "TWST"], "An honest story of difficulty with continued movement."],
  ["faith-room-bloom", 25.0, 38.0, "Faith Makes Room to Bloom", ["LNTRIO", "MTA4", "TWST"], "A compact progression from limits into growth."],
  ["renewal-transformation", 38.0, 57.0, "Coming True with a Fresh Outlook", ["LNTRIO", "HOOK", "MTA4"], "A complete renewal arc from identity to outward change."],
  ["give-hold-find", 70.0, 82.0, "Give Everything—Hold On—Find What Remains", ["LNTRIO", "TWST"], "A story of generosity, endurance, and rediscovery."],
  ["release-return", 82.0, 96.0, "Release the Past—Return Where You Belong", ["LNTRIO", "TWST"], "A full forward-motion message ending in belonging."],
  ["renew-and-replace", 96.0, 115.0, "Come True—Replace the Old with a Fresh Outlook", ["LNTRIO", "MTA4", "TWST"], "A full reinvention message."],
  ["holding-to-belonging", 77.0, 96.0, "From Holding On to Moving On", ["LNTRIO", "TWST"], "A deeper emotional progression from endurance into belonging."],
  ["past-to-coming-true", 82.0, 103.0, "No Looking Back—I'm Coming True", ["LNTRIO", "HOOK", "TWST"], "A decisive progression from releasing the past to becoming oneself."],
  ["fresh-final-arc", 103.0, 124.0, "Old Paint to Fresh Outlook to Coming True", ["LNTRIO", "MTA4", "TWST"], "A complete closing transformation story."],
];

const bugs = [
  ["good-luck", 13.65, 15.0, "Good Luck", "TRM", "Good luck"],
  ["lights-up", 17.05, 19.0, "Lights Turned Up", "TRM", "Keep hope bright"],
  ["little-low", 20.7, 22.0, "A Little Low", "TRM", "Share a low moment"],
  ["moving-slow", 22.0, 25.0, "Moving Slow", "TRM", "Progress at your pace"],
  ["wait", 27.48, 28.0, "Wait", "TRM", "Name the wait"],
  ["space-faith", 29.8, 32.0, "Space and Faith", "TRM", "Make room for belief"],
  ["make-room", 32.99, 35.0, "Make Some Room", "TRM", "Open space for change"],
  ["flowers-bloom", 36.0, 38.0, "Flowers Bloom", "TRM", "Growth and possibility"],
  ["newly-new-1", 39.08, 42.0, "Newly New", "TRM", "Renewal"],
  ["coming-true-1", 42.92, 46.0, "Coming True", "TRM", "Becoming yourself"],
  ["old-paint-1", 47.14, 48.0, "Old Paint", "TRM", "The old layer"],
  ["fade-1", 50.53, 52.0, "Fade", "TRM", "Letting the old fade"],
  ["fresh-outlook-1", 52.49, 54.0, "Fresh Outlook", "TRM", "A renewed perspective"],
  ["newly-new-2", 57.81, 60.0, "Newly New", "TRM", "Renewal, second vocal lift"],
  ["coming-true-2", 60.69, 63.0, "Coming True", "TRM", "Becoming, second vocal lift"],
  ["ooh-1", 67.0, 70.0, "Hopeful Ooh", "VSND", "A wordless hopeful lift"],
  ["take-little", 70.41, 72.19, "Take a Little", "TRM", "Receive a little support"],
  ["take-lot", 72.19, 73.0, "Take a Lot", "TRM", "Receive more support"],
  ["everything-got", 74.55, 77.0, "Everything I've Got", "TRM", "Wholehearted effort"],
  ["holding-on", 78.39, 80.0, "Holding On", "TRM", "Perseverance"],
  ["gone", 81.6, 82.0, "Gone", "TRM", "Loss or absence"],
  ["waste-time", 82.92, 83.84, "Waste Time", "TRM", "Choose what matters"],
  ["looking-back", 83.84, 85.0, "Looking Back", "TRM", "The past"],
  ["moving-on", 90.27, 92.0, "Moving On", "TRM", "Forward motion"],
  ["belong", 94.93, 96.0, "Belong", "TRM", "Belonging"],
  ["newly-new-3", 96.81, 99.0, "Newly New", "TRM", "Renewal, final vocal lift"],
  ["coming-true-3", 99.92, 103.0, "Coming True", "TRM", "Becoming, renewed lift"],
  ["old-paint-2", 104.39, 106.77, "Old Paint", "TRM", "The old layer, second vocal lift"],
  ["fade-2", 108.16, 109.0, "Fade", "TRM", "Letting go, second vocal lift"],
  ["fresh-outlook-2", 109.92, 112.68, "Fresh Outlook", "TRM", "Renewed perspective, second vocal lift"],
  ["coming-true-4", 118.69, 121.0, "Coming True", "TRM", "Becoming, strong closing lift"],
  ["ooh-2", 124.0, 127.0, "Renewing Ooh", "VSND", "A wordless renewal lift"],
  ["coming-true-5", 127.92, 131.0, "Coming True", "TRM", "Becoming, final vocal lift"],
  ["ooh-3", 131.0, 135.0, "Final Ooh", "VSND", "A wordless closing lift"],
];

const storyBugs = [
  ["room-to-bloom", "Make Room to Bloom", ["make-room", "flowers-bloom", "coming-true-1"], "A three-moment movement from openness to growth to becoming."],
  ["holding-to-moving", "Holding On to Moving On", ["holding-on", "looking-back", "moving-on"], "A three-moment story of endurance, reflection, and forward motion."],
  ["old-to-fresh", "Old Paint to Fresh Outlook", ["old-paint-2", "fade-2", "fresh-outlook-2"], "A three-moment reinvention story: old layer, release, renewed view."],
];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function renderExactExcerpt({ key, start, end, product }) {
  const outDir = product === "TUG" ? tugOutDir : bugOutDir;
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `comin-true-${product.toLowerCase()}-${slug(key)}-dp.mp3`);
  const clipStart = Math.max(vocalStart, start - 0.08);
  const clipEnd = Math.min(vocalEnd, end + (product === "BUG" ? 0.16 : 0.12));
  const duration = clipEnd - clipStart;
  const fadeOutStart = Math.max(0, duration - 0.06);
  const filter = [
    `[1:a]atrim=start=${clipStart.toFixed(3)}:end=${clipEnd.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=0.035,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.06[moment]`,
    `[3:a]volume=0.75,aformat=sample_rates=44100:sample_fmts=fltp:channel_layouts=stereo[tw]`,
    `[0:a]aformat=sample_rates=44100:sample_fmts=fltp:channel_layouts=stereo[lead]`,
    `[2:a]aformat=sample_rates=44100:sample_fmts=fltp:channel_layouts=stereo[tail]`,
    `[lead][moment][tail][tw]concat=n=4:v=0:a=1[out]`,
  ].join(";");
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-t", "1.35", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-i", source,
    "-f", "lavfi", "-t", "0.75", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-i", twinkle,
    "-filter_complex", filter,
    "-map", "[out]", "-codec:a", "libmp3lame", "-b:a", "192k", out,
  ], { stdio: "inherit" });
  return { out, clipStart, clipEnd };
}

if (!fs.existsSync(source)) throw new Error(`Missing vocal LT-PIX SSOT: ${source}`);
if (!fs.existsSync(twinkle)) throw new Error(`Missing canonical Twinkle: ${twinkle}`);
if (!fs.existsSync(hugManifestPath)) throw new Error(`Missing governed HUG manifest: ${hugManifestPath}`);
if (sha256(source) !== expectedSourceSha256) throw new Error("Comin' True vocal LT-PIX hash mismatch");

const seen = new Set();
const tugItems = tugs.map(([key, start, end, displayTitle, formKeys, buyerIntent]) => {
  if (!(start >= vocalStart && end <= vocalEnd && end > start)) throw new Error(`Invalid TUG bounds: ${key}`);
  if (!formKeys.every((form) => allowedSkForms.has(form))) throw new Error(`Invalid sK form: ${key}`);
  const identity = `TUG:${start}:${end}:${displayTitle}`;
  if (seen.has(identity)) throw new Error(`Duplicate TUG identity: ${key}`);
  seen.add(identity);
  const { out, clipStart, clipEnd } = renderExactExcerpt({ key, start, end, product: "TUG" });
  return {
    ii_key: `comin_true_tug_${slug(key).replaceAll("-", "_")}`,
    platform: "TUG",
    kut_form: "sK",
    form_keys: formKeys,
    display_title: displayTitle,
    buyer_intent: buyerIntent,
    source_text: displayTitle,
    source_start_sec: start,
    source_end_sec: end,
    rendered_clip_start_sec: Number(clipStart.toFixed(3)),
    rendered_clip_end_sec: Number(clipEnd.toFixed(3)),
    audio_url: `/ii-delivery/tugs/comin-true/${path.basename(out)}`,
    sha256: sha256(out),
    price_usd: "4.99",
    checkout_url: `/checkout?ii=comin_true_tug_${slug(key).replaceAll("-", "_")}`,
    llbp_state: "PUBLIC_PASS",
    source_audio_unchanged: true,
  };
});

const bugItems = bugs.map(([key, start, end, displayTitle, formKey, buyerIntent]) => {
  if (!(start >= vocalStart && end <= vocalEnd && end > start)) throw new Error(`Invalid BUG bounds: ${key}`);
  if (!allowedMkForms.has(formKey)) throw new Error(`Invalid mK form: ${key}`);
  const identity = `BUG:${start}:${end}:${displayTitle}`;
  if (seen.has(identity)) throw new Error(`Duplicate BUG identity: ${key}`);
  seen.add(identity);
  const { out, clipStart, clipEnd } = renderExactExcerpt({ key, start, end, product: "BUG" });
  return {
    ii_key: `comin_true_bug_${slug(key).replaceAll("-", "_")}`,
    platform: "BUG",
    kut_form: "mK",
    form_key: formKey,
    display_title: displayTitle,
    buyer_intent: buyerIntent,
    heard_text: displayTitle,
    source_start_sec: start,
    source_end_sec: end,
    rendered_clip_start_sec: Number(clipStart.toFixed(3)),
    rendered_clip_end_sec: Number(clipEnd.toFixed(3)),
    audio_url: `/ii-delivery/bugs/comin-true/${path.basename(out)}`,
    sha256: sha256(out),
    price_usd: "1.99",
    checkout_url: `/checkout?ii=comin_true_bug_${slug(key).replaceAll("-", "_")}`,
    llbp_state: "PUBLIC_PASS",
    source_audio_unchanged: true,
  };
});

const bugByKey = new Map(bugItems.map((item) => [item.ii_key.replace("comin_true_bug_", "").replaceAll("_", "-"), item]));
const storyBugItems = storyBugs.map(([key, displayTitle, componentKeys, buyerIntent]) => {
  const components = componentKeys.map((componentKey) => {
    const item = bugByKey.get(componentKey);
    if (!item) throw new Error(`Missing Story BUG component: ${componentKey}`);
    return item.ii_key;
  });
  return {
    ii_key: `comin_true_story_bug_${slug(key).replaceAll("-", "_")}`,
    platform: "BUG",
    kut_form: "STORY_BUG",
    display_title: displayTitle,
    buyer_intent: buyerIntent,
    component_bug_keys: components,
    price_usd: "2.98",
    checkout_url: `/checkout?ii=comin_true_story_bug_${slug(key).replaceAll("-", "_")}`,
    llbp_state: "PUBLIC_PASS",
    source_audio_unchanged: true,
  };
});

const repeatedTerms = new Map();
for (const item of bugItems) {
  const normalized = item.display_title.toLowerCase();
  repeatedTerms.set(normalized, (repeatedTerms.get(normalized) || 0) + 1);
}
for (const [term, count] of repeatedTerms) {
  if (count > 5) throw new Error(`More than five BUG versions for ${term}`);
}

const hugManifest = JSON.parse(fs.readFileSync(hugManifestPath, "utf8"));
const manifest = {
  schema_version: "GPMX_COMIN_TRUE_COMPLETE_II_FAMILY_V1",
  status: "PUBLIC_READY_COMPLETE_FAMILY",
  source_title: "Comin' True",
  source_catalog_project: "tlbqzzhhypixfbejoucr",
  source_catalog_track_id: 168275759,
  source_sha256: sha256(source),
  lyric_authority: "SUPABASE_CATALOG_LYRICS_PLUS_LOCAL_GOVERNED_COPY",
  lyric_authority_file: "data/kkr-lyric-authority/comin_true.txt",
  boundary_truth: "data/kkr-boundary-truth/comin_true.json",
  alignment_basis: "UNPROMPTED_WORD_LEVEL_AUDIO_ALIGNMENT_CROSS_CHECKED_TO_CATALOG_LYRICS_AND_OWNER_LOCKED_FIVE_BLK_TRUTH",
  theme: "Motivation",
  sentiments: ["Chasing your dreams", "Hope", "Determination", "Renewal", "Perseverance", "Moving forward", "Belonging"],
  source_audio_unchanged: true,
  counts: {
    hug: hugManifest.items.length,
    tug: tugItems.length,
    bug: bugItems.length,
    story_bug: storyBugItems.length,
    total: hugManifest.items.length + tugItems.length + bugItems.length + storyBugItems.length,
  },
  hugs: hugManifest.items,
  tugs: tugItems,
  bugs: bugItems,
  story_bugs: storyBugItems,
};

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`HUGS=${manifest.counts.hug}`);
console.log(`TUGS=${manifest.counts.tug}`);
console.log(`BUGS=${manifest.counts.bug}`);
console.log(`STORY_BUGS=${manifest.counts.story_bug}`);
console.log(`TOTAL_IIS=${manifest.counts.total}`);
console.log(`MANIFEST=${manifestPath}`);
