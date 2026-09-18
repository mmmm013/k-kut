import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Invalid gift link." }, 400); }
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!/^[a-f0-9]{64}$/i.test(token)) return reply({ error: "Open the complete gift link you received." }, 400);
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!base || !key) return reply({ error: "Gift playback is temporarily unavailable." }, 503);
  try {
    // Existing service validates the recipient token, grant state, expiry, and
    // play allowance. No owner credential is sent or required by this proxy.
    const result = await fetch(new URL("/functions/v1/play-recipient-delivery", base), {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ token }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) {
      const denied = result.status === 401 || result.status === 403;
      return reply({ error: denied ? "This gift link has expired, was revoked, or has no plays remaining." : "Gift playback is temporarily unavailable." }, denied ? 401 : 503);
    }
    const data = await result.json();
    if (!data.ok || typeof data.playback_url !== "string") return reply({ error: "Gift playback is temporarily unavailable." }, 503);
    const audio = new URL(data.playback_url);
    if (audio.origin !== new URL(base).origin || !audio.pathname.startsWith("/storage/v1/object/sign/")) {
      return reply({ error: "Gift playback is temporarily unavailable." }, 503);
    }
    return reply({
      playback_url: audio.href,
      plays_remaining: Number.isFinite(data.plays_remaining) ? data.plays_remaining : null,
      container_type: ["HUG", "TUG", "BUG"].includes(data.container_type) ? data.container_type : "gift",
    });
  } catch { return reply({ error: "Gift playback is temporarily unavailable. Please try again." }, 503); }
}
