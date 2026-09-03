import { notFound } from "next/navigation";
import { KutReviewerWorkbench } from "./workbench";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "K-KUT Reviewer · Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function KutReviewerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const suppliedToken = (
    Array.isArray(params?.token) ? params?.token[0] : params?.token
  )?.trim();
  const expectedToken = process.env.ADMIN_PREVIEW_TOKEN?.trim();

  if (!expectedToken || suppliedToken !== expectedToken) {
    notFound();
  }

  return <KutReviewerWorkbench token={suppliedToken} />;
}
