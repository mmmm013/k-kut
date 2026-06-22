# PIX / KK / Theme List Doctrine

Status: CURRENT DOCTRINE

## Core law

PIX metadata, KK metadata, and Theme lists are different.

PIX metadata belongs to the full source work.

KK metadata belongs only to the exact full-audio excerpt copied from the PIX.

Theme lists are lookup views that point to existing KKs.

Theme lists do not create KKs.

Theme lists do not redefine KKs.

Theme lists do not detach KKs from PIX.

## PIX list

A PIX list answers:

What is this full source work?

It may include:

- PIX ID
- internal title
- source audio
- artist / writer / rights
- full-song structure
- lyrics
- full-song themes / moods / feelings
- holiday-only restriction when applicable
- source proof
- ingestion proof

## KK list

A KK list answers:

What exact excerpt audio exists from this PIX?

It must include:

- KK ID
- KK number
- parent PIX ID
- exact audio path
- start boundary
- end boundary
- section / phrase / sound identity
- KK themes / moods / feelings for this excerpt only
- QC status
- approval status
- delivery render status
- defect history

## Theme list

A Theme list answers:

Which existing KKs fit this user-facing theme?

It must include:

- theme ID
- theme display name
- KK ID
- parent PIX ID
- exact KK audio path
- fit reason
- fit strength
- excluded-use flags
- public display label
- approval status
- delivery render status

## Critical rule

Themes do not own audio.

PIX owns source authority.

KK owns excerpt audio.

Theme lists point to KKs.

## Holiday rule

Holiday songs may only attach to their respective holiday.

Non-holiday PIX can fit multiple themes and holidays when the exact KK audio supports that use.

## Locked instruction

Produce exhaustive metadata per PIX.

Produce exhaustive metadata per KK.

Produce separate lists per theme.

Only themes, moods, feelings, and use-fit may overlap between PIX, KK, and Theme lists.

KK Kreation must use KK metadata, not broad PIX metadata.
