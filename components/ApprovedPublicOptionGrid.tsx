import type { ApprovedPublicOption } from "@/lib/publication-bridge/approvedPublicOptions";

function titleCase(value: string) {
  return String(value || "")
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ApprovedPublicOptionGrid({
  records,
  emptyTitle = "No approved K-KUT HUGs are published for this route yet.",
  buttonLabel = "Send this GPM HUG",
}: {
  records: ApprovedPublicOption[];
  emptyTitle?: string;
  buttonLabel?: string;
}) {
  if (records.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]">
          MIAL publication review active
        </p>
        <h2 className="mt-3 text-2xl font-black">{emptyTitle}</h2>
        <p className="mt-3 text-sm font-bold leading-7 text-white/70">
          Audio, route fit, rights, and GD approval must all pass before a player or payment link appears.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
          Approved Ready Now
        </p>
        <p className="text-sm font-bold text-white/55">
          {records.length.toLocaleString()} approved {records.length === 1 ? "II" : "IIs"}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {records.map((record) => (
          <article
            key={record.public_option_id}
            className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              {titleCase(record.intent_lane)}
            </p>
            <h2 className="mt-3 text-2xl font-black">{record.display_title}</h2>
            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/68">
              {record.interpretation_summary}
            </p>

            {record.action_object_meaning && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFD54F]">
                  Match shape
                </p>
                <p className="mt-1 text-sm font-bold text-white/70">
                  {record.action_object_meaning.verb || "send"}{" "}
                  {record.action_object_meaning.object || "feeling"}
                  {record.action_object_meaning.situation
                    ? ` — ${record.action_object_meaning.situation}`
                    : ""}
                </p>
              </div>
            )}

            <audio
              className="mt-5 w-full"
              controls
              preload="metadata"
              src={record.audio_delivery_url}
            />

            <a
              className="mt-5 block rounded-2xl bg-pink-200 px-5 py-3 text-center font-black text-[#160915] transition hover:bg-white"
              href={record.stripe_url_if_payment_allowed}
            >
              {buttonLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
