# K-KUT / GPEx Codex Operating Rules

## Mission
K-KUT is a G Putnam Music / GPEx invention platform for real-audio gifts and exact song-section products.

## Non-negotiable product rules
- No AI audio in final customer audio.
- No generic mKs in holiday customer flows.
- Holiday promos must use only the respective holiday source song(s).
- Mother’s Day default source is `Thank You`.
- Do not default Mother’s Day to `Believe in Love`, `Love Renews`, or any unrelated catalog track.
- Public display titles must never show artist names, raw filenames, source paths, or import prefixes.
- One K-KUT per purchase per day.
- Users may buy multiple HUGs, but each HUG must be a separate purchase.
- No downloads required for HUG recipients. Recipients open `/hug/<id>` and press play.

## Engineering rules
- Do not create Supabase clients at module load in API routes.
- Supabase clients must be created lazily inside request handlers or helper functions called by request handlers.
- Static public pages must deploy even if Supabase env vars are missing.
- Never commit `.env.local`, `.env.production.local`, `.vercel`, reports, tmp files, or generated local artifacts.
- Always run `npm run build` before any deploy-related change.
- For public promo changes, verify live HTML contains expected text after deployment.

## Foundational GPM STL source — preserve across handoffs
- Owner foundation: `GPMx STL Playlist 08-09-26.csv`. Its internal playlist title is `Shine the Light (STL) - GPM Inventory 08-06-26`.
- Exact file SHA-256: `4012cbd89703ab1b203815e555e54a4ce30a179f3d8eb435450bfe70f9625fb7`.
- Persistent source reference: `libfile_a28d4f461a8481919a12c5fc2eaa5fe9`. Read an explicitly supplied local copy directly when available; otherwise resolve this existing source before requesting another export.
- The foundation contains 523 unique Track IDs. Reconciliation on 2026-09-16 found all 324 current FullMix IDs in it, with zero missing and zero duplicate foundation IDs. The later paired FullMix/INSTRO-ONLY inventories determine current lane membership; the broader foundation does not make all 523 rows FullMix.
- Every FM/LT-PIX WAV URL is the SSOT audio source for its derived KUTs. Preserve original WAVs and identity; perform operations only on clones and retain exact source lineage. Never invent or substitute a URL.
- This CSV contains metadata and Track IDs, with no WAV URL column or HTTP links. Follow exact Track IDs to recorded WAV authority. Missing copied fields do not establish missing originals or remove inventory members.
- Do not confuse this foundation with older `GPMC/gpm_stl.csv`, `GPMC/public/assets/stl.csv`, or an assistant-generated inventory report. Do not ask the owner to explain the foundation again.

## Current live promo
- `https://k-kut.com`
- `https://www.k-kut.com`
- Memorial Day HUG promo is live.
- Buyers can hear selected audio sections.
- Buyers can click `Order Memorial Day HUG — $7.99`.
## Preferred work style
- Make small, reviewable commits.
- Explain exactly what changed.
- Do not redesign unless explicitly asked.
- Preserve owner intent over generic software defaults.
