import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { InPixReviewerWorkbench } from "./workbench";

export const dynamic = "force-dynamic";
export const metadata = { title: "IN-PIX Structure TPR · K-KUT Admin", robots: { index: false, follow: false } };

type PageProps = { searchParams?: Promise<{ token?: string | string[] }> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim();
  if (validAdminToken(token)) redirect(`/admin/access?token=${encodeURIComponent(token!)}&next=${encodeURIComponent("/admin/in-pix-reviewer")}`);
  if (!trustedProtectedPreview()) {
    const cookieStore = await cookies();
    if (!validAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) notFound();
  }
  return <InPixReviewerWorkbench />;
}
