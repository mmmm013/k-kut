const clips = [
  {
    id: "thank-you-sec-outro",
    label: "1. Outro / Final Landing",
    review_reason: "Start here because endings often carry the cleanest HUG landing."
  },
  {
    id: "thank-you-sec-ch2",
    label: "2. Final Chorus",
    review_reason: "Likely strongest full-feeling chorus option."
  },
  {
    id: "thank-you-sec-br",
    label: "3. Bridge",
    review_reason: "Check for emotional turn, lift, or deeper gratitude."
  },
  {
    id: "thank-you-sec-v1a",
    label: "4. Verse 1A",
    review_reason: "Return to the opening thought after hearing the final landing."
  },
  {
    id: "thank-you-sec-v1b",
    label: "5. Verse 1B",
    review_reason: "Continue early meaning; check recipient language."
  },
  {
    id: "thank-you-sec-prech1",
    label: "6. Pre-Chorus 1",
    review_reason: "Check whether it sets up gratitude/support without wrong-language."
  },
  {
    id: "thank-you-sec-ch1",
    label: "7. Chorus 1",
    review_reason: "Compare first chorus against final chorus."
  },
  {
    id: "thank-you-sec-v2a",
    label: "8. Verse 2A",
    review_reason: "Check later verse for father/father-figure fit."
  },
  {
    id: "thank-you-sec-v2b",
    label: "9. Verse 2B",
    review_reason: "Complete later verse review."
  }
];

export default function ThankYouKKReviewPage() {
  return (
    <main className="min-h-screen bg-[#140d08] px-6 py-10 text-[#f5e6c8]">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d4a017]">
          Internal KKr Review
        </p>

        <h1 className="mt-4 text-4xl font-black text-[#ffd36a]">
          Thank You KK Review
        </h1>

        <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-[#f5e6c8]/75">
          Default review order starts with the final landing first: Outro,
          Final Chorus, Bridge, then earlier verses. Source family is Thank You. This page plays II review renders with lead padding and Twinkle/end treatment, not raw micro-captures.
          Prior Mother’s Day campaign use does not make these Mother’s-Day-only.
        </p>

        <div className="mt-8 grid gap-5">
          {clips.map((clip) => (
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
                {clip.review_reason}
              </p>

              <audio
                className="mt-4 w-full"
                controls
                preload="metadata"
                src={`/kkr/ii-review/thank-you/${clip.id}-ii-pad1s-twinkle.mp3`}
              />

              <div className="mt-4 rounded-xl border border-[#d4a017]/20 bg-[#160d08] p-4 text-sm font-bold leading-7 text-[#f5e6c8]/75">
                <p>Wrong-language: yes / no</p>
                <p>Father usable: yes / no / maybe</p>
                <p>Sentiment: gratitude / support / respect / guidance / legacy / love</p>
                <p>Lands: soft / warm / deep / strong / emotional / wrong fit</p>
                <p>Notes:</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
