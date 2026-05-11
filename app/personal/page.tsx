import Link from "next/link";

const categories = [
  ["thank-you", "Thank You", "Say thanks when ordinary words are not enough."],
  ["love", "Love", "Send a real music moment for love, romance, and devotion."],
  ["wedding", "Wedding", "A ceremonial music package for first dance, forever love, and wedding-party thanks."],
  ["birthday", "Birthday", "Celebrate someone with a focused song moment."],
  ["anniversary", "Anniversary", "Mark another year, another memory, another reason."],
  ["apology", "Apology", "Send a careful music moment when sorry matters."],
  ["encouragement", "Encouragement", "Help someone keep going."],
  ["hang-tough", "Hang Tough", "Send strength for hard days, pressure, tests, and resolve."],
  ["hope", "Hope", "Send belief, light, and a reason to keep going."],
  ["self-esteem", "Self-Esteem", "Help someone feel worthy, stronger, and more themselves."],
  ["thinking-of-you", "Thinking of You", "Send a small music moment that says you are on my mind."],
  ["just-because", "Just Because", "Send joy, beauty, surprise, or warmth without needing a reason."],
  ["missing-you", "Missing You", "Bridge distance with a personal music moment."],
  ["friendship", "Friendship", "For the friends who stayed, helped, and mattered."],
  ["best-friend", "Best Friend", "For the friend who feels like chosen family."],
  ["family", "Family", "For the people who are part of you."],
  ["new-baby", "New Baby", "Celebrate new life, family joy, and first memories."],
  ["comfort", "Comfort", "Offer warmth, peace, and presence."],
  ["get-well", "Get Well", "Send healing, care, and a better-days-ahead feeling."],
  ["recovery", "Recovery", "Support someone rebuilding strength, health, or self."],
  ["sympathy", "Sympathy", "Send gentle care when loss makes words difficult."],
  ["grief", "Grief", "Hold space for missing, memory, and sorrow."],
  ["memorial", "Memorial", "Honor memory, love, and what remains."],
  ["celebration-of-life", "Celebration of Life", "Remember a life with warmth, beauty, and gratitude."],
  ["reflection", "Reflection", "For memories, growth, healing, and looking back."],
  ["graduation", "Graduation", "Honor a finish, a beginning, and the future ahead."],
  ["retirement", "Retirement", "Celebrate work, rest, freedom, and a life chapter closing."],
  ["congratulations", "Congratulations", "Honor a win, a beginning, or a milestone."],
];

export default function PersonalPage() {
  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Personal
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Find the right words through music.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            Personal K-KUT HUGs are for year-round human moments: love, thanks,
            apology, encouragement, comfort, birthdays, family, friendship, and more.
          </p>
        </div>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Personal categories
              </p>
              <h2 className="mt-2 text-3xl font-black">Choose the kind of moment.</h2>
            </div>
            <Link
              href="/"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              Back home
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(([slug, title, line]) => {
              const isLiveThankYou = slug === "thank-you";

              return (
                <div
                  key={slug}
                  className={
                    isLiveThankYou
                      ? "rounded-[1.5rem] border border-amber-300/60 bg-[#331706] p-5 shadow-xl shadow-amber-900/20"
                      : "rounded-[1.5rem] border border-amber-300/20 bg-[#251209] p-5 shadow-xl"
                  }
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                    {isLiveThankYou ? "Live Personal HUG" : "Personal HUG"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-amber-50">{title}</h3>
                  <p className="mt-2 text-base font-bold leading-7 text-amber-50/75">
                    {line}
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    {isLiveThankYou ? (
                      <>
                        <Link
                          href="/hug/mothers-day"
                          className="rounded-2xl bg-amber-300 px-5 py-3 text-center text-sm font-black text-[#2a180d] transition hover:bg-amber-200"
                        >
                          Open live Thank You HUG →
                        </Link>
                        <Link
                          href="/personal/thank-you"
                          className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
                        >
                          See Thank You feeling paths
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/personal/${slug}`}
                        className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
                      >
                        Open {title} →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Working doctrine
          </p>
          <p className="mt-3 text-xl font-black leading-8">
            Occasion helps users enter. Feeling helps users choose. Music helps users send.
          </p>
        </section>
      </section>
    </main>
  );
}
