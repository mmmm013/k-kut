# II Is a Finished Delivery Object

## Locked Rule

An II is a finished customer-ready delivery audio object.

An II is not a runtime recipe.

Every II must inherently contain:

- front padding
- selected KK audio
- back padding
- Twinkle / signature end sound

The padding and Twinkle must be baked into the saved delivery file before public use.

## Public Playback Rule

Public buyer pages must only play finished II delivery files.

Public pages must not:

- assemble padding at runtime
- append Twinkle at runtime
- call raw KK audio as if it were an II
- call raw PIX/source audio as if it were an II
- expose Supabase source-track URLs as product audio

## KK to II Conversion

A pre-made KK is inventory.

A pre-made KK becomes public customer product only after it is materialized as an II:

PIX/source audio -> selected KK -> front padding -> KK audio -> back padding -> Twinkle -> saved /ii-delivery/ file

## Required Public Path

Finished public delivery audio must live under:

/ii-delivery/

and must carry a delivery marker such as:

bookend-twinkle

## Father’s Day Application

Father’s Day candidate KKs may be selected from existing PIX/KK inventory.

They are not public IIs until the finished audio files are created with padding and Twinkle already inside the file.
