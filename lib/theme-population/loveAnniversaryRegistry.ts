export type LoveAnniversaryThemeRecord = {
  theme: "love" | "anniversary" | "forever";
  buyerLabel: string;
  pixTitle: string;
  pixHandle: string;
  sectionId: string;
  kkId: string;
  structuralRole: string;
  publicTags: string[];
  approvedFileName: string;
  audioUrl: string;
  status: "handoff_received_not_public" | "approved_for_planning_not_public";
  fullPixContextPath: string;
  badKkFreeReplacement: boolean;
};

export const loveAnniversaryThemeRecords: LoveAnniversaryThemeRecord[] = [
  {
    theme: "love",
    buyerLabel: "Love HUG 1",
    pixTitle: "A Love like That",
    pixHandle: "ALLT-105529524",
    sectionId: "ALLT-105529524-S02",
    kkId: "KK-ALLT-105529524-S02",
    structuralRole: "chorus / refrain",
    publicTags: ["Love HUG", "Anniversary HUG", "Wedding HUG", "Forever HUG"],
    approvedFileName: "a-love-like-that-ch1-032-105.mp3",
    audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
    status: "handoff_received_not_public",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "love",
    buyerLabel: "Love HUG 2",
    pixTitle: "A Love like That",
    pixHandle: "ALLT-105529524",
    sectionId: "ALLT-105529524-S04",
    kkId: "KK-ALLT-105529524-S04",
    structuralRole: "chorus / refrain",
    publicTags: ["Love HUG", "Anniversary HUG", "Wedding HUG", "Forever HUG"],
    approvedFileName: "a-love-like-that-ch2-1345-208-tail.mp3",
    audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
    status: "handoff_received_not_public",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "love",
    buyerLabel: "Love HUG 3",
    pixTitle: "A Love like That",
    pixHandle: "ALLT-105529524",
    sectionId: "ALLT-105529524-S06",
    kkId: "KK-ALLT-105529524-S06",
    structuralRole: "chorus / refrain",
    publicTags: ["Love HUG", "Anniversary HUG", "Wedding HUG", "Forever HUG"],
    approvedFileName: "a-love-like-that-ch3-2245-258-tail.mp3",
    audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
    status: "handoff_received_not_public",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "forever",
    buyerLabel: "Forever HUG 1",
    pixTitle: "A Love like That",
    pixHandle: "ALLT-105529524",
    sectionId: "ALLT-105529524-S07",
    kkId: "KK-ALLT-105529524-S07",
    structuralRole: "outro / tag",
    publicTags: ["Forever HUG", "Love HUG", "Closing HUG"],
    approvedFileName: "a-love-like-that-outro-2561-end.mp3",
    audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
    status: "approved_for_planning_not_public",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "anniversary",
    buyerLabel: "Anniversary HUG 1",
    pixTitle: "A Love like That",
    pixHandle: "ALLT-105529524",
    sectionId: "ALLT-105529524-S04",
    kkId: "KK-ALLT-105529524-S04",
    structuralRole: "chorus / refrain",
    publicTags: ["Anniversary HUG", "Love HUG", "Forever HUG"],
    approvedFileName: "a-love-like-that-ch2-1345-208-tail.mp3",
    audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
    status: "handoff_received_not_public",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "anniversary",
    buyerLabel: "Anniversary HUG 2",
    pixTitle: "A Love like That",
    pixHandle: "ALLT-105529524",
    sectionId: "ALLT-105529524-S06",
    kkId: "KK-ALLT-105529524-S06",
    structuralRole: "chorus / refrain",
    publicTags: ["Anniversary HUG", "Love HUG", "Forever HUG"],
    approvedFileName: "a-love-like-that-ch3-2245-258-tail.mp3",
    audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
    status: "handoff_received_not_public",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
];

export function getLoveAnniversaryThemeRecords() {
  return loveAnniversaryThemeRecords;
}
