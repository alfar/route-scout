import React from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export interface ExpandCounterProps {
    expanded: boolean;
    onToggle: () => void;
    completed: number;
    total: number;
    extra?: number;
}

const ExpandCounter: React.FC<ExpandCounterProps> = ({ expanded, onToggle, completed, total, extra }) => {
    const { t } = useTranslation(['routes']);
    return (
        <button
            className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            aria-expanded={expanded}
            aria-label={expanded ? t('collapseDetails') : t('expandDetails')}
            style={{ minHeight: 44 }}
        >
            {expanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
            <span className="font-medium">{completed}/{total}{extra ? <span className="text-red-600 ml-1">+{extra}</span> : null}</span>
        </button>
    );
};

export default ExpandCounter;
