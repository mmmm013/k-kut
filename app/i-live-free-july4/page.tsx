const items = [
  {
    title: "I Live Free · KareKUT",
    line: "Actual short KK candidate · source render 23.497s · prepared through DP/STI release gate.",
    audio: "/i-live-free-july4/audio/i-live-free-karekut-dp-sti.mp3",
  },
  {
    title: "I Live Free · ShortKUT",
    line: "Actual short KK candidate · source render 17.996s · prepared through DP/STI release gate.",
    audio: "/i-live-free-july4/audio/i-live-free-shortkut-dp-sti.mp3",
  },
];

export default function ILiveFreeJuly4Page() {
  return (
    <main className="min-h-screen bg-[#09070b] px-5 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
          G Putnam Music · K-KUT
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight">
          I Live Free
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-7 text-white/75">
          Two actual short K-KUT moments from <em>I Live Free</em>. Turn it up.
          Make noise for freedom, breath, and forward motion.
        </p>

        <div className="mt-8 grid gap-5">
          {items.map((item) => (
            <section
              key={item.audio}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl"
            >
              <h2 className="text-3xl font-black text-[#FFD54F]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{item.line}</p>
              <audio className="mt-5 w-full" controls src={item.audio} />
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/60">
          © G Putnam Music. K-KUT promo audio prepared through GPM release gate.
        </p>
      </section>
    </main>
  );
}
