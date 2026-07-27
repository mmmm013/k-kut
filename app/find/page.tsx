import Link from "next/link";
import PublicIiBrowser from "@/components/PublicIiBrowser";

export const metadata = {
  title: "MC-BOT Music Match | K-KUT",
  description:
    "Tell MC-BOT what you need the music moment to do, listen to released K-KUTs, and choose the exact fit.",
};

export const dynamic = "force-dynamic";

type FindPageProps = {
  searchParams: Promise<{
    moment?: string | string[];
  }>;
};

export default async function FindPage({ searchParams }: FindPageProps) {
  const params = await searchParams;
  const moment = Array.isArray(params.moment)
    ? params.moment[0] || ""
    : params.moment || "";

  return (
    <main className="min-h-screen bg-[#1A120B] px-5 py-10 text-[#F5E6C8] sm:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
                MC-BOT music guide
              </p>

              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
                What do you need this music moment to do?
              </h1>

              <p className="mt-6 max-w-3xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
                Choose the human need first. MC-BOT narrows the released catalog using only available evidence. You hear the results and decide what truly fits.
              </p>
            </div>

            <Link
              href="/browse"
              className="rounded-2xl border border-[#FFD36A]/65 px-5 py-3 text-sm font-black text-[#FFD36A] transition hover:bg-[#FFD36A] hover:text-[#160D08]"
            >
              Browse everything
            </Link>
          </div>

          <div className="mt-7 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A017]">
              MC-BOT promise
            </p>
            <p className="mt-2 max-w-4xl text-sm font-bold leading-7 text-[#F5E6C8]/75">
              MC-BOT will not invent a title, meaning, relationship, or emotional claim. When the current metadata cannot prove a narrow match, MC-BOT abstains and lets you browse and listen directly.
            </p>
          </div>
        </header>

        <PublicIiBrowser initialMoment={moment} />
      </section>
    </main>
  );
}
