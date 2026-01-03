import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Payment } from "../types/Payment";
import { PaymentsTable } from '../components/PaymentsTable';
import { PaymentImporter } from '../components/PaymentImporter';
import { useTranslation } from 'react-i18next';

function PaymentsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [payments, setPayments] = useState<Payment[]>();
    const { t } = useTranslation(['common']);

    useEffect(() => {
        if (projectId) {
            populatePayments();
        }
    }, [projectId]);

    async function handleAction(id: string, action: 'confirm' | 'reject') {
        await fetch(`/api/projects/${projectId}/payments/${id}/${action}`, { method: 'POST' });
        await populatePayments();
    }

    return (
        <div className="flex flex-col gap-8 p-4 h-full overflow-hidden">
            <h1 className="text-2xl font-bold flex-shrink-0">{t('paymentsTitle')}</h1>
            <div className="flex-1 overflow-y-auto">
                <PaymentsTable payments={payments} onAction={handleAction} />
                <PaymentImporter onUploaded={populatePayments} />
            </div>
        </div>
    );

    async function populatePayments() {
        const response = await fetch(`/api/projects/${projectId}/payments`);
        const data = await response.json();
        setPayments(data);
    }
}

export default PaymentsPage;
