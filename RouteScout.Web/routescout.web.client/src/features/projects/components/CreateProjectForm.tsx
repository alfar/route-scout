import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateProjectFormProps {
    onProjectCreated: () => void;
}

export function CreateProjectForm({ onProjectCreated }: CreateProjectFormProps) {
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { t } = useTranslation(['common']);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!projectName.trim()) {
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: projectName.trim(),
                    ownerIds: null,
                }),
            });

            if (response.ok) {
                setProjectName('');
                onProjectCreated();
            } else {
                alert(t('createProjectFailed'));
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert(t('networkError'));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{t('createNewProject')}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('projectName')}
                    </label>
                    <input
                        type="text"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder={t('enterProjectName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isCreating}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isCreating || !projectName.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                    {isCreating ? t('creating') : t('createProject')}
                </button>
            </form>
        </div>
    );
}
