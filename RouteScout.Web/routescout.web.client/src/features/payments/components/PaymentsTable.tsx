import { useTranslation } from 'react-i18next';
import { Payment } from "../types/Payment";
interface PaymentsTableProps {
    payments: Payment[] | undefined;
    onAction: (id: string, action: 'confirm' | 'reject') => void;
}

export function PaymentsTable({ payments, onAction }: PaymentsTableProps) {
    const { t } = useTranslation(['common']);
    if (payments === undefined) {
        return (
            <p className="text-gray-500 italic">
                {t('loading')}
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded border border-gray-600">
                <thead>
                    <tr className="bg-blue-50 sticky top-0 z-10">
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">{t('paymentsDateTime')}</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">{t('paymentsMessage')}</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">{t('paymentsAmount')}</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} className="border-t border-gray-600 even:bg-gray-50 hover:bg-blue-100 transition">
                            <td className="px-6 py-4 text-sm text-gray-800">{new Date(payment.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{payment.message}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{payment.amount}</td>
                            <td className="px-6 py-4 flex gap-2">
                                <button
                                    disabled={payment.confirmed || payment.rejected}
                                    onClick={() => onAction(payment.id, 'confirm')}
                                    className={`px-3 py-1 rounded text-white text-xs font-semibold transition-colors
                ${payment.confirmed || payment.rejected
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400'
                                        }`}
                                >
                                    ✅ {t('confirm')}
                                </button>
                                <button
                                    disabled={payment.confirmed || payment.rejected}
                                    onClick={() => onAction(payment.id, 'reject')}
                                    className={`px-3 py-1 rounded text-white text-xs font-semibold transition-colors
                ${payment.confirmed || payment.rejected
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400'
                                        }`}
                                >
                                    ❌ {t('reject')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
