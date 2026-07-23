import type { Metadata } from "next";
import { headers } from "next/headers";
import KKutHome, { kKutMetadata } from "./_kkut-home";
import SentimeantHome from "./_sentimeant-home";

const SENTIMEANT_HOSTS = new Set([
  "sentimeant.com",
  "www.sentimeant.com",
  "sentimeants.com",
  "www.sentimeants.com",
]);

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requestHost(): Promise<string> {
  const requestHeaders = await headers();
  const raw =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "";
  return raw.split(",")[0].trim().split(":")[0].toLowerCase();
}

async function isSentimeantRequest(): Promise<boolean> {
  return SENTIMEANT_HOSTS.has(await requestHost());
}

export async function generateMetadata(): Promise<Metadata> {
  if (await isSentimeantRequest()) {
    return {
      title: "Sent-i-Meants | Send a Musical HUG",
      description:
        "Choose the moment, hear the exact finished music, and send a private musical HUG.",
    };
  }
  return kKutMetadata as Metadata;
}

export default async function Page() {
  if (await isSentimeantRequest()) {
    return (
      <div data-host-home="sentimeant" data-sentimeant-home="functional-v4">
        <SentimeantHome />
      </div>
    );
  }

  return (
    <div data-host-home="k-kut">
      <KKutHome />
    </div>
  );
}
