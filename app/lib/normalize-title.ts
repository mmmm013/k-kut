export function normalizeTrackTitle(raw: string | null | undefined): string {
  let title = String(raw || "").trim();

  title = title
    .replace(/\.(mp3|wav|m4a|aif|aiff)$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove leading track number prefixes:
  // "003 - Artist - Title" -> "Artist - Title"
  title = title.replace(/^\s*\d{1,4}\s*[-–—]\s*/u, "");

  // Remove known artist/source prefixes:
  const knownPrefixes = [
    "KLEIGH",
    "KLE$IGH",
    "Music Maykers",
    "Lloyd G Miller",
    "Lloyd Miller",
    "Elle Christine",
    "G Putnam Music",
    "Michael Clay"
  ];

  for (const prefix of knownPrefixes) {
    const re = new RegExp("^" + prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&") + "\\s*[-–—]\\s*", "i");
    title = title.replace(re, "");
  }

  // If still shaped like "Artist - Title", remove artist if it looks like a person/source name.
  title = title.replace(
    /^[A-Z][A-Za-z$.' ]{1,40}\s*[-–—]\s*(?=[A-Za-z0-9])/u,
    ""
  );

  title = title
    .replace(/\s+[-–—]\s+/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  // Preserve common uppercase suffixes but title-case normal words.
  const suffixes = ["INSTRO", "PIANO-VOCAL", "STRIPPED"];
  const parts = title.split(" - ");
  const main = parts[0]
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bAi\b/g, "AI")
    .replace(/\bIi\b/g, "II")
    .replace(/\bIii\b/g, "III")
    .replace(/\bIv\b/g, "IV");

  const rest = parts.slice(1).map((part) => {
    const upper = part.toUpperCase();
    if (suffixes.includes(upper)) return upper;
    return part
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase());
  });

  return [main, ...rest].filter(Boolean).join(" - ").trim() || "Untitled";
}
