import { NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  trustedProtectedPreview,
  validAdminSession,
  validAdminToken,
} from '@/lib/admin/adminSession';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) {
  return (
    trustedProtectedPreview() ||
    validAdminToken(request.headers.get('x-admin-token')) ||
    validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
  );
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(
    {
      error: 'machine_exception_queue_quarantined',
      detail:
        'Direct endpoint writes are disabled. Machine exception timestamps are evidence only. Use a durable owner-confirmed boundary decision.',
    },
    { status: 409 },
  );
}
