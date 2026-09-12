"use client";

import { useEffect, useState } from "react";

type Item = {
  disco_track_id: string;
  track_name: string;
  album: string | null;
  artist: string | null;
  resolved: "GPMX_ORIGINAL_WAV" | null;
  wavReady: boolean;
};

type Queue = {
  items: Item[];
  total: number;
  resolved: number;
  unresolved: number;
  resolutionError?: string | null;
  error?: string;
};

export default function StlListen() {
  const [data, setData] = useState<Queue | null>(null);
  const [active, setActive] = useState<Item | null>(null);

  useEffect(() => {
    fetch("/api/admin/stl-listen/queue")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || body.error || "Inventory load failed");
        return body;
      })
      .then(setData)
      .catch((error) => setData({ items: [], total: 0, resolved: 0, unresolved: 0, error: error.message }));
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-stone-100">
      <h1 className="text-2xl font-black">GPMx FULLMIX LISTENING INVENTORY</h1>
      <p className="mt-2 text-stone-400">
        Exact current FullMix Track IDs only. Listening does not create, approve, or release a KUT.
      </p>

      {!data && <p className="mt-3">Resolving original WAV inventory…</p>}
      {data?.error && <p className="mt-3 text-red-500">Failed to load inventory: {data.error}</p>}
      {data && !data.error && (
        <p className="mt-3">
          {data.total} FullMix LT-PIX · {data.resolved} playable original WAV · exact inventory verified
        </p>
      )}
      {data?.resolutionError && <p className="mt-2 text-amber-400">Audio source unavailable: {data.resolutionError}</p>}

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="max-h-[70vh] overflow-auto">
          {data?.items.map((item) => (
            <button
              key={item.disco_track_id}
              disabled={!item.wavReady}
              onClick={() => setActive(item)}
              className="mb-2 block w-full rounded border border-stone-700 p-3 text-left disabled:cursor-not-allowed disabled:opacity-40"
            >
              <b>{item.track_name}</b>
              <br />
              <small>
                {item.artist} · {item.album} · original WAV ready
              </small>
            </button>
          ))}
        </aside>
        <section className="rounded border border-stone-700 p-5">
          {active ? (
            <>
              <h2 className="text-xl font-bold">{active.track_name}</h2>
              <p className="my-2 text-stone-400">
                {active.artist} · {active.album}
              </p>
              <audio
                controls
                autoPlay
                className="w-full"
                src={`/api/admin/stl-listen/audio/${encodeURIComponent(active.disco_track_id)}`}
              />
            </>
          ) : (
            <p>Select an original-WAV FullMix master.</p>
          )}
        </section>
      </div>
    </main>
  );
}
