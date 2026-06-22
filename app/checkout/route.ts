import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const REGULAR_HUG_PAYMENT_URL =
  process.env.NEXT_PUBLIC_TAILORED_HUG_PAYMENT_URL ||
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

function cleanReference(value: string | null) {
  if (!value) return "";

  return value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export function GET(request: NextRequest) {
  const selectedKk = cleanReference(
    request.nextUrl.searchParams.get("kk")
  );

  if (!selectedKk) {
    redirect(REGULAR_HUG_PAYMENT_URL);
  }

  const paymentUrl = new URL(REGULAR_HUG_PAYMENT_URL);
  paymentUrl.searchParams.set(
    "client_reference_id",
    selectedKk
  );

  redirect(paymentUrl.toString());
}
