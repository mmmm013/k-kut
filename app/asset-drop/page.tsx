
"use client";

import { useState } from "react";

const FOLDERS = [
  "01_MC-BOT Voice",
  "02_KLEIGH Audio",
  "03_K-KUT Candidate Audio",
  "04_Photos",
  "05_Video",
  "06_Lyrics Notes Scripts",
  "07_Artwork",
  "08_Father’s Day",
  "09_Holiday Rotation",
  "99_Archive Superseded",
];

export default function AssetDropPage() {
  const [uploadCode, setUploadCode] = useState("");
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadFiles(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Uploading...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("folder", folder);
    formData.set("note", note);
    formData.set("uploadCode", uploadCode);

    const res = await fetch("/api/asset-drop/upload", {
      method: "POST",
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setStatus(json?.error || "Upload failed.");
      setBusy(false);
      return;
    }

    setStatus(`Uploaded ${json.uploadedCount} file(s). Greg/GPM will review before anything is used.`);
    form.reset();
    setNote("");
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#09070b] px-5 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
          GPMD Asset Drop
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Upload assets for Greg/GPM review
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/70">
          Uploads land in a private Supabase inbox. Nothing is accepted, published,
          or used automatically. Greg/GPM reviews everything first.
        </p>

        <form onSubmit={uploadFiles} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-white/80">Upload code</span>
            <input
              name="uploadCode"
              type="password"
              required
              value={uploadCode}
              onChange={(e) => setUploadCode(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Enter upload code"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Folder</span>
            <select
              name="folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
            >
              {FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">What is this for?</span>
            <textarea
              name="note"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Example: Father’s Day MC-BOT cowboy dad phrase, rough take."
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Files</span>
            <input
              name="files"
              type="file"
              multiple
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
            />
          </label>

          <button
            disabled={busy}
            className="w-full rounded-2xl bg-[#FFD54F] px-5 py-4 font-black text-black transition hover:bg-white disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Upload for Greg Review"}
          </button>
        </form>

        {status && (
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold text-white/80">
            {status}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/60">
          <strong className="text-white">Rules:</strong> Upload only. Do not
          delete, rename, move, publish, approve, or edit production systems.
          Greg/GPM decides what gets used.
        </div>
      </section>
    </main>
  );
}
