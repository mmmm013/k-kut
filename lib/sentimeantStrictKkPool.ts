export const sentimeantStrictKkPool = [
  {
    "slug": "bad-day",
    "headline": "Bad day? Send a HUG.",
    "text": "A warm musical lift when someone needs care.",
    "audioUrl": "/sentimeant/strict-kk-v001/bad-day.mp3"
  },
  {
    "slug": "big-win",
    "headline": "Big win? Send a HUG.",
    "text": "Celebrate the moment with music they can keep.",
    "audioUrl": "/sentimeant/strict-kk-v001/big-win.mp3"
  },
  {
    "slug": "make-it-right",
    "headline": "Need to make it right? Send a HUG.",
    "text": "A gentle way to say I care and I am sorry.",
    "audioUrl": "/sentimeant/strict-kk-v001/make-it-right.mp3"
  },
  {
    "slug": "just-because-care",
    "headline": "Just because? Send a HUG.",
    "text": "No occasion needed\u2014just warmth, love, and a smile.",
    "audioUrl": "/sentimeant/strict-kk-v001/just-because-care.mp3"
  },
  {
    "slug": "miss-them",
    "headline": "Miss them? Send a HUG.",
    "text": "A little closeness for hearts that are far apart.",
    "audioUrl": "/sentimeant/strict-kk-v001/miss-them.mp3"
  },
  {
    "slug": "first-day-nerves",
    "headline": "First-day nerves? Send a HUG.",
    "text": "Send courage before school, work, or something new.",
    "audioUrl": "/sentimeant/strict-kk-v001/first-day-nerves.mp3"
  },
  {
    "slug": "proud-of-them",
    "headline": "Proud of them? Send a HUG.",
    "text": "Make a brave step or quiet victory feel seen.",
    "audioUrl": "/sentimeant/strict-kk-v001/proud-of-them.mp3"
  },
  {
    "slug": "thinking-of-you",
    "headline": "Thinking of you? Send a HUG.",
    "text": "A gentle lift for rest, recovery, and hard days.",
    "audioUrl": "/sentimeant/strict-kk-v001/thinking-of-you.mp3"
  },
  {
    "slug": "long-week",
    "headline": "Long week? Send a HUG.",
    "text": "A little relief for someone running on empty.",
    "audioUrl": "/sentimeant/strict-kk-v001/long-week.mp3"
  },
  {
    "slug": "breakup-blues",
    "headline": "Breakup blues? Send a HUG.",
    "text": "A soft musical landing for a tender heart.",
    "audioUrl": "/sentimeant/strict-kk-v001/breakup-blues.mp3"
  },
  {
    "slug": "new-baby",
    "headline": "New baby? Send a HUG.",
    "text": "A warm hello for sleepy, joyful new parents.",
    "audioUrl": "/sentimeant/strict-kk-v001/new-baby.mp3"
  },
  {
    "slug": "just-because-smile",
    "headline": "Make them smile. Send a HUG.",
    "text": "A playful surprise for an ordinary day.",
    "audioUrl": "/sentimeant/strict-kk-v001/just-because-smile.mp3"
  },
  {
    "slug": "friends",
    "headline": "Friend needs you? Send a HUG.",
    "text": "Comfort, laughter, and love from one friend to another.",
    "audioUrl": "/sentimeant/strict-kk-v001/friends.mp3"
  }
] as const;

export type SentimeantStory = (typeof sentimeantStrictKkPool)[number];

export function getSentimeantStory(slug: string) {
  return sentimeantStrictKkPool.find((item) => item.slug === slug);
}
