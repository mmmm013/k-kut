"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Item = { id:number; queue_order:number; authority_title:string; lt_track_id:string; in_track_id:string; writer_pattern_mode:string; review_state:string; owner_directive:string|null; structure_notes:string|null };
type QueueResponse = { queue?: Item[]; error?: string; detail?: string };
type Blk = { id:string; lines:string[]; vtpStart:string; vtpEnd:string; intpStart:string; intpEnd:string; mgs:string };

const TORN_MEMORIES_IN_PIX_TRACK_ID = "94856625-a4a7-449b-99ac-730d7a39e7b9";
const TORN_MEMORIES = `Some would say I had my chance
Some would say that I would not dance.
Some would say when the rains came.
I wouldn't play a losing game.
But the walls are closed in on me.
Through the fog I could not see.
I had no choice.
I had to leave,
So I could find my clarity.

And they're coming over me.
Yeah, they're coming over me.
Yeah, they're coming over me.
These torn memories.

You didn't like the choice I made.
But our minds thought in wicked ways.
We were surrounded by a jealous haze.
Choking on our bitter days.
What was once a growing tree.
Rising up and living free.
Is now no less than memory.
And I know it's all because of me.
And it's coming over me.

Yeah, they're coming over me.
Yeah, they're coming over me.
Yeah, they're coming over me.
These torn memories.
Yeah, they’re coming over me.
Yeah, they're coming over me.
Yeah, they’re coming over me.
These torn memories.

Now that I can finally breathe.
Now that you're far away from me.
I know that I made the right choice.
But in my heart I still hear your voice.

And they're coming over me.
Yeah, they're coming over me.
Yeah, they're coming over me.
These torn memories.
Yeah, they're coming over me.
Yeah, they're coming over me.
Yeah, they're coming over me.
These torn memories.

And they're coming over me.
Yeah, they're coming over me.
And they're coming over me.
These torn memories.

And they're coming over me.
Yeah, they're coming over me.
They're coming over me

Yeah, They're coming over me
Yeah, They're coming over me
Yeah, they're coming over me
Yeah, they're coming over me
Yeah, they're coming over me
These torn memories`;

function initialBlks(): Blk[] { return TORN_MEMORIES.trim().split(/\n\s*\n/).map((section, index) => ({ id:`TORN_MEMORIES__BLK_${String(index + 1).padStart(3,"0")}`, lines:section.split("\n").map((line) => line.trim()).filter(Boolean), vtpStart:"", vtpEnd:"", intpStart:"", intpEnd:"", mgs:"" })); }
function decodeNotes(notes:string|null): Blk[] { try { const value=JSON.parse(notes||""); return Array.isArray(value?.blks) ? value.blks : initialBlks(); } catch { return initialBlks(); } }
function validTime(value:string) { return Number.isFinite(Number(value)) && Number(value) >= 0; }

