export type GratitudeThemeRecord = {
  theme: "gratitude";
  buyerLabel: string;
  pixTitle: string;
  pixHandle: string;
  sectionId: string;
  kkId: string;
  legacyId: string;
  structuralRole: string;
  publicTags: string[];
  audioUrl: string;
  status: string;
  fullPixContextPath: string;
  badKkFreeReplacement: boolean;
};

export const gratitudeThemeRecords: GratitudeThemeRecord[] = [
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S01",
    kkId: "KK-THANK-YOU-S01",
    legacyId: "thank-you-sec-v1a",
    structuralRole: "verse_part",
    publicTags: ["Thank You HUG", "Gratitude HUG", "Mom HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-v1a-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S02",
    kkId: "KK-THANK-YOU-S02",
    legacyId: "thank-you-sec-v1b",
    structuralRole: "verse_part",
    publicTags: ["Thank You HUG", "Gratitude HUG", "Mom HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-v1b-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S03",
    kkId: "KK-THANK-YOU-S03",
    legacyId: "thank-you-sec-prech1",
    structuralRole: "pre_chorus",
    publicTags: ["Thank You HUG", "Gratitude HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-prech1-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S04",
    kkId: "KK-THANK-YOU-S04",
    legacyId: "thank-you-sec-ch1",
    structuralRole: "chorus",
    publicTags: ["Thank You HUG", "Gratitude HUG", "Mom HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-ch1-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S05",
    kkId: "KK-THANK-YOU-S05",
    legacyId: "thank-you-sec-v2a",
    structuralRole: "verse_part",
    publicTags: ["Thank You HUG", "Gratitude HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-v2a-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S06",
    kkId: "KK-THANK-YOU-S06",
    legacyId: "thank-you-sec-v2b",
    structuralRole: "verse_part",
    publicTags: ["Thank You HUG", "Gratitude HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-v2b-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S07",
    kkId: "KK-THANK-YOU-S07",
    legacyId: "thank-you-sec-br",
    structuralRole: "bridge",
    publicTags: ["Thank You HUG", "Gratitude HUG", "Reflection HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-br-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S08",
    kkId: "KK-THANK-YOU-S08",
    legacyId: "thank-you-sec-ch2",
    structuralRole: "chorus",
    publicTags: ["Thank You HUG", "Gratitude HUG", "Mom HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-ch2-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
  {
    theme: "gratitude",
    buyerLabel: "Thank You HUG",
    pixTitle: "Thank You",
    pixHandle: "THANK-YOU",
    sectionId: "THANK-YOU-S09",
    kkId: "KK-THANK-YOU-S09",
    legacyId: "thank-you-sec-outro",
    structuralRole: "outro",
    publicTags: ["Thank You HUG", "Gratitude HUG", "Closing HUG"],
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-outro-ii-delivery.mp3",
    status: "existing_public_active_pending_matrix_proof",
    fullPixContextPath: "pending",
    badKkFreeReplacement: true,
  },
];

export function getGratitudeThemeRecords() {
  return gratitudeThemeRecords;
}
