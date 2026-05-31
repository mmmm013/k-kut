import ApprovedPersonalRoutePage from "@/lib/personal-route-pages/ApprovedPersonalRoutePage";

export const metadata = {
  title: "Apology K-KUT HUGs | G Putnam Music",
  description:
    "Send an apology or repair-ready GPM music HUG from approved K-KUT options.",
};

export default function ApologyPage() {
  return (
    <ApprovedPersonalRoutePage
      publicRoute="/personal/apology"
      title="Apology"
      subtitle="Send a softer repair-level music moment with approved GPM HUG delivery audio."
    />
  );
}
