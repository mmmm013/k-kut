// Inventory membership comes from the current FullMix source list. Resolution
// annotates those members; it never removes them or authorizes KUT production.
export function buildFullMixListeningInventory<T extends { disco_track_id: string }>(
  rows: T[],
  wavSources: ReadonlyMap<string, unknown>,
  resolutionError: string | null,
  storedSources: ReadonlyMap<string, unknown> = new Map(),
  ownerAuthenticated = false,
) {
  const items = rows.map((row) => {
    const id = String(row.disco_track_id);
    const disco = wavSources.has(id);
    const stored = storedSources.has(id);
    const linked = disco || (stored && ownerAuthenticated);
    return {
      ...row,
      wavReady: linked,
      resolved: disco ? "GPMX_ORIGINAL_WAV" as const : stored && ownerAuthenticated ? "RECORDED_FULLMIX_WAV" as const : null,
      storedCopyLocated: stored,
    };
  });
  const resolved = items.filter((item) => item.wavReady).length;
  return {
    items,
    total: items.length,
    resolved,
    unresolved: items.length - resolved,
    wavReady: resolved,
    resolutionError,
    ownerAuthenticated,
    source: "current GPMx FullMix membership; WAV links resolved separately by exact Track ID",
  };
}
