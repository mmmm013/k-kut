import Link from "next/link";
import { loadAllApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";
import HugzCardGrid from "@/components/HugzCardGrid";
import {
  paymentRolloutBuyerNotice,
  paymentRolloutStatus,
} from "@/lib/paymentRolloutStatus";

export const metadata = {
  title: "Browse K-KUT | G Putnam Music",
  description:
    "Browse the 13 public HUGz Cards and see the current K-KUT release status.",
};

export const dynamic = "force-dynamic";

export default function BrowsePage() {
  const rollout = paymentRolloutStatus();
  const checkoutNotice = paymentRolloutBuyerNotice(rollout);
  const approvedRecords = loadAllApprovedPublicOptions().sort(
    (a, b) =>
      a.public_route.localeCompare(b.public_route) ||
      a.display_title.localeCompare(b.display_title) ||
      a.public_option_id.localeCompare(b.public_option_id),
  );
  const approvedCount = approvedRecords.length;
  const primaryApprovedRoute = approvedRecords[0]?.public_route || "/hug";
  const hasApprovedChoices = approvedCount > 0;

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-amber-300/35 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-7 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Browse the human moments.
          </h1>
          <p className="mt-5 max-w-4xl text-lg font-bold leading-8 text-[#EFEBE9]">
            {hasApprovedChoices
              ? rollout.enabled
                ? `The 13 HUGz Cards are open. Site-wide, ${approvedCount} exact K-KUT ${approvedCount === 1 ? "choice is" : "choices are"} released for controlled purchase.`
                : `The 13 HUGz Cards are open. Site-wide, ${approvedCount} exact K-KUT ${approvedCount === 1 ? "choice is" : "choices are"} released for controlled preview.`
              : "The 13 HUGz Cards are open. Exact K-KUT purchase choices remain held while release review continues."}
          </p>
          {!rollout.enabled && hasApprovedChoices && checkoutNotice ? (
            <p className="mt-4 max-w-4xl text-sm font-black uppercase tracking-[0.2em] text-[#FFD54F]">
              {checkoutNotice}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="rounded-2xl border border-amber-300/35 bg-amber-950/25 px-4 py-3 text-sm font-black text-amber-100">
              HUGz Cards: 13
            </span>
            <span className="rounded-2xl border border-red-400/35 bg-red-950/25 px-4 py-3 text-sm font-black text-red-100">
              {rollout.enabled
                ? `Site-wide exact choices: ${approvedCount}`
                : `Site-wide preview choices: ${approvedCount}`}
            </span>
            <Link
              href={hasApprovedChoices ? primaryApprovedRoute : "/find"}
              className="rounded-2xl bg-pink-200 px-5 py-3 text-sm font-black text-[#160915]"
            >
              {hasApprovedChoices
                ? rollout.enabled
                  ? "Open released music option"
                  : "Hear released music option"
                : "Browse 13 HUGz Cards"}
            </Link>
            <Link
              href="/hug"
              className="rounded-2xl border border-[#FFD54F]/60 px-5 py-3 text-sm font-black text-[#FFD54F]"
            >
              View all offers
            </Link>
          </div>
        </header>

        <HugzCardGrid />
      </section>
    </main>
  );
}
