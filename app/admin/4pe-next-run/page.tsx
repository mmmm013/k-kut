import { FourPeNextRunWorkbench } from "./workbench";

export const dynamic = "force-dynamic";
export const metadata = { title: "4PE Next Run · K-KUT Admin", robots: { index: false, follow: false } };

export default function FourPeNextRunPage() {
  return <FourPeNextRunWorkbench />;
}
