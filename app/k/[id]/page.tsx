"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import EofSignatureAudio from "@/components/EofSignatureAudio";
import { createClient } from "../../../lib/supabase/browser";

type PlayMeta = {
  id: string;
  variant: string;
  structure_tag: string;
  pix_pck_id: string;
  mime_type: string | null;
  duration_ms: number | null;
};

type PlayResponse = {
  signed_url: string;
  expires_in: number;
  meta: PlayMeta;
};

type AudioQcRow = {
  kut_id: string;
  delivered_url_or_path: string;
  audio_status: string;
  audio_content_type: string | null;
  storage_object_name: string | null;
};

function isPlayableAudioUrl(value: string | null) {
  const raw = value?.trim().toLowerCase();
  if (!raw) return false;
  if (!raw.startsWith("https://")) return false;
  if (!raw.includes("/storage/v1/object/public/tracks/")) return false;
  if (!raw.includes(".mp3")) return false;
  if (raw.includes("instro") || raw.includes("instrumental") || raw.includes("mk-products") || raw.includes("/mks/") || raw.includes("mini") || raw.endsWith(".wav")) return false;
  return true;
}

export default function KKutPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PlayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const decodedId = decodeURIComponent(id);

        const { data: qcRow, error: qcError } = await supabase
          .from("k_kut_audio_qc")
          .select("kut_id, delivered_url_or_path, audio_status, audio_content_type, storage_object_name")
          .eq("kut_id", decodedId)
          .eq("audio_status", "playable")
          .maybeSingle();

        if (qcError) {
          setError(qcError.message);
          return;
        }

        const playable = qcRow as AudioQcRow | null;
        if (playable) {
          if (!isPlayableAudioUrl(playable.delivered_url_or_path)) {
            setError("This K-KUT audio is marked playable but failed the client safety check.");
            return;
          }

          setData({
            signed_url: playable.delivered_url_or_path,
            expires_in: 0,
            meta: {
              id: playable.kut_id,
              variant: "Verified playable audio",
              structure_tag: playable.storage_object_name ?? "K-KUT",
              pix_pck_id: playable.kut_id,
              mime_type: playable.audio_content_type ?? "audio/mpeg",
              duration_ms: null,
            },
          });
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/play-k-kut`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ k_kut_id: decodedId }),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Unknown error" }));
          setError(body.error ?? `Error ${res.status}`);
          return;
        }

        const edgeData = await res.json() as PlayResponse;
        if (!edgeData.signed_url) {
          setError("Playable audio URL was not returned.");
          return;
        }

        setData(edgeData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load K-KUT");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-[#D4A017] font-bold text-lg hover:opacity-80">← K-KUT</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {loading && <div className="text-center text-[#C8A882] animate-pulse">Loading K-KUT…</div>}

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
              <p className="text-red-400 font-semibold mb-2">Unable to load K-KUT</p>
              <p className="text-sm text-[#C8A882]">{error}</p>
              <Link href="/" className="mt-4 inline-block text-[#D4A017] text-sm hover:underline">← Back to K-KUT</Link>
            </div>
          )}

          {data && (
            <div className="rounded-xl border border-[#D4A017]/30 bg-[#111] p-6 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C8A882] mb-1">K-KUT</p>
                <p className="text-xl font-bold text-[#D4A017]">{data.meta.structure_tag}</p>
                <p className="text-xs text-[#C8A882] mt-1">{data.meta.variant}</p>
              </div>

              <EofSignatureAudio src={data.signed_url} className="w-full rounded" />

              {data.expires_in > 0 && (
                <p className="text-xs text-[#C8A882]/60 text-center">Link valid for {Math.round(data.expires_in / 60)} minutes</p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-[#C8A882]">
        K-KUT is a <a href="https://gputnammusic.com" className="text-[#D4A017] hover:underline">G Putnam Music</a> invention. All rights reserved.
      </footer>
    </div>
  );
}
