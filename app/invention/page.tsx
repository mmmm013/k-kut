export const metadata = {
  title: "K-KUT Invention | New Digital Historic HUGs",
  description:
    "K-KUT turns real song sections into sendable emotional HUGs.",
};

export default function InventionPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto max-w-3xl space-y-7">
        <p className="text-sm uppercase tracking-[0.25em]">
          K-KUT Invention
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          New. Digital. Historic HUGs.
        </h1>

        <p className="text-2xl font-semibold">
          Send feeling musically.
        </p>

        <p className="text-lg leading-8">
          K-KUT turns real song sections into sendable emotional HUGs.
        </p>

        <p className="leading-7">
          A K-KUT HUG is a new kind of digital music greeting: a real song
          section selected for a feeling, prepared for delivery, and shared as
          an emotional music moment.
        </p>

        <p className="leading-7">
          The public K-KUT experience focuses on real audio, clear emotional
          paths, and simple HUG delivery. Additional invention, patent, and
          backend details are maintained privately for legal and partner review.
        </p>

        <a
          href="/find"
          className="inline-flex rounded-full px-6 py-3 font-semibold border"
        >
          Find a HUG
        </a>
      </section>
    </main>
  );
}
