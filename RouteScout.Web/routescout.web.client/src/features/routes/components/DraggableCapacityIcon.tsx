import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TruckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import CapacityIcon from './CapacityIcon';

export type TrailerKind = 'small' | 'large' | 'boogie';

interface DraggableCapacityIconProps {
    kind: TrailerKind;
    label?: string;
}

// Draggable icon representing a trailer capacity. Emits ids like `capacity-small|large|boogie`.
const DraggableCapacityIcon: React.FC<DraggableCapacityIconProps> = ({ kind, label }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: `drag/capacity/${kind}` });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="px-3 py-2 rounded border border-gray-600 text-gray-600 cursor-grab select-none touch-none"
        >
            <CapacityIcon kind={kind} />
        </div>
    );
};

export default DraggableCapacityIcon;
