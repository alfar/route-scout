import { useEffect, useState } from 'react';
import { Project } from '../types/Project';
import { ProjectsList } from '../components/ProjectsList';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>();
    const { t } = useTranslation(['common']);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    return (
        <div className="app">
            <nav className="bg-blue-600 p-4 flex gap-4 flex-wrap">
                <Link className="text-white font-semibold hover:underline" to="/">{t('home')}</Link>
                <Link className="text-white font-semibold hover:underline" to="/about">{t('about')}</Link>
            </nav>
            <div className="flex flex-col gap-3 p-3">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{t('projectsTitle')}</h1>
                    <p className="text-gray-600">{t('projectsDescription')}</p>
                </div>

                <CreateProjectForm onProjectCreated={loadProjects} />

                <div>
                    <h2 className="text-xl font-semibold mb-4">{t('allProjects')}</h2>
                    <ProjectsList projects={projects} />
                </div>
            </div>
        </div>
    );
}

export default ProjectsPage;
