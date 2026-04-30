"use client";

import BBBotDemo from "@/components/BBBotDemo";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] text-[#F5E6C8]">
      <header className="border-b border-[#D4A017]/20 px-6 py-4">
        <Link href="/" className="text-[#D4A017] font-bold">
          ← K-KUT
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-sm uppercase tracking-[0.3em] text-[#C8A882]">
          BB BOT Guided Demo
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Find the exact feeling moment.
        </h1>

        <p className="mt-4 max-w-2xl text-[#E8CFA8]">
          Choose a feeling. BB BOT walks you through the 4PE path and offers
          three real mini-KUT directions from one source moment.
        </p>

        <div className="mt-10">
          <BBBotDemo />
        </div>

        <p className="mt-10 text-sm text-[#C8A882]">
          Powered by 4PE PROMOTER. Real audio only. No artificial final vocals.
        </p>
      </section>
    </main>
  );
}