"use client";

const BLK3_LYRICS = [
  "And I know that you are sleeping",
  "Dreaming peaceful dreams",
  "And I am still awake",
  "Just thinking of things",
  "Where we have come from",
  "and the things that we have seen",
  "where we are now",
  "and where we will be",
];

const BLK4_LYRICS = [
  "and I love you forever, forever and a day",
  "I'm yours forever",
  "and our love will remain",
  "and I'll never want to close the book we started yesterday",
  "and I love you girl, forever and ever",
];

export default function KomboFieldTestRecipientPage() {
  async function copyHugLink() {
    const hugUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(hugUrl);
      window.alert("HUG link copied.");
    } catch {
      window.prompt("Copy this HUG link:", hugUrl);
    }
  }

  async function forwardHug() {
    const hugUrl = window.location.href;
    const text =
      "A private GPM Wedding HUG was sent just for you: Forever & a Day";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "GPM Wedding HUG",
          text,
          url: hugUrl,
        });
        return;
      } catch {
        // Continue to the clipboard fallback when sharing is cancelled or fails.
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${hugUrl}`);
      window.alert("HUG link copied for forwarding.");
    } catch {
      window.prompt("Copy and forward this HUG link:", hugUrl);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f7efe3",
        color: "#3b2415",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 620,
          margin: "0 auto",
          background: "#fffaf3",
          border: "1px solid #d8b98c",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 18px 40px rgba(59, 36, 21, 0.16)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8a633c",
            fontWeight: 700,
          }}
        >
          GPM Wedding HUG
        </p>
        <h1 style={{ margin: "0 0 10px", fontSize: 34, lineHeight: 1.04 }}>
          Forever &amp; a Day
        </h1>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 16,
            lineHeight: 1.45,
            color: "#5e422d",
          }}
        >
          A private wedding music moment sent just for you.
        </p>

        <div
          style={{
            borderRadius: 18,
            padding: 18,
            background: "#ead4b3",
            border: "1px solid #c99f68",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Play HUG
          </p>
          <audio
            controls
            preload="metadata"
            controlsList="nodownload"
            style={{ width: "100%" }}
            src="/ii-delivery/wedding/faad/FAAD-KOMBO-BLK3-BLK4-FIELD-TEST-1-DP.mp3"
          />
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 12,
              lineHeight: 1.4,
              color: "#6f5139",
            }}
          >
            Stream-only. No download.
          </p>
        </div>

        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            padding: 18,
            background: "#fff6e8",
            border: "1px solid #d8b98c",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8a633c",
            }}
          >
            Words in this HUG
          </p>
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
                Thinking of where we have been
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                }}
              >
                {BLK3_LYRICS.join("\n")}
              </p>
            </div>
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
                The promise that remains
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                }}
              >
                {BLK4_LYRICS.join("\n")}
              </p>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={forwardHug}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "14px 16px",
              background: "#3b2415",
              color: "#fffaf3",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Forward this
          </button>
          <button
            type="button"
            onClick={copyHugLink}
            style={{
              border: "1px solid #b98b55",
              borderRadius: 999,
              padding: "14px 16px",
              background: "#fffaf3",
              color: "#3b2415",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Copy this HUG link
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/hug";
            }}
            style={{
              border: "1px solid #b98b55",
              borderRadius: 999,
              padding: "14px 16px",
              background: "#fffaf3",
              color: "#3b2415",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Send your own
          </button>
        </div>
      </section>
    </main>
  );
}
