"use client";

import { FormEvent, useState } from "react";

type SubmissionResult = {
  ok: boolean;
  status?: "SMS_CONSENT_RECEIVED" | "SMS_NOT_ENABLED";
  message?: string;
  submissionId?: string;
  receivedAt?: string;
  error?: string;
};

export default function SmsOptInPage() {
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  async function submitPreference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/sms-optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, smsConsent }),
      });

      const payload = (await response.json()) as SubmissionResult;

      if (!response.ok || !payload.ok) {
        setResult({
          ok: false,
          error: payload.error || "We could not save your preference. Please try again.",
        });
        return;
      }

      setResult(payload);
    } catch {
      setResult({
        ok: false,
        error: "We could not save your preference. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto max-w-2xl">
        <a href="/" className="text-sm text-amber-300">
          &larr; Back to K-KUT
        </a>

        <h1 className="mt-8 text-4xl font-bold text-white">K-KUT SMS Updates</h1>
        <p className="mt-3 text-neutral-300">
          Save your communication preference for K-KUT HUG orders, delivery status, and
          support requests from K-KUT, operated by G Putnam Music, LLC.
        </p>

        <form
          className="mt-10 rounded-xl border border-neutral-700 bg-neutral-900 p-6"
          onSubmit={submitPreference}
        >
          <h2 className="text-xl font-semibold text-white">SMS Notification Preference</h2>

          <p className="mt-4 text-sm text-neutral-300">
            Provide your mobile number below. The SMS consent checkbox is optional and is
            unchecked by default. You may submit this form without agreeing to SMS messages.
          </p>

          <div className="mt-6">
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-300">
              Mobile Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(555) 000-0000"
              className="mt-2 w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex items-start gap-3">
            <input
              id="sms-consent"
              name="smsConsent"
              type="checkbox"
              checked={smsConsent}
              onChange={(event) => setSmsConsent(event.target.checked)}
              className="mt-1 h-4 w-4 accent-amber-400"
              aria-describedby="sms-consent-details"
            />
            <label htmlFor="sms-consent" className="text-sm text-neutral-300">
              <strong>Optional:</strong> I agree to receive transactional SMS messages from
              K-KUT (G Putnam Music, LLC) about my orders, digital HUG delivery, support
              requests, and service-status updates. Message frequency varies. Message and data
              rates may apply. Reply <strong>STOP</strong> to opt out at any time. Reply{" "}
              <strong>HELP</strong> for assistance. Consent is not a condition of purchase.
            </label>
          </div>

          <p id="sms-consent-details" className="mt-3 text-sm font-semibold text-amber-200">
            Leaving the box unchecked will not block submission. It means SMS notifications
            will not be enabled.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-amber-400 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving Preference…" : "Submit Communication Preference"}
          </button>

          {result?.ok ? (
            <div
              className="mt-6 rounded-lg border border-emerald-600/60 bg-emerald-950/40 p-4 text-sm text-emerald-100"
              role="status"
              data-submission-status={result.status}
            >
              <p className="font-semibold">{result.message}</p>
              <p className="mt-2 text-xs text-emerald-200/80">
                Confirmation: {result.submissionId}
              </p>
            </div>
          ) : null}

          {result && !result.ok ? (
            <div
              className="mt-6 rounded-lg border border-red-600/60 bg-red-950/40 p-4 text-sm text-red-100"
              role="alert"
            >
              {result.error}
            </div>
          ) : null}
        </form>

        <div className="mt-10 space-y-4 text-sm text-neutral-400">
          <h2 className="text-base font-semibold text-white">SMS Program Details</h2>
          <p><strong className="text-neutral-200">Program Name:</strong> K-KUT</p>
          <p>
            <strong className="text-neutral-200">Message Types:</strong> Order confirmations,
            digital HUG delivery links, support follow-up, and service-status alerts.
          </p>
          <p>
            <strong className="text-neutral-200">Message Frequency:</strong> Varies based on
            your orders, delivery activity, and support requests.
          </p>
          <p>
            <strong className="text-neutral-200">Charges:</strong> Message and data rates may
            apply depending on your mobile carrier and service plan.
          </p>
          <p>
            <strong className="text-neutral-200">Opt Out:</strong> Reply{" "}
            <strong>STOP</strong> to any message to cancel SMS notifications at any time.
          </p>
          <p>
            <strong className="text-neutral-200">Help:</strong> Reply{" "}
            <strong>HELP</strong> or contact{" "}
            <a href="mailto:gregory@gputnammusic.com" className="text-amber-300 underline">
              gregory@gputnammusic.com
            </a>.
          </p>
          <p>
            <strong className="text-neutral-200">No Sharing:</strong> Mobile phone numbers
            collected for SMS messaging are used only for K-KUT customer-care messaging and
            are not sold, rented, or shared with third parties for marketing purposes.
          </p>
        </div>

        <div className="mt-8 flex gap-4 text-sm">
          <a href="/terms" className="text-amber-300 underline">Terms and Conditions</a>
          <a href="/privacy" className="text-amber-300 underline">Privacy Policy</a>
        </div>
      </section>
    </main>
  );
}
