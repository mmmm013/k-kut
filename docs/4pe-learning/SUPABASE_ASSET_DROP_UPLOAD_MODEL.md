
# Supabase Asset Drop Upload Model

## Locked Rule

MC uploads through a simple GPMD Asset Drop page.

Files land in Supabase Storage.

MC does not use Vercel for assets.

MC does not approve, publish, classify, or import assets.

Greg/GPM reviews everything.

## Upload State

Uploaded = received.

Received does not mean accepted.

Accepted does not mean public.

Public requires Greg approval, KKr classification, delivery materialization when needed, and BIC production audit PASS.

## Bucket

Bucket: asset-drop

Privacy: private

Default path:

pending-review/<folder>/<date>/<timestamp>-<filename>

## MC Permissions

MC may upload.

MC may describe what the file is for.

MC should not delete, rename, move, approve, publish, or edit production systems.

## Greg/GPM Role

Greg/GPM reviews, thanks MC, silently approves or rejects, classifies through KKr, and imports only approved assets.
