"use client";

import { useEffect, useState } from "react";

export default function HugPage({ params }: { params: { id: string } }) {
  const [hug, setHug] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/hug/${params.id}`)
      .then(res => res.json())
      .then(setHug);
  }, [params.id]);

  if (!hug) return <div>Loading...</div>;

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>💛 You’ve received a HUG</h1>
      <audio controls src={hug.audio_url} style={{ marginTop: 20 }} />
      <p style={{ marginTop: 20 }}>{hug.delivery_note}</p>
      <p>Remaining forwards: {hug.remaining_forwards}</p>
    </div>
  );
}
