# K-KUT Seasonal Laning Rules

## Purpose

This document controls how K-KUT separates evergreen HUG pages, holiday landing pages, active seasonal campaigns, and archives.

The goal is to prevent holiday pages, promo sets, checkout pages, audio previews, and archived pages from collapsing into one confusing public surface.

## Page Roles

### 1. Evergreen HUG Router

Path:

/hug

Role:

Permanent doorway for all HUGs.

Rules:

- Must not become a holiday campaign page.
- Must not say a specific holiday is currently active unless pointing to a separate campaign page.
- Must not contain default holiday audio.
- Must not contain stale seasonal checkout.
- Should route to Personal and Holiday.

Public job:

Choose the kind of HUG.

---

### 2. Personal HUG Index

Path:

/personal

Role:

Permanent catalog of personal, non-holiday HUG categories.

Rules:

- Must not use seasonal urgency.
- Must not contain holiday-only checkout.
- Must not expose internal production terms.
- May point to personal category pages.

Public job:

Choose a personal feeling path.

---

### 3. Holiday Catalog

Path:

/holiday

Role:

Permanent holiday catalog.

Rules:

- May list all holidays.
- Must not imply all listed holidays are currently active campaigns.
- May point to each holiday landing page.
- Must not contain direct active checkout unless clearly marked as an active campaign.

Public job:

Choose a holiday.

---

### 4. Holiday Landing Page

Example paths:

/holiday/mothers-day
/holiday/fathers-day
/holiday/thanksgiving

Role:

Permanent holiday explanation page.

Rules:

- Explains what kind of HUG fits that holiday.
- May show emotional paths.
- May point to an active campaign only when that campaign is open.
- Must not carry old checkout after the season closes.
- Must not pretend an archived campaign is still active.

Public job:

Explain the holiday HUG use case.

---

### 5. Active Campaign Page

Example paths:

/campaign/mothers-day-2027
/campaign/fathers-day-2026
/campaign/thanksgiving-2026

Role:

Temporary selling page for one season.

Rules:

- Must have a clear active season.
- Must have an open date and close date.
- May show Featured HUG Collections.
- May contain checkout.
- Must be closed or redirected when the season ends.
- Must not become the permanent holiday landing page.

Public job:

Sell this season's featured HUG collections.

---

### 6. Archive Page

Example paths:

/archive/mothers-day-2026
/hug/mothers-day, if retained as a legacy archive

Role:

Closed proof/history page.

Rules:

- Must say the public ordering flow is closed.
- Must not contain active checkout.
- Must not contain misleading current-season language.
- Must not autoplay or default to stale holiday audio.
- May preserve proof of the flow.

Public job:

Show that the season existed and is now closed.

## Seasonal Statuses

Every holiday campaign must be one of these:

1. Dormant
2. Planning
3. Preview
4. Active
5. Archived

### Dormant

The holiday page exists, but no campaign is open.

### Planning

Internal preparation only. No public checkout.

### Preview

Public page may say the season is coming.

### Active

Campaign page is live. Checkout may be available.

### Archived

Campaign is closed. Checkout must be removed or disabled.

## Promo / Collection Naming

Internal term:

promo set

Public term:

Featured HUG Collection

Public pages should not say "promo set" unless referring to a true discount or marketing campaign.

## Featured HUG Collection Rules

Each collection should have:

- public title
- one-sentence emotional promise
- 3 to 5 HUG options
- season status
- checkout link only if active
- no internal production terms

Example public titles:

- Gentle Gratitude
- You Were There
- Love That Stayed
- Birthday Lift
- Hard Words, Soft Delivery
- For Mom
- For Dad
- Still With Me

## Hard Rule

No page may be both evergreen and seasonal-active.

Evergreen pages route.
Holiday pages explain.
Campaign pages sell.
Archive pages preserve.

Do not combine those jobs.
