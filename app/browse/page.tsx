import Link from "next/link";
import PublicIiBrowser from "@/components/PublicIiBrowser";

export const metadata = {
  title: "K-KUT Controlled Audio | G Putnam Music",
  description: "Controlled K-KUT playback and strict music safety status.",
};

export const dynamic = "force-dynamic";

const CANARY_BRANCH = "canary/thank-you-ch1-medium75";

export default function BrowsePage() {
  const canary =
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_COMMIT_REF === CANARY_BRANCH;

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className={`rounded-[2rem] border p-7 shadow-2xl md:p-10 ${
          canary
            ? "border-amber-300/50 bg-gradient-to-br from-[#3A2411] via-[#1A1008] to-[#050302]"
            : "border-red-400/40 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302]"
        }`}>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {canary ? "Thank You audio canary" : "Strict music emergency hold"}
          </h1>

          <p className="mt-5 max-w-4xl text-lg font-bold leading-8 text-[#EFEBE9]">
            {canary
              ? "Preview only: listen to one governed Thank You Chorus 1 II with the 75% MEDIUM Audio Logo. Sending and checkout remain closed."
              : "Public audio and checkout are closed. Every II must have an LT-PIX SSOT parent and explicit proof that the source and customer file contain authorized music. MC-BOT scripts and all no-music audio are prohibited."}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <span className="rounded-2xl border border-[#FFD54F]/40 bg-black/25 px-4 py-3 text-sm font-black text-[#FFF3C4]">
              {canary ? "Preview audio: 1" : "Public audio: 0"}
            </span>
            <span className="rounded-2xl border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm font-black text-red-100">
              Purchasable IIs: 0
            </span>
            <span className="rounded-2xl border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm font-black text-red-100">
              MC-BOT allowed: 0
            </span>
          </div>

          <Link href="/" className="mt-7 inline-block rounded-2xl border border-[#FFD54F]/65 px-5 py-3 text-sm font-black text-[#FFD54F]">
            Back home
          </Link>
        </header>

        <PublicIiBrowser />

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          {canary
            ? "Canary boundary: Preview playback only. Production, sending, and checkout remain blocked until the numeric LT-PIX parent ID and final listening approval are recorded."
            : "Reopening requires per-II LT-PIX SSOT, strict authorized-music proof, MC-BOT/no-music isolation, identity proof, Audio-Logo-at-end proof, and customer playback validation."}
        </footer>
      </section>
    </main>
  );
}
