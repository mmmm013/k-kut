import strictKkPool from "@/data/sentimeant/strict-kk-pool-v001.json";

const cardImages: Record<string, string> = {
  "bad-day": "/cute-hugs/bad-day.webp",
  "big-win": "/cute-hugs/big-win.webp",
  "make-it-right": "/cute-hugs/make-it-right.webp",
  "just-because-care": "/cute-hugs/just-because-care.webp",
  "miss-them": "/cute-hugs/miss-them.webp",
  "first-day-nerves": "/cute-hugs/first-day-nerves.webp",
  "proud-of-them": "/cute-hugs/proud-of-them.webp",
  "thinking-of-you": "/cute-hugs/thinking-of-you.webp",
  "long-week": "/cute-hugs/long-week.webp",
  "breakup-blues": "/cute-hugs/breakup-blues.webp",
  "new-baby": "/cute-hugs/new-baby.webp",
  "just-because-smile": "/cute-hugs/just-because-smile.webp",
  friends: "/cute-hugs/friends.webp",
};

export const hugzSeedCatalog = strictKkPool.rows.map((row) => ({
  slug: row.slug,
  headline: row.headline,
  description: row.story_text,
  imageUrl: cardImages[row.slug],
  seedCount: 1,
  seeds: [
    {
      rank: 1,
      assetId: row.kk_id,
      assetKind: "KK",
      excerpt: "Strict-music KK preview",
      previewUrl: row.delivery_audio_url,
      buyUrl: null,
      price: "$7.99",
      reference: row.kk_id,
      checkoutStatus: row.checkout_status,
      musicGateStatus: row.source_music_gate_status,
      twinkleAtEnd: row.twinkle_at_end,
    },
  ],
}));

export type HugzContainer = (typeof hugzSeedCatalog)[number];

export function getHugzContainer(slug: string) {
  return hugzSeedCatalog.find((container) => container.slug === slug);
}
