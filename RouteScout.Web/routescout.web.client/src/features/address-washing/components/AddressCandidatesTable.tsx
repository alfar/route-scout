import { AddressCandidate } from '../types/AddressCandidate';
import { AddressSelector } from './AddressSelector';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    candidates: AddressCandidate[] | undefined;
    onReject: (id: string) => Promise<void>;
    onConfirm: (id: string) => Promise<void>;
    onSelectAddress: (candidateId: string, addressId: string) => Promise<void>;
}

export function AddressCandidatesTable({ candidates, onReject, onConfirm, onSelectAddress }: Props) {
    const [selectingId, setSelectingId] = useState<string | null>(null);
    const { t } = useTranslation(['common']);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-600 rounded">
                <thead className="bg-blue-100">
                    <tr>
                        <th className="px-4 py-2 text-left">{t('rawAddress')}</th>
                        <th className="px-4 py-2 text-left">{t('selectedAddress')}</th>
                        <th className="px-4 py-2 text-left">{t('state')}</th>
                        <th className="px-4 py-2 text-left">{t('washed')}</th>
                        <th className="px-4 py-2 text-left">{t('actions')}</th>
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
                                            {t('selectAddress')}
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
                                            <button className="mt-1 text-xs text-gray-500 underline" onClick={() => setSelectingId(null)}>{t('cancel')}</button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-2">{t('addressState' + candidate.state)}</td>
                                <td className="px-4 py-2">{candidate.isWashed ? t('yes') : t('no')}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                                        onClick={() => onReject(candidate.id)}
                                        disabled={candidate.state === 'Rejected'}
                                    >
                                        {t('reject')}
                                    </button>
                                    {candidate.state === 'Selected' && (
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                            onClick={() => onConfirm(candidate.id)}
                                        >
                                            {t('confirm')}
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
