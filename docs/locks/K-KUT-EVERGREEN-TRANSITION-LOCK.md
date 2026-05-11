# K-KUT Evergreen Transition Lock

Status: transition from temporary Mother’s Day campaign back to evergreen K-KUT buyer flow.

Known commits:
- db437ee Point homepage CTA to find guide
- 954ba08 Add Mother’s Day urgency to K-KUT homepage

Homepage lock:
- Standard evergreen homepage.
- No Mother’s Day urgency on homepage.
- Main message: Send feeling through music.
- CTA: Find the right words.

Primary buyer paths:
- /find
- /som
- /personal
- /holiday

Applied SOM routing correction:
- Send warmth -> /personal/thank-you
- Send support -> /personal/encouragement
- Send repair -> /personal/apology
- Main CTA -> /personal
- Main CTA copy -> Start with Personal HUGs

Mother’s Day lock:
- Preserve Mother’s Day pages and assets.
- Mother’s Day may live under holiday/seasonal paths.
- Mother’s Day must not remain default evergreen buyer route.

Pre-commit checks:
- No “Mother’s Day is tomorrow” on app/page.tsx.
- No “Send Mom” on app/page.tsx.
- No “Send a Mother’s Day HUG” on app/page.tsx.
- No /som default routing to /hug/mothers-day.
- npm run build passes.

Rule: do not rely on chat memory for this transition. Preserve status in repo files and commits.
