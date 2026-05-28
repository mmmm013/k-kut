export type TugMcBotLine = {
  id: string;
  step:
    | "start"
    | "listen"
    | "choose"
    | "compare"
    | "checkout"
    | "back"
    | "reassure"
    | "seasonal"
    | "wedding";
  label: string;
  line: string;
};

export const tugMcBotWholeAudioSrc =
  "/audio/mc-bot/tug/script-whole-2.m4a";

export const tugMcBotScript: TugMcBotLine[] = [
  {
    id: "welcome-start",
    step: "start",
    label: "Welcome / start",
    line: "Welcome. I’ll help you find the right K-KUT. Start by listening first.",
  },
  {
    id: "listen-first",
    step: "listen",
    label: "Listen first",
    line: "Press play first. Hear the song moment, then I’ll help you choose the right K-KUT.",
  },
  {
    id: "choose-feeling",
    step: "choose",
    label: "Choose feeling / occasion",
    line: "Choose the feeling you want to send. I’ll narrow the K-KUT options from there.",
  },
  {
    id: "recommendation-first-kk",
    step: "compare",
    label: "Recommendation / first KK",
    line: "Start here. This is the strongest first K-KUT recommendation.",
  },
  {
    id: "recommendation-next-kk",
    step: "compare",
    label: "Recommendation / next KK",
    line: "Next, compare this one. It gives you a fuller emotional path.",
  },
  {
    id: "checkout-locked",
    step: "checkout",
    label: "Checkout locked",
    line: "This K-KUT is selected, but checkout stays locked until the exact approved audio is ready.",
  },
  {
    id: "checkout-locked-alt",
    step: "checkout",
    label: "Checkout locked alternate",
    line: "You can choose it now. Buying opens only after final audio approval.",
  },
  {
    id: "checkout-ready",
    step: "checkout",
    label: "Checkout ready",
    line: "Checkout is ready. This exact K-KUT audio is approved and available.",
  },
  {
    id: "audio-pending",
    step: "checkout",
    label: "Audio pending",
    line: "Audio is not ready yet. I’ll keep this option selected while approval finishes.",
  },
  {
    id: "back-restart",
    step: "back",
    label: "Back / restart",
    line: "No problem. Let’s step back and choose another direction.",
  },
  {
    id: "back-restart-alt",
    step: "back",
    label: "Back / restart alternate",
    line: "Let’s start over and find the better fit.",
  },
  {
    id: "reassure",
    step: "reassure",
    label: "Reassure",
    line: "Good choice. I’ll keep guiding you one step at a time.",
  },
  {
    id: "reassure-alt",
    step: "reassure",
    label: "Reassure alternate",
    line: "You’re in the right place. We’ll keep this simple.",
  },
  {
    id: "fathers-day-active",
    step: "seasonal",
    label: "Father’s Day active path",
    line: "For Father’s Day, start with the feeling you want him to receive.",
  },
  {
    id: "fathers-day-active-alt",
    step: "seasonal",
    label: "Father’s Day active path alternate",
    line: "I’ll help you find a Father’s Day K-KUT that sounds complete and lands right.",
  },
  {
    id: "wedding-path",
    step: "wedding",
    label: "Wedding path",
    line: "For Wedding, listen to the full song first. Then compare the recommended K-KUTs.",
  },
  {
    id: "wedding-path-alt",
    step: "wedding",
    label: "Wedding path alternate",
    line: "Start with V2 plus Chorus 2. Then compare V2-End for the fuller closing option.",
  },
];

export const tugMcBotDoctrine = {
  source: "Clayton Gunn / Michael Clay MC-BOT recording",
  audioAttachmentName: "Script whole 2.m4a",
  wholeAudioSrc: tugMcBotWholeAudioSrc,
  noGeneratedVoiceFallback: true,
  noAutoplay: true,
  userControlledAudioOnly: true,
  lineLevelClipsRequireFutureSegmentation: true,
} as const;
