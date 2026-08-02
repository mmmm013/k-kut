import Link from "next/link";

export const metadata = {
  title: "Sent-i-Meants | Send what you meant",
  description:
    "Start with the feeling. Sent-i-Meants helps shape what you want to say and what the other person may need to hear.",
};

const feelings = [
  {
    id: "thank-you",
    title: "Thank You iMeant",
    want: "I noticed. I remember. I am grateful.",
    hear: "You mattered more than you know.",
  },
  {
    id: "sorry",
    title: "Sorry iMeant",
    want: "I wish I had said it better.",
    hear: "Your feelings matter to me.",
  },
  {
    id: "miss-you",
    title: "Miss You iMeant",
    want: "You are still close to my heart.",
    hear: "You have not been forgotten.",
  },
  {
    id: "proud-of-you",
    title: "Proud of You iMeant",
    want: "I see your strength.",
    hear: "What you are doing matters.",
  },
  {
    id: "still-care",
    title: "Still Care iMeant",
    want: "Even now, I still care.",
    hear: "The connection was real.",
  },
] as const;

export default function SentimeantHome() {
  return (
    <main className="min-h-screen bg-[#f7efe4] text-[#3b241b]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-6 border-b border-[#d9baa2] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#9a4f35]">
              Sent-i-Meants
            </p>
            <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-[#542c20] sm:text-6xl">
              Sent-i-Meants
            </h1>
            <p className="mt-2 text-lg font-bold italic text-[#7a4937]">
              Send what you meant.
            </p>
          </div>

          <nav
            aria-label="Sent-i-Meants navigation"
            className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-black text-[#653827]"
          >
            <a className="hover:underline" href="#imeants">
              iMeants
            </a>
            <a className="hover:underline" href="#mirror">
              The Mirror
            </a>
            <a className="hover:underline" href="#how">
              How it works
            </a>
            <a
              className="hover:underline"
              href="mailto:reachus@gputnammusic.com"
            >
              Contact
            </a>
          </nav>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#a35539]">
              A new way to send a feeling
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl font-black leading-[0.98] text-[#4b271c] sm:text-7xl">
              Send an <em className="text-[#b55f43]">iMeant.</em>
            </h2>
            <p className="mt-7 max-w-2xl text-xl font-bold leading-8 text-[#5e392b]">
              A text says what you typed. An iMeant says what you meant.
            </p>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#785342]">
              For the thank-you. For the apology. For the “I miss you.” For
              the words that are hard to say plainly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[#8f412e] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#713020]"
                href="#imeants"
              >
                Start with the feeling
              </a>
              <a
                className="rounded-full border-2 border-[#9c624b] px-6 py-4 text-sm font-black text-[#653827] transition hover:bg-white/60"
                href="#mirror"
              >
                See The Mirror
              </a>
            </div>
          </div>

          <div
            aria-label="Sent-i-Meants envelope and heart"
            className="relative mx-auto flex min-h-80 w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-[#d7b49d] bg-gradient-to-br from-[#fffaf3] via-[#f6dfcf] to-[#e9bca2] p-8 text-center shadow-[0_25px_70px_rgba(92,50,34,0.22)]"
          >
            <div className="text-8xl drop-shadow-sm" aria-hidden="true">
              ✉️
            </div>
            <div
              className="absolute left-1/2 top-1/2 -translate-y-8 text-6xl text-[#b13e39] drop-shadow-md"
              aria-hidden="true"
            >
              ♥
            </div>
            <p className="mt-10 max-w-xs font-serif text-2xl font-black leading-8 text-[#5b3023]">
              Choose a feeling. Send what you meant.
            </p>
          </div>
        </section>

        <section
          className="rounded-[2.25rem] border border-[#d8b9a3] bg-[#fffaf4] p-6 shadow-sm sm:p-9"
          id="imeants"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#a35539]">
            iMeants
          </p>
          <h2 className="mt-3 font-serif text-4xl font-black text-[#4b271c] sm:text-5xl">
            Start with the feeling.
          </h2>
          <p className="mt-4 max-w-3xl font-semibold leading-7 text-[#76503f]">
            Pick the closest beginning. MC-BOT will listen and help clarify
            what you mean before any music is considered.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {feelings.map((feeling) => (
              <Link
                key={feeling.id}
                href={`/sentimeant/start?feeling=${feeling.id}`}
                className="group flex min-h-40 flex-col justify-between rounded-[1.5rem] border border-[#d6ae97] bg-[#f8e7da] p-5 transition hover:-translate-y-1 hover:border-[#9f583e] hover:bg-[#f3d8c6] hover:shadow-lg"
              >
                <span className="font-serif text-xl font-black text-[#5a2f22]">
                  {feeling.title}
                </span>
                <span className="mt-5 text-sm font-black text-[#99472f] group-hover:underline">
                  Begin here →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12" id="mirror">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#a35539]">
            The Mirror
          </p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-black leading-tight text-[#4b271c] sm:text-5xl">
            What you want to say. What they may need to hear.
          </h2>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {feelings.map((feeling) => (
              <article
                className="rounded-[1.75rem] border border-[#dabaa5] bg-white/70 p-6 shadow-sm"
                key={feeling.id}
              >
                <h3 className="font-serif text-2xl font-black text-[#5b3023]">
                  {feeling.title}
                </h3>
                <p className="mt-5 text-sm font-semibold leading-6 text-[#76503f]">
                  <strong className="text-[#773824]">
                    What you want to say:
                  </strong>
                  <br />
                  {feeling.want}
                </p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#76503f]">
                  <strong className="text-[#773824]">
                    What they may need to hear:
                  </strong>
                  <br />
                  {feeling.hear}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="rounded-[2.25rem] border border-[#d8b9a3] bg-[#5b3023] p-7 text-[#fff8f0] shadow-xl sm:p-10"
          id="how"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f0b895]">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-4xl font-black sm:text-5xl">
            No rush. No blast. Just care.
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["1. Choose", "Pick the feeling you want to send."],
              ["2. Shape", "Choose the message tone that feels true."],
              [
                "3. Send",
                "Share a short feeling when plain words are not enough.",
              ],
              ["4. Care", "Every iMeant is meant to be handled gently."],
            ].map(([title, text]) => (
              <div
                className="rounded-2xl border border-[#d89977]/35 bg-black/15 p-5"
                key={title}
              >
                <strong className="font-serif text-xl text-[#ffd4b8]">
                  {title}
                </strong>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#f8e4d7]">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-7 text-sm font-bold leading-7 text-[#f0cdb8]">
            Review branch: the original welcoming front door is restored.
            MC-BOT continues only after a customer chooses a feeling. No audio,
            inventory assignment, checkout, or delivery is enabled here.
          </p>
        </section>

        <footer className="py-10 text-center text-sm font-semibold leading-7 text-[#795241]">
          <p>
            Sent-i-Meants is a customer-safe emotional message experience by G
            Putnam Music, LLC.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 font-black text-[#673a2b]">
            <span>♥ Care</span>
            <span>✉️ Send</span>
            <span>☀️ Warmth</span>
            <span>✓ Gentle</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
