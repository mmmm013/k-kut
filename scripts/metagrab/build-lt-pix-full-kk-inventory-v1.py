import csv
import json
import re
import hashlib
from pathlib import Path
from collections import Counter, defaultdict

ROOT = Path(".")
REPORT_DIR = Path("reports/metagrab")
REPORT_DIR.mkdir(parents=True, exist_ok=True)

ALL_OUT = REPORT_DIR / "LT-PIX-FULL-KK-INVENTORY-V1.tsv"
HOLIDAY_OUT = REPORT_DIR / "holiday-kk-theme-inventory-V3-LT-PIX-ONLY.tsv"
PERSONAL_OUT = REPORT_DIR / "personal-kk-theme-inventory-V3-LT-PIX-ONLY.tsv"
REJECT_OUT = REPORT_DIR / "rejected-non-LT-PIX-source-rows-V1.tsv"
SUMMARY_OUT = REPORT_DIR / "LT-PIX-FULL-KK-INVENTORY-SUMMARY-V1.md"

EXPECTED_LT_PIX = 307
MIN_KKS_PER_LT_PIX = 6
STANDARD_KKS_PER_LT_PIX = 7
MIN_EXPECTED_KKS = EXPECTED_LT_PIX * MIN_KKS_PER_LT_PIX
STANDARD_EXPECTED_KKS = EXPECTED_LT_PIX * STANDARD_KKS_PER_LT_PIX

REJECT_PATH = re.compile(
    r"node_modules|\.next|\.git|reports/metagrab|HOLIDAY-QUARANTINE",
    re.I,
)

REJECT_SOURCE = re.compile(
    r"\bINSTRO\b|instrumental|IN-PIX|INO-PIX|IN/O|— mK| mK |mk-products|mini[-_ ]?kut|"
    r"data/4pe/|data/audio-law|data/bic|data/campaigns|data/depth|data/emotions|"
    r"rules|doctrine|template|schema|model\.json|kk-report-intake|kk-batch",
    re.I,
)

TITLE_KEYS = [
    "pix_title", "lt_pix_title", "title", "track_title", "song_title",
    "work_title", "source_title", "internal_work_title", "internal_pix_title",
]

ID_KEYS = [
    "pix_id", "lt_pix_id", "track_id", "song_id", "work_id", "id",
]

LYRIC_KEYS = [
    "lyrics", "lyric", "lyric_text", "full_lyrics", "song_lyrics",
    "transcript", "transcription", "words", "word_text", "line_text",
    "lines", "source_text", "text_lyrics",
]

AUDIO_KEYS = [
    "audio_url", "source_audio_url", "source_audio_path", "track_url",
    "file_url", "public_url", "previewSrc", "audio_path",
]

SECTION_STANDARD = [
    ("KK 1", "Intro / Opening"),
    ("KK 2", "Verse 1 / First movement"),
    ("KK 3", "Chorus / Main lift"),
    ("KK 4", "Verse 2 / Development"),
    ("KK 5", "Bridge / Turn"),
    ("KK 6", "Final chorus / Peak"),
    ("KK 7", "Outro / Landing"),
]

def clean(x):
    if x is None:
        return ""
    if isinstance(x, list):
        return "\n".join(clean(v) for v in x)
    if isinstance(x, dict):
        return " ".join(clean(v) for v in x.values())
    return str(x).replace("\r", "\n").strip()

def norm(x):
    return re.sub(r"[^a-z0-9]+", " ", clean(x).lower()).strip()

def stable_id(text, n=10):
    return hashlib.sha1(clean(text).encode("utf-8", "ignore")).hexdigest()[:n].upper()

def walk_files():
    roots = [Path("data"), Path("lib")]
    files = []
    for root in roots:
        if not root.exists():
            continue
        for p in root.rglob("*"):
            if p.is_file() and not REJECT_PATH.search(str(p)):
                if p.suffix.lower() in [".json", ".csv", ".tsv"]:
                    files.append(p)
    return files

def read_csv(path):
    rows = []
    try:
        with path.open(newline="", encoding="utf-8", errors="ignore") as f:
            if path.suffix.lower() == ".tsv":
                reader = csv.DictReader(f, delimiter="\t")
            else:
                reader = csv.DictReader(f)
            for r in reader:
                r = dict(r)
                r["__file"] = str(path)
                rows.append(r)
    except Exception as e:
        rows.append({"__file": str(path), "__read_error": repr(e)})
    return rows

