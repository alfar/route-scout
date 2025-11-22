import { useState } from 'react';
import { TeamSummary } from '../types/TeamSummary';
import QRCode from 'react-qr-code';

interface Props {
  team: TeamSummary;
  teamId: string;
  onUpdated: () => Promise<void>;
}

export function TeamInfoPage({ team, teamId, onUpdated }: Props) {
  const [name, setName] = useState(team.name);
  const [leaderName, setLeaderName] = useState(team.leaderName);
  const [leaderPhone, setLeaderPhone] = useState(team.leaderPhone);
  const [trailerSize, setTrailerSize] = useState(team.trailerSize);
  const [saving, setSaving] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [members, setMembers] = useState<string[]>(team.members);
  const trailerSizes = ["Small", "Large", "Boogie"];
  const qrUrl = `${window.location.origin}/team/${teamId}`;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${teamId}?teamName=${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trailerSize, leaderName, leaderPhone })
      });
      if (res.ok) {
        await onUpdated();
      }
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    const member = memberToAdd.trim();
    if (!member) return;
    const res = await fetch(`/api/teams/${teamId}/members?member=${encodeURIComponent(member)}`, { method: 'POST' });
    if (res.ok) {
      setMembers(m => [...m, member]);
      setMemberToAdd('');
      await onUpdated();
    }
  }

  async function removeMember(member: string) {
    const res = await fetch(`/api/teams/${teamId}/members/${encodeURIComponent(member)}`, { method: 'DELETE' });
    if (res.ok) {
      setMembers(m => m.filter(x => x !== member));
      await onUpdated();
    }
  }

  return (
    <div className="border rounded p-4 shadow-sm bg-white flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-xs text-gray-600 uppercase">Name</span>
          <input value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-gray-600 uppercase">Trailer Size</span>
          <select value={trailerSize} onChange={e => setTrailerSize(e.target.value)} className="border p-2 rounded">
            {trailerSizes.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-gray-600 uppercase">Leader Name</span>
          <input value={leaderName} onChange={e => setLeaderName(e.target.value)} className="border p-2 rounded" />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-gray-600 uppercase">Leader Phone</span>
          <input value={leaderPhone} onChange={e => setLeaderPhone(e.target.value)} className="border p-2 rounded" />
        </label>
      </div>
      <div className="flex gap-2">
        <button disabled={saving} onClick={save} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Members</h3>
        <ul className="list-disc ml-6 mb-3">
          {members.map(m => (
            <li key={m} className="flex items-center gap-2">
              <span>{m}</span>
              <button onClick={() => removeMember(m)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Remove</button>
            </li>
          ))}
          {members.length === 0 && <li className="text-xs text-gray-500">No members yet.</li>}
        </ul>
        <div className="flex gap-2">
          <input value={memberToAdd} onChange={e => setMemberToAdd(e.target.value)} placeholder="New member" className="border p-2 rounded flex-1" />
          <button onClick={addMember} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className="text-xs text-gray-600">Share this QR to open team routes page</span>
        <QRCode value={qrUrl} size={128} />
        <a href={qrUrl} target="_blank" rel="noopener" className="text-blue-600 text-xs underline">Open Routes Page</a>
      </div>
    </div>
  );
}
