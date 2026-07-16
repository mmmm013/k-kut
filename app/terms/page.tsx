import {
  A2P_CHARGES_DISCLOSURE,
  A2P_CONSENT_DISCLOSURE,
  A2P_FREQUENCY_DISCLOSURE,
  A2P_HELP_DISCLOSURE,
  A2P_MESSAGE_TYPES,
  A2P_NO_CONDITION_DISCLOSURE,
  A2P_NO_IMPLIED_CONSENT_DISCLOSURE,
  A2P_NO_MARKETING_SHARING_DISCLOSURE,
  A2P_OPERATOR,
  A2P_OPT_OUT_DISCLOSURE,
  A2P_PROGRAM_NAME,
} from "../../lib/a2p-consent";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-amber-300">
          ← Back to K-KUT
        </a>

        <h1 className="mt-8 text-4xl font-bold text-white">
          Terms and Conditions
        </h1>

        <p className="mt-4 text-neutral-300">Effective date: May 4, 2026</p>
        <p className="mt-1 text-neutral-400">SMS terms updated: July 16, 2026</p>

        <p className="mt-6 text-neutral-300">
          These Terms and Conditions govern use of {A2P_PROGRAM_NAME}, a service
          operated by {A2P_OPERATOR}. By accessing or using K-KUT, you agree to these
          Terms and our Privacy Policy. Agreeing to these Terms does not opt you in to
          SMS messages.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">Program Name</h2>
        <p className="mt-3 text-neutral-300">
          The SMS program name is {A2P_PROGRAM_NAME}.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Program Description
        </h2>
        <p className="mt-3 text-neutral-300">
          K-KUT may send transactional customer-care SMS messages for {A2P_MESSAGE_TYPES}.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Canonical Voluntary SMS Consent
        </h2>
        <p className="mt-3 text-neutral-300">{A2P_CONSENT_DISCLOSURE}</p>
        <p className="mt-3 text-neutral-300">{A2P_NO_CONDITION_DISCLOSURE}</p>
        <p className="mt-3 text-neutral-300">{A2P_NO_IMPLIED_CONSENT_DISCLOSURE}</p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Opt Out and Help
        </h2>
        <p className="mt-3 text-neutral-300">
          {A2P_OPT_OUT_DISCLOSURE} {A2P_HELP_DISCLOSURE}
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Message Frequency
        </h2>
        <p className="mt-3 text-neutral-300">{A2P_FREQUENCY_DISCLOSURE}</p>

        <h2 className="mt-8 text-2xl font-semibold text-white">Charges</h2>
        <p className="mt-3 text-neutral-300">{A2P_CHARGES_DISCLOSURE}</p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Mobile Information
        </h2>
        <p className="mt-3 text-neutral-300">
          Mobile phone numbers and SMS consent information are used for K-KUT
          customer-care messaging and related operational records. {" "}
          {A2P_NO_MARKETING_SHARING_DISCLOSURE}
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">Use of K-KUT</h2>
        <p className="mt-3 text-neutral-300">
          You agree to use K-KUT only for lawful purposes and in a way that does not
          interfere with the operation, security, or availability of the service.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Digital Products and Delivery
        </h2>
        <p className="mt-3 text-neutral-300">
          K-KUT may provide digital products, previews, delivery links, service
          updates, or customer-care communications. Availability and delivery timing
          may vary depending on the product or service.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">Contact</h2>
        <p className="mt-3 text-neutral-300">
          For questions about these Terms, contact {A2P_OPERATOR} at{" "}
          <a className="text-amber-300" href="mailto:gregory@gputnammusic.com">
            gregory@gputnammusic.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
