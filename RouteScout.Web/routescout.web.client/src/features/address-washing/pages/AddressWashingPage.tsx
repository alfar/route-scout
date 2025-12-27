import { useEffect, useState } from 'react';
import { AddressCandidate } from '../types/AddressCandidate';
import { AddressCandidatesTable } from '../components/AddressCandidatesTable';
import { useTranslation } from 'react-i18next';

function AddressWashingPage() {
    const [candidates, setCandidates] = useState<AddressCandidate[]>();
    const { t } = useTranslation(['common']);

    useEffect(() => {
        populateCandidates();
    }, []);

    async function handleReject(id: string) {
        await fetch(`/api/address-candidates/${id}/reject`, { method: 'POST' });
        await populateCandidates();
    }

    async function handleConfirm(id: string) {
        await fetch(`/api/address-candidates/${id}/confirm`, { method: 'POST' });
        await populateCandidates();
    }

    async function handleSelectAddress(candidateId: string, addressId: string) {
        await fetch(`/api/address-candidates/${candidateId}/select/${addressId}`, {
            method: 'POST'
        });
        await populateCandidates();
    };

    async function populateCandidates() {
        const response = await fetch('/api/address-candidates');
        const data = await response.json();
        setCandidates(data);
    }

    return (
        <div className="flex flex-col p-3 lg:p-4 overscroll-contain gap-2">
            <h1 className="text-2xl font-bold mb-3">{t('addressCandidatesTitle')}</h1>
            <AddressCandidatesTable candidates={candidates} onReject={handleReject} onConfirm={handleConfirm} onSelectAddress={handleSelectAddress} />
        </div>
    );
}

export default AddressWashingPage;
