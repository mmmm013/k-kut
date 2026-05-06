export const metadata = {
  title: "Lu, this is for you to share with Mom.",
  description: "A private real-music K-KUT HUG.",
};

export default function RecipientHugPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center">
        <div className="w-full rounded-[2rem] border border-amber-300/30 bg-[#24180F] p-7 shadow-2xl shadow-black/40 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-300">
            K-KUT HUG
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
            Lu, this is for you to share with Mom.
          </h1>

          <p className="mt-6 text-xl font-bold leading-relaxed text-amber-50/85">
            I picked this private real-music moment for you to pass along with warmth, love, and thanks.
          </p>

          <p className="mt-5 rounded-3xl border border-amber-300/25 bg-black/20 p-5 text-lg font-bold leading-relaxed text-amber-50/80">
            For Mom: we picked this K-KUT HUG for you because we wanted to send something warm, personal, and full of love.
          </p>

          <div className="mt-8 rounded-3xl border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">
              Your HUG
            </p>

            <h2 className="mt-3 text-3xl font-black text-amber-100">
              A real music moment
            </h2>

            <audio
              controls
              preload="metadata"
              className="mt-6 w-full rounded-xl border border-amber-300/25 bg-[#1A120B] p-3"
            >
              <source
                src="/mothers-day/samples/thank-you-chorus-sample.mp3"
                type="audio/mpeg"
              />
              Your browser does not support the audio element.
            </audio>
          </div>

          <p className="mt-6 text-sm font-bold leading-relaxed text-amber-50/60">
            No checkout here. No download. No searching. This page is just the
            HUG meant for you to receive.
          </p>
        </div>
      </section>
    </main>
  );
}
