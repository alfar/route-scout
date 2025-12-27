import { useTranslation } from 'react-i18next';

function AboutPage() {
    const { t } = useTranslation(['common']);
    return <div>{t('aboutMadeBy')}</div>
}

export default AboutPage;