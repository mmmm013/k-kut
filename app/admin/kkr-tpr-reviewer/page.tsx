import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
export const metadata = { title: "TPR Pre-made II Reviewer · K-KUT Admin", robots: { index: false, follow: false } };
type PageProps = { searchParams?: Promise<{ token?: string | string[] }> };

// TPR is a protected alias for the sole pre-made-II review surface.
export default async function TprPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim();
  if (validAdminToken(token)) redirect(`/admin/access?token=${encodeURIComponent(token!)}&next=${encodeURIComponent("/admin/kkr-tpr-reviewer")}`);
  if (!trustedProtectedPreview()) {
    const store = await cookies();
    if (!validAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value)) notFound();
  }
  redirect("/admin/kut-reviewer");
}
