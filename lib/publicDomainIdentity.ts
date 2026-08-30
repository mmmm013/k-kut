import { headers } from "next/headers";

export type PublicDomainIdentity = {
  publicName: "K-KUT" | "13HUGz" | "Sent-i-Meants";
  legalDescription: string;
};

const HUGZ_HOSTS = new Set(["13hugz.com", "www.13hugz.com"]);
const SENTIMEANT_HOSTS = new Set([
  "sentimeant.com",
  "www.sentimeant.com",
  "sentimeants.com",
  "www.sentimeants.com",
]);

function normalizeHost(value: string | null) {
  return (value || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];
}

export async function getPublicDomainIdentity(): Promise<PublicDomainIdentity> {
  const requestHeaders = await headers();
  const host = normalizeHost(
    requestHeaders.get("x-vercel-forwarded-host") ||
      requestHeaders.get("x-forwarded-host") ||
      requestHeaders.get("host")
  );

  if (HUGZ_HOSTS.has(host)) {
    return {
      publicName: "13HUGz",
      legalDescription: "13HUGz legal terms from G Putnam Music, LLC.",
    };
  }

  if (SENTIMEANT_HOSTS.has(host)) {
    return {
      publicName: "Sent-i-Meants",
      legalDescription: "Sent-i-Meants legal terms from G Putnam Music, LLC.",
    };
  }

  return {
    publicName: "K-KUT",
    legalDescription: "K-KUT legal terms from G Putnam Music, LLC.",
  };
}
