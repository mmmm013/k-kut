'use client';

import { FormEvent, useState } from 'react';

type SubmissionState =
  | { kind: 'idle'; message: '' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string };

function getSmsOptInError(phone: string, consent: boolean): string | null {
  if (!consent) {
    return 'Please check the SMS consent box before submitting. No SMS opt-in was submitted.';
  }

  const digits = phone.replace(/\D/g, '');
  const isValidUsNumber = digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));

  if (!isValidUsNumber) {
    return 'Enter a valid 10-digit U.S. mobile phone number.';
  }

  return null;
}

export default function SmsOptInPage() {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({ kind: 'idle', message: '' });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = getSmsOptInError(phone, consent);

    if (error) {
      setSubmission({ kind: 'error', message: error });
      return;
    }

    setSubmission({
      kind: 'success',
      message:
        'Your checked SMS consent and phone number passed the opt-in form validation. K-KUT will use this number only for the transactional messages described on this page.',
    });
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto max-w-2xl">
        <a href="/" className="text-sm text-amber-300">
          &larr; Back to K-KUT
        </a>

        <h1 className="mt-8 text-4xl font-bold text-white">K-KUT SMS Updates</h1>
        <p className="mt-3 text-neutral-300">
          Stay informed about your K-KUT HUG orders, delivery status, and support requests
          via transactional SMS messages from K-KUT, operated by G Putnam Music, LLC.
        </p>

        <form
          className="mt-10 rounded-xl border border-neutral-700 bg-neutral-900 p-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="text-xl font-semibold text-white">Opt In to SMS Notifications</h2>

          <p className="mt-4 text-sm text-neutral-300">
            By providing your mobile phone number and checking the box below, you agree to
            receive transactional SMS messages from <strong>K-KUT</strong> (G Putnam Music, LLC)
            about your orders, digital HUG delivery, support requests, and service-status
            updates. Message frequency varies based on your activity.
          </p>

          <div className="mt-6 flex items-start gap-3">
            <input
              id="sms-consent"
              name="smsConsent"
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setSubmission({ kind: 'idle', message: '' });
              }}
              className="mt-1 h-4 w-4 accent-amber-400"
              aria-describedby="sms-consent-details sms-form-status"
            />
            <label id="sms-consent-details" htmlFor="sms-consent" className="text-sm text-neutral-300">
              I agree to receive transactional SMS messages from K-KUT (G Putnam Music, LLC)
              about my orders, delivery, and support. Message and data rates may apply.
              Reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> for
              assistance. View our{' '}
              <a href="/terms" className="text-amber-300 underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-amber-300 underline">
                Privacy Policy
              </a>.
            </label>
          </div>

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
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setSubmission({ kind: 'idle', message: '' });
              }}
              placeholder="(555) 000-0000"
              aria-describedby="sms-form-status"
              aria-invalid={submission.kind === 'error'}
              className="mt-2 w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-amber-400 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-amber-300"
          >
            Subscribe to K-KUT SMS
          </button>

          <p
            id="sms-form-status"
            role={submission.kind === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`mt-4 text-sm ${
              submission.kind === 'error'
                ? 'text-red-300'
                : submission.kind === 'success'
                  ? 'text-green-300'
                  : 'sr-only'
            }`}
          >
            {submission.message}
          </p>
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
            <strong className="text-neutral-200">Opt Out:</strong> Reply{' '}
            <strong>STOP</strong> to any message to cancel SMS notifications at any time.
          </p>
          <p>
            <strong className="text-neutral-200">Help:</strong> Reply{' '}
            <strong>HELP</strong> or contact{' '}
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
