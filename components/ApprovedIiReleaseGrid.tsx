import type {
  ApprovedIiContainer,
  ApprovedIiReleaseItem,
} from "@/lib/approvedIiRelease";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function sectionName(role: string) {
  return role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ApprovedIiReleaseGrid({
  records,
  checkoutConfigured,
}: {
  records: ApprovedIiReleaseItem[];
  checkoutConfigured: Record<ApprovedIiContainer, boolean>;
}) {
  const titleGroups = Array.from(
    records.reduce((groups, record) => {
      const current = groups.get(record.publicTitle) || [];
      current.push(record);
      groups.set(record.publicTitle, current);
      return groups;
    }, new Map<string, ApprovedIiReleaseItem[]>()),
  );

  return (
    <div className="space-y-8">
      {titleGroups.map(([title, items]) => {
        const first = items[0];
        const isHoliday = first.container === "holiday_hug";
        const canCheckout = checkoutConfigured[first.container];

        return (
          <section
            key={title}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
                  {isHoliday ? "Christmas HUG" : "Regular HUG"} ·{" "}
                  {formatPrice(first.priceCents)}
                </p>
                <h2 className="mt-2 text-3xl font-black">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-white/70">
                  {first.interpretationSummary}
                </p>
              </div>
              <span className="rounded-full border border-[#FFD54F]/35 px-4 py-2 text-xs font-black text-[#FFD54F]">
                6 approved moments
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.publicOptionId}
                  className="rounded-[1.4rem] border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-200">
                    Moment {item.momentNumber} · {sectionName(item.sectionRole)}
                  </p>
                  <p className="mt-2 text-sm font-bold text-white/65">
                    {item.intentLane}
                  </p>
                  <audio
                    className="mt-4 w-full"
                    controls
                    controlsList="nodownload noplaybackrate"
                    preload="none"
                    src={item.audioDeliveryUrl}
                  />
                  {canCheckout ? (
                    <a
                      href={`/api/approved-ii-checkout?id=${encodeURIComponent(item.publicOptionId)}`}
                      className="mt-4 block rounded-xl bg-[#FFD54F] px-4 py-3 text-center text-sm font-black text-black"
                    >
                      Send this HUG · {formatPrice(item.priceCents)}
                    </a>
                  ) : (
                    <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-950/25 px-4 py-3 text-center text-xs font-black text-amber-100">
                      Checkout opens after Stripe price verification
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
