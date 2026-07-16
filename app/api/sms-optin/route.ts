import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "gpm_sms_consent_records";
const CAMPAIGN_SID = "CM9788370188c8c407e38f427fe849a70f";
const CONSENT_VERSION = "k-kut-sms-consent-v002-2026-07-15";
const SOURCE_PAGE = "https://www.k-kut.com/sms-optin";
const CONSENT_TEXT =
  "Optional: I agree to receive transactional customer-care SMS messages from K-KUT (G Putnam Music, LLC) about my orders, digital HUG delivery, support requests, and service-status updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Reply HELP for help. Consent is not a condition of purchase, account creation, order, delivery, or support.";

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
        "X-Client-Info": "gpm-k-kut-sms-consent-v002",
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
        campaign_sid: CAMPAIGN_SID,
        program_name: "K-KUT",
        consent_version: CONSENT_VERSION,
        consent_text: CONSENT_TEXT,
        source_page: SOURCE_PAGE,
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
      program_name: "K-KUT",
      campaign_sid: CAMPAIGN_SID,
      checkbox_optional: true,
      consent_not_condition_of_purchase: true,
      sends_sms: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
