import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VOCAL_TRACK_ID = "c5b9e589-2db5-41c6-a335-0e3ee7f1f43f";
const INSTRO_TRACK_ID = "94856625-a4a7-449b-99ac-730d7a39e7b9";
const CANDIDATE_KEY = "kkr-torn-memories-cc-001";
const RENDER_PATH = "kkr-tpr/torn-memories/TORN_MEMORIES__KKR_CC_001.mp3";
const EXPECTED_LYRIC_SHA = "9657508e03e3ecb35c3341525fb3b67039ca50999ee957c13dfbbe19e27e8ec3";
const EXPECTED_LINE = "But our minds thought in wicked ways.";
const SR = 8000;
const FRAME = 160;
const HOP = 80;
const LOW = 0.66;
const STRONG = 0.78;
const MIN_GAP_SEC = 0.55;

function authorized(request: NextRequest) {
  const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return trustedProtectedPreview() || validAdminToken(supplied) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

function md5(bytes: Uint8Array) { return createHash("md5").update(bytes).digest("hex"); }
function sha256Text(text: string) { return createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex"); }
function median(values: number[]) {
  if (!values.length) return 0;
  const ordered = [...values].sort((a,b)=>a-b);
  return ordered[Math.floor(ordered.length/2)];
}

function decodeMono(path: string) {
  if (!ffmpegPath) throw new Error("ffmpeg-static path unavailable");
  const run = spawnSync(ffmpegPath, ["-hide_banner","-loglevel","error","-i",path,"-vn","-ac","1","-ar",String(SR),"-f","f32le","pipe:1"], { maxBuffer: 128 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(`ffmpeg decode failed: ${run.stderr?.toString() || run.status}`);
  const buf = run.stdout;
  const values = new Float32Array(Math.floor(buf.length / 4));
  for (let i=0;i<values.length;i++) values[i] = buf.readFloatLE(i*4);
  return values;
}

function align(vocal: Float32Array, instro: Float32Array) {
  const n = Math.min(vocal.length, instro.length);
  const radius = Math.round(0.60 * SR);
  let best: {mse:number; shift:number; scale:number} | null = null;
  for (let shift=-radius; shift<=radius; shift+=8) {
    const startY = shift >= 0 ? shift : 0;
    const startX = shift >= 0 ? 0 : -shift;
    const len = n - Math.abs(shift);
    if (len < SR*20) continue;
    let xy=0, xx=0, yy=0, count=0;
    for (let i=0;i<len;i+=64) {
      const y=vocal[startY+i], x=instro[startX+i];
      xy += x*y; xx += x*x; yy += y*y; count++;
    }
    if (xx <= 1e-12 || count === 0) continue;
    const scale=xy/xx;
    const mse=(yy - 2*scale*xy + scale*scale*xx)/count;
    if (!best || mse < best.mse) best={mse,shift,scale};
  }
  if (!best) throw new Error("paired-master alignment failed");
  return best;
}

function buildEvidence(vocal: Float32Array, instro: Float32Array, alignment: {shift:number;scale:number}) {
  const n=Math.min(vocal.length,instro.length);
  const startY=alignment.shift>=0?alignment.shift:0;
  const startX=alignment.shift>=0?0:-alignment.shift;
  const len=n-Math.abs(alignment.shift);
  const frames: {time:number; ratio:number; instRms:number}[]=[];
  for (let i=0;i+FRAME<len;i+=HOP) {
    let rs=0, vs=0, xs=0;
    for (let j=0;j<FRAME;j++) {
      const y=vocal[startY+i+j];
      const x=instro[startX+i+j];
      const r=y-alignment.scale*x;
      rs+=r*r; vs+=y*y; xs+=x*x;
    }
    const rr=Math.sqrt(rs/FRAME), vr=Math.sqrt(vs/FRAME), xr=Math.sqrt(xs/FRAME);
    frames.push({time:(startY+i+FRAME/2)/SR,ratio:rr/Math.max(vr,1e-9),instRms:xr});
  }
  return frames;
}

function prosecute(frames: {time:number;ratio:number;instRms:number}[]) {
  const strong=frames.map(f=>f.ratio>=STRONG);
  const low=frames.map(f=>f.ratio<LOW);
  const firstStrong=strong.findIndex(Boolean);
  if (firstStrong<0) throw new Error("no vocal event proved");
  const vtpStart=frames[firstStrong].time;
  const minGapFrames=Math.ceil(MIN_GAP_SEC/(HOP/SR));
  const separators: {start:number;end:number}[]=[];
  for (let i=0;i<low.length;) {
    if (!low[i]) { i++; continue; }
    let j=i; while (j<low.length && low[j]) j++;
    if (j-i>=minGapFrames) {
      const before=strong.slice(Math.max(0,i-80),i).some(Boolean);
      const after=strong.slice(j,Math.min(strong.length,j+80)).some(Boolean);
      if (before && after) separators.push({start:frames[i].time,end:frames[j-1].time});
    }
    i=j;
  }
  const sep=separators.find(s=>s.start>vtpStart+2);
  if (!sep) throw new Error("no governing post-vocal structural separator proved");
  let lastStrong=firstStrong;
  for (let i=firstStrong;i<frames.length && frames[i].time<sep.start;i++) if (strong[i]) lastStrong=i;
  const vtpEnd=frames[lastStrong].time + (FRAME/(2*SR));

  // IN-PIX structural cue: choose the strongest smoothed RMS change within 4s before VTP start.
  const searchStart=Math.max(0,vtpStart-4);
  let bestIndex=firstStrong, bestNovelty=-1;
  const lag=Math.max(1,Math.round(0.35/(HOP/SR)));
  const window=Math.max(1,Math.round(0.18/(HOP/SR)));
  const smooth=(idx:number)=>median(frames.slice(Math.max(0,idx-window),Math.min(frames.length,idx+window+1)).map(f=>f.instRms));
  for (let i=Math.max(lag,firstStrong-Math.round(4/(HOP/SR)));i<=firstStrong;i++) {
    if (frames[i].time<searchStart) continue;
    const novelty=Math.abs(smooth(i)-smooth(i-lag));
    if (novelty>bestNovelty) { bestNovelty=novelty; bestIndex=i; }
  }
  let intpStart=Math.min(vtpStart,frames[bestIndex].time);
  if (vtpStart-intpStart>3.5) intpStart=vtpStart;
  const intpEnd=sep.start;
  if (!(intpStart<=vtpStart && vtpStart<vtpEnd && vtpEnd<=intpEnd)) throw new Error("InTP/VTP containment failed");
  return {
    intpStart:Number(intpStart.toFixed(3)),
    vtpStart:Number(vtpStart.toFixed(3)),
    vtpEnd:Number(vtpEnd.toFixed(3)),
    intpEnd:Number(intpEnd.toFixed(3)),
    separators:separators.map(s=>({start:Number(s.start.toFixed(3)),end:Number(s.end.toFixed(3))})),
    structureNovelty:Number(bestNovelty.toExponential(6)),
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({error:"not_found"},{status:404});
  const supabase=serviceClient();
  if (!supabase) return NextResponse.json({error:"service_client_unavailable"},{status:503});
  if (!ffmpegPath) return NextResponse.json({error:"ffmpeg_unavailable"},{status:503});
  const dir=await mkdtemp(join(tmpdir(),"kkr-torn-"));
  try {
    const {data: resolver, error: resolverError}=await supabase.from("gpmx_track_storage_audio_resolver_v1")
      .select("track_id,resolved_bucket_id,resolved_object_name,resolver_state,delivery_ready")
      .in("track_id",[VOCAL_TRACK_ID,INSTRO_TRACK_ID]);
    if (resolverError || !resolver || resolver.length!==2) throw new Error(`resolver failed: ${resolverError?.message || resolver?.length}`);
    const byId=new Map(resolver.map((r:any)=>[String(r.track_id),r]));
    const vocalRow=byId.get(VOCAL_TRACK_ID), instroRow=byId.get(INSTRO_TRACK_ID);
    if (!vocalRow || !instroRow || vocalRow.resolver_state!=="RESOLVED_FROM_STORAGE_OBJECT_ID" || instroRow.resolver_state!=="RESOLVED_FROM_STORAGE_OBJECT_ID") throw new Error("exact resolver state missing");

    const download=async(row:any,path:string)=>{
      const result=await supabase.storage.from(String(row.resolved_bucket_id)).download(String(row.resolved_object_name));
      if (result.error || !result.data) throw new Error(`private download failed: ${result.error?.message}`);
      const bytes=new Uint8Array(await result.data.arrayBuffer());
      await writeFile(path,bytes);
      return bytes;
    };
    const vocalPath=join(dir,"vocal.mp3"), instroPath=join(dir,"instro.mp3");
    const [vocalBytes,instroBytes]=await Promise.all([download(vocalRow,vocalPath),download(instroRow,instroPath)]);
    if (vocalBytes.length!==14258427 || md5(vocalBytes)!=="69cc2add1e0c96c394eb55a245f8553c") throw new Error("vocal byte identity mismatch");
    if (instroBytes.length!==14255091 || md5(instroBytes)!=="1c623bc7eb95104f221eba87dd7ef62d") throw new Error("IN-PIX byte identity mismatch");

    const {data: lyricRow, error: lyricError}=await supabase.from("gpmc_lt_pix_canonical_lyrics_ee")
      .select("canonical_lyrics,lyrics_sha256,lineage_state").eq("source_catalog_track_id",161322999).single();
    if (lyricError || !lyricRow) throw new Error(`lyric authority unavailable: ${lyricError?.message}`);
    const lyrics=String(lyricRow.canonical_lyrics || "");
    if (String(lyricRow.lyrics_sha256)!==EXPECTED_LYRIC_SHA || sha256Text(lyrics)!==EXPECTED_LYRIC_SHA || !lyrics.includes(EXPECTED_LINE)) throw new Error("current owner lyric authority mismatch");

    const vocal=decodeMono(vocalPath), instro=decodeMono(instroPath);
    const alignment=align(vocal,instro);
    const frames=buildEvidence(vocal,instro,alignment);
    const p=prosecute(frames);

    const rendered=join(dir,"candidate.mp3");
    const render=spawnSync(ffmpegPath,["-hide_banner","-loglevel","error","-y","-i",vocalPath,"-ss",String(p.intpStart),"-to",String(p.intpEnd),"-map","0:a:0","-c:a","libmp3lame","-q:a","0",rendered],{maxBuffer:32*1024*1024});
    if (render.status!==0) throw new Error(`candidate render failed: ${render.stderr?.toString() || render.status}`);
    const renderedBytes=new Uint8Array(await readFile(rendered));
    const upload=await supabase.storage.from("tracks").upload(RENDER_PATH,renderedBytes,{contentType:"audio/mpeg",upsert:true});
    if (upload.error) throw new Error(`candidate upload failed: ${upload.error.message}`);

    const firstGroup=lyrics.split(/\n\s*\n/)[0]?.trim() || "TORN MEMORIES vocal CC 001";
    const payload={
      candidate_key:CANDIDATE_KEY,
      card_key:"TPR_TORN_MEMORIES_KKR_CC_001",
      authority_title:"TORN MEMORIES",
      ii_type:"KKR_CC",
      container_type:"HUG",
      display_text:firstGroup,
      form_key:"CMG_FEEL_BLK",
      start_sec:p.intpStart,
      end_sec:p.intpEnd,
      audio_path:String(vocalRow.resolved_object_name),
      review_state:"PENDING_GREGORY_REVIEW",
      evidence_state:"KKR_TPR_MACHINE_PROSECUTED",
      source_relation:"VOCAL_LT_PIX_CC",
      source_track_ref:VOCAL_TRACK_ID,
      source_vocal_track_id:VOCAL_TRACK_ID,
      source_in_pix_track_id:INSTRO_TRACK_ID,
      lyric_authority_sha256:EXPECTED_LYRIC_SHA,
      intp_start_sec:p.intpStart,
      vtp_start_sec:p.vtpStart,
      vtp_end_sec:p.vtpEnd,
      intp_end_sec:p.intpEnd,
      method_notes:{
        writer_pattern_mode:"CMG_FEEL_BLK",
        review_audio:"FULL_VOCAL_LT_PIX_WITH_CC_RANGE",
        rendered_cc_path:RENDER_PATH,
        rendered_cc_sha256:createHash("sha256").update(renderedBytes).digest("hex"),
        in_pix_role:"STRUCTURAL_AND_ATTRIBUTAL_EVIDENCE_ONLY",
        alignment_lag_sec:Number((alignment.shift/SR).toFixed(4)),
        alignment_scale:Number(alignment.scale.toFixed(6)),
        alignment_mse:Number(alignment.mse.toExponential(6)),
        structure_novelty:p.structureNovelty,
        separators:p.separators,
        lyric_line_verified:EXPECTED_LINE
      },
      updated_at:new Date().toISOString(),
    };
    const upsert=await supabase.schema("gpmx_backend").from("kkr_tpr_candidate_ee").upsert(payload,{onConflict:"candidate_key"}).select("candidate_key,start_sec,end_sec,intp_start_sec,vtp_start_sec,vtp_end_sec,intp_end_sec").single();
    if (upsert.error) throw new Error(`reviewer candidate persist failed: ${upsert.error.message}`);

    return NextResponse.json({ok:true,candidate:upsert.data,authority:{lyrics_sha256:EXPECTED_LYRIC_SHA,line:EXPECTED_LINE},sources:{vocal:String(vocalRow.resolved_object_name),in_pix:String(instroRow.resolved_object_name)},rendered:{path:RENDER_PATH,bytes:renderedBytes.length},reviewer:"/admin/kut-reviewer"});
  } catch (error:any) {
    return NextResponse.json({ok:false,error:error?.message || String(error)},{status:500});
  } finally {
    await rm(dir,{recursive:true,force:true}).catch(()=>{});
  }
}
