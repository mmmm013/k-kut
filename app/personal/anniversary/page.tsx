import ApprovedPersonalRoutePage from "@/lib/personal-route-pages/ApprovedPersonalRoutePage";

export const metadata = {
  title: "Anniversary K-KUT HUGs | G Putnam Music",
  description:
    "Send an anniversary-ready GPM music HUG from approved K-KUT options.",
};

export const dynamic = "force-dynamic";

export default function AnniversaryPage() {
  return (
    <ApprovedPersonalRoutePage
      publicRoute="/personal/anniversary"
      title="Anniversary"
      subtitle="Send a still-choosing-you music moment with approved GPM HUG delivery audio."
    />
  );
}
