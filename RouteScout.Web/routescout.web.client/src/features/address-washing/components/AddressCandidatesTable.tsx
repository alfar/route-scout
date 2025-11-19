import { AddressCandidate, WashedAddress } from '../types/AddressCandidate';
import { AddressSelector, AddressOption } from './AddressSelector';
import { useState } from 'react';

interface Props {
    candidates: AddressCandidate[] | undefined;
    onReject: (id: string) => Promise<void>;
    onConfirm: (id: string) => Promise<void>;
    onSelectAddress: (candidateId: string, addressId: string) => Promise<void>;
}

export function AddressCandidatesTable({ candidates, onReject, onConfirm, onSelectAddress }: Props) {
    const [selectingId, setSelectingId] = useState<string | null>(null);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                <thead className="bg-blue-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Raw Address</th>
                        <th className="px-4 py-2 text-left">Selected Address</th>
                        <th className="px-4 py-2 text-left">State</th>
                        <th className="px-4 py-2 text-left">Washed</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates?.map(candidate => {
                        const washedAddresses = candidate.lastWashResult?.resultater || [];
                        const selected = washedAddresses.find(a => a.id === candidate.selectedWashedAddressId);
                        return (
                            <tr key={candidate.id} className="border-t">
                                <td className="px-4 py-2">{candidate.rawText}</td>
                                <td className="px-4 py-2">
                                    {selected ? (
                                        <span
                                            className="underline text-blue-700 cursor-pointer"
                                            onClick={() => setSelectingId(candidate.id)}
                                        >
                                            {selected.street} {selected.number}, {selected.zipCode} {selected.city}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic cursor-pointer" onClick={() => setSelectingId(candidate.id)}>
                                            Select address
                                        </span>
                                    )}
                                    {selectingId === candidate.id && (
                                        <div className="mt-2">
                                            <AddressSelector
                                                addresses={washedAddresses.map(a => ({
                                                    id: a.id,
                                                    label: `${a.street} ${a.number}, ${a.zipCode} ${a.city}`
                                                }))}
                                                selectedAddressId={candidate.selectedWashedAddressId || null}
                                                onSelect={async (addressId) => {
                                                    await onSelectAddress(candidate.id, addressId);
                                                    setSelectingId(null);
                                                }}
                                            />
                                            <button className="mt-1 text-xs text-gray-500 underline" onClick={() => setSelectingId(null)}>Cancel</button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-2">{candidate.state}</td>
                                <td className="px-4 py-2">{candidate.isWashed ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                                        onClick={() => onReject(candidate.id)}
                                        disabled={candidate.state === 'Rejected'}
                                    >
                                        Reject
                                    </button>
                                    {candidate.state === 'Selected' && (
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                            onClick={() => onConfirm(candidate.id)}
                                        >
                                            Confirm
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
