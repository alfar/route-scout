import { useEffect, useState } from 'react';
import { Payment } from "../types/Payment";
import { PaymentsTable } from '../components/PaymentsTable';
import { PaymentImporter } from '../components/PaymentImporter';

function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>();

    useEffect(() => {
        populatePayments();
    }, []);

    async function handleAction(id: string, action: 'confirm' | 'reject') {
        await fetch(`/api/payments/${id}/${action}`, { method: 'POST' });
        await populatePayments();
    }

    return (
        <div className="flex flex-col gap-8">
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
