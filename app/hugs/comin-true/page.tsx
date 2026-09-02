import manifest from "@/data/ii-delivery-registry/comin-true-full-family-v1.json";

export const metadata = {
  title: "Comin' True — 101 Music IIs",
  description: "Exact Comin' True HUG, TUG, BUG, and Story BUG music moments for hope, determination, renewal, and moving forward.",
};

type AudioII = {
  ii_key: string;
  display_title: string;
  buyer_intent: string;
  audio_url: string;
  price_usd: string;
};

function AudioCard({ ii, product }: { ii: AudioII; product: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#151020] p-6 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-200">
        Comin&apos; True {product}
      </p>
      <h3 className="mt-3 text-2xl font-black">{ii.display_title}</h3>
      <p className="mt-3 min-h-14 text-sm font-semibold leading-6 text-white/68">{ii.buyer_intent}</p>
      <audio className="mt-5 w-full" controls controlsList="nodownload noplaybackrate" preload="metadata" src={ii.audio_url} />
      <p className="mt-6 rounded-2xl border border-violet-200/30 bg-violet-200/10 px-6 py-4 text-center font-black text-violet-100">
        Public audio preview · {product} ${ii.price_usd}
      </p>
    </article>
  );
}

function ProductSection({ id, title, description, product, items }: { id: string; title: string; description: string; product: string; items: AudioII[] }) {
  return (
    <section id={id} className="mt-14 scroll-mt-8">
      <h2 className="text-4xl font-black">{title}</h2>
      <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-white/70">{description}</p>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {items.map((ii) => <AudioCard key={ii.ii_key} ii={ii} product={product} />)}
      </div>
    </section>
  );
}

export default function CominTrueIIFamilyPage() {
  const bugByKey = new Map(manifest.bugs.map((bug) => [bug.ii_key, bug]));

  return (
    <main className="min-h-screen bg-[#09070d] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-violet-300/25 bg-[#151020] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-violet-200">Motivation · Hope · Determination · Renewal · Moving Forward</p>
          <h1 className="mt-4 text-5xl font-black leading-none sm:text-6xl">Comin&apos; True</h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-white/75">
            101 finished music IIs, each cut directly from the same full vocal recording. Choose a larger musical HUG, a meaningful lyric TUG, a compact BUG, or a three-part Story BUG.
          </p>
          <p className="mt-4 text-sm font-bold text-violet-100/75">Public audio preview · stream only · original recording unchanged · exact-price checkout links pending</p>
          <nav className="mt-7 grid gap-3 sm:grid-cols-4">
            <a className="rounded-xl bg-white/10 px-4 py-3 text-center font-black" href="#hugs">15 HUGs</a>
            <a className="rounded-xl bg-white/10 px-4 py-3 text-center font-black" href="#tugs">49 TUGs</a>
            <a className="rounded-xl bg-white/10 px-4 py-3 text-center font-black" href="#bugs">34 BUGs</a>
            <a className="rounded-xl bg-white/10 px-4 py-3 text-center font-black" href="#story-bugs">3 Story BUGs</a>
          </nav>
        </section>

        <ProductSection id="hugs" title="HUGs" description="Larger musical moments and contiguous KOMBOs for a fuller emotional message. $7.99 each." product="HUG" items={manifest.hugs} />
        <ProductSection id="tugs" title="TUGs" description="Exact meaningful lyric moments: phrases, one-liners, line pairs, line trios, hooks, idioms, twists, and metaphors. $4.99 each." product="TUG" items={manifest.tugs} />
        <ProductSection id="bugs" title="BUGs" description="Compact emotional terms and vocal sounds derived directly from the full recording. $1.99 each." product="BUG" items={manifest.bugs} />

        <section id="story-bugs" className="mt-14 scroll-mt-8">
          <h2 className="text-4xl font-black">Story BUGs</h2>
          <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-white/70">Three distinct BUG moments arranged as a short emotional progression. $2.98 per Story BUG.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {manifest.story_bugs.map((story) => (
              <article key={story.ii_key} className="rounded-3xl border border-white/10 bg-[#151020] p-6 shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-200">Comin&apos; True Story BUG</p>
                <h3 className="mt-3 text-2xl font-black">{story.display_title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/68">{story.buyer_intent}</p>
                <div className="mt-5 space-y-3">
                  {story.component_bug_keys.map((key, index) => {
                    const bug = bugByKey.get(key);
                    if (!bug) return null;
                    return (
                      <div key={key} className="rounded-2xl bg-black/25 p-3">
                        <p className="mb-2 text-sm font-black">{index + 1}. {bug.display_title}</p>
                        <audio controls controlsList="nodownload noplaybackrate" preload="metadata" src={bug.audio_url} className="w-full" />
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 rounded-2xl border border-violet-200/30 bg-violet-200/10 px-6 py-4 text-center font-black text-violet-100">Public three-part preview · Story BUG ${story.price_usd}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
