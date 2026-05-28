export const realHugKuts = {
  thanks: [
  {
    "id": "thank-you-kk2",
    "label": "Thank You KK2",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "V1C + V1D + Chorus 1",
    "previewSrc": "/mothers-day/thank-you/kks/thank-you-kk2.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks/manifest.json"
  },
  {
    "id": "thank-you-kk3",
    "label": "Thank You KK3",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "Chorus 1 lift",
    "previewSrc": "/mothers-day/thank-you/kks/thank-you-kk3.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks/manifest.json"
  },
  {
    "id": "thank-you-kk5",
    "label": "Thank You KK5",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "Verse 2A",
    "previewSrc": "/mothers-day/thank-you/kks/thank-you-kk5.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks/manifest.json"
  },
  {
    "id": "thank-you-kk6",
    "label": "Thank You KK6",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "Verse 2B through Outro",
    "previewSrc": "/mothers-day/thank-you/kks/thank-you-kk6.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks/manifest.json"
  },
  {
    "id": "thank-you-kk7",
    "label": "Thank You KK7",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "Chorus 2 through Outro",
    "previewSrc": "/mothers-day/thank-you/kks/thank-you-kk7.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks/manifest.json"
  },
  {
    "id": "thank-you-kk2",
    "label": "Thank You KK2",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "V1C + V1D + Chorus 1",
    "previewSrc": "/mothers-day/thank-you/kks-expanded/thank-you-kk2.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks-expanded/manifest.json"
  },
  {
    "id": "thank-you-kk3",
    "label": "Thank You KK3",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "Chorus 1",
    "previewSrc": "/mothers-day/thank-you/kks-expanded/thank-you-kk3.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks-expanded/manifest.json"
  },
  {
    "id": "thank-you-kk5",
    "label": "Thank You KK5",
    "fit": "Vocal K-KUT thank-you option.",
    "section": "V2A",
    "previewSrc": "/mothers-day/thank-you/kks-expanded/thank-you-kk5.mp3",
    "source": "KK_ONLY",
    "kkSourceFile": "public/mothers-day/thank-you/kks-expanded/manifest.json"
  }
]
} as const;

export type RealHugKut = typeof realHugKuts.thanks[number];
