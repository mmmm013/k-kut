import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount || 25);

    const allowed = [5, 15, 25, 50, 100, 250];
    const finalAmount = allowed.includes(amount) ? amount : 25;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_creation: "always",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: finalAmount * 100,
            product_data: {
              name: "MS Donation — Michael Scherer Support",
              description:
                "100% of marked MS Donation funds are forwarded to Michael Scherer.",
            },
          },
        },
      ],
      metadata: {
        fund: "MS Donation",
        beneficiary: "Michael Scherer",
        sponsor: "G Putnam Music",
      },
      payment_intent_data: {
        metadata: {
          fund: "MS Donation",
          beneficiary: "Michael Scherer",
          sponsor: "G Putnam Music",
        },
        description: "MS Donation — Michael Scherer Support",
      },
      success_url: "https://k-kut.com/donate/thanks",
      cancel_url: "https://k-kut.com/find",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Donation checkout failed", detail: String(err) },
      { status: 500 }
    );
  }
}
