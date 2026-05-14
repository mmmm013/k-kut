import { KUT_MAP } from "@/app/lib/kut-map";
import Link from "next/link";

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params?.slug;

  if (!slug) {
    return <div>No slug</div>;
  }

  const kutIds = KUT_MAP[slug as keyof typeof KUT_MAP] || [];

  return (
    <main style={{ padding: "40px", color: "white", background: "black" }}>
      <h1>{slug}</h1>

      {kutIds.length === 0 && <p>No KUTs found</p>}

      {kutIds.map((id) => (
        <div key={id}>
          <Link href={`/k/${id}`}>▶ Play {id}</Link>
        </div>
      ))}
    </main>
  );
}