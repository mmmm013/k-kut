"use client";

import { FormEvent, useState } from "react";

type SubmissionState =
  | { kind: "idle"; message: "" }
  | { kind: "saving"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function SmsOptInForm() {
  const [smsConsent, setSmsConsent] = useState(false);
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<SubmissionState>({
    kind: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (smsConsent && !phone.trim()) {
      setState({
        kind: "error",
        message: "Enter your mobile number only because you chose optional SMS updates.",
      });
      return;
    }

    setState({ kind: "saving", message: "Saving your choice…" });

    try {
      const response = await fetch("/api/sms-optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sms_consent: smsConsent,
          phone: smsConsent ? phone : "",
          website,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        sms_consent?: boolean;
      };

      if (!response.ok || !result.ok) {
        setState({
          kind: "error",
          message:
            result.error === "valid_us_phone_required_for_sms_opt_in"
              ? "Enter a valid U.S. mobile number, including area code."
              : "Your choice was not saved. Please try again or contact support.",
        });
        return;
      }

      setState({
        kind: "success",
        message: result.sms_consent
          ? "SMS consent recorded. K-KUT may send customer-care texts for your orders, delivery, support, or service status."
          : "No SMS consent was given. You can continue using K-KUT, place orders, receive delivery, and request support without SMS.",
      });

      if (!smsConsent) setPhone("");
    } catch {
      setState({
        kind: "error",
        message: "Your choice was not saved. Please try again or contact support.",
      });
    }
  }

  return (
    <form
      className="mt-10 rounded-xl border border-neutral-700 bg-neutral-900 p-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-xl font-semibold text-white">Choose SMS or No SMS</h2>

      <p className="mt-4 text-sm font-semibold text-amber-200">
        SMS consent is optional and is not a condition of purchase, account creation,
        ordering, digital delivery, or customer support.
      </p>

      <p className="mt-3 text-sm text-neutral-300">
        Leave the box unchecked to continue without SMS. Check it only when you want
        transactional customer-care text messages from K-KUT.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-neutral-700 bg-neutral-950 p-4">
        <input
          id="sms-consent"
          name="sms-consent"
          type="checkbox"
          checked={smsConsent}
          onChange={(event) => {
            const nextConsent = event.target.checked;
            setSmsConsent(nextConsent);
            setState({ kind: "idle", message: "" });
            if (!nextConsent) setPhone("");
          }}
          className="mt-1 h-5 w-5 accent-amber-400"
          aria-describedby="sms-consent-details"
        />
        <label htmlFor="sms-consent" className="text-sm text-neutral-200">
          <strong className="text-white">Optional:</strong> I agree to receive
          transactional customer-care SMS messages from K-KUT (G Putnam Music, LLC)
          about my orders, digital HUG delivery, support requests, and service-status
          updates. Message frequency varies. Message and data rates may apply. Reply{" "}
          <strong>STOP</strong> to opt out. Reply <strong>HELP</strong> for help.
        </label>
      </div>

      <p id="sms-consent-details" className="mt-3 text-xs text-neutral-400">
        The checkbox is unchecked by default. You may save “No SMS” and continue to use
        every K-KUT service.
      </p>

      <div className="mt-6">
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-300">
          Mobile Phone Number {smsConsent ? "(required for SMS opt-in)" : "(not needed)"}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={!smsConsent}
          required={smsConsent}
          placeholder={smsConsent ? "(555) 000-0000" : "Choose optional SMS to enter a number"}
          className="mt-2 w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={state.kind === "saving"}
        className="mt-6 w-full rounded-lg bg-amber-400 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
      >
        {state.kind === "saving" ? "Saving…" : "Save My Choice"}
      </button>

      <p className="mt-4 text-sm text-neutral-300">
        By saving, you acknowledge the K-KUT{" "}
        <a href="/terms" className="text-amber-300 underline">
          Terms and Conditions
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-amber-300 underline">
          Privacy Policy
        </a>
        . Accepting those documents does not opt you in to SMS.
      </p>

      {state.message ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-lg border p-4 text-sm ${
            state.kind === "error"
              ? "border-red-700 bg-red-950 text-red-100"
              : state.kind === "success"
                ? "border-emerald-700 bg-emerald-950 text-emerald-100"
                : "border-neutral-700 bg-neutral-950 text-neutral-200"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
