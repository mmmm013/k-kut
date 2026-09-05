import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { TornMemoriesIntakeWorkbench } from "./workbench";
export const dynamic = "force-dynamic";
export const metadata = { title: "Torn Memories Intake · K-KUT Admin", robots: { index: false, follow: false } };
type PageProps = { searchParams?: Promise<{ token?: string | string[] }> };
export default async function Page({ searchParams }: PageProps) { const params = await searchParams; const token = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim(); if (validAdminToken(token)) redirect(`/admin/access?token=${encodeURIComponent(token!)}&next=${encodeURIComponent("/admin/kkr-torn-memories-intake")}`); if (!trustedProtectedPreview()) { const store = await cookies(); if (!validAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value)) notFound(); } return <TornMemoriesIntakeWorkbench />; }
