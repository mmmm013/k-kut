# Core Buyer Routes — BIC Pass

## Locked Rule

BIC-level release = production audit pass, not local build pass.

## Routes Now Governed by Reusable BIC Audit

- /romance
- /kupid
- /wedding
- /holiday
- /personal

## Release System

The default buyer-route release system is now:

data/bic-routes/routes.json
+
scripts/bic-route-production-audit.mjs
+
scripts/bic-release-route.mjs

## No More One-Off Loop

Do not create a new route-specific BIC audit script unless the route has truly special behavior.

Default route release process:

1. Update app/<route>/page.tsx.
2. Add or update route config in data/bic-routes/routes.json.
3. Run node scripts/bic-release-route.mjs /route.
4. Treat the route as released only after production BIC audit PASS.

## Audio Law

Customer-ready audio must include front padding + customer audio + back padding + Twinkle/signature end sound.

Padding and Twinkle travel together.
No raw KK customer delivery.
No INSTRO.
No mKs in public buyer flow unless ADMIN override is active.
