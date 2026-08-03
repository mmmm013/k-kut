export type HugzIntentChoice = {
  label: string;
  description: string;
  href: string;
};

export type HugzIntentPath = {
  question: string;
  choices: readonly HugzIntentChoice[];
};

const hugzIntentPaths: Record<string, HugzIntentPath> = {
  "bad-day": {
    question: "What kind of support do they need?",
    choices: [
      {
        label: "Comfort",
        description: "Help them feel cared for and less alone.",
        href: "/personal/comfort",
      },
      {
        label: "Encouragement",
        description: "Help them keep going through a difficult day.",
        href: "/personal/encouragement",
      },
      {
        label: "Hang Tough",
        description: "Send strength for pressure, setbacks, or a hard fight.",
        href: "/personal/hang-tough",
      },
      {
        label: "Thinking of You",
        description: "Let them know they are on your mind.",
        href: "/personal/thinking-of-you",
      },
    ],
  },
  "big-win": {
    question: "What are you celebrating?",
    choices: [
      {
        label: "A big win",
        description: "Celebrate something they worked hard to achieve.",
        href: "/personal/congratulations",
      },
      {
        label: "Graduation",
        description: "Honor a finish, a beginning, and the future ahead.",
        href: "/personal/graduation",
      },
      {
        label: "Birthday",
        description: "Celebrate their day and what makes them special.",
        href: "/personal/birthday",
      },
      {
        label: "Just because",
        description: "Share joy without needing a formal occasion.",
        href: "/personal/just-because",
      },
    ],
  },
  "make-it-right": {
    question: "What do you want to make right?",
    choices: [
      {
        label: "I’m sorry",
        description: "Say sorry clearly and sincerely.",
        href: "/personal/apology?intent=im-sorry",
      },
      {
        label: "Please forgive me",
        description: "Ask for forgiveness without demanding it.",
        href: "/personal/apology?intent=please-forgive-me",
      },
      {
        label: "I still care",
        description: "Let them know the relationship still matters.",
        href: "/personal/apology?intent=i-still-care",
      },
      {
        label: "I want to repair this",
        description: "Open the door to rebuilding trust.",
        href: "/personal/apology?intent=repair",
      },
    ],
  },
  "just-because-care": {
    question: "What kind of care do you want to send?",
    choices: [
      {
        label: "Thank you",
        description: "Tell them their kindness mattered.",
        href: "/personal/thank-you",
      },
      {
        label: "Thinking of you",
        description: "Send a simple reminder that you care.",
        href: "/personal/thinking-of-you",
      },
      {
        label: "Friendship",
        description: "Celebrate a friend who matters to you.",
        href: "/personal/friendship",
      },
      {
        label: "Family",
        description: "Send warmth to someone who is part of you.",
        href: "/personal/family",
      },
    ],
  },
  "miss-them": {
    question: "What kind of missing do you want to express?",
    choices: [
      {
        label: "I miss you",
        description: "Say the distance is real and they matter.",
        href: "/personal/missing-you",
      },
      {
        label: "Thinking of you",
        description: "Reach out gently without saying too much.",
        href: "/personal/thinking-of-you",
      },
      {
        label: "Missing a friend",
        description: "Reconnect across time or distance.",
        href: "/personal/friendship",
      },
      {
        label: "Missing family",
        description: "Send a family connection across the distance.",
        href: "/personal/family",
      },
    ],
  },
  "first-day-nerves": {
    question: "What would help them face the new beginning?",
    choices: [
      {
        label: "You can do this",
        description: "Give them confidence for the first step.",
        href: "/personal/encouragement",
      },
      {
        label: "Stay strong",
        description: "Send resolve for a demanding new situation.",
        href: "/personal/hang-tough",
      },
      {
        label: "Better days ahead",
        description: "Send hope when the future feels uncertain.",
        href: "/personal/hope",
      },
      {
        label: "Believe in yourself",
        description: "Remind them they are capable and worthy.",
        href: "/personal/self-esteem",
      },
    ],
  },
  "proud-of-them": {
    question: "Why are you proud of them?",
    choices: [
      {
        label: "They did it",
        description: "Recognize a real achievement.",
        href: "/personal/congratulations",
      },
      {
        label: "They graduated",
        description: "Honor the work and the next chapter.",
        href: "/personal/graduation",
      },
      {
        label: "They kept going",
        description: "Recognize courage and persistence.",
        href: "/personal/encouragement",
      },
      {
        label: "They deserve celebrating",
        description: "Make their birthday or milestone feel seen.",
        href: "/personal/birthday",
      },
    ],
  },
  "thinking-of-you": {
    question: "Why are they on your mind?",
    choices: [
      {
        label: "Just checking in",
        description: "Send a small hello and let them know you care.",
        href: "/personal/thinking-of-you",
      },
      {
        label: "They need comfort",
        description: "Offer warmth and presence through a hard time.",
        href: "/personal/comfort",
      },
      {
        label: "They are unwell",
        description: "Send gentle care and better-days-ahead support.",
        href: "/personal/get-well",
      },
      {
        label: "They are a friend",
        description: "Remind a friend that the connection matters.",
        href: "/personal/friendship",
      },
    ],
  },
  "long-week": {
    question: "What do they need after a long week?",
    choices: [
      {
        label: "Comfort",
        description: "Help them exhale and feel cared for.",
        href: "/personal/comfort",
      },
      {
        label: "Encouragement",
        description: "Remind them that they can keep moving forward.",
        href: "/personal/encouragement",
      },
      {
        label: "Strength",
        description: "Send resolve for one more step.",
        href: "/personal/hang-tough",
      },
      {
        label: "A smile",
        description: "Brighten the day for no other reason.",
        href: "/personal/just-because",
      },
    ],
  },
  "breakup-blues": {
    question: "What kind of support fits this heartbreak?",
    choices: [
      {
        label: "Comfort",
        description: "Offer care without trying to fix everything.",
        href: "/personal/comfort",
      },
      {
        label: "Reflection",
        description: "Make room for memory, growth, and looking back.",
        href: "/personal/reflection",
      },
      {
        label: "I miss you",
        description: "Express the distance honestly.",
        href: "/personal/missing-you",
      },
      {
        label: "Hope",
        description: "Send belief that life can open again.",
        href: "/personal/hope",
      },
    ],
  },
  "new-baby": {
    question: "What should this new-baby HUG celebrate?",
    choices: [
      {
        label: "Welcome, baby",
        description: "Celebrate new life and first memories.",
        href: "/personal/new-baby",
      },
      {
        label: "Family joy",
        description: "Celebrate the whole family’s new chapter.",
        href: "/personal/family",
      },
      {
        label: "Congratulations",
        description: "Honor the parents and their beautiful news.",
        href: "/personal/congratulations",
      },
      {
        label: "A little surprise",
        description: "Send joy simply because this moment is special.",
        href: "/personal/just-because",
      },
    ],
  },
  "just-because-smile": {
    question: "What kind of smile do you want to send?",
    choices: [
      {
        label: "Brighten their day",
        description: "Send warmth without needing a reason.",
        href: "/personal/just-because",
      },
      {
        label: "Thinking of you",
        description: "Let them know they crossed your mind.",
        href: "/personal/thinking-of-you",
      },
      {
        label: "Friendship",
        description: "Share a light moment with a friend.",
        href: "/personal/friendship",
      },
      {
        label: "Love",
        description: "Send affection, romance, or devotion.",
        href: "/personal/love",
      },
    ],
  },
  friends: {
    question: "What kind of friendship moment is this?",
    choices: [
      {
        label: "Thanks for being there",
        description: "Thank a friend who showed up when it mattered.",
        href: "/personal/thank-you",
      },
      {
        label: "Best friend",
        description: "Celebrate the friend who feels like chosen family.",
        href: "/personal/best-friend",
      },
      {
        label: "Thinking of you",
        description: "Reach out with a simple reminder that you care.",
        href: "/personal/thinking-of-you",
      },
      {
        label: "Friendship",
        description: "Honor the bond, old memories, or everyday connection.",
        href: "/personal/friendship",
      },
    ],
  },
};

const fallbackIntentPath: HugzIntentPath = {
  question: "What should this HUG help you say?",
  choices: [
    {
      label: "Comfort or support",
      description: "Help someone through a difficult moment.",
      href: "/personal/comfort",
    },
    {
      label: "Celebrate something",
      description: "Honor a win, milestone, or happy beginning.",
      href: "/personal/congratulations",
    },
    {
      label: "Say thank you",
      description: "Tell someone that what they did mattered.",
      href: "/personal/thank-you",
    },
    {
      label: "Apologize or repair",
      description: "Say sorry and begin making something right.",
      href: "/personal/apology",
    },
  ],
};

export function getHugzIntentPath(slug: string): HugzIntentPath {
  return hugzIntentPaths[slug] ?? fallbackIntentPath;
}
