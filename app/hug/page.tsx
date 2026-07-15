export const metadata = {
  title: "K-KUT HUGs | G Putnam Music",
  description:
    "K-KUT HUG audio matching is under GD review before customer release.",
};

const HUG_LANES = [
  {
    title: "Personal HUGs",
    eyebrow: "Everyday moments",
    description:
      "Birthday, thank-you, apology, comfort, encouragement, friendship, family, love, and more.",
  },
  {
    title: "Holiday HUGs",
    eyebrow: "Seasonal moments",
    description:
      "Temporary calendar-event HUGs assembled only during an approved seasonal window.",
  },
  {
    title: "Romance HUGs",
    eyebrow: "Love / repair / spark",
    description:
      "Gentle affection, missing you, committed love, repair, anniversary, and private connection.",
  },
];

export default function HugPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9]">
            Send a real music moment as a private HUG link.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[#FFD54F]/45 bg-[#1A0D07] p-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
              GD audio-match review active
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Audio and checkout are held until every K-KUT is right.
            </h2>

            <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-[#D7CCC8]">
              No preview is customer-ready until its controlled LT-PIX source,
              KK identity, complete vocal start and end, emotional meaning,
              buyer-route fit, GD approval, and final delivery package all pass.
              A cut that starts or ends inside a vocal is blocked.
            </p>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-[#FFD54F]/35 bg-gradient-to-r from-[#25140D] to-[#100806] p-6 shadow-xl md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Wounded &amp; Willing™
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Real independent artists, Playing It Forward.
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D7CCC8]">
            We Kare. We Share. We Dare. Meet the artists, songwriters,
            musicians, and performers behind the music—and help one real music
            moment keep moving.
          </p>

          <a
            className="mt-5 inline-flex rounded-2xl border border-[#FFD54F]/70 px-5 py-3 text-sm font-black text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
            href="/playing-it-forward"
          >
            Meet Wounded &amp; Willing
          </a>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {HUG_LANES.map((lane) => (
            <article
              key={lane.title}
              className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-5 shadow-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                {lane.eyebrow}
              </p>

              <h2 className="mt-3 text-2xl font-black text-white">
                {lane.title}
              </h2>

              <p className="mt-3 min-h-[96px] text-sm leading-6 text-[#D7CCC8]">
                {lane.description}
              </p>

              <div className="mt-5 rounded-2xl border border-[#8D6E63]/35 bg-black/25 px-5 py-3 text-center text-sm font-black text-[#BCAAA4]">
                Matching review active
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#0F0805] p-5">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Release standard
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Meaning and audio must agree.
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-[#D7CCC8]">
            Titles and marketing labels do not prove a match. K-KUT review must
            use the actual lyric, audible expression, performance, song-section
            structure, natural vocal boundaries, source authority, and customer
            situation before an option can be heard or purchased.
          </p>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm leading-6 text-[#BCAAA4]">
          Public audio and checkout remain blocked during this corrective review.
        </footer>
      </section>
    </main>
  );
}
