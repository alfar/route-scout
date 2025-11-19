import React, { useState } from 'react';

interface Props {
    onCreated: () => void;
}

const CreateRouteForm: React.FC<Props> = ({ onCreated }) => {
    const [name, setName] = useState('');
    const [dropOffPoint, setDropOffPoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, dropOffPoint }),
            });
            if (!res.ok) throw new Error('Failed to create route');
            setName('');
            setDropOffPoint('');
            onCreated();
        } catch (e) {
            setError('Could not create route');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2 items-end">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    className="border rounded px-2 py-1"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Drop-off Point</label>
                <input
                    className="border rounded px-2 py-1"
                    value={dropOffPoint}
                    onChange={e => setDropOffPoint(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
            >
                Create Route
            </button>
            {error && <span className="text-red-600 ml-2">{error}</span>}
        </form>
    );
};

export default CreateRouteForm;
