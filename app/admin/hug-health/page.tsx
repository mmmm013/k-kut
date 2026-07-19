const functionPoints = [
  "K-KUT home page loads",
  "Browse page loads the governed 2,611-KK public source catalog",
  "All 2,611 verified KKs identify as K-KUT HUGs at $7.99",
  "The disproven 1,256 supposed sKs are not public pilot inventory",
  "Every displayed KK is playable before selection",
  "Every displayed KK carries verified GPMx Twinkle-at-end proof",
  "Optional written note is limited to 13 words",
  "Checkout accepts only the governed KK offer code",
  "Checkout verifies the selected KK on the server",
  "Checkout uses only the existing authorized $7.99 Stripe Payment Link",
  "Paid orders create an H2 pending-order record",
  "Paid orders remain manual-review fulfillment items",
  "MyK coordinates remain requests until rendered with lineage, boundary, and hash proof",
  "No permanent individual-holiday route or checkout gateway exists",
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
          These are the required permanent storefront, MyK pilot, and
          fulfillment controls. Seasonal Holiday Theme selections are built
          freshly and do not create permanent individual-holiday customer
          routes.
        </p>

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
