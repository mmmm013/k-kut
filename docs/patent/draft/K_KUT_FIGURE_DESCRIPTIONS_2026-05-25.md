# K-KUT Patent Figure Descriptions

## Figure 1 — System Architecture

A user device accesses a public K-KUT page. The page renders from source-backed assets and may receive enrichment from catalog/database services. The system includes MC-BOT guidance, audio storage, payment handoff, fulfillment services, and audit gates.

## Figure 2 — PIX to KK/KUT Flow

A source song PIX is ingested. The system identifies song sections. The sections are represented as solo KKs and contiguous KK-Kombos. Each candidate receives metadata, approval status, and commerce status.

## Figure 3 — MC-BOT Occasion Matching

A user selects or provides an occasion. MC-BOT maps the occasion to a source song and recommended KKs. The page displays recommended choices first and complete governed choices after.

## Figure 4 — Wedding Flow

The Wedding embodiment presents Forever & A Day as the full source song first. Then it presents V2 + Ch2 and V2-End as recommended KKs, followed by solo sections and contiguous combos.

## Figure 5 — State Machine

Each KUT moves through selectable, playable, buyable, and fulfilled states. Checkout is locked until exact approved audio and fulfillment readiness exist.

## Figure 6 — BIC Audit Gate

The audit checks route availability, link resolution, audio source reachability, selection links, payment redirects, and backend independence.
