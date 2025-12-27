import { useTranslation } from 'react-i18next';

function DashboardPage() {
    const { t } = useTranslation(['common']);
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('dashboardTitle')}</h1>
            <p>{t('dashboardWelcome')}</p>
        </div>
    );
}

export default DashboardPage;
