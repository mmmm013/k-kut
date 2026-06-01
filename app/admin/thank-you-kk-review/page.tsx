const perfectClips = [
  {
    id: "thank-you-sec-ch1",
    label: "1. Chorus 1",
    reason: "Approved as perfect in Step 126 listening."
  },
  {
    id: "thank-you-sec-v2b",
    label: "2. Verse 2B",
    reason: "Approved as perfect in Step 126 listening."
  }
];

const refinementQueue = [
  "Outro: re-listen after softened Twinkle/end treatment.",
  "Final Chorus / Ch2: ends one line too soon; final note needs correct sustain.",
  "Bridge: great candidate, but starts one line late and cutoff must avoid upcoming build.",
  "Pre-Chorus 1: starts late, needs prior line in full, and needs about 1 second added to end.",
  "Verse 2A: not approved yet."
];

export default function ThankYouKKReviewPage() {
  return (
    <main className="min-h-screen bg-[#140d08] px-6 py-10 text-[#f5e6c8]">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d4a017]">
          Internal KKr Review
        </p>

        <h1 className="mt-4 text-4xl font-black text-[#ffd36a]">
          Perfect Thank You II Candidates
        </h1>

        <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-[#f5e6c8]/75">
          Displaying only perfect II review candidates. These use 1.35s lead
          padding and softened Twinkle/end treatment. Imperfect KKs stay in the
          refinement queue.
        </p>

        <div className="mt-8 grid gap-5">
          {perfectClips.map((clip) => {
            const audioSrc = `/kkr/ii-review/thank-you/${clip.id}-ii-pad135s-twinkle.mp3`;

            return (
              <article
                key={clip.id}
                className="rounded-2xl border border-[#d4a017]/35 bg-[#24180f] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4a017]">
                  {clip.label}
                </p>

                <h2 className="mt-2 text-xl font-black text-[#ffd36a]">
                  {clip.id}
                </h2>

                <p className="mt-2 text-sm font-bold leading-6 text-[#f5e6c8]/70">
                  {clip.reason}
                </p>

                <audio
                  className="mt-4 w-full"
                  controls
                  preload="metadata"
                  src={audioSrc}
                />

                <p className="mt-2 break-all text-xs font-bold text-[#f5e6c8]/50">
                  {audioSrc}
                </p>
              </article>
            );
          })}
        </div>

        <section className="mt-8 rounded-2xl border border-[#d4a017]/25 bg-[#160d08] p-5">
          <h2 className="text-2xl font-black text-[#ffd36a]">
            Refinement Queue
          </h2>

          <div className="mt-4 grid gap-3 text-sm font-bold leading-7 text-[#f5e6c8]/75">
            {refinementQueue.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
