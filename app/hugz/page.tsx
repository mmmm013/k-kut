import HugzDiscoveryGrid from "@/components/HugzDiscoveryGrid";

export const metadata = {
  title: "HUGz Music Choices | K-KUT",
  description: "Open one of 13 temporary sentiment containers and choose from multiple music options for a $7.99 HUG delivery package.",
};

export default function HugzPage() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <HugzDiscoveryGrid />
      </div>
    </main>
  );
}
