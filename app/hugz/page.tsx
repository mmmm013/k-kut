import HugzRotatingLanding from "@/components/HugzRotatingLanding";

export const metadata = {
  title: "HUGz Music Choices | K-KUT",
  description:
    "One temporary HUGz at a time, rotating every 33 seconds. Open a HUGz to choose from multiple music options.",
};

export default function HugzPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#050408] p-2 text-white sm:p-3 lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden">
      <HugzRotatingLanding />
    </main>
  );
}
