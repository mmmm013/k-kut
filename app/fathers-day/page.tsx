import type { Metadata } from "next";

import productStatements from "../../data/kk-sets/fathers-day-product-statements.json";

export const metadata: Metadata = {
  title: "Father's Day HUGs | K-KUT",
  description:
    "Tell MC-BOT how Dad should feel. Hear a matched Father’s Day K-KUT HUG and send a private link.",
};

type ProductItem = {
  id?: string;
  title?: string;
  name?: string;
tierLabel?: string;
  typeLabel?: string;
  feelingLane?: string;
  displayCopy?: string;
  priceLabel?: string;
  promoPriceLabel?: string;
  audioUrl?: string;
  publicAudioUrl?: string;
  localReviewFile?: string;
  checkoutUrl?: string;
  buyUrl?: string;
  stripePaymentLink?: string;
};

const productData = productStatements as { items?: ProductItem[]; products?: ProductItem[] };
const products = productData.items ?? productData.products ?? [];

const feelings = [
  "Strong / steady",
  "Proud / respect",
  "Loved",
  "Grateful",
  "Remembered",
  "Hard to say",
];

const sizeChoices = [
  "Tiny touch",
  "Short phrase",
  "Classic K-KUT",
  "Bigger K-KUT KOMBO",
  "Father’s Day HUG package",
];

const steps = [
  "Tell MC-BOT who this is for.",
  "Say how Dad should feel when he hears it.",
  "MC-BOT narrows the match.",
  "Choose smaller, classic, or bigger if needed.",
  "Hear the option.",
  "Approve, add a note, and send.",
];

function publicPath(raw?: string) {
  if (!raw) return "";
  if (raw.startsWith("public/")) return `/${raw.slice("public/".length)}`;
  return raw;
}


