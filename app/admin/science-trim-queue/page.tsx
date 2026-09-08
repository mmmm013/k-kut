'use client';

import { useRef, useState } from 'react';

import recoveryQueue from '@/data/kkr-correction-queues/comin-true-owner-trim-targets-v1.json';

type RecoveryTarget = {
  work_item_ids: string[];
  consumer_ii_keys: string[];
  titles: string[];
  stored_end_sec: number;
  machine_proposed_end_sec: number;
  owner_end_sec: number | null;
  machine_evidence_state: 'QUARANTINED_NOT_ENDPOINT_AUTHORITY';
  authority_state: 'OWNER_CONFIRMED_LAST_VOCAL_NOTE_END' | 'OWNER_DECISION_RECOVERY_REQUIRED';
  action_state: 'PRIVATE_REVISION_QUEUED' | 'NO_ACTION_AUTHORIZED';
};

const targets = recoveryQueue.targets as RecoveryTarget[];

function reviewCenter(target: RecoveryTarget) {
  return target.owner_end_sec ?? target.stored_end_sec;
}

function loopStartFor(target: RecoveryTarget) {
  return Math.max(0, reviewCenter(target) - 3);
}

function loopEndFor(target: RecoveryTarget) {
  return reviewCenter(target) + 2;
}

export default function ScienceTrimQueue() {
  const first = targets[0];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState(first);
  const [loopStart, setLoopStart] = useState(loopStartFor(first));
  const [loopEnd, setLoopEnd] = useState(loopEndFor(first));
  const [looping, setLooping] = useState(false);
  const [status, setStatus] = useState('');

  const choose = (target: RecoveryTarget) => {
    audioRef.current?.pause();
    setActive(target);
    setLoopStart(loopStartFor(target));
    setLoopEnd(loopEndFor(target));
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
    setStatus('Looping the endpoint evidence window.');

    try {
      await audio.play();
    } catch {
      setLooping(false);
      setStatus('Playback could not start. Use the audio play control, then try again.');
    }
  };

  const stopLoop = () => {
    setLooping(false);
    audioRef.current?.pause();
    setStatus('Loop stopped. Audio remains available for scrubbing.');
  };

  const recovered = active.authority_state === 'OWNER_CONFIRMED_LAST_VOCAL_NOTE_END';

  return (
    <main className="min-h-screen bg-[#090806] p-5 text-stone-100">
      <h1 className="text-2xl font-black text-amber-200">
        OWNER BOUNDARY RECOVERY · COMIN’ TRUE
      </h1>
      <p className="mt-2 max-w-4xl text-stone-300">
        The 19 machine exception timestamps are quarantined. They are evidence only and cannot
        initialize, save, trim, render, approve, stage, or release a product.
      </p>
      <p className="mt-2 font-bold text-emerald-300">
        Recovered: {recoveryQueue.recovered_endpoint_count} · Still quarantined:{' '}
        {recoveryQueue.unrecovered_endpoint_count}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside aria-label="Boundary recovery items">
          {targets.map((target) => {
            const isActive = active.work_item_ids[0] === target.work_item_ids[0];
            const isRecovered =
              target.authority_state === 'OWNER_CONFIRMED_LAST_VOCAL_NOTE_END';

            return (
              <button
                type="button"
                onClick={() => choose(target)}
                key={target.work_item_ids[0]}
                aria-pressed={isActive}
                className={`mb-2 block w-full rounded border p-3 text-left ${
                  isActive ? 'border-amber-300 bg-amber-300/10' : 'border-stone-700'
                }`}
              >
                <b>{target.titles[0]}</b>
                <br />
                <small className={isRecovered ? 'text-emerald-300' : 'text-stone-400'}>
                  {isRecovered
                    ? `OWNER END: ${target.owner_end_sec?.toFixed(3)} · REVISION QUEUED`
                    : 'QUARANTINED · NO ENDPOINT AUTHORIZED'}
                </small>
              </button>
            );
          })}
        </aside>

        <section className="rounded border border-amber-300/30 p-5">
          <h2 className="text-3xl font-black">{active.titles[0]}</h2>
          <p className="mt-2 text-sm text-stone-400">
            Products: {active.consumer_ii_keys.join(', ')}
          </p>

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
              PLAY EVIDENCE LOOP
            </button>
            <button
              type="button"
              className="rounded border border-stone-500 px-4 py-2 font-black disabled:opacity-40"
              onClick={stopLoop}
              disabled={!looping}
            >
              STOP LOOP
            </button>
          </div>

          <div className="mt-5 rounded border border-stone-700 bg-black p-4">
            <p className="font-black">OWNER END (last audible vocal-note end)</p>
            <p className={`mt-2 font-mono text-2xl ${recovered ? 'text-emerald-300' : 'text-stone-500'}`}>
              {active.owner_end_sec === null ? 'NOT RECOVERED' : active.owner_end_sec.toFixed(3)}
            </p>
            <p className="mt-3 text-sm text-stone-400">
              Prior stored capture: {active.stored_end_sec.toFixed(3)}
            </p>
            <details className="mt-3 text-sm text-stone-500">
              <summary>Rejected machine evidence</summary>
              <p className="mt-2">
                {active.machine_proposed_end_sec.toFixed(3)} · not endpoint authority · no action
                permitted
              </p>
            </details>
          </div>

          <p
            className={`mt-5 rounded border p-4 font-bold ${
              recovered
                ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
                : 'border-red-400/50 bg-red-400/10 text-red-200'
            }`}
          >
            {recovered
              ? '36.250 is durably recorded as Gregory’s owner-confirmed endpoint. Private revisions are queued for both linked products; originals remain unchanged.'
              : 'No owner endpoint is available in the durable SSOT. This row remains quarantined and cannot create a revision.'}
          </p>

          <p className="mt-3 text-sm text-amber-200" role="status">
            {status}
          </p>
        </section>
      </div>
    </main>
  );
}
