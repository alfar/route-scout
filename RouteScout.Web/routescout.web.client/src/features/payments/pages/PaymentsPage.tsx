import { useEffect, useState } from 'react';
import { Payment } from "../types/Payment";
import { PaymentsTable } from '../components/PaymentsTable';
import { PaymentImporter } from '../components/PaymentImporter';
import { useTranslation } from 'react-i18next';

function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>();
    const { t } = useTranslation(['common']);

    useEffect(() => {
        populatePayments();
    }, []);

    async function handleAction(id: string, action: 'confirm' | 'reject') {
        await fetch(`/api/payments/${id}/${action}`, { method: 'POST' });
        await populatePayments();
    }

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-2xl font-bold">{t('paymentsTitle')}</h1>
            <PaymentsTable payments={payments} onAction={handleAction} />
            <PaymentImporter onUploaded={populatePayments} />
        </div>
    );

    async function populatePayments() {
        const response = await fetch('/api/payments');
        const data = await response.json();
        setPayments(data);
    }
}

export default PaymentsPage;