function productId(item: ProductItem) {
  return (
    item.id ??
    (item.kutId ?? item.id ?? item.publicDisplayCode ?? "KUT")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function productHref(item: ProductItem) {
  return (
    item.buyUrl ??
    item.checkoutUrl ??
    item.stripePaymentLink ??
    `/checkout?product=${encodeURIComponent(productId(item))}`
  );
}

export default function FathersDayPage() {
  return (
    <main className="fdPage">
      <section className="hero">
        <p className="eyebrow">Father’s Day HUGs</p>
        <h1>How should Dad feel when he hears this?</h1>
        <p className="lead">
          Tell MC-BOT what you want this Father’s Day HUG to do. MC-BOT helps
          narrow the options so you do not have to hear everything.
        </p>

        <div className="actions">
          <a className="primary" href="#feelings">
            Tell MC-BOT the feeling
          </a>
          <a className="secondary" href="#ready">
            Look around with MC-BOT
          </a>
        </div>

        <div className="promise">
          <span>Hear it first</span>
          <span>Adjust smaller or bigger</span>
          <span>Send a private HUG link</span>
        </div>
      </section>

      <section id="feelings" className="panel">
        <div className="botIntro">
          <p className="eyebrow">MC-BOT guide</p>
          <h2>Tell me what you want Dad to receive.</h2>
          <p>
            You are not choosing from a wall of products. You tell us the
            feeling. MC-BOT narrows the available K-KUT options and brings forward a match.
          </p>
        </div>

        <div className="feelings">
          {feelings.map((feeling) => (
            <a className="feeling" href="#ready" key={feeling}>
              {feeling}
            </a>
          ))}
        </div>
      </section>

      <section className="stepsPanel">
        <p className="eyebrow">Six simple steps</p>
        <h2>You direct it. MC-BOT helps.</h2>
        <div className="steps">
          {steps.map((step, index) => (
            <article className="step" key={step}>
              <strong>{index + 1}</strong>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sizePanel">
        <p className="eyebrow">Sizing happens during narrowing</p>
        <h2>Make it tiny, classic, bigger, or gift-ready.</h2>
        <p>
          You do not need to decide size first. MC-BOT can start with the
          feeling, then help you make the HUG smaller, fuller, or more complete.
        </p>
        <div className="sizes">
          {sizeChoices.map((choice) => (
            <span key={choice}>{choice}</span>
          ))}
        </div>
      </section>

      <section id="ready" className="readyPanel">
        <div className="readyHead">
          <p className="eyebrow">Ready options</p>
          <h2>Hear a few Father’s Day matches.</h2>
          <p>
            Hear a match, ask MC-BOT to adjust it, or send it when it feels right.
          </p>
        </div>

        <div className="cards">
          {products.map((item, index) => {
            const publicCode = `KK${index + 1}`;
            const audio = publicPath(
              item.audioUrl ?? item.publicAudioUrl ?? item.localReviewFile
            );

            return (
              <article className="card" key={productId(item)}>
                <div className="cardTop">
                  <span>Ready match</span>
                  <strong>{item.promoPriceLabel ?? item.priceLabel ?? "$4.99"}</strong>
                </div>

                <h3>{publicCode}</h3>
                <p>
                  A K-KUT match MC-BOT can help compare, adjust, or send.
                </p>

                {audio ? (
                  <audio controls preload="metadata" src={audio}>
                    Your browser does not support the audio element.
                  </audio>
                ) : null}

                <div className="cardActions">
                  <a className="send" href={productHref(item)}>
                    {`Send ${publicCode}`}
                  </a>
                  <a className="help" href="#feelings">
                    Ask MC-BOT to narrow
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="support">
        <p className="eyebrow">Optional support</p>
        <h2>Support GPMx invention work after the choice is clear.</h2>
        <p>
          Product price stays separate. Optional support helps keep real
          emotional audio moments alive and available.
        </p>
      </section>

      <style>{`
        .fdPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(244, 198, 104, 0.24), transparent 34rem),
            linear-gradient(180deg, #100d08 0%, #1b130b 54%, #0d0b08 100%);
          color: #fff8e8;
          padding: 26px 18px 70px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .hero,
        .panel,
        .stepsPanel,
        .sizePanel,
        .readyPanel,
        .support {
          width: min(1040px, 100%);
          margin: 0 auto;
        }

        .hero {
          min-height: 88vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 22px 0 36px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #f4c668;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.74rem;
          font-weight: 950;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        h1 {
          max-width: 850px;
          font-size: clamp(3rem, 14vw, 7rem);
          line-height: 0.88;
          letter-spacing: -0.075em;
          margin-bottom: 18px;
        }

        h2 {
          font-size: clamp(1.75rem, 5vw, 3.15rem);
          line-height: 1;
          letter-spacing: -0.045em;
          margin-bottom: 12px;
        }

        h3 {
          font-size: 1.35rem;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .lead {
          max-width: 680px;
          color: #f0dfbc;
          font-size: clamp(1.05rem, 4vw, 1.35rem);
          line-height: 1.55;
          margin-bottom: 24px;
        }

        .actions,
        .promise,
        .cardActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .primary,
        .secondary,
        .send,
        .help,
        .feeling {
          border-radius: 999px;
          text-decoration: none;
          font-weight: 950;
          text-align: center;
        }

        .primary,
        .secondary {
          padding: 15px 20px;
          min-width: 220px;
        }

        .primary,
        .send {
          background: #f4c668;
          color: #17110a;
        }

        .secondary,
        .help {
          background: rgba(255,255,255,0.1);
          color: #fff3d2;
          border: 1px solid rgba(244,198,104,0.42);
        }

        .promise {
          margin-top: 24px;
        }

        .promise span,
        .sizes span {
          border: 1px solid rgba(244,198,104,0.36);
          border-radius: 999px;
          padding: 9px 12px;
          background: rgba(255,255,255,0.07);
          color: #ffe5a8;
          font-weight: 800;
          font-size: 0.92rem;
        }

        .panel,
        .stepsPanel,
        .sizePanel,
        .readyPanel,
        .support {
          padding: 32px 0;
        }

        .botIntro,
        .step,
        .sizePanel,
        .card,
        .support {
          border: 1px solid rgba(244,198,104,0.23);
          border-radius: 24px;
          background: rgba(255,255,255,0.075);
          box-shadow: 0 22px 70px rgba(0,0,0,0.25);
        }

        .botIntro,
        .sizePanel,
        .support {
          padding: 22px;
        }

        .botIntro p,
        .step p,
        .sizePanel p,
        .readyHead p,
        .card p,
        .support p {
          color: #eadabd;
          line-height: 1.55;
        }

        .feelings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .feeling {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 54px;
          padding: 12px;
          background: #fff4d0;
          color: #181107;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .step {
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 12px;
          padding: 16px;
        }

        .step strong {
          width: 36px;
          height: 36px;
          display: inline-grid;
          place-items: center;
          border-radius: 50%;
          background: #f4c668;
          color: #17110a;
        }

        .sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .readyHead {
          max-width: 700px;
          margin-bottom: 16px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px;
        }

        .card {
          padding: 18px;
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-bottom: 12px;
        }

        .cardTop span {
          color: #ffd982;
          font-weight: 900;
        }

        .cardTop strong {
          border-radius: 999px;
          background: #f4c668;
          color: #17110a;
          padding: 6px 10px;
        }

        audio {
          width: 100%;
          margin: 10px 0 14px;
        }

        .send,
        .help {
          padding: 11px 14px;
          flex: 1 1 150px;
        }

        @media (max-width: 720px) {
          .hero {
            justify-content: flex-start;
            padding-top: 38px;
          }

          .primary,
          .secondary {
            width: 100%;
          }

          .promise span,
          .sizes span {
            width: 100%;
            text-align: center;
          }

          .cardTop {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
