import Link from "next/link";
import SentimeantMcBotIntentReview from "@/components/SentimeantMcBotIntentReview";
import { getHugzContainer } from "@/lib/hugzSeedCatalog";
import {
  CUSTOMER_PACKAGE_NAMES,
  PRODUCT_OFFER_LAW,
  type CustomerPackageName,
} from "@/lib/productOfferLaw";

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

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function customerPackageName(value: string | undefined): CustomerPackageName | "" {
  return CUSTOMER_PACKAGE_NAMES.includes(value as CustomerPackageName)
    ? (value as CustomerPackageName)
    : "";
}

export default async function SentimeantStartPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawFeeling = firstValue(params.feeling);
  const feelingId = rawFeeling && feelingLabels[rawFeeling] ? rawFeeling : "";
  const feeling = feelingId ? feelingLabels[feelingId] : "";

  const source = firstValue(params.source) === "13hugz" ? "13hugz" : "";
  const cardSlug = source ? firstValue(params.card) || "" : "";
  const sourceCard = cardSlug ? getHugzContainer(cardSlug) : null;
  const requestedPackage = customerPackageName(firstValue(params.package));
  const packageName = source === "13hugz" ? "HUG" : requestedPackage;
  const packageLaw = packageName ? PRODUCT_OFFER_LAW[packageName] : null;

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

        {source === "13hugz" && sourceCard ? (
          <section className="mb-6 rounded-2xl border border-[#cda489] bg-[#fff6eb] p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a4e35]">
              13HUGz handoff · HUG package
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#4d2c20]">
              {sourceCard.headline}
            </h1>
            <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#74503f]">
              This HUGz Card is a starting clue, not a decision. MC-BOT must
              listen to your own words, reflect what it understood, and let you
              correct the meaning before any MGS comparison or HUG candidate is
              considered.
            </p>
            <p className="mt-2 text-sm font-black text-[#74402e]">
              HUG is the customer package only. Any eventual underlying II must
              remain independently identified and proven as KK or KOMBO.
            </p>
            <a
              href={`https://13hugz.com/hugz/${sourceCard.slug}`}
              className="mt-3 inline-flex text-sm font-black text-[#8b402b] underline"
            >
              Back to this HUGz Card
            </a>
          </section>
        ) : packageLaw ? (
          <section className="mb-6 rounded-2xl border border-[#cda489] bg-[#fff6eb] p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a4e35]">
              Customer package context · {packageName}
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#74503f]">
              {packageName} is a customer package name only. It never replaces
              the exact II identity: {packageLaw.canonicalIiKinds.join(" or ")}.
            </p>
          </section>
        ) : null}

        <SentimeantMcBotIntentReview
          initialFeelingId={feelingId}
          initialFeelingLabel={feeling}
        />

        <p className="mt-6 rounded-2xl border border-[#d8b9a3] bg-[#fffaf4] p-5 text-sm font-bold leading-7 text-[#76503f]">
          Review branch only. The chosen feeling, package context, HUGz Card
          context, and sentence guide a governed theme result; they do not
          select, classify, approve, price, or deliver any KK, KOMBO, sK, or mK.
          HUG, TUG, and BUG remain customer package names only. No audio,
          checkout, fulfillment, or customer-data persistence is enabled here.
        </p>
      </div>
    </main>
  );
}
