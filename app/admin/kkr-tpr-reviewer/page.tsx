import { TprReviewerWorkbench } from "./workbench";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TPR Reviewer · K-KUT Admin",
  robots: { index: false, follow: false },
};

// Sole-owner product: admin routes open automatically everywhere, no login wall.
export default function KkrTprReviewerPage() {
  return <TprReviewerWorkbench />;
}
