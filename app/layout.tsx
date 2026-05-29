import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#F5e6c8] antialiased min-h-screen">
        <header className="sticky top-0 z-50 border-b border-amber-300/20 bg-[#0a0a0a]/90 px-5 py-3 backdrop-blur">
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

        {children}
        <SingleAudioPlaybackGuard />
          <Analytics />
      </body>
    </html>
  );
}
