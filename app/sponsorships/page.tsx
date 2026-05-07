const CONTACT_EMAIL = "reachus@gputnammusic.com";

export default function SponsorshipsPage() {
  const subject = encodeURIComponent("K-KUT Sponsorship Membership");
  const body = encodeURIComponent(
    "Hello G Putnam Music,\n\nI would like information about K-KUT sponsorship memberships.\n\nName:\nOrganization:\nBest phone/email:\nInterest:\n"
  );

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-amber-300/20 bg-white/5 p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">
          Sponsorship Memberships
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Support K-KUT through sponsorship membership.
        </h1>

        <p className="mt-5 text-lg leading-8 text-neutral-200">
          Donation and public one-off purchase flows are paused. We are currently
          accepting sponsorship membership inquiries only.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200/20 bg-amber-950/20 p-5">
          <p className="font-semibold text-amber-100">
            Contact G Putnam Music
          </p>
          <p className="mt-2 text-neutral-200">
            All sponsorship membership inquiries go to{" "}
            <a
              className="font-bold text-amber-200 underline"
              href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>

        <a
          className="mt-8 inline-flex rounded-full bg-amber-300 px-6 py-3 font-black text-neutral-950 shadow-lg"
          href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}
        >
          Ask about sponsorship membership
        </a>

        <p className="mt-6 text-sm leading-6 text-neutral-400">
          K-KUT HUG playback remains available for listening and demonstration.
          Sponsorship membership details are handled directly through G Putnam Music.
        </p>
      </section>
    </main>
  );
}
