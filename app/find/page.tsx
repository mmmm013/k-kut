import Link from "next/link";
import HugzCardGrid from "@/components/HugzCardGrid";
import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadAllApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export const metadata = {
  title: "Find a Music Moment | K-KUT",
  description: "Find music for your message across available HUGs, TUGs, and BUGs.",
};

export default async function FindPage({ searchParams }: {
  searchParams: Promise<{ mode?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requestedMode = typeof params.mode === "string" ? params.mode.toUpperCase() : "";
  const mode = ["HUG", "TUG", "BUG"].includes(requestedMode) ? requestedMode : "";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  // Search display metadata only. Selection and checkout retain exact II IDs.
  const records = loadAllApprovedPublicOptions()
    .filter(record => !mode || record.product_family === mode)
    .filter(record => {
      const text = `${record.display_title} ${record.interpretation_summary} ${record.intent_lane}`.toLocaleLowerCase();
      return words.every(word => text.includes(word));
    })
    .sort((a, b) => a.source_pix_id_or_track_id.localeCompare(b.source_pix_id_or_track_id)
      || a.kk_id_or_delivery_object_id.localeCompare(b.kk_id_or_delivery_object_id));

  return (
    <main className="min-h-screen bg-[#1A120B] px-5 py-10 text-[#F5E6C8] sm:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <h1 className="text-4xl font-black text-[#FFD36A] sm:text-6xl">What would you like to say?</h1>
          <p className="mt-5 text-lg">Search the available music by feeling or lyric. Listen before choosing.</p>
          <form action="/find" method="get" className="mt-6 flex flex-wrap items-end gap-4">
            <label className="flex flex-1 flex-col gap-2 font-bold">
              Your message
              <input name="q" defaultValue={query} maxLength={200} placeholder="Try thank you or missing you" className="min-h-12 rounded-xl border border-[#FFD36A]/50 bg-black/30 px-4 text-white" />
            </label>
            <label className="flex flex-col gap-2 font-bold">
              Music gift
              <select name="mode" defaultValue={mode.toLowerCase()} className="min-h-12 rounded-xl border border-[#FFD36A]/50 bg-[#24180F] px-4 text-white">
                <option value="">All music gifts</option>
                <option value="hug">HUG</option>
                <option value="tug">TUG</option>
                <option value="bug">BUG</option>
              </select>
            </label>
            <button type="submit" className="min-h-12 rounded-xl bg-[#FFD36A] px-6 font-black text-black">Find music</button>
          </form>
          <Link href="/find" className="mt-4 inline-block underline">Clear filters</Link>
        </header>
        <ApprovedPublicOptionGrid records={records} emptyTitle="No available music matches this selection yet. Try another search or explore the themes below." />
        <h2 className="text-3xl font-black">Explore by feeling or occasion</h2>
        <HugzCardGrid />
      </section>
    </main>
  );
}
