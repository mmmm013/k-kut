import Link from "next/link";
import { personalCategoryList } from "@/lib/personalSeeds";

const featuredPromos = [
  {
    slug: "birthday",
    label: "Viral promo",
    title: "Birthday HUG",
    line: "Send a real birthday song moment. Hear it first, then send it privately.",
    href: "/personal/birthday",
    cta: "Hear Birthday HUGs",
    proof: "Audio-backed: Best Birthday",
  },
  {
    slug: "apology",
    label: "Viral promo",
    title: "I’m Sorry HUG",
    line: "When a text is not enough, choose a careful music moment for repair.",
    href: "/personal/apology?intent=im-sorry",
    cta: "Hear Apology HUGs",
    proof: "Native apology KUT path",
  },
  {
    slug: "wedding",
    label: "Mid-range promo",
    title: "Wedding Track Pack",
    line: "A reviewed wedding song package built around Forever & A Day.",
    href: "/personal/wedding",
    cta: "Open Wedding Pack",
    proof: "Dedicated wedding package",
  },
  {
    slug: "anniversary",
    label: "Viral to mid-range",
    title: "Anniversary HUG",
    line: "Mark another year with a private song moment that remembers why it matters.",
    href: "/personal/anniversary",
    cta: "Hear Anniversary HUGs",
    proof: "Audio-backed: Awesome Anniversary",
  },
  {
    slug: "romance",
    label: "New invention",
    title: "Kupid",
    line: "Pick the romance level. A signed audio excerpt, chosen for exactly this moment.",
    href: "/kupid",
    cta: "Pick a Level",
    proof: "Signed · Traceable · Permanent",
  },
];

const PERSONAL_READY_HUGS = [
  {
    label: "Personal Warmth",
    title: "A Love Like That",
    description:
      "A warm personal HUG for love, care, thanks, support, or a simple human moment.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "",
  },
  {
    label: "Romance / Physical Spark",
    title: "Your Heart Poundin'",
    description:
      "A bold personal romance HUG for desire, passion, and private intimate energy.",
    audioUrl:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    checkoutUrl: "",
  },
];

const promoGroups = [
  {
    title: "Core personal HUGs",
    items: ["birthday", "thank-you", "apology", "encouragement", "thinking-of-you", "just-because", "love", "missing-you"],
  },
  {
    title: "Life events",
    items: ["wedding", "anniversary", "new-baby", "graduation", "retirement", "congratulations"],
  },
  {
    title: "Hard moments",
    items: ["comfort", "sympathy", "grief", "memorial", "celebration-of-life", "get-well", "recovery", "hang-tough", "hope", "self-esteem"],
  },
  {
    title: "Relationships",
    items: ["friendship", "best-friend", "family"],
  },
];

function categoryBySlug(slug: string) {
  return personalCategoryList.find((category) => category.slug === slug);
}

export default function PersonalPage() {
  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Personal HUGs
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Send a feeling, not just a message.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            K-KUT HUGs turn real song moments into private music gifts for birthdays,
            apologies, anniversaries, weddings, comfort, thanks, encouragement, and
            the moments words do not carry.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/personal/birthday"
              className="rounded-2xl bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#150b07] transition hover:bg-amber-100"
            >
              Hear Birthday HUGs
            </Link>
            <Link
              href="/find"
              className="rounded-2xl border border-amber-200/30 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              Find the right HUG with MC-BOT
            </Link>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Featured audio-backed promos
              </p>
              <h2 className="mt-2 text-3xl font-black">Hear it first. Then choose.</h2>
            </div>
            <Link
              href="/hug"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              HUG overview
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPromos.map((promo) => (
              <div
                key={promo.slug}
                className="rounded-[1.5rem] border border-amber-300/25 bg-[#2a160c] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">
                  {promo.label}
                </p>
                <h3 className="mt-2 text-2xl font-black text-amber-50">{promo.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/75">{promo.line}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-amber-200/80">
                  {promo.proof}
                </p>
                <Link
                  href={promo.href}
                  className="mt-5 block rounded-2xl bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#150b07] transition hover:bg-amber-100"
                >
                  {promo.cta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            {PERSONAL_READY_HUGS.map((hug) => (
              <article
                key={hug.label}
                className="rounded-[1.75rem] border border-amber-300/20 bg-[#251209] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">
                  {hug.label}
                </p>

                <h2 className="mt-3 text-2xl font-black text-amber-50">
                  {hug.title}
                </h2>

                <p className="mt-3 min-h-[78px] text-sm font-bold leading-6 text-amber-50/70">
                  {hug.description}
                </p>

                <audio
                  className="mt-5 w-full"
                  controls
                  preload="metadata"
                  src={hug.audioUrl}
                />

                <p className="mt-5 rounded-2xl border border-amber-200/30 px-5 py-3 text-center text-sm font-black text-amber-100">
                  Preview available · checkout closed
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            KFS / Awesome Squad accordances
          </p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-3xl font-black">Kids and family-safe singalong HUGs stay in their own lane.</h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                Awesome Squad and KFS songs belong with kids birthday, classroom, family,
                encouragement, and singalong uses. Keep them distinct from adult apology,
                romance, grief, and memorial lanes.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-[#251209] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Public home</p>
              <p className="mt-2 text-xl font-black">thesingalongs.com</p>
              <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
                Cross-link from K-KUT only when child/family context is explicit.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Promo universe
          </p>
          <h2 className="mt-2 text-3xl font-black">We cover the reasons people buy cards. Music makes them personal.</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {promoGroups.map((group) => (
              <div key={group.title} className="rounded-[1.5rem] border border-amber-300/20 bg-[#251209] p-5 shadow-xl">
                <h3 className="text-2xl font-black text-amber-50">{group.title}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {group.items.map((slug) => {
                    const category = categoryBySlug(slug);
                    if (!category) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/personal/${slug}`}
                        className="rounded-2xl border border-amber-300/15 bg-black/20 p-4 transition hover:border-amber-200/40 hover:bg-white/10"
                      >
                        <span className="block text-base font-black text-amber-50">{category.title}</span>
                        <span className="mt-1 block text-sm font-bold leading-6 text-amber-50/65">{category.line}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Working doctrine
          </p>
          <p className="mt-3 text-xl font-black leading-8">
            Occasion helps users enter. Feeling helps users choose. Music helps users send.
          </p>
        </section>
      </section>
    </main>
  );
}
