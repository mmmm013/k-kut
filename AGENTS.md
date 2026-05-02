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

## Current live promo
- `https://k-kut.com`
- `https://www.k-kut.com`
- Mother’s Day GPM HUG promo is live.
- Buyers can hear `Thank You — Source Preview`.
- Buyers can click `Order Mother’s Day HUG — $9.99`.

## Preferred work style
- Make small, reviewable commits.
- Explain exactly what changed.
- Do not redesign unless explicitly asked.
- Preserve owner intent over generic software defaults.
