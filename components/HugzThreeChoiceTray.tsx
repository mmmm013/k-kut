import { HUGZ_BOUNDARY_HOLD } from "@/lib/hugzBoundaryHold";

type HugzSeed = {
  rank: number;
  assetId: string;
  assetKind: string;
  excerpt: string;
};

export default function HugzThreeChoiceTray({
  seeds,
  cardHeadline,
}: {
  seeds: readonly HugzSeed[];
  cardHeadline: string;
}) {
  return (
    <section aria-label={`${cardHeadline} HUG choices`}>
      <div className="rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
          Exact music choices in release review
        </p>
        <h2 className="mt-3 text-2xl font-black text-[#FFF8E1]">
          No player or payment starts yet.
        </h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#D7CCC8]">
          {HUGZ_BOUNDARY_HOLD.publicMessage}
        </p>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#BCAAA4]">
          {seeds.length} candidates remain private until their customer-safe titles and exact boundaries pass.
        </p>
      </div>
    </section>
  );
}
