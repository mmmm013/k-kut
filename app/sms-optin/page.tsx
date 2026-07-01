import type { CSSProperties } from "react";

export const metadata = {
  title: "K-KUT SMS Opt-In",
  description:
    "K-KUT transactional customer-care SMS opt-in for orders, delivery links, support requests, and service-status updates.",
};

type SmsOptInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageStyle: CSSProperties = {
  maxWidth: 880,
  margin: "0 auto",
  padding: "48px 20px",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  lineHeight: 1.55,
};

const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 24,
  marginTop: 24,
  background: "#fff",
              color: "#1f2937",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginTop: 16,
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #bbb",
  borderRadius: 10,
  fontSize: 16,
  boxSizing: "border-box",
};

const smallStyle: CSSProperties = {
  color: "#1f2937",
  fontSize: 14,
};

export default async function SmsOptInPage({
  searchParams,
}: SmsOptInPageProps) {
  const params = searchParams ? await searchParams : {};
  const submitted = params.submitted === "1";
  const error = params.error === "missing-consent";

  return (
    <main style={pageStyle}>
      <p>
        <a href="/" aria-label="Back to K-KUT">
          ← Back to K-KUT
        </a>
      </p>

      <h1>K-KUT SMS Opt-In</h1>

      <p>
        K-KUT is operated by G Putnam Music, LLC. This page is for
        transactional and customer-care SMS consent only.
      </p>

      <section style={cardStyle}>
        <h2>SMS program description</h2>

        <p>
          K-KUT may send transactional customer-care SMS messages related to
          orders, digital delivery links, support requests, account/customer-care
          follow-up, and service-status updates.
        </p>

        <p>
          K-KUT does not use this SMS program for promotional blasts,
          third-party marketing, or unsolicited outreach.
        </p>
      </section>

      <section style={cardStyle}>
        <h2>Provide SMS consent</h2>

        {submitted ? (
          <div
            role="status"
            style={{
              border: "1px solid #8bc48b",
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
              background: "#f1fff1",
            }}
          >
            Thank you. Your K-KUT SMS opt-in request was received. K-KUT will
            only use SMS for transactional/customer-care purposes.
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            style={{
              border: "1px solid #d88",
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
              background: "#fff5f5",
            }}
          >
            Please provide a mobile phone number and check the SMS consent box
            before submitting.
          </div>
        ) : null}

        <form action="/api/sms-optin" method="post">
          <label htmlFor="name" style={labelStyle}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            style={inputStyle}
          />

          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={inputStyle}
          />

          <label htmlFor="phone" style={labelStyle}>
            Mobile phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 309 555 0123"
            required
            style={inputStyle}
          />

          <label
            htmlFor="smsConsent"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              marginTop: 20,
              fontWeight: 500,
            }}
          >
            <input
              id="smsConsent"
              name="smsConsent"
              type="checkbox"
              value="yes"
              style={{ marginTop: 6 }}
            />
            <span>
              By checking this box and submitting this form, I consent to
              receive transactional/customer-care SMS messages from K-KUT
              (G Putnam Music, LLC) about my order, digital delivery link,
              support request, account/customer-care follow-up, or service
              status. Message frequency varies. Message and data rates may
              apply. Reply STOP to opt out. Reply HELP for help. Consent to
              receive SMS messages is not a condition of any unrelated purchase.
            </span>
          </label>

          <button
            type="submit"
            style={{
              marginTop: 22,
              padding: "12px 18px",
              borderRadius: 999,
              border: "1px solid #111",
              fontWeight: 800,
              cursor: "pointer",
              background: "#111",
              color: "#fff",
            }}
          >
            Submit SMS opt-in request
          </button>
        </form>

        <p style={smallStyle}>
          This form is for SMS consent only. K-KUT messaging remains limited to
          transactional/customer-care communications.
        </p>
      </section>

      <section style={cardStyle}>
        <h2>SMS terms and disclosures</h2>

        <p>
          <strong>Program name:</strong> K-KUT
        </p>

        <p>
          <strong>Message purpose:</strong> transactional/customer-care messages
          about orders, digital delivery links, support requests,
          account/customer-care follow-up, and service-status updates.
        </p>

        <p>
          <strong>Frequency:</strong> message frequency varies based on your
          orders, delivery activity, support requests, or service-status needs.
        </p>

        <p>
          <strong>Rates:</strong> message and data rates may apply depending on
          your mobile carrier and service plan.
        </p>

        <p>
          <strong>Opt out:</strong> reply STOP to opt out.
        </p>

        <p>
          <strong>Help:</strong> reply HELP for help or contact{" "}
          <a href="mailto:reachus@gputnammusic.com">
            reachus@gputnammusic.com
          </a>
          .
        </p>

        <p>
          <strong>No sale or marketing sharing:</strong> mobile phone numbers
          and SMS consent information are not sold, rented, shared, or disclosed
          to third parties or affiliates for their marketing or promotional
          purposes.
        </p>

        <p>
          Review the{" "}
          <a href="/privacy">
            K-KUT Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms">
            K-KUT Terms
          </a>
          .
        </p>
      </section>
    </main>
  );
}
