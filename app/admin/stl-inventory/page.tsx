'use client';

import { useState } from 'react';

export default function StlInventory() {
  const [status, setStatus] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Importing split inventory and setting aside known issue rows…');
    const response = await fetch('/api/admin/stl-inventory/import', { method: 'POST', body: new FormData(event.currentTarget) });
    setStatus(JSON.stringify(await response.json(), null, 2));
  }
  return (
    <main className="min-h-screen bg-black p-8 text-stone-100">
      <h1 className="text-2xl font-black">GPMx INVENTORY INTAKE</h1>
      <p className="mt-2 max-w-3xl text-stone-400">
        Upload the dated FullMix and INSTRO-ONLY CSVs together. Only verified <strong>FullMix LT-PIX</strong> may enter KKr and KUT production. INSTRO-ONLY stays separate inventory and never feeds KUTs. Missing WAV URLs do not stop inventory intake. Known issue rows remain in private staging. No KUT, stage item, or public release is created.
      </p>
      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-5">
        <label className="block">
          <span className="mb-2 block font-bold">Snapshot date</span>
          <input name="snapshotDate" type="date" required className="rounded bg-stone-900 p-2" />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold">FullMix CSV</span>
          <input name="fullmix" type="file" accept=".csv,text/csv" required />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold">INSTRO-ONLY CSV</span>
          <input name="instro" type="file" accept=".csv,text/csv" required />
        </label>
        <button className="block rounded bg-amber-300 px-4 py-2 font-bold text-black">Import inventory</button>
      </form>
      <pre className="mt-6 whitespace-pre-wrap text-sm">{status}</pre>
    </main>
  );
}
