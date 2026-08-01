import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";
import "./globals.css";
import SingleAudioPlaybackGuard from "@/components/SingleAudioPlaybackGuard";
import { platformForHost } from "@/lib/crossDomainHugDp";

export const metadata: Metadata = {
  title: "GPMx — HUGs, TUGs & BUGs",
  description:
    "GPM customer packages: HUGs, TUGs, and BUGs. Each package preserves the exact underlying II identity.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GPMx",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

function normalizedHost(headerList: Awaited<ReturnType<typeof headers>>) {
  return (
    headerList.get("x-vercel-forwarded-host") ||
    headerList.get("x-forwarded-host") ||
    headerList.get("host") ||
    ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];
}

function GpmxHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-300/20 bg-[#0a0a0a]/90 px-5 py-3 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <a
            href="/"
            className="text-lg font-black tracking-[0.22em] text-amber-200"
          >
            GPMx
          </a>
          <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-amber-50/55 sm:inline">
            Music authority & discovery
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-black">
          <a
            href="/"
            className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
          >
            Home
          </a>
          <a
            href="/find"
            className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
          >
            Discover
          </a>
          <a
            href="/themes"
            className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
          >
            Themes
          </a>
          <a
            href="/kupid"
            className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
          >
            Kupid
          </a>
          <a
            href="/wedding"
            className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
          >
            Wedding
          </a>
        </div>
      </nav>
    </header>
  );
}

function SentimeantHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#d7b49d] bg-[#fffaf4]/95 px-5 py-3 text-[#542c20] backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <a
            href="/"
            className="text-lg font-black tracking-[0.22em] text-[#7c3d2a]"
          >
            GPMx
          </a>
          <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-[#8a6656] sm:inline">
            Meaning, reflection & matching
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-black">
          <a className="hover:underline" href="/">
            Sent-i-Meants
          </a>
          <a className="hover:underline" href="/sentimeant/start">
            Tell MC-BOT
          </a>
          <a
            className="hover:underline"
            href="mailto:reachus@gputnammusic.com"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}

function KkutHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#FFD54F]/25 bg-[#09070B]/95 px-5 py-3 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <a
            href="/"
            className="text-lg font-black tracking-[0.22em] text-[#FFD54F]"
          >
            GPMx
          </a>
          <span className="text-sm font-black text-[#FFF8E1]">K-KUT</span>
          <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-[#BCAAA4] sm:inline">
            Choose, buy, send & receive
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-black">
          <a
            href="/"
            className="rounded-full border border-[#FFD54F]/25 px-3 py-2 text-[#FFF8E1] transition hover:border-[#FFD54F]/70"
          >
            Home
          </a>
          <a
            href="/browse"
            className="rounded-full border border-[#FFD54F]/25 px-3 py-2 text-[#FFF8E1] transition hover:border-[#FFD54F]/70"
          >
            Packages
          </a>
          <a
            href="/find"
            className="rounded-full border border-[#FFD54F]/25 px-3 py-2 text-[#FFF8E1] transition hover:border-[#FFD54F]/70"
          >
            Find
          </a>
          <a
            href="/personal"
            className="rounded-full border border-[#FFD54F]/25 px-3 py-2 text-[#FFF8E1] transition hover:border-[#FFD54F]/70"
          >
            Personal
          </a>
          <a
            href="/holiday"
            className="rounded-full border border-[#FFD54F]/25 px-3 py-2 text-[#FFF8E1] transition hover:border-[#FFD54F]/70"
          >
            Holiday
          </a>
        </div>
      </nav>
    </header>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = normalizedHost(await headers());
  const platform = platformForHost(host);
  const isHugzHost = platform.id === "13hugz";
  const isSentimeantHost = platform.id === "sentimeants";
  const isGpmxHost = platform.id === "gpmx";

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-[#F5e6c8] antialiased">
        {!isHugzHost &&
          (isSentimeantHost ? (
            <SentimeantHeader />
          ) : isGpmxHost ? (
            <GpmxHeader />
          ) : (
            <KkutHeader />
          ))}

        {children}
        {isHugzHost && (
          <footer className="border-t border-amber-300/15 bg-[#050408] px-5 py-4 text-center text-xs font-bold text-amber-50/55">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-amber-100/70">
              13HUGz · Visual HUGz Card discovery
            </p>
            <nav
              aria-label="13HUGz legal"
              className="flex items-center justify-center gap-5"
            >
              <a className="transition hover:text-amber-200" href="/privacy">
                Privacy
              </a>
              <a className="transition hover:text-amber-200" href="/terms">
                Terms
              </a>
              <a
                className="transition hover:text-amber-200"
                href="mailto:reachus@gputnammusic.com"
              >
                Contact
              </a>
            </nav>
          </footer>
        )}
        <SingleAudioPlaybackGuard />
        <Analytics />
      </body>
    </html>
  );
}
