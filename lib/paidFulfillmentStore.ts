import { createClient } from "@supabase/supabase-js";

// Use the existing private event store. Never acknowledge durable fulfillment
// based on Render's ephemeral disk or application logs.
export async function persistPaidFulfillment(record: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.GPMC_KUT_SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("paid_fulfillment_store_not_configured");
  const eventId = record.stripe_event_id;
  if (typeof eventId !== "string" || !/^evt_[A-Za-z0-9_]+$/.test(eventId)) throw new Error("invalid_payment_event");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.from("stripe_webhook_events").upsert({
    id: `render_fulfillment_${eventId}`,
    event_type: "k_kut.paid_fulfillment_recorded",
    payload: record,
    processed_at: null,
  }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw new Error("paid_fulfillment_store_write_failed");
  return record.status === "paid_held_current_ii_authority"
    ? "durable_paid_hold_recorded" : "durable_paid_manual_fulfillment_recorded";
}
