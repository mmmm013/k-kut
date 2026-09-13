import { createHash } from "node:crypto";

// Exact historical recordings; this map grants no product approval.
const records = [
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:1",
    "title": "FD-KUT-RTB-001",
    "path": "public/father-days-kks/ring-the-bell/ii-delivery/FD-KUT-RTB-001-v005-KEEP-30p90-endpad-0p333-ii-delivery-v001.mp3",
    "sha256": "f46968ebb6046502a8ceec592592d6916ea060e49894954d92dc18ad39571ee5"
  },
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:2",
    "title": "FD-KUT-RTB-002",
    "path": "public/father-days-kks/ring-the-bell/ii-delivery/FD-KUT-RTB-002-v001-KEEP-CHORUS1-30p90-54p00-ii-delivery-v001.mp3",
    "sha256": "77c3d16211e246acb8461a5098656bfc2788a7f2671c47ad4baba96492b094f2"
  },
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:3",
    "title": "FD-KUT-RTB-003",
    "path": "public/father-days-kks/ring-the-bell/ii-delivery/FD-KUT-RTB-003-v002-REENCODE-FIX-54p00-76p00-ii-delivery-v001.mp3",
    "sha256": "76991371e847b73fa8f995571c94c46e7ec97f162949fca1a05b77190b47cf3e"
  },
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:4",
    "title": "FD-KUT-RTB-004",
    "path": "public/father-days-kks/ring-the-bell/ii-delivery/FD-KUT-RTB-004-v001-KEEP-76p00-98p80-ii-delivery-v001.mp3",
    "sha256": "aaacb1b8902d8b394e387d0bd98393e42570a67d5b58f9bd1dcccbd75d91dc0e"
  },
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:5",
    "title": "FD-KUT-RTB-005",
    "path": "public/father-days-kks/ring-the-bell/ii-delivery/FD-KUT-RTB-005-v001-KEEP-98p80-112p40-ii-delivery-v004-canonical-sti.mp3",
    "sha256": "593d7f0f91fc95622240961fba32b81ae2511d079e46507e8eb8b0ccbc40b931"
  },
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:6",
    "title": "FD-KUT-RTB-006",
    "path": "public/father-days-kks/ring-the-bell/ii-delivery/FD-KUT-RTB-006-v001-FINAL-CHORUS-OUTRO-start-112p40-to-end-ii-delivery-v001-canonical-sti.mp3",
    "sha256": "f203c6840e2489b2332a09543ccb8d0207e3071e7a968dd1d8c2bcdd4d907d8d"
  },
  {
    "record_key": "public.gpmc_approved_kk_admin_ee:7",
    "title": "fd-no-mystery-final-chorus-or-ch3",
    "path": "public/kks/no-mystery/im-no-mystery-authority-current-review-v1/im-no-mystery-blk6-current-law-loud-twinkle.mp3",
    "sha256": "52d0315d8cdd7e6c3b2f8e46239c280a666c8ffeb2874b6412d2583601bec8ec"
  },
  {
    "record_key": "public.gpmc_derivative_product_inventory_ee:2",
    "title": "fd-no-mystery-final-chorus-or-ch3",
    "path": "public/kks/no-mystery/im-no-mystery-authority-current-review-v1/im-no-mystery-blk6-current-law-loud-twinkle.mp3",
    "sha256": "52d0315d8cdd7e6c3b2f8e46239c280a666c8ffeb2874b6412d2583601bec8ec"
  }
];
const commit = "592e5a9c40b69b66226a2f93431aa001cd9941aa";
export function archivedKK(row: { record_key: string; title: string }) {
  return records.find(r => r.record_key === row.record_key && r.title === row.title);
}
export async function readArchivedKK(record: NonNullable<ReturnType<typeof archivedKK>>) {
  const response = await fetch(`https://raw.githubusercontent.com/mmmm013/k-kut/${commit}/${record.path}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("archive_unavailable");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash("sha256").update(bytes).digest("hex") !== record.sha256) throw new Error("archive_hash_mismatch");
  return bytes;
}
