const functionPoints = [
  "Landing page loads",
  "BB-BOT message appears",
  "Play BB-BOT voice button appears",
  "BB-BOT voice files exist",
  "Step 1 family cards work",
  "Step 2 HUG-kind cards work",
  "Step 3 song buttons work",
  "Mother’s Day Start HUG link opens /hug/mothers-day",
  "Mother’s Day wizard loads",
  "Start button works",
  "Feeling buttons work",
  "Text field works",
  "HUG options appear",
  "Play demo works",
  "Choose this HUG works",
  "Checkout opens Stripe",
];

export default function HugHealthPage() {
  return (
    <main className="min-h-screen bg-[#241105] px-6 py-10 text-[#fff7e8]">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
          Admin · HUG Health
        </p>

        <h1 className="mt-4 text-4xl font-black">
          K-KUT HUG Function Points
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-amber-50/75">
          This page lists the required working points for the public HUG landing
          page and Mother’s Day wizard. Run the terminal health check before every
          deploy:
        </p>

        <pre className="mt-5 overflow-auto rounded-2xl bg-black/30 p-5 text-sm text-amber-100">
{`node scripts/hug-health-check.mjs`}
        </pre>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {functionPoints.map((point, index) => (
            <div
              key={point}
              className="rounded-2xl border border-amber-200/20 bg-[#3a1f0f] p-5"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                Function Point {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-black">{point}</h2>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
