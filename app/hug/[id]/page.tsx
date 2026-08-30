import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import EofSignatureAudio from "@/components/EofSignatureAudio";
import { findApprovedPublicOptionByInventoryId } from "@/lib/publication-bridge/approvedPublicOptions";

export const dynamic = "force-dynamic";

type HugRow = {
  id?: string;
  kut_id?: string;
  k_kut_id?: string;
  delivery_note?: string;
  message?: string;
  sender_name?: string;
  recipient_name?: string;
  remaining_forwards?: number;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export default async function HugDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#160d08] px-6 text-[#fff3cf]">
        <p>HUG lookup is temporarily unavailable.</p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("hugs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const hug = data as HugRow;
  const kutId = firstString(hug.kut_id, hug.k_kut_id, hug.id);
  const currentOption = findApprovedPublicOptionByInventoryId(kutId);
  const verifiedPlayable = Boolean(
    currentOption &&
      currentOption.product_family === "HUG" &&
      currentOption.inventory_family === "KK",
  );
  const audioUrl = verifiedPlayable ? currentOption?.audio_delivery_url || "" : "";

  const sender = firstString(hug.sender_name) || "Someone";
  const recipient = firstString(hug.recipient_name) || "you";
  const note =
    firstString(hug.delivery_note, hug.message) ||
    "Someone sent you a real-audio GPM HUG.";

  return (
    <main className="min-h-screen bg-[#160d08] px-6 py-12 text-[#fff3cf]">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#d6a400]/40 bg-[#24180f] p-8 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd36a]">
          You received a GPM HUG
        </p>

        <h1 className="mt-4 text-4xl font-black">
          💛 {recipient}, this is for you.
        </h1>

        <p className="mt-4 text-lg text-[#e8cf9f]">
          {sender} sent you a real-audio K-KUT HUG.
        </p>

        {verifiedPlayable ? (
          <EofSignatureAudio src={audioUrl} className="mt-8 w-full" />
        ) : (
          <div className="mt-8 rounded-2xl border border-[#d6a400]/30 bg-[#160d08] p-5 text-[#ffd36a]">
            Audio is held until this exact HUG reaches the current-II STAGE gate.
          </div>
        )}

        <p className="mt-8 rounded-2xl border border-[#d6a400]/25 bg-[#160d08] p-5 text-lg">
          {note}
        </p>

        {typeof hug.remaining_forwards === "number" && (
          <p className="mt-4 text-sm text-[#b99759]">
            Remaining forwards: {hug.remaining_forwards}
          </p>
        )}
      </section>
    </main>
  );
}
