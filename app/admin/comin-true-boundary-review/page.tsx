import { notFound } from "next/navigation";

import worklist from "@/data/kkr-captured-cc-correction-worklists/comin_true.deduplicated-v1.json";
import prosecution from "@/data/kkr-captured-cc-correction-worklists/comin_true.endpoint-prosecution-v1.json";

import { CominTrueBoundaryWorkbench, type ProsecutionEndpoint } from "./workbench";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comin' True Boundary Review · K-KUT Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function CominTrueBoundaryReviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const suppliedToken = (Array.isArray(params?.token) ? params?.token[0] : params?.token)?.trim();
  const expectedToken = process.env.ADMIN_PREVIEW_TOKEN?.trim();

  if (!expectedToken || suppliedToken !== expectedToken) {
    notFound();
  }

  const items = worklist.items.map((item) => ({
    id: item.work_item_id,
    start: item.captured_cc.capture_start_sec,
    storedEnd: item.captured_cc.stored_capture_end_sec,
    titles: item.display_titles,
    consumerKeys: item.consumer_ii_keys,
    productFamilies: item.product_families,
  }));

  return (
    <CominTrueBoundaryWorkbench
      sourceTitle={worklist.source_title}
      sourcePath={worklist.source_audio_path}
      sourceSha256={worklist.source_sha256}
      worklistSchema={worklist.schema_version}
      items={items}
      prosecution={prosecution.endpoints as ProsecutionEndpoint[]}
      measuredAlignment={prosecution.method.measured_alignment}
    />
  );
}
