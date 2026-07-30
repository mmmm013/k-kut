import HugzRotatingLanding from "@/components/HugzRotatingLanding";

export const metadata = {
  title: "13 HUGz Cards | K-KUT",
  description:
    "Explore 13 sentiment HUGz Cards while their KK and KOMBO vocal boundaries complete quality review.",
};

export default function HugzPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#050408] p-2 text-white sm:p-3 lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden">
      <HugzRotatingLanding />
    </main>
  );
}
