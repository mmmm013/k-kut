import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import {
  A2P_CAMPAIGN_SID,
  A2P_CONSENT_DISCLOSURE,
  A2P_CONSENT_VERSION,
  A2P_PROGRAM_NAME,
  A2P_SOURCE_PAGE,
} from "../../../lib/a2p-consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "gpm_sms_consent_records";

function cleanString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalizeUsPhone(value: unknown) {
  const raw = cleanString(value, 80);
  const digits = raw.replace(/[^0-9]/g, "");
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (!/^[2-9][0-9]{9}$/.test(national)) return null;
  return `+1${national}`;
}

function serverSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey) {
    throw new Error("sms_consent_store_not_configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "gpm-k-kut-sms-consent-v003",
      },
    },
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Honeypot: return a neutral success response without storing bot input.
  if (cleanString(body.website, 200)) {
    return NextResponse.json(
      { ok: true, sms_consent: false, consent_recorded: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const smsConsent = body.sms_consent === true;
  const phoneE164 = smsConsent ? normalizeUsPhone(body.phone) : null;

  if (smsConsent && !phoneE164) {
    return NextResponse.json(
      { ok: false, error: "valid_us_phone_required_for_sms_opt_in" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabase = serverSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        phone_e164: phoneE164,
        sms_consent: smsConsent,
        campaign_sid: A2P_CAMPAIGN_SID,
        program_name: A2P_PROGRAM_NAME,
        consent_version: A2P_CONSENT_VERSION,
        consent_text: A2P_CONSENT_DISCLOSURE,
        source_page: A2P_SOURCE_PAGE,
        user_agent: cleanString(req.headers.get("user-agent"), 500),
        request_referer: cleanString(req.headers.get("referer"), 500),
      })
      .select("id,submitted_at")
      .single();

    if (error || !data?.id || !data?.submitted_at) {
      console.error("sms_consent_insert_failed", error?.message || "missing_data");
      return NextResponse.json(
        { ok: false, error: "sms_choice_not_saved" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        sms_consent: smsConsent,
        consent_recorded: smsConsent,
        choice_recorded: true,
        consent_version: A2P_CONSENT_VERSION,
        submitted_at: data.submitted_at,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "sms_consent_route_failed",
      error instanceof Error ? error.message : "unknown_error",
    );
    return NextResponse.json(
      { ok: false, error: "sms_choice_not_saved" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/sms-optin",
      program_name: A2P_PROGRAM_NAME,
      campaign_sid: A2P_CAMPAIGN_SID,
      consent_version: A2P_CONSENT_VERSION,
      checkbox_optional: true,
      consent_not_condition_of_purchase: true,
      sends_sms: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
