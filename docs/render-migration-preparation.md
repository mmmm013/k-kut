# Render migration preparation — 2026-09-18

Status: preparation only. No Render service, charge, DNS change, registrar transfer, or Vercel cancellation has been performed. This document is not a deploy-ready certification.

## Target architecture

Keep repository mmmm013/k-kut and Supabase project vwlzubxshjjonabpeagd. Start with ONE Render Node web service for this repository, rather than one paid service per domain. Existing host-based routing supports several brands; confirm every domain's actual Vercel project before attaching it. Preserve the 324 accepted FM source inputs, exact CSV values, existing KUT boundary review, release decisions, and locked prices.

No replacement database, persistent disk, cache, or audio worker is included in this initial proposal. Audio inventories remain in Supabase/object storage. Do not render audio during migration.

## Verified source findings

- package.json: Next 15.5.22; build is npm run build, start is next start. The existing prebuild runs governance audits and scripts/check-env.mjs. Preserve those checks.
- vercel.json installs using npm install --legacy-peer-deps. Prefer npm ci --legacy-peer-deps only after confirming the committed lockfile.
- next.config.js uses normal Next server output and unoptimized images. A Node web service is the appropriate target, not a static export.
- middleware.ts accepts x-forwarded-host and host in addition to x-vercel-forwarded-host.
- scripts/check-env.mjs requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY outside Vercel. Supply the real values before building; do not impersonate Vercel to skip this check.
- app/checkout/route.ts blocks payment unless VERCEL_ENV is production. Introduce and test a provider-independent production gate before live checkout on Render. Do not set production payment flags on the preparation service.
- app/api/stripe/webhook/route.ts treats absence of VERCEL as local mode and writes fulfillment packets to local disk. Render migration must preserve durable paid-order evidence and idempotency; do not depend on ephemeral local disk.
- lib/admin/adminSession.ts currently returns true unconditionally from trustedProtectedPreview(). A public Render endpoint with production service credentials would inherit this bypass. Restore real admin authentication before a public launch; test anonymous denial and owner access.
- middleware.ts redirects 2gdp.com to https://mc-vektor.vercel.app/the-vektor. That separate app must be located and migrated if this domain is included. Moving k-kut alone does not remove this dependency.
- @vercel/analytics remains a package dependency. Locate its rendered usage before deciding whether to remove or replace it.
- Several audio scripts require ffmpeg. Check the complete prebuild path in the chosen build environment; do not remove audits to conceal missing tooling.

## Proposed configuration (NOT activated)

After code repairs and a successful full build, use a Render Blueprint resembling:

```yaml
services:
  - type: web
    name: gpmx-render-preparation
    runtime: node
    repo: https://github.com/mmmm013/k-kut
    branch: main
    plan: free
    autoDeployTrigger: off
    buildCommand: npm ci --legacy-peer-deps && npm run build
    startCommand: npm run start -- --hostname 0.0.0.0 --port $PORT
    envVars:
      - key: NODE_VERSION
        value: "22"
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: ADMIN_PREVIEW_TOKEN
        sync: false
```

This is an inert example, not a root render.yaml. Validate against Render's current Blueprint schema before use. Node 22 is a proposed baseline and must pass the full dependency/build check. No domain aliases or live Stripe secrets are included. Free compute is suitable only for evaluating compatibility, not a production capacity recommendation.

Required secret mapping from reviewed source: the two public Supabase variables above; server-only SUPABASE_SERVICE_ROLE_KEY (or existing GPMC_KUT_SUPABASE_SECRET_KEY alternative); ADMIN_PREVIEW_TOKEN. Later payment testing additionally needs the appropriate Stripe configuration, including STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET. Inventory all remaining environment-variable names from the full checkout and current Vercel configuration before deployment. Never commit secret values or copy them into this document.

## Domains to reconcile

| Domain | Preparation status |
| --- | --- |
| k-kut.com and www | Main repo target; verify live aliases |
| 13HUGz.com and www | Host-specific /hugz routing found |
| sentimeant.com and www | Host-specific routing found |
| sentimeants.com and www | Canonical redirect to sentimeant.com found |
| gputnammusic.com | Verify actual hosting project before mapping |
| i-meant.com | Verify actual hosting project before mapping |
| 2gdp.com and www | Separate mc-vektor Vercel dependency found; include only if in requested domain inventory |

Preserve MX, TXT, SPF, DKIM, DMARC and domain ownership. Changing web hosting does not require registrar transfer.

## Cost decision

The preparation proposes one service and no duplicate database. Render charges separately for workspace plan, service compute, and any usage overages (bandwidth/build minutes). Existing Supabase costs remain. A free evaluation does not establish the cost or capacity of production.

Current official docs distinguish free, 0.5c-512mb (legacy starter), and 1c-2g (legacy standard). The pricing page retrieved during this review did not expose the compute dollar amounts. No exact production monthly total is verified or authorized. Obtain the account-specific quote before purchasing; include bandwidth, build minutes, optional workers, and any separately hosted projects. Use manual deployments initially to control unnecessary builds.

## Execution sequence

1. Obtain authenticated Render access and a complete Git checkout. No paid purchase yet.
2. Repair provider-dependent checkout/fulfillment behavior and admin access; retain current product/release rules.
3. Inventory all current domains, environment variable names, scheduled jobs, storage usage, and separate projects. Map existing values securely.
4. Run npm run build including prebuild audits. Resolve failures without bypassing governance.
5. Deploy an isolated evaluation service, then verify domain-specific routing, owner authentication, anonymous denial, audio playback, inventory visibility, checkout gating, and webhook replay behavior.
6. Present the tested deployment and exact proposed recurring cost before paid activation.
7. Switch web DNS only after the replacement passes. Keep rollback targets. Retire Vercel services and address billing only after traffic and integrations have moved.

## Verification limits

This review read current repository files through GitHub and compared the setup to official Render documentation. A direct Git clone did not complete from this workspace and was stopped. No full local build, authenticated Render deployment, or runtime test was completed. Only documentation is proposed in this PR; no runtime or deployment configuration is changed.

## Official references

- https://render.com/docs/deploy-nextjs-app
- https://render.com/docs/blueprint-spec
- https://render.com/docs/compute-plans
- https://render.com/pricing
- https://render.com/articles/how-much-does-cloud-application-hosting-cost-for-small-businesses
