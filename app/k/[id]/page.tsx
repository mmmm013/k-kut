import Link from "next/link";
import CurrentIiAuthorityHold from "@/components/CurrentIiAuthorityHold";
import EofSignatureAudio from "@/components/EofSignatureAudio";
import { findApprovedPublicOptionByAnyId } from "@/lib/publication-bridge/approvedPublicOptions";

export const dynamic = "force-dynamic";

export default async function KKutPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const option = findApprovedPublicOptionByAnyId(decodeURIComponent(id));

  if (
    !option ||
    option.product_family !== "HUG" ||
    option.inventory_family !== "KK"
  ) {
    return <CurrentIiAuthorityHold itemLabel="K-KUT" />;
  }

  return (
    <main className="min-h-screen bg-[#09070B] px-6 py-12 text-white">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-[#D4A017]/30 bg-[#111] p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D4A017]">
          Current HUG · approved K-KUT
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#FFD54F]">
          {option.display_title}
        </h1>
        <p className="mt-3 text-sm font-bold leading-6 text-[#C8A882]">
          {option.interpretation_summary}
        </p>
        <EofSignatureAudio
          src={option.audio_delivery_url}
          className="mt-6 w-full rounded"
        />
        <Link
          href="/find"
          className="mt-6 inline-block text-sm font-black text-[#D4A017]"
        >
          Find another music moment
        </Link>
      </section>
    </main>
  );
}
