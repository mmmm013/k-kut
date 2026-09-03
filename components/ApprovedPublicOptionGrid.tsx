import ApprovedLyricHighlight from "@/components/ApprovedLyricHighlight";
import {
  getApprovedLyricLines,
  getCompactApprovedLyricLines,
} from "@/lib/approvedLyricHighlights";
import type { ApprovedPublicOption } from "@/lib/publication-bridge/approvedPublicOptions";
import {
  paymentRolloutBuyerNotice,
  paymentRolloutStatus,
} from "@/lib/paymentRolloutStatus";

function titleCase(value: string) {
  return String(value || "")
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ApprovedPublicOptionGrid({
  records,
  emptyTitle = "No approved K-KUT IIs are published for this route yet.",
  buttonLabel,
}: {
  records: ApprovedPublicOption[];
  emptyTitle?: string;
  buttonLabel?: string;
}) {
  const rollout = paymentRolloutStatus();
  const checkoutNotice = paymentRolloutBuyerNotice(rollout);

  if (records.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]">Customer release review active</p>
        <h2 className="mt-3 text-2xl font-black">{emptyTitle}</h2>
        <p className="mt-3 text-sm font-bold leading-7 text-white/70">
          Meaning, audio, route fit, rights, and final approval must all pass before a player or payment button appears.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">Approved Ready Now</p>
        <p className="text-sm font-bold text-white/55">
          {records.length.toLocaleString()} approved {records.length === 1 ? "II" : "IIs"}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {records.map((record) => {
          const lyricLines = getApprovedLyricLines(
            record.kk_id_or_delivery_object_id,
          );

          return (
            <article key={record.public_option_id} className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                {record.product_family} · {formatPrice(record.price_cents)} · {titleCase(record.intent_lane)}
              </p>
              <h2 className="mt-3 text-2xl font-black">{record.display_title}</h2>
              <ApprovedLyricHighlight
                lines={getCompactApprovedLyricLines(lyricLines)}
                className="mt-3"
              />
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/68">{record.interpretation_summary}</p>

              {record.action_object_meaning && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFD54F]">Match shape</p>
                  <p className="mt-1 text-sm font-bold text-white/70">
                    {record.action_object_meaning.verb || "send"} {record.action_object_meaning.object || "feeling"}
                    {record.action_object_meaning.situation ? ` — ${record.action_object_meaning.situation}` : ""}
                  </p>
                </div>
              )}

              <audio className="mt-5 w-full" controls controlsList="nodownload noplaybackrate" preload="metadata" src={record.audio_delivery_url} />

              {rollout.enabled ? (
                <form action="/checkout" method="post" className="mt-5">
                  <input type="hidden" name="public_option_id" value={record.public_option_id} />
                  <input type="hidden" name="ii" value={record.kk_id_or_delivery_object_id} />
                  <button type="submit" className="block w-full rounded-2xl bg-pink-200 px-5 py-3 text-center font-black text-[#160915] transition hover:bg-white">
                    {buttonLabel || `Buy & send this ${record.product_family} · ${formatPrice(record.price_cents)}`}
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-black text-white/75">
                  {checkoutNotice}
                </div>
              )}
              <p className="mt-3 text-xs font-bold leading-5 text-white/50">
                {rollout.enabled
                  ? `Checkout verifies this exact approved II and its locked ${record.product_family} price before Stripe opens.`
                  : "Audio preview is live now. Payment stays closed until rollout allows checkout."}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
