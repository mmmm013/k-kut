# GPMC Track Registry Migration Plan

Status: Active

Date opened:
2026-06-22

---

## Goal

Replace competing source authorities with one source authority:

GPMC Master Track Registry

---

## Locked Authority Chain

GPMC
↓
GPM Kreator
↓
II
↓
Track
↓
PIX
↓
LT-PIX
↓
KK
↓
sK

Do not introduce alternate authority chains.

---

## Authority Rules

GPMC Master Track Registry is authority.

DISCO is intake source, not permanent authority.

Supabase is operational storage, not authority.

KK inventories are derivative inventory, not authority.

sK inventories are derivative inventory, not authority.

Holiday inventories are derivative inventory, not authority.

---

## Current Scope Exclusion

Father's Day / FD is excluded from the current intake source pass.

FD is a theme / product container, not source authority.

FD history remains reported and preserved as historical theme output.

FD stays empty until called.

When called, FD unpacks eligible content from the source spine.

FD is rebuilt automatically each year from current source authority.

FD does not seed the GPMC Master Track Registry.

FD does not create authority for Track, PIX, LT-PIX, KK, or sK records.

4PE rebuilds FD and all other theme / product views from the new source spine.

Required rebuild spine:

GPMC
↓
GPM Kreator
↓
II
↓
Track
↓
PIX
↓
LT-PIX
↓
KK
↓
sK

---

## Acronym Control Rule

Known acronyms stay known.

One-off typos in known acronyms may be corrected only when the intended known acronym is obvious.

Unidentified acronyms must never be accepted as valid doctrine.

Unidentified acronyms must be stopped, questioned, or staged for formal definition before use.

Do not invent acronym meanings.

Do not introduce alternate acronym forms.

---

## Migration Order

### Pass 1

DISCO census
Supabase tracks census
PIX metadata census

### Pass 2

Create Track Registry

### Pass 3

Create II backfill

### Pass 4

Track → PIX mapping

### Pass 5

PIX → LT-PIX mapping

### Pass 6

KK repatriation

### Pass 7

sK repatriation

---

## Target Registry Fields

TRACK ID
DISCO Track ID
Track Name
Artist
Writer(s)
Publisher(s)
PRO
PRO Number
ISRC
GPM Kreator
Parent II
PIX Count
LT-PIX Count
KK Count
sK Count
Status

---

## Success Condition

Every asset resolves to:

GPMC
↓
GPM Kreator
↓
II
↓
Track
↓
PIX
↓
LT-PIX
↓
KK
↓
sK

No derivative inventory may become source authority.

