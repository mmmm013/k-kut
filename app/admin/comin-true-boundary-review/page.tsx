import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "P0 KUT Reviewer Redirect · K-KUT Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function KutReviewerRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const suppliedToken = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim();
  const expectedToken = process.env.ADMIN_PREVIEW_TOKEN?.trim();

  if (!expectedToken || suppliedToken !== expectedToken) {
    notFound();
  }
  redirect(`/admin/kut-reviewer?token=${encodeURIComponent(suppliedToken)}`);
}
