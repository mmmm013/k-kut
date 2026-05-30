
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "asset-drop";

const allowedFolders = new Set([
  "01_MC-BOT Voice",
  "02_KLEIGH Audio",
  "03_K-KUT Candidate Audio",
  "04_Photos",
  "05_Video",
  "06_Lyrics Notes Scripts",
  "07_Artwork",
  "08_Father’s Day",
  "09_Holiday Rotation",
  "99_Archive Superseded",
]);

function safeName(name: string) {
  return name
    .replace(/[^\w.\-() ]+/g, "_")
    .replace(/\s+/g, "-")
    .slice(0, 160);
}

export async function POST(req: Request) {
  const configuredCode = process.env.ASSET_DROP_UPLOAD_TOKEN;

  if (!configuredCode) {
    return NextResponse.json(
      { ok: false, error: "Asset drop upload code is not configured." },
      { status: 500 }
    );
  }

  const form = await req.formData();

  const uploadCode = String(form.get("uploadCode") || "");
  const folder = String(form.get("folder") || "");
  const note = String(form.get("note") || "").trim();

  if (uploadCode !== configuredCode) {
    return NextResponse.json(
      { ok: false, error: "Wrong upload code." },
      { status: 401 }
    );
  }

  if (!allowedFolders.has(folder)) {
    return NextResponse.json(
      { ok: false, error: "Invalid folder." },
      { status: 400 }
    );
  }

  if (!note) {
    return NextResponse.json(
      { ok: false, error: "Please include what this is for." },
      { status: 400 }
    );
  }

  const files = form.getAll("files").filter((x): x is File => x instanceof File);

  if (!files.length) {
    return NextResponse.json(
      { ok: false, error: "No files provided." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase server credentials are missing." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: buckets } = await supabase.storage.listBuckets();
  const hasBucket = buckets?.some((b) => b.name === BUCKET);

  if (!hasBucket) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 1024 * 1024 * 1024,
    });

    if (createError) {
      return NextResponse.json(
        { ok: false, error: `Could not create asset-drop bucket: ${createError.message}` },
        { status: 500 }
      );
    }
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const stamp = now.toISOString().replace(/[:.]/g, "-");

  const uploaded = [];

  for (const file of files) {
    const fileName = safeName(file.name || "upload.bin");
    const path = `pending-review/${folder}/${day}/${stamp}-${fileName}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
        metadata: {
          uploaded_by_role: "MC",
          approval_status: "pending_greg_review",
          note,
          original_name: file.name,
        },
      });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Upload failed for ${file.name}: ${error.message}` },
        { status: 500 }
      );
    }

    uploaded.push({
      originalName: file.name,
      path,
      status: "pending_greg_review",
    });
  }

  return NextResponse.json({
    ok: true,
    uploadedCount: uploaded.length,
    uploaded,
    rule: "Uploaded means received, not accepted or public.",
  });
}
