import { useState } from 'react';
import { TeamSummary } from '../types/TeamSummary';

interface Props {
  team: TeamSummary;
  onChanged: () => Promise<void>;
  trailerSizes: string[];
}

export function TeamCard({ team, onChanged, trailerSizes }: Props) {
  const [editing, setEditing] = useState(false);
  const [trailerSize, setTrailerSize] = useState(team.trailerSize);
  const [leaderName, setLeaderName] = useState(team.leaderName);
  const [leaderPhone, setLeaderPhone] = useState(team.leaderPhone);
  const [name, setName] = useState(team.name);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${team.id}?teamName=${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trailerSize, leaderName, leaderPhone })
      });
      if (res.ok) {
        setEditing(false);
        await onChanged();
      }
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    if (!memberToAdd.trim()) return;
    const res = await fetch(`/api/teams/${team.id}/members?member=${encodeURIComponent(memberToAdd)}`, { method: 'POST' });
    if (res.ok) {
      setMemberToAdd('');
      await onChanged();
    }
  }

  async function removeMember(member: string) {
    const res = await fetch(`/api/teams/${team.id}/members/${encodeURIComponent(member)}`, { method: 'DELETE' });
    if (res.ok) {
      await onChanged();
    }
  }

  return (
    <div className="border rounded p-4 shadow-sm">
      {editing ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-end flex-wrap">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Name</span>
              <input value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" />
            </label>
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
            <button disabled={saving} onClick={saveEdit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            <button disabled={saving} onClick={() => setEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50">Cancel</button>
          </div>
          <div className="mt-2">
            <h3 className="font-semibold mb-1">Members</h3>
            <ul className="list-disc ml-6">
              {team.members.map(m => (
                <li key={m} className="flex items-center gap-2">
                  <span>{m}</span>
                  <button onClick={() => removeMember(m)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Remove</button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <input value={memberToAdd} onChange={e => setMemberToAdd(e.target.value)} placeholder="New member" className="border p-2 rounded flex-1" />
              <button onClick={addMember} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="font-semibold">{team.name}</div>
            <div className="text-sm text-gray-600">{team.trailerSize} Trailer</div>
            <div>Leader: {team.leaderName} ({team.leaderPhone})</div>
            <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Edit</button>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Members</h3>
            <div className="flex flex-wrap gap-2">
              {team.members.map(m => (
                <span key={m} className="bg-gray-200 px-2 py-1 rounded text-sm">{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
