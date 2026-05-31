import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

type BridgeRecord = {
  public_option_id: string;
  display_title: string;
  interpretation_summary: string;
  action_object_meaning: {
    verb: string;
    object: string;
    situation: string;
  };
  intent_lane: string;
  audio_delivery_url: string;
  stripe_url_if_payment_allowed: string;
  public_route: string;
};

function loadRecord(publicRoute: string): BridgeRecord | null {
  const filePath = path.join(
    process.cwd(),
    "data/publication-bridge/public-option-records.generated.json"
  );

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    records?: BridgeRecord[];
  };

  return (
    (parsed.records || []).find((record) => record.public_route === publicRoute) ||
    null
  );
}

function titleCaseSlug(value: string) {
  return value
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ApprovedPersonalRoutePage({
  publicRoute,
  title,
  subtitle,
}: {
  publicRoute: string;
  title: string;
  subtitle: string;
}) {
  const record = loadRecord(publicRoute);

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#241223] via-[#120816] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {title} K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            {subtitle}
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            This page shows approved HUG options for this exact personal route.
            No raw inventory, no generic personal cards, and no mixed-route options appear here.
          </p>
        </header>

        {!record ? (
          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold leading-7 text-white/70">
              This route is being prepared. Return to Find to browse approved HUG options.
            </p>
            <Link className="mt-6 inline-flex font-black text-[#FFD54F]" href="/find">
              Back to approved HUG options
            </Link>
          </section>
        ) : (
          <section>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
              Approved Ready Now
            </p>

            <article className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                {titleCaseSlug(record.intent_lane)}
              </p>

              <h2 className="mt-3 text-2xl font-black">
                {record.display_title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/68">
                {record.interpretation_summary}
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFD54F]">
                  Match shape
                </p>
                <p className="mt-1 text-sm font-bold text-white/70">
                  {record.action_object_meaning.verb}{" "}
                  {record.action_object_meaning.object} —{" "}
                  {record.action_object_meaning.situation}
                </p>
              </div>

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
                Send this {title} HUG
              </a>
            </article>
          </section>
        )}

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <Link className="font-black text-[#FFD54F]" href="/find">
            Back to approved HUG options
          </Link>
        </footer>
      </section>
    </main>
  );
}
