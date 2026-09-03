import fs from "node:fs";
import path from "node:path";

type CominTrueHug = {
  ii_key?: string;
  source_blk_first?: string;
  source_blk_last?: string;
};

type CominTrueManifest = {
  hugs?: CominTrueHug[];
};

const COMIN_TRUE_MANIFEST_PATH = path.join(
  process.cwd(),
  "data",
  "ii-delivery-registry",
  "comin-true-full-family-v1.json",
);
const COMIN_TRUE_LYRIC_PATH = path.join(
  process.cwd(),
  "data",
  "kkr-lyric-authority",
  "comin_true.txt",
);
const COMIN_TRUE_BLOCK_ORDER = ["BLK1", "BLK2", "BLK3", "BLK4", "BLK5"] as const;
const COMIN_TRUE_BLOCK_LINE_RANGES: Record<
  (typeof COMIN_TRUE_BLOCK_ORDER)[number],
  readonly [number, number | null]
> = {
  BLK1: [0, 4],
  BLK2: [4, 8],
  BLK3: [8, 10],
  BLK4: [10, 12],
  BLK5: [12, null],
};

let cachedCominTrueHugs: Map<string, CominTrueHug> | null = null;
let cachedCominTrueBlocks: Record<string, string[]> | null = null;

function loadCominTrueHugs() {
  if (cachedCominTrueHugs) return cachedCominTrueHugs;
  if (!fs.existsSync(COMIN_TRUE_MANIFEST_PATH)) {
    cachedCominTrueHugs = new Map();
    return cachedCominTrueHugs;
  }

  const manifest = JSON.parse(
    fs.readFileSync(COMIN_TRUE_MANIFEST_PATH, "utf8"),
  ) as CominTrueManifest;

  cachedCominTrueHugs = new Map(
    (manifest.hugs || [])
      .filter((item) => item.ii_key)
      .map((item) => [String(item.ii_key), item]),
  );

  return cachedCominTrueHugs;
}

function loadCominTrueBlockLines() {
  if (cachedCominTrueBlocks) return cachedCominTrueBlocks;
  if (!fs.existsSync(COMIN_TRUE_LYRIC_PATH)) {
    cachedCominTrueBlocks = {};
    return cachedCominTrueBlocks;
  }

  const sourceLines = fs
    .readFileSync(COMIN_TRUE_LYRIC_PATH, "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const lyricLines =
    sourceLines[0]?.toLowerCase() === "coming true"
      ? sourceLines.slice(1)
      : sourceLines;

  cachedCominTrueBlocks = Object.fromEntries(
    COMIN_TRUE_BLOCK_ORDER.map((blockId) => {
      const [start, end] = COMIN_TRUE_BLOCK_LINE_RANGES[blockId];
      return [blockId, lyricLines.slice(start, end ?? undefined)];
    }),
  );

  return cachedCominTrueBlocks;
}

export function getApprovedLyricLines(inventoryId: string): string[] {
  const normalizedInventoryId = String(inventoryId || "").trim();
  if (!normalizedInventoryId.startsWith("comin_true_")) return [];

  const item = loadCominTrueHugs().get(normalizedInventoryId);
  if (!item?.source_blk_first || !item.source_blk_last) return [];

  const firstIndex = COMIN_TRUE_BLOCK_ORDER.indexOf(
    item.source_blk_first as (typeof COMIN_TRUE_BLOCK_ORDER)[number],
  );
  const lastIndex = COMIN_TRUE_BLOCK_ORDER.indexOf(
    item.source_blk_last as (typeof COMIN_TRUE_BLOCK_ORDER)[number],
  );

  if (firstIndex < 0 || lastIndex < firstIndex) return [];

  const blocks = loadCominTrueBlockLines();
  return COMIN_TRUE_BLOCK_ORDER.slice(firstIndex, lastIndex + 1).flatMap(
    (blockId) => blocks[blockId] || [],
  );
}

export function getCompactApprovedLyricLines(
  lines: string[],
  maxVisibleLines = 5,
): string[] {
  if (lines.length <= maxVisibleLines) return lines;
  if (maxVisibleLines <= 2) return lines.slice(0, maxVisibleLines);

  const headCount = Math.max(1, Math.floor((maxVisibleLines - 1) / 2));
  const tailCount = Math.max(1, maxVisibleLines - headCount - 1);

  return [
    ...lines.slice(0, headCount),
    "…",
    ...lines.slice(lines.length - tailCount),
  ];
}
