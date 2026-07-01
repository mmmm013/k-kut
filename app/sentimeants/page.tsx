const kkutCheckoutUrl =
  process.env.NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL ||
  "https://www.k-kut.com/checkout";

export default function SentimeantsLandingPage() {
  return (
    <main className="min-h-screen bg-[#1b120d] px-6 py-10 text-[#fff7ea]">
      <section className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-4 text-sm">
          <a href="/" className="font-semibold text-[#ffd27a]">
            K-KUT
          </a>
          <div className="flex gap-4 text-[#f6d9ad]">
            <a href="https://www.k-kut.com/privacy" className="hover:text-white">
              Privacy
            </a>
            <a href="https://www.k-kut.com/terms" className="hover:text-white">
              Terms
            </a>
          </div>
        </nav>

        <section className="mt-16 rounded-3xl border border-[#5b3926] bg-[#26170f] p-8 shadow-2xl md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ffd27a]">
            Sent-i-Meants
          </p>

          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
            Send what you meant.
          </h1>

          <p className="mt-5 max-w-2xl text-2xl font-semibold text-[#ffd27a]">
            from me to you!
          </p>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#f6d9ad]">
            Sent-i-Meants are emotional audio gifts powered by K-KUT and
            G Putnam Music, LLC. Choose a feeling, send a short-KUT or KareKut,
            and give someone a real moment they can play, keep, and feel.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href={kkutCheckoutUrl}
              className="rounded-full bg-[#ffd27a] px-7 py-4 text-center text-base font-bold text-[#1b120d] transition hover:bg-white"
            >
              Start a KareKut
            </a>
            <a
              href="https://www.k-kut.com"
              className="rounded-full border border-[#ffd27a] px-7 py-4 text-center text-base font-bold text-[#ffd27a] transition hover:bg-[#3a2518]"
            >
              Visit K-KUT delivery
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#5b3926] bg-[#24160f] p-6">
            <h2 className="text-xl font-bold text-white">short-KUT</h2>
            <p className="mt-2 text-3xl font-black text-[#ffd27a]">$1.99</p>
            <p className="mt-3 text-sm leading-6 text-[#f6d9ad]">
              A small emotional audio moment when a quick feeling says enough.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ffd27a] bg-[#2d1b11] p-6">
            <h2 className="text-xl font-bold text-white">KareKut</h2>
            <p className="mt-2 text-3xl font-black text-[#ffd27a]">$4.99</p>
            <p className="mt-3 text-sm leading-6 text-[#f6d9ad]">
              A fuller emotional audio gift for care, thanks, support, love,
              apology, memory, and connection.
            </p>
          </div>

          <div className="rounded-2xl border border-[#5b3926] bg-[#24160f] p-6">
            <h2 className="text-xl font-bold text-white">Signature / Holiday</h2>
            <p className="mt-2 text-3xl font-black text-[#ffd27a]">$9.99+</p>
            <p className="mt-3 text-sm leading-6 text-[#f6d9ad]">
              Bigger emotional deliveries for special moments, holidays, and
              deeper messages.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-[#5b3926] bg-[#24160f] p-6">
          <h2 className="text-2xl font-bold text-white">How it works</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div>
              <p className="font-bold text-[#ffd27a]">1. Choose</p>
              <p className="mt-2 text-sm leading-6 text-[#f6d9ad]">
                Pick the feeling you want to send.
              </p>
            </div>
            <div>
              <p className="font-bold text-[#ffd27a]">2. Select</p>
              <p className="mt-2 text-sm leading-6 text-[#f6d9ad]">
                Choose a short-KUT, KareKut, or special delivery.
              </p>
            </div>
            <div>
              <p className="font-bold text-[#ffd27a]">3. Add</p>
              <p className="mt-2 text-sm leading-6 text-[#f6d9ad]">
                Add an optional note or short personal message when available.
              </p>
            </div>
            <div>
              <p className="font-bold text-[#ffd27a]">4. Send</p>
              <p className="mt-2 text-sm leading-6 text-[#f6d9ad]">
                Delivery and support are handled through K-KUT.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-[#5b3926] pt-6 text-sm leading-6 text-[#d9b98c]">
          <p>
            Sent-i-Meants are powered by K-KUT and G Putnam Music, LLC.
            Payments, delivery, support, SMS updates, Privacy, and Terms may be
            handled through k-kut.com.
          </p>
          <p className="mt-3">
            Contact:{" "}
            <a href="mailto:reachus@gputnammusic.com" className="text-[#ffd27a] underline">
              reachus@gputnammusic.com
            </a>
          </p>
        </footer>
      </section>
    </main>
  );
}
