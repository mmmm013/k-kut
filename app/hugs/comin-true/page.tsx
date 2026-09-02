import manifest from "@/data/ii-delivery-registry/comin-true-sell-now-v1.json";

export const metadata = {
  title: "Comin' True — Motivation HUGs",
  description: "Send a real Comin' True music moment for hope, determination, renewal, and chasing a dream.",
};

export default function CominTrueHugsPage() {
  return (
    <main className="min-h-screen bg-[#09070d] px-5 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-violet-300/25 bg-[#151020] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-violet-200">
            Motivation · Hope · Determination · Renewal
          </p>
          <h1 className="mt-4 text-5xl font-black leading-none text-white sm:text-6xl">
            Comin&apos; True
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-white/75">
            Send someone a real music HUG for staying patient, making room for hope,
            becoming more themselves, or starting fresh.
          </p>
          <p className="mt-4 text-sm font-bold text-violet-100/75">
            Every choice below is a distinct finished II. Private-link delivery · stream only · $4.99.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {manifest.items.map((ii) => (
            <article key={ii.ii_key} className="rounded-3xl border border-white/10 bg-[#151020] p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-200">
                Comin&apos; True Music HUG
              </p>
              <h2 className="mt-3 text-2xl font-black">{ii.display_title}</h2>
              <p className="mt-3 min-h-14 text-sm font-semibold leading-6 text-white/68">
                {ii.buyer_intent}
              </p>
              <audio
                className="mt-5 w-full"
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                preload="metadata"
                src={ii.audio_url}
              />
              <a
                className="mt-6 block rounded-2xl bg-violet-200 px-6 py-4 text-center font-black text-[#120b1b] transition hover:bg-violet-100"
                href={ii.checkout_url}
              >
                Send this HUG · ${ii.price_usd}
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
