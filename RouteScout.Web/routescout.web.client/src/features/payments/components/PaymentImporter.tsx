import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentImporterProps {
    onUploaded?: () => void;
}

export function PaymentImporter({ onUploaded }: PaymentImporterProps) {
    const { t } = useTranslation(['common']);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setError(t('pleaseSelectCsv'));
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/payments/import', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const message = await response.text();
                setError(message || t('uploadFailed'));
            } else {
                if (onUploaded) onUploaded();
            }
        } catch (err) {
            setError(t('networkError'));
        } finally {
            setUploading(false);
        }
    }

    return (
        <form
            onSubmit={handleUpload}
            className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded shadow mb-4"
        >
            <label className="flex flex-col md:flex-row items-center gap-2 font-medium text-gray-700">
                <span>{t('uploadCsv')}</span>
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-900 border border-gray-600 rounded cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </label>
            <button
                type="submit"
                disabled={uploading}
                className={`px-4 py-2 rounded text-white font-semibold transition-colors ${uploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {uploading ? t('uploading') : t('upload')}
            </button>
            {error && (
                <div className="w-full text-red-600 mt-2 text-sm">{error}</div>
            )}
        </form>
    );
}
