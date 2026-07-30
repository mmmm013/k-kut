export type HugzSeed = {
  rank: number;
  assetId: string;
  assetKind: "KK" | "KOMBO";
  excerpt: string;
};

export type HugzContainer = {
  slug: string;
  headline: string;
  description: string;
  imageUrl: string;
  seedCount: number;
  seeds: HugzSeed[];
};

const card = (
  slug: string,
  headline: string,
  description: string,
): HugzContainer => ({
  slug,
  headline,
  description,
  imageUrl: `/cute-hugs/${slug}.webp`,
  seedCount: 0,
  seeds: [],
});

// HUGz Cards are non-II discovery containers. Their prior seed inventory was
// removed. Only newly approved KKs/KOMBOs from the first true inventory may
// repopulate these empty containers.
export const hugzSeedCatalog = [
  card("bad-day", "Bad day? Send a HUG.", "Comfort and support for a hard day."),
  card("big-win", "Big win? Send a HUG.", "Celebrate a meaningful win."),
  card("make-it-right", "Need to make it right? Send a HUG.", "Apology, repair, and a second chance."),
  card("just-because-care", "Just because you care.", "Warmth and care without an occasion."),
  card("miss-them", "Miss them? Send a HUG.", "Closeness across distance."),
  card("first-day-nerves", "First-day nerves? Send courage.", "Encouragement before something new."),
  card("proud-of-them", "Proud of them? Let them hear it.", "Recognition for a brave step or milestone."),
  card("thinking-of-you", "Thinking of you.", "A gentle expression of presence."),
  card("long-week", "Long week? Send some relief.", "Support for someone running on empty."),
  card("breakup-blues", "Breakup blues? Send a soft landing.", "Care for a tender heart."),
  card("new-baby", "New baby? Send a musical welcome.", "Welcome new life and growing family."),
  card("just-because-smile", "Make them smile—just because.", "A playful ordinary-day surprise."),
  card("friends", "Friend needs you? Send a HUG.", "Comfort, laughter, and friendship."),
];

export function getHugzContainer(slug: string) {
  return hugzSeedCatalog.find((container) => container.slug === slug);
}
