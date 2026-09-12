const DEFAULT_FULLMIX_SHARE_URL = "https://s.disco.ac/bvftlpcldiqy";
const MAX_SHARE_PAGE_BYTES = 12 * 1024 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;
const SHARE_FETCH_TIMEOUT_MS = 45_000;

const SHARE_REQUEST_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
} as const;

type ShareTrack = {
  id?: number | string;
  name?: string;
  all_files?: {
    wav?: {
      id?: number | string;
      original_name?: string;
      play_url?: string;
    };
  };
  nested_tracks?: ShareTrack[];
};

type SharePayload = {
  playlist_id?: number | string;
  tracks?: ShareTrack[];
};

export type GpmxWavSource = {
  trackId: string;
  trackName: string | null;
  fileId: string;
  originalName: string;
  signedWavUrl: string;
  playlistId: string;
  shareUrl: string;
  playlistUrl?: string;
  sessionCookie?: string;
};

let cachedSources: Promise<Map<string, GpmxWavSource>> | null = null;
let cacheExpiresAt = 0;

function approvedShareUrl(): string {
  const raw = process.env.GPMX_STL_FULLMIX_SHARE_URL?.trim() || DEFAULT_FULLMIX_SHARE_URL;
  const url = new URL(raw);
  if (url.protocol !== "https:" || (url.hostname !== "s.disco.ac" && !url.hostname.endsWith(".disco.ac"))) {
    throw new Error("GPMx FullMix share URL is not an approved HTTPS audio host");
  }
  return url.toString();
}

export function parseGpmxWavSources(
  html: string,
  shareUrl: string,
  session?: { playlistUrl: string; cookie: string },
): Map<string, GpmxWavSource> {
  const marker = "window.playlist_data = ";
  const start = html.indexOf(marker);
  if (start < 0) throw new Error("GPMx playlist data marker is missing");
  const jsonStart = start + marker.length;
  const jsonEnd = html.indexOf(";\n", jsonStart);
  if (jsonEnd < 0) throw new Error("GPMx playlist data terminator is missing");

  const payload = JSON.parse(html.slice(jsonStart, jsonEnd)) as SharePayload;
  const playlistId = String(payload.playlist_id || "").trim();
  if (!playlistId) throw new Error("GPMx playlist ID is missing");

  const sources = new Map<string, GpmxWavSource>();
  const visit = (tracks: ShareTrack[] | undefined) => {
    for (const track of tracks || []) {
      const trackId = String(track.id || "").trim();
      const wav = track.all_files?.wav;
      const signedWavUrl = String(wav?.play_url || "").trim();
      const fileId = String(wav?.id || "").trim();
      const originalName = String(wav?.original_name || "").trim();
      if (trackId && signedWavUrl && fileId && originalName) {
        const url = new URL(signedWavUrl);
        const expectedPath = `/play/${trackId}/file/${fileId}/`;
        if (
          url.protocol === "https:" &&
          url.hostname.endsWith(".disco.ac") &&
          url.pathname.includes(expectedPath) &&
          url.pathname.toLowerCase().endsWith(".wav")
        ) {
          sources.set(trackId, {
            trackId,
            trackName: track.name?.trim() || null,
            fileId,
            originalName,
            signedWavUrl: url.toString(),
            playlistId,
            shareUrl,
            playlistUrl: session?.playlistUrl,
            sessionCookie: session?.cookie,
          });
        }
      }
      visit(track.nested_tracks);
    }
  };
  visit(payload.tracks);
  return sources;
}

async function fetchSources(): Promise<Map<string, GpmxWavSource>> {
  const shareUrl = approvedShareUrl();
  const redirectResponse = await fetch(shareUrl, {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(SHARE_FETCH_TIMEOUT_MS),
    headers: SHARE_REQUEST_HEADERS,
  });

  let response = redirectResponse;
  let session: { playlistUrl: string; cookie: string } | undefined;
  if (redirectResponse.status >= 300 && redirectResponse.status < 400) {
    const location = redirectResponse.headers.get("location");
    if (!location) throw new Error("GPMx playlist redirect is missing its destination");

    const redirectUrl = new URL(location, shareUrl);
    if (
      redirectUrl.protocol !== "https:" ||
      !redirectUrl.hostname.endsWith(".disco.ac") ||
      !redirectUrl.pathname.startsWith("/playlist-new/")
    ) {
      throw new Error("GPMx playlist redirect is not an approved destination");
    }

    const sessionCookie = redirectResponse.headers
      .get("set-cookie")
      ?.match(/(?:^|,\s*)(sessionid=[^;]+)/i)?.[1];
    if (!sessionCookie) throw new Error("GPMx playlist redirect is missing its session cookie");

    session = { playlistUrl: redirectUrl.toString(), cookie: sessionCookie };

    response = await fetch(redirectUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(SHARE_FETCH_TIMEOUT_MS),
      headers: { ...SHARE_REQUEST_HEADERS, cookie: sessionCookie },
    });
  }

  if (!response.ok) throw new Error(`GPMx playlist request failed (${response.status})`);
  const length = Number(response.headers.get("content-length") || 0);
  if (length > MAX_SHARE_PAGE_BYTES) throw new Error("GPMx playlist response exceeds the safety limit");
  const html = await response.text();
  if (Buffer.byteLength(html, "utf8") > MAX_SHARE_PAGE_BYTES) {
    throw new Error("GPMx playlist response exceeds the safety limit");
  }
  return parseGpmxWavSources(html, shareUrl, session);
}

export async function loadGpmxWavSources(): Promise<Map<string, GpmxWavSource>> {
  const now = Date.now();
  if (!cachedSources || now >= cacheExpiresAt) {
    cachedSources = fetchSources().catch((error) => {
      cachedSources = null;
      cacheExpiresAt = 0;
      throw error;
    });
    cacheExpiresAt = now + CACHE_TTL_MS;
  }
  return cachedSources;
}

export async function resolveGpmxWav(trackId: string): Promise<GpmxWavSource | null> {
  if (!/^\d+$/.test(trackId)) return null;
  return (await loadGpmxWavSources()).get(trackId) || null;
}
