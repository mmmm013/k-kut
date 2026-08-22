export const BUG_PACKAGE_LAW = Object.freeze({
  basePriceCents: 199,
  totalTimedSends: 3,
  billingCount: 1,
  packageLockedBeforeSendOne: true,
  modes: {
    REPEAT: {
      totalPriceCents: 199,
      sameExactBugEachSend: true,
      contentHashMustMatchAcrossSends: true,
    },
    STORY_ARC: {
      sequencingAddOnCents: 99,
      totalPriceCents: 298,
      distinctBugEachSend: true,
      relatedThemeRequired: true,
      sequenceRoles: ["HOOK", "BUILD", "PAYOFF"],
      randomizedOnlyAtAssembly: true,
    },
  },
} as const);

export type BugPackageMode = keyof typeof BUG_PACKAGE_LAW.modes;
export type BugStoryRole = "HOOK" | "BUILD" | "PAYOFF";

export type BugPackageSend = {
  sendIndex: 1 | 2 | 3;
  storyRole: BugStoryRole;
  bugId: string;
  contentSha256: string;
  audioSha256: string;
  scheduledAt: string;
};

export type BugPackageManifest = {
  packageId: string;
  mode: BugPackageMode;
  storyArcId: string;
  approvedPoolVersion: string;
  selectionSeedSha256: string;
  lockedAt: string;
  billingTotalCents: 199 | 298;
  sends: [BugPackageSend, BugPackageSend, BugPackageSend];
};

const SHA256 = /^[0-9a-f]{64}$/u;
const EXPECTED_ROLES: BugStoryRole[] = ["HOOK", "BUILD", "PAYOFF"];

export function assertBugPackageManifest(manifest: BugPackageManifest) {
  if (!manifest.packageId || !manifest.lockedAt) throw new Error("BUG package must lock before Send 1");
  if (manifest.sends.length !== 3) throw new Error("BUG package must contain exactly 3 Sends");
  if (manifest.billingTotalCents !== (manifest.mode === "REPEAT" ? 199 : 298)) {
    throw new Error("BUG package billing total is invalid");
  }

  manifest.sends.forEach((send, index) => {
    if (send.sendIndex !== index + 1) throw new Error("BUG Send order is invalid");
    if (send.storyRole !== EXPECTED_ROLES[index]) throw new Error("BUG story role order is invalid");
    if (!SHA256.test(send.contentSha256) || !SHA256.test(send.audioSha256)) {
      throw new Error("BUG Send hash is invalid");
    }
    if (!send.scheduledAt) throw new Error("BUG Send schedule is missing");
  });

  const bugIds = new Set(manifest.sends.map((send) => send.bugId));
  const contentHashes = new Set(manifest.sends.map((send) => send.contentSha256));
  const audioHashes = new Set(manifest.sends.map((send) => send.audioSha256));

  if (manifest.mode === "REPEAT") {
    if (bugIds.size !== 1 || contentHashes.size !== 1 || audioHashes.size !== 1) {
      throw new Error("Repeat BUG must use the same exact BUG for all 3 Sends");
    }
  } else {
    if (!manifest.storyArcId || !manifest.approvedPoolVersion || !SHA256.test(manifest.selectionSeedSha256)) {
      throw new Error("Story BUG assembly proof is incomplete");
    }
    if (bugIds.size !== 3 || contentHashes.size !== 3 || audioHashes.size !== 3) {
      throw new Error("Story BUG must use 3 distinct related BUGs");
    }
  }

  return manifest;
}
