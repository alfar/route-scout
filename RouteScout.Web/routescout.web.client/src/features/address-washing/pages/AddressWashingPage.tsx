import { useEffect, useState } from 'react';
import { AddressCandidate } from '../types/AddressCandidate';
import { AddressCandidatesTable } from '../components/AddressCandidatesTable';

function AddressWashingPage() {
    const [candidates, setCandidates] = useState<AddressCandidate[]>();

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
        // Refresh the candidates list after selection
        // (Assuming you have a fetchCandidates function)
        await populateCandidates();
    };

    async function populateCandidates() {
        const response = await fetch('/api/address-candidates');
        const data = await response.json();
        setCandidates(data);
    }

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-2xl font-bold text-blue-700">Address Candidates</h1>
            <AddressCandidatesTable candidates={candidates} onReject={handleReject} onConfirm={handleConfirm} onSelectAddress={handleSelectAddress} />
        </div>
    );
}

export default AddressWashingPage;
