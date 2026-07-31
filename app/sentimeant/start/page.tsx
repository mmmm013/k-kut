import Link from "next/link";
import SentimeantMcBotIntentReview from "@/components/SentimeantMcBotIntentReview";

export const metadata = {
  title: "Shape your Sent-i-Meant | GPMx",
  description:
    "A governed MC-BOT guide that identifies the closest emotional direction before later MGS comparison or music matching.",
};

const feelingLabels: Record<string, string> = {
  "thank-you": "Thank You iMeant",
  sorry: "Sorry iMeant",
  "miss-you": "Miss You iMeant",
  "proud-of-you": "Proud of You iMeant",
  "still-care": "Still Care iMeant",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SentimeantStartPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawFeeling = Array.isArray(params.feeling)
    ? params.feeling[0]
    : params.feeling;
  const feelingId = rawFeeling && feelingLabels[rawFeeling] ? rawFeeling : "";
  const feeling = feelingId ? feelingLabels[feelingId] : "";

  return (
    <main className="min-h-screen bg-[#f7efe4] px-4 py-8 text-[#3b241b] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d8b9a3] bg-[#fffaf4] px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a35539]">
              Sent-i-Meants · Shape
            </p>
            <p className="mt-1 text-sm font-bold text-[#6f4938]">
              {feeling
                ? `You started with: ${feeling}`
                : "Tell MC-BOT what happened in one sentence."}
            </p>
          </div>
          <Link
            href="/sentimeant#imeants"
            className="rounded-full border border-[#9c624b] px-4 py-2 text-sm font-black text-[#653827] hover:bg-[#f5dfd0]"
          >
            Change the feeling
          </Link>
        </div>

        <SentimeantMcBotIntentReview
          initialFeelingId={feelingId}
          initialFeelingLabel={feeling}
        />

        <p className="mt-6 rounded-2xl border border-[#d8b9a3] bg-[#fffaf4] p-5 text-sm font-bold leading-7 text-[#76503f]">
          Review branch only. The chosen feeling and sentence guide a governed
          theme result; they do not select, classify, approve, price, or deliver
          any KK or KOMBO. No audio, checkout, fulfillment, or customer-data
          persistence is enabled.
        </p>
      </div>
    </main>
  );
}
