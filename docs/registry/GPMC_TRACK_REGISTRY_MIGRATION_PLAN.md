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