export function TornMemoriesIntakeWorkbench() {
 const audioRef=useRef<HTMLAudioElement|null>(null); const [queue,setQueue]=useState<Item[]>([]); const [activeIndex,setActiveIndex]=useState(0); const [blks,setBlks]=useState<Blk[]>(initialBlks); const [status,setStatus]=useState("Loading BLK mapping queue…");
 useEffect(()=>{void fetch("/api/admin/kkr-torn-memories/mapping",{cache:"no-store"}).then(async r=>{const body=await r.json().catch(()=>({})) as QueueResponse;if(!r.ok)throw new Error(body.detail||body.error||"Queue load failed");const items=body.queue||[];setQueue(items);setActiveIndex(0);setBlks(decodeNotes(items[0]?.structure_notes||null));setStatus(items.length?"Listen through the whole IN-PIX, then map every lyric BLK.":"No pending IN-PIX structure reviews.");}).catch((e:unknown)=>setStatus(e instanceof Error?e.message:"Queue load failed"));},[]);
 const active=queue[activeIndex]||null; const audioSrc=useMemo(()=>active?"/api/admin/kkr-torn-memories/source/instro":"",[active]);
 useEffect(()=>{setBlks(decodeNotes(active?.structure_notes||null));if(audioRef.current&&audioSrc){audioRef.current.pause();audioRef.current.src=audioSrc;audioRef.current.load();}},[active,audioSrc]);
 const update=(index:number,key:keyof Blk,value:string)=>setBlks(current=>current.map((blk,i)=>i===index?{...blk,[key]:value}:blk));
 const isTornMemories=active?.in_track_id===TORN_MEMORIES_IN_PIX_TRACK_ID; const complete=isTornMemories&&blks.every(blk=>blk.lines.length>=2&&validTime(blk.vtpStart)&&validTime(blk.vtpEnd)&&validTime(blk.intpStart)&&validTime(blk.intpEnd)&&Number(blk.vtpEnd)>Number(blk.vtpStart)&&Number(blk.intpEnd)>Number(blk.intpStart)&&blk.mgs.trim());
 async function save(reviewState:"PENDING_HUMAN_TPR"|"STRUCTURE_IDENTIFIED"|"HOLD") { if(!active)return;if(!isTornMemories){setStatus("This workstation is locked to the Torn Memories authority; this queue record is held unchanged.");return;}if(reviewState==="STRUCTURE_IDENTIFIED"&&!complete){setStatus("Every multi-line BLK requires VTP, InTP, and MGS evidence before structure can be identified.");return;}setStatus("Saving…");const structureNotes=JSON.stringify({schema:"KKR_FULL_LYRIC_BLK_MAPPING_V1",authority_title:active.authority_title,full_lyric_read:true,blks},null,2);const r=await fetch("/api/admin/kkr-torn-memories/mapping",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reviewState,structureNotes})});const body=await r.json().catch(()=>({}));if(!r.ok){setStatus(body.detail||body.error||"Save failed");return;}if(reviewState==="STRUCTURE_IDENTIFIED"){const next=queue.filter(x=>x.id!==active.id);setQueue(next);setActiveIndex(Math.min(activeIndex,Math.max(0,next.length-1)));setStatus(next.length?"Saved. Next full-lyric mapping ready.":"Saved. Full-lyric BLK mapping complete.");}else setStatus("Saved as incomplete evidence; no candidate can be generated."); }
 if(!active)return <main className="min-h-screen bg-[#090806] p-8 text-stone-100"><h1 className="text-2xl font-black text-amber-200">FULL-LYRIC BLK MAPPING</h1><p className="mt-4">{status}</p></main>;
 return <main className="min-h-screen bg-[#090806] text-stone-100"><header className="border-b border-amber-200/20 bg-[#100d08] px-5 py-4"><p className="text-xs font-black uppercase tracking-[.24em] text-amber-300">Internal · Human TPR · mandatory before KUT creation</p><h1 className="mt-1 text-2xl font-black">FULL-LYRIC BLK MAPPING</h1><p className="mt-1 text-sm text-stone-400">Read every lyric block. Listen to the entire IN-PIX. Establish Sister Pair evidence before any KK/HUG, sK/TUG, or mK/BUG work.</p></header><section className="mx-auto max-w-6xl p-5"><div className="rounded-2xl border border-amber-300/30 bg-stone-900 p-5"><h2 className="text-3xl font-black">{active.authority_title}</h2>{!isTornMemories ? <p className="mt-3 text-amber-200">No matching full-lyric authority is loaded for this source. This record is held unchanged.</p> : null}<audio ref={audioRef} className="mt-5 w-full" controls preload="metadata" src={audioSrc}/><p className="mt-3 text-sm text-amber-100">{complete?"All BLKs evidenced. Structure identification can be saved.":"Incomplete evidence: this item cannot produce a KUT candidate."}</p><div className="mt-6 space-y-5">{isTornMemories ? blks.map((blk,index)=><article key={blk.id} className="rounded-xl border border-stone-700 bg-black/30 p-4"><p className="font-mono text-xs text-amber-300">{blk.id} · {blk.lines.length} lyric lines</p><ol className="mt-2 list-decimal pl-5 text-sm text-stone-200">{blk.lines.map(line=><li key={line}>{line}</li>)}</ol><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([['vtpStart','VTP start'],['vtpEnd','VTP end'],['intpStart','InTP start'],['intpEnd','InTP end']] as const).map(([key,label])=><label key={key} className="text-xs font-bold text-stone-400">{label}<input value={blk[key]} onChange={e=>update(index,key,e.target.value)} inputMode="decimal" placeholder="seconds" className="mt-1 w-full rounded border border-stone-600 bg-stone-950 p-2 font-mono text-stone-100"/></label>)}</div><label className="mt-3 block text-xs font-bold text-stone-400">Independent MGS / humanized meaning evidence<textarea value={blk.mgs} onChange={e=>update(index,'mgs',e.target.value)} rows={3} placeholder="Preserve distinct meanings, POV, emotional direction, use/avoidance context, and contradictions. Do not inherit song-level meaning." className="mt-1 w-full rounded border border-stone-600 bg-stone-950 p-3 text-sm text-stone-100"/></label></article>) : null}</div><div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>void save("PENDING_HUMAN_TPR")} className="rounded-xl bg-sky-500 px-4 py-3 font-black text-black">SAVE INCOMPLETE MAP</button><button onClick={()=>void save("STRUCTURE_IDENTIFIED")} disabled={!complete} className="rounded-xl bg-emerald-400 px-4 py-3 font-black text-black disabled:opacity-30">COMPLETE BLK MAP</button><button onClick={()=>void save("HOLD")} className="rounded-xl border border-amber-300/60 px-4 py-3 font-black text-amber-200">HOLD</button><a href="/admin/kut-reviewer" className="rounded-xl border border-stone-500 px-4 py-3 font-black text-stone-200">Back to KUT reviewer</a></div><p className="mt-3 text-xs text-stone-500">{status}</p></div></section></main>;
}
