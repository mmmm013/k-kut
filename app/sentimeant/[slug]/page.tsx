import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSentimeantStory,
  sentimeantStrictKkPool,
} from "@/lib/sentimeantStrictKkPool";

export function generateStaticParams() {
  return sentimeantStrictKkPool.map((item) => ({ slug: item.slug }));
}

export default async function SentimeantStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getSentimeantStory(slug);

  if (!story) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]">
            Sent-i-Meants · Musical KK preview
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            {story.headline}
          </h1>
          <p className="mt-4 text-lg font-bold leading-8 text-[#EFEBE9]">
            {story.text}
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-[#8D6E63]/45 bg-[#120A06] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
            Hear the music
          </p>
          <audio
            className="mt-5 w-full"
            controls
            preload="metadata"
            src={story.audioUrl}
          />
          <p className="mt-5 text-sm font-bold leading-7 text-[#D7CCC8]">
            This temporary preview is a strict-music-gate KK with the canonical
            GPMx Twinkle at the end. It is not an MC-BOT script.
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5">
          <p className="text-sm font-bold leading-7 text-[#BCAAA4]">
            Purchase and delivery are temporarily closed while checkout receives
            its separate end-to-end proof.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-2xl border border-[#FFD54F]/70 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#FFD54F]"
          >
            Back to all 13 stories
          </Link>
        </section>
      </section>
    </main>
  );
}
