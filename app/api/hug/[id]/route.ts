import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { data: hug } = await supabase
    .from("hug_instances")
    .select("*")
    .eq("id", params.id)
    .single();

  return NextResponse.json({
    ...hug,
    audio_url: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/tracks/A%20LOVE%20LIKE%20THAT.mp3",
    delivery_note: "Soft mmm → \"I wanna love like that\" → warm finish"
  });
}
