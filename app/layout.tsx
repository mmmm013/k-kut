import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { headers } from 'next/headers';
import './globals.css';
import SingleAudioPlaybackGuard from "@/components/SingleAudioPlaybackGuard";

export const metadata: Metadata = {
  title: 'HUGs — Private Music Moments',
  description:
    'A HUG is a private music moment you choose by feeling, then send to someone.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'GPM' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

const HUGZ_HOSTS = new Set(['13hugz.com', 'www.13hugz.com']);
const SENTIMEANT_HOSTS = new Set([
  'sentimeant.com',
  'www.sentimeant.com',
  'sentimeants.com',
  'www.sentimeants.com',
]);

function normalizedHost(headerList: Awaited<ReturnType<typeof headers>>) {
  return (
    headerList.get('x-vercel-forwarded-host') ||
    headerList.get('x-forwarded-host') ||
    headerList.get('host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .toLowerCase()
    .split(':')[0];
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = normalizedHost(await headers());
  const isHugzHost = HUGZ_HOSTS.has(host);
  const isSentimeantHost = SENTIMEANT_HOSTS.has(host);
  const isStandaloneHost = isHugzHost || isSentimeantHost;

  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#F5e6c8] antialiased min-h-screen">
        {!isStandaloneHost ? <header className="sticky top-0 z-50 border-b border-amber-300/20 bg-[#0a0a0a]/90 px-5 py-3 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <a href="/" className="text-lg font-black tracking-[0.22em] text-amber-200">
              GPM
            </a>

            <div className="flex flex-wrap items-center gap-2 text-sm font-black">
              <a
                href="/"
                className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Home
              </a>
              <a
                href="/hug"
                className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Offers
              </a>
              <a
                href="/find"
                className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Find
              </a>
              <a
                href="/personal"
                className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Personal
              </a>
              <a
                href="/holiday"
                className="rounded-full border border-amber-300/20 px-3 py-2 text-amber-50/80 transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Holiday
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
        </header> : null}

        {children}
        {isStandaloneHost ? (
          <footer className="border-t border-amber-300/15 bg-[#050408] px-5 py-4 text-center text-xs font-bold text-amber-50/55">
            <nav aria-label={isHugzHost ? "13HUGz legal" : "Sent-i-Meants legal"} className="flex items-center justify-center gap-5">
              <a className="transition hover:text-amber-200" href="/privacy">Privacy</a>
              <a className="transition hover:text-amber-200" href="/terms">Terms</a>
              <a className="transition hover:text-amber-200" href="mailto:reachus@gputnammusic.com">Contact</a>
            </nav>
          </footer>
        ) : null}
        <SingleAudioPlaybackGuard />
        <Analytics />
      </body>
    </html>
  );
}
