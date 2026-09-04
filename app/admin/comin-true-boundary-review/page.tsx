import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "P0 KUT Reviewer Redirect · K-KUT Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function CominTrueBoundaryReviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const suppliedToken = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim() || "";
  // Sole-owner product: admin routes open automatically everywhere, no login wall.
  redirect(`/admin/kut-reviewer${suppliedToken ? `?token=${encodeURIComponent(suppliedToken)}` : ""}`);
}
