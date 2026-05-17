"use client";

import EofSignatureAudio from "@/components/EofSignatureAudio";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/browser";

type MKutAsset = {
  id: string;
  mk_type: string | null;
  content: string | null;
  structure_tag: string | null;
  audio_qc_status: string | null;
  audio_url: string | null;
  mp3_url: string | null;
  title: string | null;
  artist: string | null;
};

export default function MiniKutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [asset, setAsset] = useState<MKutAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMiniKut() {
      try {
        const supabase = createClient();
        const decodedId = decodeURIComponent(id);

        const { data, error } = await supabase
          .from("m_kut_assets")
          .select("id, mk_type, content, structure_tag, audio_qc_status, audio_url, mp3_url, title, artist")
          .eq("id", decodedId)
          .maybeSingle();

        if (error) {
          setError(error.message);
          return;
        }

        if (!data) {
          setError("mini-KUT not found");
          return;
        }

        const row = data as MKutAsset;

        if (row.audio_qc_status !== "pass") {
          setError(`mini-KUT is not playable yet: ${row.audio_qc_status ?? "pending"}`);
          return;
        }

        if (!row.audio_url && !row.mp3_url) {
          setError("mini-KUT has no audio URL");
          return;
        }

        setAsset(row);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load mini-KUT");
      } finally {
        setLoading(false);
      }
    }

    loadMiniKut();
  }, [id]);

  const audioSrc = asset?.audio_url ?? asset?.mp3_url ?? "";
  const title = asset?.title ?? asset?.content ?? asset?.id;
  const structure = asset?.structure_tag ?? asset?.mk_type ?? "mini-KUT";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-[#D4A017] font-bold text-lg hover:opacity-80">
          ← K-KUT
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#C8A882]">mini-KUT</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {loading && (
            <div className="text-center text-[#C8A882] animate-pulse">Loading mini-KUT…</div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
              <p className="text-red-400 font-semibold mb-2">Unable to load mini-KUT</p>
              <p className="text-sm text-[#C8A882]">{error}</p>
              <Link href="/" className="mt-4 inline-block text-[#D4A017] text-sm hover:underline">
                ← Back to K-KUT
              </Link>
            </div>
          )}

          {asset && (
            <div className="rounded-xl border border-[#C8A882]/30 bg-[#111] p-6 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C8A882] mb-1">mini-KUT</p>
                <p className="text-xl font-bold text-[#F5e6c8]">{structure}</p>
                <p className="text-sm text-[#C8A882] mt-1">
                  {title}{asset.artist ? ` · ${asset.artist}` : ""}
                </p>
              </div>

              <EofSignatureAudio src={audioSrc} className="w-full rounded" />

              <p className="text-xs text-[#C8A882]/60 text-center">Audio ready</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-[#C8A882]">
        K-KUT is a{" "}
        <a href="https://gputnammusic.com" className="text-[#D4A017] hover:underline">
          G Putnam Music
        </a>{" "}
        invention. All rights reserved.
      </footer>
    </div>
  );
}
