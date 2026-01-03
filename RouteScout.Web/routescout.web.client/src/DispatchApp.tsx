import { Routes, Route, Link, useParams, Navigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();

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

    // Helper function to determine if a link is active
    const isActive = (path: string) => {
        if (path === '/') {
            // For home, only match exact path
            return location.pathname === baseUrl || location.pathname === `${baseUrl}/`;
        }
        return location.pathname.startsWith(`${baseUrl}${path}`);
    };

    // Link styling
    const getLinkClassName = (path: string) => {
        const baseClasses = "text-white font-semibold transition-colors px-2 py-1 rounded";
        const activeClasses = "bg-blue-700 underline";
        const inactiveClasses = "hover:bg-blue-500";
        
        return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
    };

    return (
        <AuthProvider>
            <div className="App flex flex-col h-screen overflow-hidden">
                {/* Fixed navbar */}
                <nav className="bg-blue-600 p-4 flex gap-4 flex-wrap items-center justify-between flex-shrink-0">
                    <div className="flex gap-4 flex-wrap">
                        <Link className={getLinkClassName('/')} to="/">{t('home')}</Link>
                        <Link className={getLinkClassName('/payments')} to={`${baseUrl}/payments`}>{t('payments')}</Link>
                        <Link className={getLinkClassName('/address-washing')} to={`${baseUrl}/address-washing`}>{t('addressWashing')}</Link>
                        <Link className={getLinkClassName('/routes')} to={`${baseUrl}/routes`}>{t('routeManagement')}</Link>
                        <Link className={getLinkClassName('/street-catalog/import')} to={`${baseUrl}/street-catalog/import`}>{t('streetCatalogImport')}</Link>
                    </div>
                    <UserMenu />
                </nav>
                <SseProvider>
                    {/* Flexible main content area */}
                    <main className="flex-1 min-h-0 overflow-hidden">
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
