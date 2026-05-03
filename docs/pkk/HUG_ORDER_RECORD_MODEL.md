# PKK-003B — HUG Order Record Model

Status: DRAFT

Required buyer capture:
- buyer email: required
- buyer full legal name: required
- buyer phone: optional for SMS gifts

UUID rule:
Every HUG order must have a K-KUT-generated UUID.

Stripe proves payment. K-KUT owns the HUG fulfillment object.

PKK control rule:
No HUG order is fulfillment-ready until payment, buyer email, buyer full legal name, HUG UUID, fulfillment status, and personalization path are proven.
