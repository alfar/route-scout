import { useState } from 'react';

interface Props {
  onCreated: () => Promise<void>;
}

const trailerSizes = ["Small", "Large", "Boogie"];

export function CreateTeamForm({ onCreated }: Props) {
  const [trailerSize, setTrailerSize] = useState(trailerSizes[0]);
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trailerSize, leaderName, leaderPhone })
      });
      if (res.ok) {
        setLeaderName('');
        setLeaderPhone('');
        await onCreated();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Create Team</h2>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Trailer Size</span>
          <select value={trailerSize} onChange={e => setTrailerSize(e.target.value)} className="border p-2 rounded">
            {trailerSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Leader Name</span>
          <input value={leaderName} onChange={e => setLeaderName(e.target.value)} className="border p-2 rounded" />
        </label>
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Leader Phone</span>
          <input value={leaderPhone} onChange={e => setLeaderPhone(e.target.value)} className="border p-2 rounded" />
        </label>
        <button disabled={saving} onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
      </div>
    </div>
  );
}
