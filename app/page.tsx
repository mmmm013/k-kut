import { headers } from "next/headers";
import KKutHome from "./_kkut-home";
import SentimeantHome from "./_sentimeant-home";

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

export default async function Home() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-vercel-forwarded-host") ||
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    "";

  return isSentimeantHost(host) ? <SentimeantHome /> : <KKutHome />;
}
