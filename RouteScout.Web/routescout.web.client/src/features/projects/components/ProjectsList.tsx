import { Link } from 'react-router-dom';
import { Project } from '../types/Project';
import { useTranslation } from 'react-i18next';

interface ProjectsListProps {
    projects?: Project[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
    const { t } = useTranslation(['common']);

    if (!projects) {
        return <p className="text-gray-500">{t('loading')}</p>;
    }

    if (projects.length === 0) {
        return <p className="text-gray-500">{t('noProjects')}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            {t('projectName')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            {t('createdAt')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <Link to={"/projects/" + project.id}>{project.name}</Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(project.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
