import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "KUT Reviewer · K-KUT Admin", robots: { index: false, follow: false } };

export default function Page() {
  // IN-PIX is KKr-internal structural/attributal evidence only.
  // Gregory reviews only the resulting vocal CC/KUT events.
  redirect("/admin/kut-reviewer");
}
