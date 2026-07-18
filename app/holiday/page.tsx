import Link from "next/link";

export const metadata = {
  title: "Holiday Theme | K-KUT",
  description:
    "The K-KUT Holiday Theme is activated seasonally or on demand.",
};

export default function HolidayThemePage() {
  return (
    <main className="min-h-screen bg-[#09070B] px-5 py-12 text-white sm:px-8">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-[#8D6E63]/45 bg-[#180D08] p-7 shadow-2xl sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
          K-KUT Theme
        </p>

        <h1 className="mt-4 text-5xl font-black">Holiday</h1>

        <p className="mt-5 text-lg font-bold leading-8 text-[#D7CCC8]">
          Holiday selections are created freshly for the active season or for an approved on-demand use. No individual holiday has a permanent route, collection, inventory list, or checkout gateway.
        </p>

        <Link
          href="/browse"
          className="mt-7 inline-block rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05]"
        >
          Browse current HUGs
        </Link>
      </section>
    </main>
  );
}
