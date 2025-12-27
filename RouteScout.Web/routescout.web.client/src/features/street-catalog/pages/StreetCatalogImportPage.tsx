import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const StreetCatalogImportPage = () => {
    const { t } = useTranslation(['common']);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) {
            setStatus('Please choose a CSV file');
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/catalog/import', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) {
                const text = await res.text();
                setStatus(`Import failed: ${text}`);
            } else {
                const data = await res.json();
                setStatus(`Successfully imported ${data.imported} rows.`);
            }
        } catch (err) {
            setStatus('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col p-3 lg:p-4 overscroll-contain gap-2">
            <h1 className="text-2xl font-bold">{t('streetCatalogImport')}</h1>
            <p className="text-sm text-gray-600">{t('streetCatalogImportDesc')}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 border rounded p-4 bg-white shadow-sm">
                <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm"
                />
                <button
                    type="submit"
                    disabled={loading || !file}
                    className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
                >{loading ? t('importingProgress') : t('importButton')}</button>
                {status && <div className="text-sm">{status}</div>}
            </form>
        </div>
    );
};

export default StreetCatalogImportPage;
