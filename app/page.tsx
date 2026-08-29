import type { Metadata } from "next";
import { headers } from "next/headers";
import KKutHome, { kKutMetadata } from "./_kkut-home";
import SentimeantHome, { metadata as sentimeantMetadata } from "./_sentimeant-home";

export const dynamic = "force-dynamic";

function isSentimeantHost(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0].replace(/\.$/, "");

  return (
    host === "sentimeant.com" ||
    host.endsWith(".sentimeant.com") ||
    host === "sentimeants.com" ||
    host.endsWith(".sentimeants.com")
  );
}

async function requestHost() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-vercel-forwarded-host") ||
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    ""
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return isSentimeantHost(await requestHost())
    ? sentimeantMetadata
    : kKutMetadata;
}

export default async function Home() {
  const host = await requestHost();

  return isSentimeantHost(host) ? <SentimeantHome /> : <KKutHome />;
}
