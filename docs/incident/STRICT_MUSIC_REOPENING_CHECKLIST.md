# Strict Music Reopening Checklist

No customer-facing II may return unless all fields pass for that II:

- inventory ID
- LT-PIX SSOT parent ID
- LT-PIX parent audio SHA-256
- customer audio SHA-256
- authorized music source status
- strict music gate status
- known MC-BOT/no-music SHA block status
- human customer-audio QA status
- Twinkle-at-end status
- rights status
- identity status

Any missing, false, unknown, held, or contradictory field blocks release.

Required Production KPIs:

- customer-facing IIs containing authorized music: 100%
- customer-facing IIs with LT-PIX SSOT parent: 100%
- MC-BOT/no-music public rows: 0
- unproven-music public rows: 0
- checkout rows not matching strict-music release authority: 0
- Production customer-audio canary pass before reopening: required
