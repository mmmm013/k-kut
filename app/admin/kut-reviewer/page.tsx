import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { KutReviewerWorkbench } from "./workbench";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "P0 KUT Reviewer · K-KUT Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function KutReviewerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const suppliedToken = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim();

  if (validAdminToken(suppliedToken)) {
    redirect(`/admin/access?token=${encodeURIComponent(suppliedToken!)}&next=${encodeURIComponent("/admin/kut-reviewer")}`);
  }

  if (trustedProtectedPreview()) return <KutReviewerWorkbench />;

  const cookieStore = await cookies();
  if (!validAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) notFound();

  return <KutReviewerWorkbench />;
}
