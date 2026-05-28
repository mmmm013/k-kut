import {
  tugMcBotDoctrine,
  tugMcBotScript,
  tugMcBotWholeAudioSrc,
} from "@/lib/tugMcBotScript";

const steps = [
  { id: "start", label: "Start" },
  { id: "listen", label: "Listen" },
  { id: "choose", label: "Choose" },
  { id: "compare", label: "Compare" },
  { id: "checkout", label: "Checkout" },
] as const;

export default function TugPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] text-[#F5E6C8]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            K-KUT TUGs • MC-BOT
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            MC-BOT guides each TUG one step at a time.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#F5E6C8]/80">
            TUGs keep users focused: see every step, follow the current step,
            listen first, then choose the right K-KUT.
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={[
                "rounded-3xl border p-4 text-center",
                index === 0
                  ? "border-[#D4A017] bg-[#D4A017] text-[#1A120B]"
                  : "border-[#D4A017]/25 bg-[#24180F] text-[#F5E6C8]",
              ].join(" ")}
            >
              <p className="text-xs font-black uppercase tracking-wide">
                Step {index + 1}
              </p>
              <p className="mt-1 text-lg font-black">{step.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#D4A017]/25 bg-[#24180F] p-6 shadow-2xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#D4A017]">
            Real MC-BOT recording
          </p>
          <h2 className="mt-3 text-3xl font-black">
            Michael Clay / MC-BOT whole TUG script audio.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#F5E6C8]/70">
            This is the real recorded source file. No generated voice. No autoplay.
            Line-level clips can be segmented later from this approved whole recording.
          </p>

          <div className="mt-6 rounded-2xl border border-[#D4A017]/25 bg-[#1A120B] p-4">
            <p className="mb-3 text-sm font-black text-[#D4A017]">
              Play MC-BOT whole TUG recording
            </p>
            <audio controls preload="none" controlsList="nodownload" className="w-full">
              <source src={tugMcBotWholeAudioSrc} />
              Your browser does not support audio playback.
            </audio>
            <p className="mt-2 text-xs text-[#F5E6C8]/60">
              Audio starts only when the user presses play.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#D4A017]/25 bg-[#24180F] p-6 shadow-2xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#D4A017]">
            MC-BOT TUG script
          </p>
          <h2 className="mt-3 text-3xl font-black">
            Approved guide lines.
          </h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {tugMcBotScript.map((item, index) => (
              <article
                key={item.id}
                className="rounded-3xl border border-[#D4A017]/25 bg-[#1A120B] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#D4A017]">
                      Line {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{item.label}</h3>
                    <p className="mt-3 text-base leading-7 text-[#F5E6C8]/90">
                      “{item.line}”
                    </p>
                  </div>
                  <span className="rounded-full border border-[#D4A017]/25 px-3 py-2 text-xs font-black uppercase tracking-wide text-[#D4A017]">
                    {item.step}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#D4A017]/25 bg-[#1A120B] p-5 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#D4A017]">
            TUG doctrine
          </p>
          <p className="mt-3 text-sm leading-6 text-[#F5E6C8]/60">
            Source attachment: {tugMcBotDoctrine.audioAttachmentName}. No autoplay.
            No fake voice. User-controlled audio only.
          </p>
        </div>
      </section>
    </main>
  );
}
