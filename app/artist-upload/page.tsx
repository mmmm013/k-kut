"use client";

import { useState } from "react";

const ARTIST_UPLOAD_FOLDER = "4PE_ARTIST_UPLOADS_PENDING_REVIEW";

export default function ArtistUploadPage() {
  const [uploadCode, setUploadCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadFiles(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Uploading to private 4PE Intake...");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const intakeNote = [
      `4PE Artist Upload`,
      `Uploader first name: ${firstName}`,
      `Uploader email: ${email}`,
      `Track title / working title: ${trackTitle}`,
      `Notes: ${notes || "—"}`,
      `Rule: Upload means received only. Not accepted. Not public. Not PIX/KK/II/DP approved.`,
    ].join("\n");

    formData.set("folder", ARTIST_UPLOAD_FOLDER);
    formData.set("note", intakeNote);
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

    setStatus(
      `Upload received successfully. Thank you. ${json.uploadedCount} file(s) entered private 4PE Intake Pending Review. Nothing is public, accepted, or approved yet. Greg/GPM will review next.`
    );

    form.reset();
    setFirstName("");
    setEmail("");
    setTrackTitle("");
    setNotes("");
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#09070b] px-5 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
          G Putnam Music · Private 4PE Intake
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Artist WAV Upload
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/70">
          Upload WAV, AIFF, FLAC, or ZIP files here. MP3/M4A may be included only
          as reference. Nothing uploaded here becomes public. Nothing uploaded
          here is approved for K-KUT until Greg/GPM reviews it through 4PE Intake.
        </p>

        <form onSubmit={uploadFiles} className="mt-8 space-y-5">
          <input type="hidden" name="folder" value={ARTIST_UPLOAD_FOLDER} />

          <label className="block">
            <span className="text-sm font-bold text-white/80">Upload code</span>
            <input
              name="uploadCode"
              type="password"
              required
              value={uploadCode}
              onChange={(e) => setUploadCode(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Enter private upload code"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">First name</span>
            <input
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Example: Michael"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Email</span>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">
              Track title / working title
            </span>
            <input
              name="trackTitle"
              type="text"
              required
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Example: Brave"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Notes</span>
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Version notes, source notes, vocalist notes, rough/final note, or anything Greg should know."
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Files</span>
            <input
              name="files"
              type="file"
              multiple
              required
              accept=".wav,.aif,.aiff,.flac,.zip,.mp3,.m4a,audio/*,application/zip"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
            />
          </label>

          <button
            disabled={busy}
            className="w-full rounded-2xl bg-[#FFD54F] px-5 py-4 font-black text-black transition hover:bg-white disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Upload to 4PE Intake"}
          </button>
        </form>

        {status && (
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold text-white/80">
            {status}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/60">
          <strong className="text-white">Rules:</strong> Upload means received
          only. It does not create a PIX, K-KUT, KK, NakedKK, sK, mK, II, DP, or
          public approval. Greg/GPM reviews first.
        </div>
      </section>
    </main>
  );
}