def flatten_json(obj, path, context=None, rows=None):
    context = context or {}
    rows = rows or []

    if isinstance(obj, dict):
        row = dict(context)
        row.update(obj)
        row["__file"] = str(path)
        rows.append(row)

        next_context = dict(context)
        for k in TITLE_KEYS:
            if k in obj and clean(obj[k]):
                next_context.setdefault(k, clean(obj[k]))
        for k in ID_KEYS:
            if k in obj and clean(obj[k]):
                next_context.setdefault(k, clean(obj[k]))

        for v in obj.values():
            flatten_json(v, path, next_context, rows)

    elif isinstance(obj, list):
        for item in obj:
            flatten_json(item, path, context, rows)

    return rows

def read_json(path):
    try:
        obj = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
        return flatten_json(obj, path)
    except Exception as e:
        return [{"__file": str(path), "__read_error": repr(e)}]

def value_from(row, keys):
    for k in keys:
        if k in row and clean(row[k]):
            return clean(row[k])
    for k, v in row.items():
        lk = str(k).lower()
        if any(target in lk for target in keys) and clean(v):
            return clean(v)
    return ""

def lyric_text_from(row):
    pieces = []
    for k, v in row.items():
        lk = str(k).lower()
        if any(token in lk for token in ["lyric", "lyrics", "transcript", "transcription", "words", "line_text"]):
            txt = clean(v)
            if txt:
                pieces.append(txt)
    return "\n".join(pieces).strip()

def audio_from(row):
    for k in AUDIO_KEYS:
        if k in row and clean(row[k]):
            return clean(row[k])
    for k, v in row.items():
        lk = str(k).lower()
        if "audio" in lk or "track_url" in lk or "file_url" in lk:
            val = clean(v)
            if re.search(r"\.(mp3|m4a|wav)(\?|$)", val, re.I):
                return val
    return ""

