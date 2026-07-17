import {
  A2P_CHARGES_DISCLOSURE,
  A2P_FREQUENCY_DISCLOSURE,
  A2P_HELP_DISCLOSURE,
  A2P_MESSAGE_TYPES,
  A2P_NO_CONDITION_DISCLOSURE,
  A2P_NO_MARKETING_SHARING_DISCLOSURE,
  A2P_OPERATOR,
  A2P_OPT_OUT_DISCLOSURE,
  A2P_PROGRAM_NAME,
} from "../../lib/a2p-consent";
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
          {A2P_PROGRAM_NAME}, operated by {A2P_OPERATOR}, offers optional
          transactional customer-care SMS messages for {A2P_MESSAGE_TYPES}.
        </p>

        <div className="mt-6 rounded-xl border-2 border-amber-400 bg-amber-950/30 p-5">
          <p className="font-semibold text-amber-100">
            {A2P_NO_CONDITION_DISCLOSURE}
          </p>
        </div>

        <SmsOptInForm />

        <div className="mt-10 space-y-4 text-sm text-neutral-400">
          <h2 className="text-base font-semibold text-white">SMS Program Details</h2>
          <p>
            <strong className="text-neutral-200">Program Name:</strong>{" "}
            {A2P_PROGRAM_NAME}
          </p>
          <p>
            <strong className="text-neutral-200">Program Operator:</strong>{" "}
            {A2P_OPERATOR}
          </p>
          <p>
            <strong className="text-neutral-200">Message Types:</strong>{" "}
            {A2P_MESSAGE_TYPES}.
          </p>
          <p>
            <strong className="text-neutral-200">Message Frequency:</strong>{" "}
            {A2P_FREQUENCY_DISCLOSURE}
          </p>
          <p>
            <strong className="text-neutral-200">Charges:</strong>{" "}
            {A2P_CHARGES_DISCLOSURE}
          </p>
          <p>
            <strong className="text-neutral-200">Opt Out:</strong>{" "}
            {A2P_OPT_OUT_DISCLOSURE}
          </p>
          <p>
            <strong className="text-neutral-200">Help:</strong>{" "}
            {A2P_HELP_DISCLOSURE}
          </p>
          <p>
            <strong className="text-neutral-200">Voluntary Consent:</strong>{" "}
            {A2P_NO_CONDITION_DISCLOSURE}
          </p>
          <p>
            <strong className="text-neutral-200">No Marketing Sharing:</strong>{" "}
            {A2P_NO_MARKETING_SHARING_DISCLOSURE}
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
