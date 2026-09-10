'use client';

import { useState } from 'react';

export default function StlInventory() {
  const [status, setStatus] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Validating WAV URLs and resolving exact duplicate Track IDs…');
    const response = await fetch('/api/admin/stl-inventory/import', { method: 'POST', body: new FormData(event.currentTarget) });
    setStatus(JSON.stringify(await response.json(), null, 2));
  }
  return (
    <main className="min-h-screen bg-black p-8 text-stone-100">
      <h1 className="text-2xl font-black">GPMx INVENTORY INTAKE</h1>
      <p className="mt-2 max-w-3xl text-stone-400">
        Upload the dated FullMix and INSTRO-ONLY CSVs together. Every source row must include a non-empty <strong>WAV URL</strong>. Only redundant occurrences of an identical Track ID are preserved in private DUP staging and excluded from active inventory. No KUT, stage item, or public release is created.
      </p>
      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-5">
        <label className="block">
          <span className="mb-2 block font-bold">Snapshot date</span>
          <input name="snapshotDate" type="date" required className="rounded bg-stone-900 p-2" />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold">FullMix CSV with WAV URL column</span>
          <input name="fullmix" type="file" accept=".csv,text/csv" required />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold">INSTRO-ONLY CSV with WAV URL column</span>
          <input name="instro" type="file" accept=".csv,text/csv" required />
        </label>
        <button className="block rounded bg-amber-300 px-4 py-2 font-bold text-black">Validate and import</button>
      </form>
      <pre className="mt-6 whitespace-pre-wrap text-sm">{status}</pre>
    </main>
  );
}
