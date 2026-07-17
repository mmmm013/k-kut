import {
  A2P_CONSENT_DISCLOSURE,
  A2P_DECLINE_DISCLOSURE,
  A2P_NO_CONDITION_DISCLOSURE,
  A2P_NO_IMPLIED_CONSENT_DISCLOSURE,
  A2P_NO_MARKETING_SHARING_DISCLOSURE,
  A2P_OPERATOR,
  A2P_PROGRAM_NAME,
} from "../../lib/a2p-consent";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-amber-300">
          ← Back to K-KUT
        </a>

        <h1 className="mt-8 text-4xl font-bold text-white">Privacy Policy</h1>

        <p className="mt-4 text-neutral-300">Effective date: May 4, 2026</p>
        <p className="mt-1 text-neutral-400">
          SMS privacy terms updated: July 16, 2026 — voluntary consent correction
        </p>

        <p className="mt-6 text-neutral-300">
          {A2P_PROGRAM_NAME} is operated by {A2P_OPERATOR}. This Privacy Policy explains
          how we collect, use, and protect information provided through K-KUT services,
          including order, delivery, support, intake, and customer-care activity.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Information We Collect
        </h2>
        <p className="mt-3 text-neutral-300">
          We may collect information you provide directly, including your name, email
          address, order details, support requests, delivery preferences, and other
          information needed to provide K-KUT services.
        </p>
        <p className="mt-3 text-neutral-300">
          We collect and store a mobile phone number for K-KUT SMS messaging only after
          you deliberately check the separate optional SMS-consent box and submit the
          opt-in form. {A2P_DECLINE_DISCLOSURE}
        </p>
        <p className="mt-3 font-semibold text-amber-100">
          Providing a phone number by itself never authorizes SMS. SMS consent exists only
          when you deliberately check the separate optional SMS-consent box and submit the
          opt-in form.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          How We Use Information
        </h2>
        <p className="mt-3 text-neutral-300">
          We use information to process orders, provide digital delivery, respond to
          support requests, send authorized service-status updates, manage customer-care
          activity, improve K-KUT services, and maintain business and compliance records.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Canonical Voluntary SMS Consent
        </h2>
        <p className="mt-3 text-neutral-300">{A2P_CONSENT_DISCLOSURE}</p>
        <p className="mt-3 text-neutral-300">{A2P_NO_CONDITION_DISCLOSURE}</p>
        <p className="mt-3 text-neutral-300">{A2P_NO_IMPLIED_CONSENT_DISCLOSURE}</p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          SMS Consent Records
        </h2>
        <p className="mt-3 text-neutral-300">
          We maintain an operational record of the choice submitted through the K-KUT
          SMS page, including the date and time, consent disclosure version, source page,
          and the mobile number only when SMS consent was given. The opt-in page itself
          does not send an SMS message.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          No Sale or Marketing Sharing of Mobile Information
        </h2>
        <p className="mt-3 text-neutral-300">
          K-KUT does not sell or rent mobile phone numbers or SMS consent information.{" "}
          {A2P_NO_MARKETING_SHARING_DISCLOSURE}
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">
          Service Providers
        </h2>
        <p className="mt-3 text-neutral-300">
          We may use trusted service providers to operate the website, process payments,
          store operational records, deliver authorized communications, provide hosting,
          and support customer service. These providers are used only as needed to
          operate the service.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">Data Protection</h2>
        <p className="mt-3 text-neutral-300">
          We use reasonable administrative, technical, and operational safeguards to
          protect information. No internet-based service can guarantee complete security.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-white">Contact</h2>
        <p className="mt-3 text-neutral-300">
          For privacy questions, contact {A2P_OPERATOR} at{" "}
          <a className="text-amber-300" href="mailto:gregory@gputnammusic.com">
            gregory@gputnammusic.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