def split_lyrics_into_sections(text, count=STANDARD_KKS_PER_LT_PIX):
    lines = [ln.strip() for ln in re.split(r"\n+", text) if ln.strip()]
    if not lines:
        words = clean(text).split()
        if not words:
            return [""] * count
        chunk = max(1, len(words) // count)
        sections = []
        for i in range(count):
            start = i * chunk
            end = len(words) if i == count - 1 else (i + 1) * chunk
            sections.append(" ".join(words[start:end]).strip())
        return sections

    sections = []
    chunk = max(1, len(lines) // count)
    for i in range(count):
        start = i * chunk
        end = len(lines) if i == count - 1 else (i + 1) * chunk
        sections.append("\n".join(lines[start:end]).strip())
    return sections

def personal_themes(section_text):
    t = section_text.lower()
    hits = []

    checks = [
        ("Courage / Keep Going", ["keep going", "hold on", "carry on", "through", "stand", "strong", "fight", "survive", "one more", "rise", "brave"]),
        ("Hope", ["hope", "believe", "light", "tomorrow", "future"]),
        ("Strength / Steady Support", ["strong", "strength", "steady", "there for", "with you", "beside you"]),
        ("Respect / Honor", ["respect", "honor", "earned", "proud"]),
        ("Legacy", ["legacy", "what you gave", "still matters", "remember you", "carry your"]),
        ("Family", ["family", "home", "together", "father", "mother", "dad", "mom", "son", "daughter"]),
        ("Love / Romance", ["love", "heart", "touch", "forever", "kiss", "romance", "devotion"]),
        ("Memory / Missing You", ["remember", "memory", "missing", "miss you", "empty chair", "gone", "grief"]),
        ("Apology / Repair", ["sorry", "forgive", "apology", "wrong", "make it right", "repair"]),
        ("Gratitude", ["thank", "grateful", "gratitude", "appreciate"]),
        ("Peace / Calm", ["peace", "calm", "quiet", "rest", "breathe"]),
    ]

    for theme, needles in checks:
        if any(n in t for n in needles):
            hits.append(theme)

    return sorted(set(hits)) or ["THEME_REVIEW_NEEDED"]

def holiday_themes(title, section_text):
    title_l = title.lower()
    t = section_text.lower()
    hits = []

    # Locked exception: Christmas in title goes Christmas only for Holiday.
    if "christmas" in title_l:
        return [("Christmas", "Christmas / Title-supported")]

    checks = [
        ("Christmas", "Christmas / Lyric-supported", ["christmas"]),
        ("Father’s Day", "Respect", ["father", "dad", "respect", "earned", "proud"]),
        ("Father’s Day", "Strength", ["father", "dad", "strong", "strength"]),
        ("Father’s Day", "Steady Dad", ["father", "dad", "steady", "there for me", "you were there"]),
        ("Father’s Day", "Legacy", ["father", "dad", "legacy", "what you gave", "still matters"]),
        ("Father’s Day", "Keep Going", ["father", "dad", "keep going", "carry on"]),
        ("Mother’s Day", "Love / Support", ["mother", "mom", "mama", "love", "support"]),
        ("Valentine’s Day", "Romance / Love", ["valentine", "love", "romance", "heart", "forever", "devotion"]),
        ("Thanksgiving", "Gratitude / Family", ["thanksgiving", "grateful", "gratitude", "family", "gather"]),
        ("New Year", "Hope / Fresh Start", ["new year", "fresh start", "start again", "begin again"]),
        ("Easter", "Hope / Renewal", ["easter", "renewal", "rise again", "light"]),
        ("Memorial / Remembrance", "Memory / Missing You", ["memorial", "remember", "memory", "missing", "miss you", "empty chair", "grief", "honor"]),
    ]

    for hol, theme, needles in checks:
        if any(n in t for n in needles):
            hits.append((hol, theme))

    return sorted(set(hits))

def is_explicit_lt_pix(row, full_text):
    # Accept explicit LT-PIX records, or lyric-bearing source records that are not rejected.
    if re.search(r"\bLT[-_ ]?PIX\b", full_text, re.I):
        return True
    if lyric_text_from(row):
        return True
    return False

source_rows = []
for file in walk_files():
    if file.suffix.lower() == ".json":
        source_rows.extend(read_json(file))
    elif file.suffix.lower() in [".csv", ".tsv"]:
        source_rows.extend(read_csv(file))

lt_pix = {}
rejected = []

for row in source_rows:
    file = clean(row.get("__file"))
    full_text = " ".join(clean(v) for v in row.values())

    title = value_from(row, TITLE_KEYS)
    pix_id = value_from(row, ID_KEYS)
    lyrics = lyric_text_from(row)
    audio = audio_from(row)

    reject_reason = ""

    if REJECT_PATH.search(file):
        reject_reason = "REJECT_PATH"
    elif REJECT_SOURCE.search(file) or REJECT_SOURCE.search(full_text):
        reject_reason = "REJECT_SOURCE_NOT_LT_PIX"
    elif not title:
        reject_reason = "NO_TITLE_LOCATION"
    elif not is_explicit_lt_pix(row, full_text):
        reject_reason = "NO_LT_PIX_OR_LYRIC_AUTHORITY"
    elif not lyrics:
        reject_reason = "NO_TEXT_OR_LYRIC_SKIP"

    if reject_reason:
        rejected.append({
            "FILE": file,
            "TITLE_OR_LOCATION": title,
            "PIX_ID": pix_id,
            "REJECT_REASON": reject_reason,
        })
        continue

    key = pix_id or norm(title)
    if not key:
        continue

    if key not in lt_pix:
        lt_pix[key] = {
            "PIX_ID": pix_id or f"LTPIX-{stable_id(title)}",
            "INTERNAL_PIX_LOCATION_ONLY": title,
            "LYRICS": lyrics,
            "AUDIO_SOURCE": audio,
            "EVIDENCE": file,
        }
    else:
        # Keep longest lyric authority and first audio source.
        if len(lyrics) > len(lt_pix[key]["LYRICS"]):
            lt_pix[key]["LYRICS"] = lyrics
        if audio and not lt_pix[key]["AUDIO_SOURCE"]:
            lt_pix[key]["AUDIO_SOURCE"] = audio
        if file not in lt_pix[key]["EVIDENCE"]:
            lt_pix[key]["EVIDENCE"] += f" ; {file}"

all_rows = []
holiday_rows = []
personal_rows = []

for idx, rec in enumerate(sorted(lt_pix.values(), key=lambda r: r["INTERNAL_PIX_LOCATION_ONLY"].lower()), start=1):
    title = rec["INTERNAL_PIX_LOCATION_ONLY"]
    pix_id = rec["PIX_ID"]
    audio = rec["AUDIO_SOURCE"]
    lyrics = rec["LYRICS"]
    evidence = rec["EVIDENCE"]

    sections = split_lyrics_into_sections(lyrics, STANDARD_KKS_PER_LT_PIX)

    for n, ((kk_num, section_label), section_text) in enumerate(zip(SECTION_STANDARD, sections), start=1):
        kk_id = f"KK-LT-{stable_id(pix_id or title, 8)}-{n:02d}"

        pthemes = personal_themes(section_text)
        hthemes = holiday_themes(title, section_text)

        all_row = {
            "KK_ID": kk_id,
            "KK_NUMBER": kk_num,
            "SECTION_LABEL": section_label,
            "INTERNAL_PIX_LOCATION_ONLY": title,
            "PIX_ID": pix_id,
            "SECTION_TEXT_PREVIEW": clean(section_text)[:500],
            "AUDIO_SOURCE": audio,
            "AUDIO_VERIFIED": "no",
            "PUBLIC_READY": "no",
            "PERSONAL_THEMES": " ; ".join(pthemes),
            "HOLIDAY_THEMES": " ; ".join([f"{h}:{t}" for h, t in hthemes]),
            "STATUS": "LT_PIX_KK_REQUIRED_SECTION_SLOT",
            "NEXT_ACTION": "section listen/review, boundary confirm, audio render/verify",
            "EVIDENCE": evidence,
        }
        all_rows.append(all_row)

        for theme in pthemes:
            personal_rows.append({
                "THEME": theme,
                "KK_ID": kk_id,
                "KK_NUMBER": kk_num,
                "SECTION_LABEL": section_label,
                "INTERNAL_PIX_LOCATION_ONLY": title,
                "SECTION_TEXT_PREVIEW": clean(section_text)[:500],
                "AUDIO_SOURCE": audio,
                "AUDIO_VERIFIED": "no",
                "PUBLIC_READY": "no",
                "STATUS": "LT_PIX_KK_THEME_CANDIDATE",
                "NEXT_ACTION": "KK-level theme review and audio verification",
                "EVIDENCE": evidence,
            })

        for hol, theme in hthemes:
            holiday_rows.append({
                "HOLIDAY": hol,
                "THEME": theme,
                "KK_ID": kk_id,
                "KK_NUMBER": kk_num,
                "SECTION_LABEL": section_label,
                "INTERNAL_PIX_LOCATION_ONLY": title,
                "SECTION_TEXT_PREVIEW": clean(section_text)[:500],
                "AUDIO_SOURCE": audio,
                "AUDIO_VERIFIED": "no",
                "PUBLIC_READY": "no",
                "STATUS": "LT_PIX_HOLIDAY_KK_THEME_CANDIDATE",
                "NEXT_ACTION": "KK-level holiday review and audio verification",
                "EVIDENCE": evidence,
            })

def write_tsv(path, rows, fields):
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter="\t", extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

write_tsv(ALL_OUT, all_rows, [
    "KK_ID", "KK_NUMBER", "SECTION_LABEL", "INTERNAL_PIX_LOCATION_ONLY", "PIX_ID",
    "SECTION_TEXT_PREVIEW", "AUDIO_SOURCE", "AUDIO_VERIFIED", "PUBLIC_READY",
    "PERSONAL_THEMES", "HOLIDAY_THEMES", "STATUS", "NEXT_ACTION", "EVIDENCE",
])

write_tsv(PERSONAL_OUT, personal_rows, [
    "THEME", "KK_ID", "KK_NUMBER", "SECTION_LABEL", "INTERNAL_PIX_LOCATION_ONLY",
    "SECTION_TEXT_PREVIEW", "AUDIO_SOURCE", "AUDIO_VERIFIED", "PUBLIC_READY",
    "STATUS", "NEXT_ACTION", "EVIDENCE",
])

write_tsv(HOLIDAY_OUT, holiday_rows, [
    "HOLIDAY", "THEME", "KK_ID", "KK_NUMBER", "SECTION_LABEL", "INTERNAL_PIX_LOCATION_ONLY",
    "SECTION_TEXT_PREVIEW", "AUDIO_SOURCE", "AUDIO_VERIFIED", "PUBLIC_READY",
    "STATUS", "NEXT_ACTION", "EVIDENCE",
])

write_tsv(REJECT_OUT, rejected, [
    "FILE", "TITLE_OR_LOCATION", "PIX_ID", "REJECT_REASON",
])

lt_count = len(lt_pix)
kk_count = len(all_rows)
short_lt = EXPECTED_LT_PIX - lt_count
short_min = MIN_EXPECTED_KKS - kk_count

personal_counts = Counter(r["THEME"] for r in personal_rows)
holiday_counts = Counter((r["HOLIDAY"], r["THEME"]) for r in holiday_rows)
reject_counts = Counter(r["REJECT_REASON"] for r in rejected)

summary = []
summary.append("# LT-PIX Full KK Inventory V1")
summary.append("")
summary.append(f"Expected LT-PIX count: {EXPECTED_LT_PIX}")
summary.append(f"LT-PIX found with text/lyric authority: {lt_count}")
summary.append(f"Expected minimum KKs: {MIN_EXPECTED_KKS} ({EXPECTED_LT_PIX} × {MIN_KKS_PER_LT_PIX})")
summary.append(f"Expected standard KKs: {STANDARD_EXPECTED_KKS} ({EXPECTED_LT_PIX} × {STANDARD_KKS_PER_LT_PIX})")
summary.append(f"KK rows generated: {kk_count}")
summary.append("")
summary.append("## Verdict")
if kk_count >= MIN_EXPECTED_KKS:
    summary.append("PASS: KK inventory meets or exceeds the 1,842 minimum.")
else:
    summary.append("STOP: KK inventory is short of the 1,842 minimum.")
    summary.append(f"LT-PIX shortfall vs 307: {max(0, short_lt)}")
    summary.append(f"KK shortfall vs 1,842: {max(0, short_min)}")
    summary.append("")
    summary.append("Detailed explanation:")
    summary.append("- The local repo did not expose enough LT-PIX rows with lyric/text authority.")
    summary.append("- Rows with INSTRO / IN-PIX / mK / rule/doctrine/path-only evidence were rejected.")
    summary.append("- Rows with no text/lyric authority were skipped by rule.")
    summary.append("- To reach the required count, the missing LT-PIX source catalog or lyric/text authority must be restored or connected.")
summary.append("")
summary.append("## Reports")
summary.append(f"- Full KK inventory: {ALL_OUT}")
summary.append(f"- Holiday theme inventory: {HOLIDAY_OUT}")
summary.append(f"- Personal theme inventory: {PERSONAL_OUT}")
summary.append(f"- Rejected source rows: {REJECT_OUT}")
summary.append("")
summary.append("## Personal theme counts")
for theme, count in personal_counts.most_common():
    summary.append(f"- {theme}: {count}")
summary.append("")
summary.append("## Holiday theme counts")
for (holiday, theme), count in holiday_counts.most_common():
    summary.append(f"- {holiday} / {theme}: {count}")
summary.append("")
summary.append("## Reject reason counts")
for reason, count in reject_counts.most_common():
    summary.append(f"- {reason}: {count}")

SUMMARY_OUT.write_text("\n".join(summary) + "\n", encoding="utf-8")

print("CREATED:", ALL_OUT)
print("CREATED:", HOLIDAY_OUT)
print("CREATED:", PERSONAL_OUT)
print("CREATED:", REJECT_OUT)
print("CREATED:", SUMMARY_OUT)
print("")
print("EXPECTED LT-PIX:", EXPECTED_LT_PIX)
print("LT-PIX FOUND WITH TEXT/LYRIC AUTHORITY:", lt_count)
print("EXPECTED MINIMUM KKS:", MIN_EXPECTED_KKS)
print("EXPECTED STANDARD KKS:", STANDARD_EXPECTED_KKS)
print("KK ROWS GENERATED:", kk_count)
print("")
if kk_count >= MIN_EXPECTED_KKS:
    print("PASS: KK inventory meets or exceeds 1,842 minimum.")
else:
    print("STOP: KK inventory is short.")
    print("LT-PIX SHORTFALL VS 307:", max(0, short_lt))
    print("KK SHORTFALL VS 1,842:", max(0, short_min))
print("")
print("===== TOP PERSONAL THEME COUNTS =====")
for theme, count in personal_counts.most_common(30):
    print(f"{count}\t{theme}")
print("")
print("===== TOP HOLIDAY THEME COUNTS =====")
for (holiday, theme), count in holiday_counts.most_common(30):
    print(f"{count}\t{holiday}\t{theme}")
print("")
print("===== REJECT COUNTS =====")
for reason, count in reject_counts.most_common(30):
    print(f"{count}\t{reason}")
