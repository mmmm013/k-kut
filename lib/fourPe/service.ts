import { createClient } from "@supabase/supabase-js";

export function fourPeServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export function validSha256(value: unknown) {
  return value == null || value === "" || (typeof value === "string" && /^[a-f0-9]{64}$/i.test(value));
}

export function workerAuthorized(authorization: string | null) {
  const expected = process.env.FOUR_PE_WORKER_SECRET?.trim();
  return Boolean(expected && authorization === `Bearer ${expected}`);
}
