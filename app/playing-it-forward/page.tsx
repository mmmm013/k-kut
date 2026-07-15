export const metadata = {
  title: "Playing It Forward | Wounded & Willing | K-KUT",
  description:
    "Meet Wounded & Willing: independent artists, songwriters, musicians, and performers sharing real music moments through K-KUT.",
};

const PRINCIPLES = [
  {
    title: "We Kare.",
    description:
      "We use real music to recognize hurt, gratitude, hope, repair, love, and the things people struggle to say.",
  },
  {
    title: "We Share.",
    description:
      "We turn finished, governed music moments into HUGs and TUGs people can listen to, send, and remember.",
  },
  {
    title: "We Dare.",
    description:
      "We dare other independent artists and listeners to keep showing up, keep creating, and keep Playing It Forward.",
  },
];

export default function PlayingItForwardPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music presents
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
            Wounded &amp; Willing™
          </h1>

          <p className="mt-5 max-w-4xl text-2xl font-black leading-tight text-[#FFF8E1] md:text-4xl">
            Real independent artists. Real songs. Real lives.
          </p>

          <p className="mt-5 text-3xl font-black text-[#FFD54F] md:text-5xl">
            Playing It Forward.
          </p>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-[#EFEBE9]">
            We are independent artists, songwriters, musicians, and performers
            who have spent years working neighborhoods, churches, local events,
            Friday nights, and every room where people would listen.
          </p>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#D7CCC8]">
            We know wounds. We know many people have it worse. We keep showing
            up anyway—with music, kindness, courage, and something real to
            share.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#160A05] transition hover:bg-white"
              href="/hug"
            >
              Hear and send a HUG
            </a>

            <a
              className="rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
              href="/find"
            >
              Find a music moment
            </a>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <article
              key={principle.title}
              className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6 shadow-xl"
            >
              <h2 className="text-3xl font-black text-[#FFD54F]">
                {principle.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#D7CCC8]">
                {principle.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#0F0805] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-black">
            One music moment can keep moving.
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-black/25 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD54F]">
                1 · Artists create
              </p>
              <p className="mt-3 text-sm leading-6 text-[#D7CCC8]">
                A finished KK or KK-KOMBO becomes a governed iMeant with exact
                source, rights, audio, and delivery proof.
              </p>
            </div>

            <div className="rounded-2xl bg-black/25 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD54F]">
                2 · People connect
              </p>
              <p className="mt-3 text-sm leading-6 text-[#D7CCC8]">
                The iMeant is offered through K-KUT as a HUG or TUG for a real
                human moment.
              </p>
            </div>

            <div className="rounded-2xl bg-black/25 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD54F]">
                3 · Music moves forward
              </p>
              <p className="mt-3 text-sm leading-6 text-[#D7CCC8]">
                Listening, sending, sharing, and buying help independent music
                reach the next person and support the next release.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#FFD54F]/30 bg-gradient-to-r from-[#24130C] to-[#100806] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            First releases
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Fresh KKs and KK-KOMBOs are entering the release gate.
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D7CCC8]">
            Only finished, approved, rights-cleared delivery audio appears here.
            Each final iMeant keeps its exact parent-song, writer, performer,
            rights, boundary, and delivery lineage behind the scenes.
          </p>

          <a
            className="mt-6 inline-flex rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#160A05] transition hover:bg-white"
            href="/hug"
          >
            Start Playing It Forward
          </a>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm leading-6 text-[#BCAAA4]">
          Wounded &amp; Willing™ is a G Putnam Music independent-artist
          initiative. Playing It Forward is the continuing invitation: hear
          something real, share something meaningful, and help music keep
          moving.
        </footer>
      </section>
    </main>
  );
}
