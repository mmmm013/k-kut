import type { Metadata } from "next";
import Link from "next/link";
import LoveHumanizationReview from "@/components/LoveHumanizationReview";

export const metadata: Metadata = {
  title: "LOVE HUGz Humanization Review | K-KUT",
  description: "ADMIN review of the governed Top 100 LOVE path and three-choice humanization flow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoveHugzReviewPage() {
  return (
    <>
      <div className="bg-[#09070B] px-5 pt-5 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link href="/hugz" className="text-sm font-black text-[#FFD54F]">
            ← Existing 13 HUGz
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#BCAAA4]">
            Direct review route · not linked into public HUGz discovery
          </p>
        </div>
      </div>
      <LoveHumanizationReview />
    </>
  );
}
