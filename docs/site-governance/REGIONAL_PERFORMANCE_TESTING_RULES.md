# K-KUT Regional Performance Testing Rules

## Purpose

K-KUT may run live production performance tests from multiple regions to verify global access quality.

Performance proof must be honest. A test from one Mac, one network, or one location must not be described as a true regional test.

## Core Rule

A performance test may only claim a region if the test actually runs from that region.

A local Mac test may be labeled:

- local_mac_origin
- local_desktop_origin
- owner_network_origin

It must not be labeled:

- US region proof
- Europe proof
- Asia proof
- global proof
- worldwide proof

unless regional runners actually performed those tests.

## Approved Region Labels

Approved future region labels:

- us_east
- us_west
- europe_west
- europe_central
- asia_east
- asia_south
- south_america
- africa
- oceania
- local_mac_origin

## First-Version Rule

First version may store local-origin proof only.

True regional testing may be added later using:

- regional cloud runners
- Vercel analytics
- third-party performance probes
- CI jobs with region support
- manually documented region-specific test machines

## Required Test Fields

Each performance proof record should include:

- tested_at
- region_label
- origin_description
- total_requests
- passed
- failed
- min_ms
- median_ms
- p95_ms
- p99_ms
- max_ms
- tested_urls
- tool_used
- notes

## Public Claim Rule

Allowed public/internal claim for the May 12, 2026 local test:

> K-KUT passed a 1,000-request live production performance test from the owner’s local Mac origin with 0 failed requests.

Not allowed:

> K-KUT passed 1,000 requests per region.

> K-KUT passed global performance testing.

> K-KUT has been fully region-tested worldwide.

## Hard Stops

Do not fake regional proof.

Do not rename local results as global results.

Do not claim performance coverage from regions that were not tested.

Do not run aggressive tests that could harm checkout, webhook, or production stability.

Do not include private customer data in performance reports.

## Correct Next Step

Before true regional claims, create controlled regional runners and save each region report separately.

Example future files:

- recovery-review/performance/live-1000-us-east.json
- recovery-review/performance/live-1000-us-west.json
- recovery-review/performance/live-1000-europe-west.json
- recovery-review/performance/live-1000-asia-east.json
- recovery-review/performance/live-1000-south-america.json
- recovery-review/performance/live-1000-africa.json
- recovery-review/performance/live-1000-oceania.json
