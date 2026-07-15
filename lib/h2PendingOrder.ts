import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const H2_TABLE = "gpm_h2_pending_orders";
const H2_TOKEN_PATTERN = /^[a-f0-9]{32}$/;
const INVENTORY_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;
const BF_PROFILE_PATTERN = /^[a-z0-9-]{1,60}$/;
const ORIGIN_DOMAIN_PATTERN = /^[A-Za-z0-9.-]{1,253}$/;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PUBLIC_PRODUCT_NAME_LIMIT = 120;

export type PendingH2Order = {
  token: string;
  inventoryId: string;
  personalNote: string;
  bfProfile: string;
  originDomain: string;
  publicProductName: string;
  coreOfferCode: "hug";
  status: "awaiting_payment" | "paid_received";
  createdAt: string;
  expiresAt: string;
};

type CreatePendingH2OrderInput = {
  inventoryId: string;
  personalNote: string;
  bfProfile: string;
  originDomain: string;
  publicProductName: string;
};

type ConsumePendingH2OrderInput = {
  token: string;
  stripeEventId: string;
  stripeCheckoutSessionId: string;
};

type PendingH2OrderRow = {
  token: string;
  inventory_id: string;
  personal_note: string;
  bf_profile: string;
  origin_domain: string;
  public_product_name: string;
  core_offer_code: "hug";
  status: "awaiting_payment" | "paid_received";
  created_at: string;
  expires_at: string;
  stripe_event_id: string | null;
};

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalizePersonalNote(value: unknown) {
  return cleanText(value, PERSONAL_NOTE_CHARACTER_LIMIT)
    .replace(/\s+/gu, " ")
    .trim();
}

function countWords(value: string) {
  return value ? value.split(/\s+/u).filter(Boolean).length : 0;
}

function serverSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey) {
    throw new Error("h2_pending_order_store_not_configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "gpm-h2-pending-order-v001",
      },
    },
  });
}

function normalizeRow(row: PendingH2OrderRow): PendingH2Order {
  return {
    token: row.token,
    inventoryId: row.inventory_id,
    personalNote: row.personal_note,
    bfProfile: row.bf_profile,
    originDomain: row.origin_domain,
    publicProductName: row.public_product_name,
    coreOfferCode: row.core_offer_code,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function h2PendingOrderStoreConfigured() {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function createPendingH2Order(
  input: CreatePendingH2OrderInput,
): Promise<string> {
  const inventoryId = cleanText(input.inventoryId, 200);
  const personalNote = normalizePersonalNote(input.personalNote);
  const bfProfile = cleanText(input.bfProfile, 60).toLowerCase();
  const originDomain = cleanText(input.originDomain, 253).toLowerCase();
  const publicProductName = cleanText(
    input.publicProductName,
    PUBLIC_PRODUCT_NAME_LIMIT,
  );

  if (!INVENTORY_ID_PATTERN.test(inventoryId)) {
    throw new Error("h2_invalid_inventory_id");
  }

  if (countWords(personalNote) > PERSONAL_NOTE_WORD_LIMIT) {
    throw new Error("h2_personal_note_over_13_words");
  }

  if (!BF_PROFILE_PATTERN.test(bfProfile)) {
    throw new Error("h2_invalid_bf_profile");
  }

  if (!ORIGIN_DOMAIN_PATTERN.test(originDomain)) {
    throw new Error("h2_invalid_origin_domain");
  }

  if (!publicProductName) {
    throw new Error("h2_missing_public_product_name");
  }

  const token = randomUUID().replaceAll("-", "");
  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from(H2_TABLE)
    .insert({
      token,
      inventory_id: inventoryId,
      personal_note: personalNote,
      bf_profile: bfProfile,
      origin_domain: originDomain,
      public_product_name: publicProductName,
      core_offer_code: "hug",
      status: "awaiting_payment",
    })
    .select("token")
    .single();

  if (error || !data?.token || !H2_TOKEN_PATTERN.test(data.token)) {
    throw new Error("h2_pending_order_create_failed");
  }

  return data.token;
}

export async function consumePendingH2Order(
  input: ConsumePendingH2OrderInput,
): Promise<PendingH2Order> {
  const token = cleanText(input.token, 80).toLowerCase();
  const stripeEventId = cleanText(input.stripeEventId, 220);
  const stripeCheckoutSessionId = cleanText(
    input.stripeCheckoutSessionId,
    220,
  );

  if (!H2_TOKEN_PATTERN.test(token)) {
    throw new Error("h2_invalid_token");
  }

  if (!stripeEventId || !stripeCheckoutSessionId) {
    throw new Error("h2_missing_stripe_authority");
  }

  const supabase = serverSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(H2_TABLE)
    .update({
      status: "paid_received",
      stripe_event_id: stripeEventId,
      stripe_checkout_session_id: stripeCheckoutSessionId,
      paid_received_at: now,
      updated_at: now,
    })
    .eq("token", token)
    .eq("status", "awaiting_payment")
    .gt("expires_at", now)
    .select(
      "token,inventory_id,personal_note,bf_profile,origin_domain,public_product_name,core_offer_code,status,created_at,expires_at,stripe_event_id",
    )
    .maybeSingle();

  if (error) {
    throw new Error("h2_pending_order_consume_failed");
  }

  if (data) {
    return normalizeRow(data as PendingH2OrderRow);
  }

  const { data: existing, error: existingError } = await supabase
    .from(H2_TABLE)
    .select(
      "token,inventory_id,personal_note,bf_profile,origin_domain,public_product_name,core_offer_code,status,created_at,expires_at,stripe_event_id",
    )
    .eq("token", token)
    .maybeSingle();

  if (existingError) {
    throw new Error("h2_pending_order_lookup_failed");
  }

  if (
    existing &&
    existing.status === "paid_received" &&
    existing.stripe_event_id === stripeEventId
  ) {
    return normalizeRow(existing as PendingH2OrderRow);
  }

  throw new Error("h2_pending_order_not_available");
}
