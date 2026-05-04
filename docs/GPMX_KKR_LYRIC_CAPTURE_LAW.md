# GPMx KKR Lyric Capture Law

## Core Rule

KKR must capture all lyrics before extracting candidates.

KKR may not rely only on audio filenames, folders, or prior candidate artifacts.

## Required Order

1. Capture full lyric text.
2. Preserve raw lyric source.
3. Organize lyrics into legitimate sections as KKR learns.
4. Label sections when clear.
5. Extract 2-line and 3-line LineFeels / Feeling Lines.
6. Score LineFeels using the 10-point control system.
7. Only then consider audio K-KUT creation.

## Section Learning

KKR may learn and assign sections from:

- repeated lyric patterns
- chorus repetition
- verse changes
- bridge contrast
- final emotional lift
- outro/resolution language
- audio timing when available
- human review notes

## Section Labels

Use practical section labels:

- intro
- verse
- pre_chorus
- chorus
- bridge
- final_chorus
- outro
- refrain
- tag
- spoken
- unknown

## Control Rule

Official PIX song structure may be ignored for LineFeel extraction.

However, KKR must still learn and preserve useful section organization.

## Output Requirement

Each lyric capture should produce:

- pix_id
- pix_title
- source_lyric_path
- raw_lyrics
- learned_sections
- section_confidence
- review_status
- notes

## LineFeel Dependency

No LineFeel extraction is valid unless full lyric capture exists or the missing lyric source is explicitly marked.

## K-KUT Dependency

No audio K-KUT candidate is valid from lyric meaning alone.

K-KUT creation requires separate audio-cut approval.
