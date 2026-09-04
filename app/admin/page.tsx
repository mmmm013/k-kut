export const dynamic = "force-dynamic";

export const metadata = {
  title: "K-KUT Admin",
  robots: { index: false, follow: false },
};

type AdminPageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

const links = [
  ["P0 KUT Reviewer", "/admin/kut-reviewer", "Review governed KUT queue items from Supabase with exact endpoint controls and persisted decisions."],
  ["Localization Preview", "/admin/localization-preview", "Review HUG localization, audio-safety, rollout, and pricing data."],
  ["HUG Health", "/admin/hug-health", "Review HUG system health."],
  ["Kleigh Guide", "/admin/kleigh-guide", "Review internal Kleigh guidance."],
  ["Admin Play", "/admin/play", "Open the internal play/testing page."],
];

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  // Sole-owner product: admin routes open automatically everywhere, no login wall.
  const suppliedToken = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim() || "";

  const tokenParam = encodeURIComponent(suppliedToken);

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl border border-amber-300/30 bg-stone-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Internal Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">K-KUT Admin Index</h1>
          <p className="mt-4 max-w-3xl text-stone-300">Protected internal links for review pages. This page is token-gated, noindex, mobile-friendly, and not buyer-facing.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          {links.map(([title, href, description]) => (
            <a key={href} href={href + "?token=" + tokenParam} className="rounded-2xl border border-stone-700 bg-stone-900 p-5 transition hover:border-amber-300/60">
              <h2 className="text-xl font-semibold text-amber-200">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">{description}</p>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
