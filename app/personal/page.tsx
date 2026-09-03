import Link from "next/link";
import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";
import { personalCategoryList } from "@/lib/personalSeeds";

export const metadata = {
  title: "Personal Music Moments | K-KUT",
  description:
    "Choose a personal moment. Exact audio and payment appear only for fully released K-KUT options.",
};

export const dynamic = "force-dynamic";

const categoryGroups = [
  {
    title: "Everyday connection",
    slugs: [
      "birthday",
      "thank-you",
      "apology",
      "encouragement",
      "thinking-of-you",
      "just-because",
      "love",
      "missing-you",
    ],
  },
  {
    title: "Life events",
    slugs: [
      "wedding",
      "anniversary",
      "new-baby",
      "graduation",
      "retirement",
      "congratulations",
    ],
  },
  {
    title: "Hard moments",
    slugs: [
      "comfort",
      "sympathy",
      "grief",
      "memorial",
      "celebration-of-life",
      "get-well",
      "recovery",
      "hang-tough",
      "hope",
      "self-esteem",
    ],
  },
  {
    title: "Relationships",
    slugs: ["friendship", "best-friend", "family"],
  },
] as const;

function categoryBySlug(slug: string) {
  return personalCategoryList.find((category) => category.slug === slug);
}

export default function PersonalPage() {
  const records = loadApprovedPublicOptions("/personal");

  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Personal
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Start with the personal reason.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            Pick the closest moment below. K-KUT publishes a music player or payment button only after that exact option clears meaning, rights, audio, and delivery review.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/find"
              className="rounded-2xl bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#150b07]"
            >
              Browse 13 HUGz Cards
            </Link>
            <Link
              href="/hug"
              className="rounded-2xl border border-amber-200/30 px-5 py-3 text-center text-sm font-black text-amber-100"
            >
              Compare all offers
            </Link>
          </div>
        </header>

        <section className="mt-8">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Released personal options
          </p>
          <ApprovedPublicOptionGrid
            records={records}
            emptyTitle="No exact Personal music option has cleared the current release gate."
          />
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {categoryGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-[1.75rem] border border-amber-300/20 bg-[#251209] p-6"
            >
              <h2 className="text-2xl font-black text-amber-50">{group.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.slugs.map((slug) => {
                  const category = categoryBySlug(slug);
                  return (
                    <Link
                      key={slug}
                      href={`/personal/${slug}`}
                      className="rounded-full border border-amber-200/25 px-4 py-2 text-sm font-black text-amber-100"
                    >
                      {category?.title || slug.replaceAll("-", " ")}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
