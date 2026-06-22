import Link from "next/link";

type CI = {
  id: string;
  display_title: string;
  pix_source: string;
  feeling: string;
  audio_path: string;
  mc_bot_line: string;
};

export default function FathersDayPageView({
  title,
  subtitle,
  cis,
  prevHref,
  nextHref
}: {
  title: string;
  subtitle: string;
  cis: CI[];
  prevHref?: string;
  nextHref?: string;
}) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#FFD54F]">
            GPMx / K-KUT / Father’s Day
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">{subtitle}</p>
          <p className="mt-4 rounded-xl bg-black/25 p-3 text-sm text-white/75">
            Holiday is a lane. PIX titles stay exact. Public Father’s Day CI audio includes padding + STI/Twinkle.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-[#FFD54F]/35 bg-[#FFD54F]/10 p-5 shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-[#FFD54F]">MC-BOT Guide</p>
          <h2 className="mt-2 text-2xl font-bold">
            Choose the Father’s Day feeling first, then press play.
          </h2>
          <p className="mt-3 text-white/80">
            These are real music moments chosen by feeling. Sources alternate so each option feels distinct.
          </p>
        </section>

        <nav className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-white/15 bg-black/30 p-4">
          {prevHref ? (
            <Link className="rounded-full border border-[#FFD54F]/40 px-5 py-3 text-sm font-bold text-[#FFD54F] hover:bg-[#FFD54F] hover:text-black" href={prevHref}>
              ← Back
            </Link>
          ) : null}
          {nextHref ? (
            <Link className="rounded-full bg-[#FFD54F] px-5 py-3 text-sm font-black text-black" href={nextHref}>
              More KKs →
            </Link>
          ) : null}
        </nav>

        <section className="grid gap-4">
          {cis.map((ci) => (
            <article id={ci.id} key={ci.id} className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#FFD54F]">Father’s Day CI</p>
              <h2 className="text-2xl font-bold">{ci.display_title}</h2>
              <p className="mt-2 text-white/80">{ci.feeling}</p>
              <p className="mt-2 text-sm text-white/50">Source PIX: {ci.pix_source}</p>
              <p className="mt-3 rounded-xl bg-black/25 p-3 text-sm text-white/75">
                MC-BOT: {ci.mc_bot_line}
              </p>

              <audio className="mt-4 w-full" controls preload="none">
                <source src={ci.audio_path} />
                Your browser does not support audio playback.
              </audio>

              <a
                href={"/checkout?kk=" + encodeURIComponent(ci.id)}
                className="mt-4 inline-block rounded-full bg-[#FFD54F] px-5 py-3 font-semibold text-black"
              >
                Buy this KK
              </a>
            </article>
          ))}
        </section>

        <div className="mt-8 flex flex-wrap gap-3 rounded-2xl border border-white/15 bg-black/30 p-4">
          {prevHref ? (
            <Link className="rounded-full border border-[#FFD54F]/40 px-5 py-3 font-bold text-[#FFD54F]" href={prevHref}>
              ← Back
            </Link>
          ) : null}
          {nextHref ? (
            <Link className="rounded-full bg-[#FFD54F] px-5 py-3 font-black text-black" href={nextHref}>
              More KKs →
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
