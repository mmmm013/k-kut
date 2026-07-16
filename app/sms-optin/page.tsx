import SmsOptInForm from "./SmsOptInForm";

export const metadata = {
  title: "K-KUT Optional SMS Updates",
  description:
    "Choose whether to receive optional transactional customer-care SMS messages from K-KUT.",
};

export default function SmsOptInPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto max-w-2xl">
        <a href="/" className="text-sm text-amber-300">
          &larr; Back to K-KUT
        </a>

        <h1 className="mt-8 text-4xl font-bold text-white">
          Optional K-KUT SMS Updates
        </h1>
        <p className="mt-3 text-neutral-300">
          K-KUT, operated by G Putnam Music, LLC, offers optional transactional
          customer-care SMS messages for orders, digital HUG delivery, support
          requests, and service-status updates.
        </p>

        <div className="mt-6 rounded-xl border-2 border-amber-400 bg-amber-950/30 p-5">
          <p className="font-semibold text-amber-100">
            You do not have to consent to SMS to buy, order, receive a digital HUG,
            create or use an account, or receive customer support.
          </p>
        </div>

        <SmsOptInForm />

        <div className="mt-10 space-y-4 text-sm text-neutral-400">
          <h2 className="text-base font-semibold text-white">SMS Program Details</h2>
          <p>
            <strong className="text-neutral-200">Program Name:</strong> K-KUT
          </p>
          <p>
            <strong className="text-neutral-200">Program Operator:</strong> G Putnam
            Music, LLC
          </p>
          <p>
            <strong className="text-neutral-200">Message Types:</strong> Order
            confirmations, digital HUG delivery links, support follow-up, and
            service-status alerts.
          </p>
          <p>
            <strong className="text-neutral-200">Message Frequency:</strong> Varies
            based on your orders, delivery activity, support requests, or service
            status.
          </p>
          <p>
            <strong className="text-neutral-200">Charges:</strong> Message and data
            rates may apply depending on your mobile carrier and service plan.
          </p>
          <p>
            <strong className="text-neutral-200">Opt Out:</strong> Reply{" "}
            <strong>STOP</strong> to any K-KUT message to cancel SMS notifications at
            any time.
          </p>
          <p>
            <strong className="text-neutral-200">Help:</strong> Reply{" "}
            <strong>HELP</strong> or contact{" "}
            <a href="mailto:gregory@gputnammusic.com" className="text-amber-300 underline">
              gregory@gputnammusic.com
            </a>
            .
          </p>
          <p>
            <strong className="text-neutral-200">Voluntary Consent:</strong> The SMS
            checkbox is optional, unchecked by default, and separate from purchase,
            account, order, delivery, support, Terms, and Privacy acceptance.
          </p>
          <p>
            <strong className="text-neutral-200">No Marketing Sharing:</strong> Mobile
            phone numbers and SMS consent information are not sold, rented, or shared
            with third parties or affiliates for their marketing or promotional
            purposes.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <a href="/terms" className="text-amber-300 underline">
            Terms and Conditions
          </a>
          <a href="/privacy" className="text-amber-300 underline">
            Privacy Policy
          </a>
        </div>
      </section>
    </main>
  );
}
