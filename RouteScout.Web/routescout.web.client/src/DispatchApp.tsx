import { Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import './App.css';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import AddressWashingPage from './features/address-washing/pages/AddressWashingPage';
import RouteManagementPage from './features/routes/pages/RouteManagementPage';
import StreetCatalogImportPage from './features/street-catalog/pages/StreetCatalogImportPage';
import SseProvider from './features/stream/components/SseProvider';
import UserMenu from './components/UserMenu';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';

export function DispatchApp() {
    const { projectId } = useParams<{ projectId: string }>();
    const { t } = useTranslation(['common']);

    // If no projectId in URL, try to get it from localStorage
    useEffect(() => {
        if (projectId) {
            localStorage.setItem('selectedProjectId', projectId);
        }
    }, [projectId]);

    // If no projectId and none in localStorage, redirect to projects page
    if (!projectId) {
        const savedProjectId = localStorage.getItem('selectedProjectId');
        if (savedProjectId) {
            return <Navigate to={`/projects/${savedProjectId}`} replace />;
        }
        return <Navigate to="/projects" replace />;
    }

    const baseUrl = `/projects/${projectId}`;

    return (
        <AuthProvider>
            <div className="App">
                <nav className="bg-blue-600 p-4 flex gap-4 flex-wrap items-center justify-between">
                    <div className="flex gap-4 flex-wrap">
                        <Link className="text-white font-semibold hover:underline" to="/">{t('home')}</Link>
                        <Link className="text-white font-semibold hover:underline" to={`${baseUrl}/payments`}>{t('payments')}</Link>
                        <Link className="text-white font-semibold hover:underline" to={`${baseUrl}/address-washing`}>{t('addressWashing')}</Link>
                        <Link className="text-white font-semibold hover:underline" to={`${baseUrl}/routes`}>{t('routeManagement')}</Link>
                        <Link className="text-white font-semibold hover:underline" to={`${baseUrl}/street-catalog/import`}>{t('streetCatalogImport')}</Link>
                    </div>
                    <UserMenu />
                </nav>
                <SseProvider>
                    <main className="p-8 flex flex-col gap-6">
                        <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/payments" element={<PaymentsPage />} />
                            <Route path="/address-washing" element={<AddressWashingPage />} />
                            <Route path="/routes" element={<RouteManagementPage />} />
                            <Route path="/street-catalog/import" element={<StreetCatalogImportPage />} />
                        </Routes>
                    </main>
                </SseProvider>
            </div>
        </AuthProvider>
    );
}
