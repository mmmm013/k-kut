import { redirect } from "next/navigation";

const REGULAR_HUG_PAYMENT_URL =
  process.env.NEXT_PUBLIC_TAILORED_HUG_PAYMENT_URL ||
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

export function GET() {
  redirect(REGULAR_HUG_PAYMENT_URL);
}
