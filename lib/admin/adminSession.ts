import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "gpm_admin_session";
const SESSION_PAYLOAD = "gpm-admin-v1";

function expectedToken() {
  return process.env.ADMIN_PREVIEW_TOKEN?.trim() || "";
}

function sessionSignature() {
  const secret = expectedToken();
  return secret ? createHmac("sha256", secret).update(SESSION_PAYLOAD).digest("hex") : "";
}

export function validAdminToken(value?: string | null) {
  const expected = expectedToken();
  const supplied = value?.trim() || "";
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validAdminSession(value?: string | null) {
  const expected = sessionSignature();
  const supplied = value?.trim() || "";
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Preview deployments are already gated by Vercel Authentication for the project.
// Inside that protected environment, do not force the owner to supply a second app secret.
// Production/custom-domain admin access continues to require the app's signed admin session.
export function trustedProtectedPreview() {
  return process.env.VERCEL_ENV === "preview";
}

export function adminSessionCookieValue() {
  return sessionSignature();
}
