# K-KUT Operational BIC Performance Rules

Current target gate:
- LCP at or below 2.5s.
- INP at or below 200ms.
- CLS at or below 0.1.
- Evaluate at the 75th percentile across mobile and desktop.

Implementation rules:
- Do not preload all audio.
- Load selected audio only after user tap.
- Reserve fixed visual space for audio controls.
- Keep one active decision on screen at a time.
- Keep the visual step map visible at every step.
- Hide checkout until checkout is actually open.
- Use "tracks" for PIX and "kuts" for all other customer-facing receipts and customer communications.
