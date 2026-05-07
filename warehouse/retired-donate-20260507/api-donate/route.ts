import { NextRequest, NextResponse } from "next/server";

const FEATURED_IDS = new Set([
  "thank-you-kk1",
  "thank-you-kk2",
  "thank-you-kk4",
  "thank-you-kk6",
  "thank-you-kk7",
]);

const SECTION_IDS = new Set([
  "thank-you-kk3",
  "thank-you-kk5",
  "thank-you-sec-intro",
  "thank-you-sec-v1a",
  "thank-you-sec-v1c",
  "thank-you-sec-v1d",
  "thank-you-sec-ch1",
  "thank-you-sec-v2a",
  "thank-you-sec-v2b",
  "thank-you-sec-ch2",
  "thank-you-sec-outro",
]);

function getTier(kk: string) {
  if (FEATURED_IDS.has(kk)) return "featured";
  if (SECTION_IDS.has(kk)) return "section";
  if (/^thank-you-cc-\d{3}$/.test(kk)) return "moment";
  return "";
}

function getPaymentLink(tier: string) {
  if (tier === "moment") return process.env.NEXT_PUBLIC_MD_MOMENT_KK_LINK;
  if (tier === "section") return process.env.NEXT_PUBLIC_MD_SECTION_KK_LINK;
  if (tier === "featured") return process.env.NEXT_PUBLIC_MD_FEATURED_KK_LINK;
  return "";
}

function getPrice(tier: string) {
  if (tier === "moment") return "$4.99";
  if (tier === "section") return "$7.99";
  if (tier === "featured") return "$12.99";
  return "";
}

export async function POST(req: NextRequest) {
  let kk = "";

  try {
    const body = await req.json();
    kk = String(body?.kk || "").trim();
  } catch {
    kk = "";
  }

  const tier = getTier(kk);
  const url = getPaymentLink(tier);

  if (!kk || !tier) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing K-KUT selection." },
      { status: 400 }
    );
  }

  if (!url) {
    return NextResponse.json(
      {
        ok: false,
        error: `Missing Stripe payment link for ${tier} K-KUT.`,
        tier,
        kk,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    kk,
    tier,
    price: getPrice(tier),
    url,
    note: "One K-KUT per purchase. Stripe Payment Link selected by K-KUT tier.",
  });
}
