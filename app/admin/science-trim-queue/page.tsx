'use client';

import { useRef, useState } from 'react';
import targets from '@/data/kkr-correction-queues/comin-true-owner-trim-targets-v1.json';

type T = (typeof targets.targets)[number];

const loopStartFor = (endpoint: number) => Math.max(0, endpoint - 3);
const loopEndFor = (endpoint: number) => endpoint + 2;

export default function ScienceTrimQueue() {
  const first = targets.targets[0];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState<T>(first);
  const [end, setEnd] = useState(first.proposed_end_sec);
  const [loopStart, setLoopStart] = useState(loopStartFor(first.proposed_end_sec));
  const [loopEnd, setLoopEnd] = useState(loopEndFor(first.proposed_end_sec));
  const [looping, setLooping] = useState(false);
  const [status, setStatus] = useState('');

  const choose = (target: T) => {
    const proposedEnd = target.proposed_end_sec;
    audioRef.current?.pause();
    setActive(target);
    setEnd(proposedEnd);
    setLoopStart(loopStartFor(proposedEnd));
    setLoopEnd(loopEndFor(proposedEnd));
    setLooping(false);
    setStatus('');
  };

  const playLoop = async () => {
    const audio = audioRef.current;
    if (!audio || loopEnd <= loopStart) {
      setStatus('Loop end must be later than loop start.');
      return;
    }

    audio.currentTime = loopStart;
    setLooping(true);
    setStatus('Looping the endpoint review window.');

    try {
      await audio.play();
    } catch {
      setLooping(false);
      setStatus('Playback could not start. Use the audio play control, then try the loop again.');
    }
  };

  const stopLoop = () => {
    setLooping(false);
    setStatus('Loop stopped. Audio remains available for scrubbing.');
  };

  const trim = async () => {
    setStatus('Saving private replacement request…');
    const response = await fetch('/api/admin/science-trim-queue/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        iiKey: active.work_item_ids[0],
        originalEnd: active.stored_end_sec,
        correctedEnd: end,
      }),
    });
    const body = await response.json();
    setStatus(
      response.ok
        ? `Queued private render revision ${body.revisionId}. Original remains unchanged.`
        : body.detail || body.error || 'Save failed',
    );
  };

  return (
    <main className="min-h-screen bg-[#090806] p-5 text-stone-100">
      <h1 className="text-2xl font-black text-amber-200">SCIENCE TRIM QUEUE · COMIN’ TRUE</h1>
      <p className="mt-2 text-stone-400">
        19 exact endpoint exceptions. Vocal LT-PIX only. TRIM creates a private replacement request; it does not release anything.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside>
          {targets.targets.map((target) => (
            <button
              type="button"
              onClick={() => choose(target)}
              key={target.work_item_ids[0]}
              aria-pressed={active.work_item_ids[0] === target.work_item_ids[0]}
              className={`mb-2 block w-full rounded border p-3 text-left ${
                active.work_item_ids[0] === target.work_item_ids[0]
                  ? 'border-amber-300 bg-amber-300/10'
                  : 'border-stone-700'
              }`}
            >
              <b>{target.titles[0]}</b>
              <br />
              <small>
                {target.stored_end_sec.toFixed(3)} → {target.proposed_end_sec.toFixed(3)}
              </small>
            </button>
          ))}
        </aside>

        <section className="rounded border border-amber-300/30 p-5">
          <h2 className="text-3xl font-black">{active.titles[0]}</h2>
          <p className="mt-2 text-sm text-stone-400">Linked items: {active.work_item_ids.join(', ')}</p>

          <audio
            ref={audioRef}
            controls
            preload="metadata"
            className="mt-5 w-full"
            src="/api/admin/science-trim-queue/audio"
            onTimeUpdate={(event) => {
              if (looping && event.currentTarget.currentTime >= loopEnd) {
                event.currentTarget.currentTime = loopStart;
                void event.currentTarget.play();
              }
            }}
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="font-black">
              LOOP START
              <input
                aria-label="Loop start"
                className="mt-1 block w-full rounded bg-black p-2 font-mono text-cyan-300"
                type="number"
                step="0.001"
                min="0"
                value={loopStart}
                onChange={(event) => setLoopStart(Number(event.target.value))}
              />
            </label>
            <label className="font-black">
              LOOP END
              <input
                aria-label="Loop end"
                className="mt-1 block w-full rounded bg-black p-2 font-mono text-cyan-300"
                type="number"
                step="0.001"
                min="0.001"
                value={loopEnd}
                onChange={(event) => setLoopEnd(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded bg-amber-300 px-4 py-2 font-black text-black"
              onClick={() => void playLoop()}
            >
              PLAY ENDPOINT LOOP
            </button>
            <button
              type="button"
              className="rounded border border-stone-500 px-4 py-2 font-black"
              onClick={stopLoop}
              disabled={!looping}
            >
              STOP LOOP
            </button>
          </div>

          <label className="mt-5 block font-black">
            END (last vocal note)
            <input
              aria-label="End last vocal note"
              className="ml-3 rounded bg-black p-2 font-mono text-emerald-300"
              type="number"
              step="0.001"
              min="0.001"
              value={end}
              onChange={(event) => setEnd(Number(event.target.value))}
            />
          </label>
          <p className="mt-3 text-sm text-stone-400">
            Stored: {active.stored_end_sec.toFixed(3)} · scientific proposal: {active.proposed_end_sec.toFixed(3)}
          </p>

          <button
            type="button"
            className="mt-5 rounded bg-cyan-400 px-5 py-3 font-black text-black"
            onClick={() => void trim()}
          >
            TRIM AND QUEUE PRIVATE RENDER
          </button>
          <p className="mt-3 text-sm text-amber-200" role="status">
            {status}
          </p>
        </section>
      </div>
    </main>
  );
}
