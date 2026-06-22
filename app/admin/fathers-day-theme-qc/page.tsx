const REVIEW_THEMES = [
  {
    id: "thanks-dad",
    heading: "Father’s Day — Thanks Dad",
    note: "Gratitude, guidance, support, respect.",
    options: [
      {
        publicLabel: "Father’s Day — Thanks Dad — Option 1",
        backendRef: "KK-THANK-YOU-S01 / thank-you-sec-v1a",
        sourceStatus: "existing Thank You gratitude candidate",
        qcStatus: "NEEDS_GREGORY_LISTEN_APPROVAL",
        audioUrl: "/hug-delivery/thank-you/thank-you-sec-v1a-ii-delivery.mp3",
      },
      {
        publicLabel: "Father’s Day — Thanks Dad — Option 2",
        backendRef: "KK-THANK-YOU-S04 / thank-you-sec-ch1",
        sourceStatus: "existing Thank You gratitude candidate",
        qcStatus: "NEEDS_GREGORY_LISTEN_APPROVAL",
        audioUrl: "/hug-delivery/thank-you/thank-you-sec-ch1-ii-delivery.mp3",
      },
      {
        publicLabel: "Father’s Day — Thanks Dad — Option 3",
        backendRef: "KK-THANK-YOU-S09 / thank-you-sec-outro",
        sourceStatus: "existing Thank You gratitude candidate",
        qcStatus: "NEEDS_GREGORY_LISTEN_APPROVAL",
        audioUrl: "/hug-delivery/thank-you/thank-you-sec-outro-ii-delivery.mp3",
      },
    ],
  },
  {
    id: "missing-dad",
    heading: "Father’s Day — Missing Dad",
    note: "Memory, distance, grief, remembrance.",
    options: [
      {
        publicLabel: "Father’s Day — Missing Dad — Option 1",
        backendRef: "KK-THANK-YOU-S05 / thank-you-sec-v2a",
        sourceStatus: "existing Thank You gratitude candidate",
        qcStatus: "NEEDS_GREGORY_LISTEN_APPROVAL",
        audioUrl: "/hug-delivery/thank-you/thank-you-sec-v2a-ii-delivery.mp3",
      },
    ],
  },
  {
    id: "strong-steady-dad",
    heading: "Father’s Day — Strong / Steady Dad",
    note: "Strength, backbone, support, legacy.",
    options: [
      {
        publicLabel: "Father’s Day — Strong / Steady Dad — Option 1",
        backendRef: "KK-THANK-YOU-S07 / thank-you-sec-br",
        sourceStatus: "existing Thank You gratitude candidate",
        qcStatus: "NEEDS_GREGORY_LISTEN_APPROVAL",
        audioUrl: "/hug-delivery/thank-you/thank-you-sec-br-ii-delivery.mp3",
      },
    ],
  },
  {
    id: "cowboy-western-dad",
    heading: "Father’s Day — Cowboy / Western Dad",
    note: "Western backbone, rugged warmth, country feel.",
    options: [],
  },
  {
    id: "proud-respect-dad",
    heading: "Father’s Day — Proud / Respect",
    note: "Respect, pride, admiration, recognition.",
    options: [],
  },
  {
    id: "repair-complicated-dad",
    heading: "Father’s Day — Repair / Complicated Dad",
    note: "Careful lane. No public option until exact QC approval.",
    options: [],
  },
];

export default function FathersDayThemeQcPage() {
  return (
    <main className="min-h-screen bg-[#08090b] px-5 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-[#111] p-6">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Admin QC Only
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Father’s Day Theme QC Listening
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-6 text-white/70">
            This page is for Gregory’s human listen review. It is theme-first,
            not title-first. It does not approve, sell, rebuild, re-extract, or
            run KKr. No checkout appears here.
          </p>

          <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-950/20 p-4 text-sm font-bold leading-6 text-red-100">
            Current sales gate: no Father’s Day HUG option is sellable until
            Gregory marks an exact option approved after listening.
          </div>
        </header>

        <div className="mt-8 grid gap-6">
          {REVIEW_THEMES.map((theme) => (
            <section
              key={theme.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
            >
              <h2 className="text-2xl font-black">{theme.heading}</h2>

              <p className="mt-2 text-sm leading-6 text-white/62">
                {theme.note}
              </p>

              {theme.options.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-[#FFD54F]/20 bg-[#171105] p-4 text-sm font-bold text-[#FFD54F]">
                  NO APPROVED AUDIO IN THIS THEME QC SLOT YET.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {theme.options.map((option) => (
                    <article
                      key={option.publicLabel}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4"
                    >
                      <h3 className="text-lg font-black">
                        {option.publicLabel}
                      </h3>

                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
                        {option.qcStatus}
                      </p>

                      <audio
                        className="mt-4 w-full"
                        controls
                        preload="metadata"
                        src={option.audioUrl}
                      />

                      <dl className="mt-4 space-y-2 text-xs leading-5 text-white/55">
                        <div>
                          <dt className="font-black text-white/75">
                            Backend ref
                          </dt>
                          <dd>{option.backendRef}</dd>
                        </div>

                        <div>
                          <dt className="font-black text-white/75">
                            Source status
                          </dt>
                          <dd>{option.sourceStatus}</dd>
                        </div>

                        <div>
                          <dt className="font-black text-white/75">
                            Audio URL
                          </dt>
                          <dd className="break-all">{option.audioUrl}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-white/60">
          Display rule: theme-first option naming for review. Backend refs are
          shown only for admin QC. No public buyer checkout from this page.
        </footer>
      </section>
    </main>
  );
}
