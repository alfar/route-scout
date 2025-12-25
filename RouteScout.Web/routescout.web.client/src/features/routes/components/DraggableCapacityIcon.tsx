import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TruckIcon } from '@heroicons/react/24/outline';

export type TrailerKind = 'small' | 'large' | 'boogie';

interface DraggableCapacityIconProps {
  kind: TrailerKind;
  label?: string;
}

// Draggable icon representing a trailer capacity. Emits ids like `capacity-small|large|boogie`.
const DraggableCapacityIcon: React.FC<DraggableCapacityIconProps> = ({ kind, label }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `drag/capacity/${kind}` });

  const text = label ?? kind.charAt(0).toUpperCase() + kind.slice(1);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="inline-flex items-center px-3 py-2 rounded border border-gray-600 text-gray-600 cursor-grab select-none touch-none"
    >
      <TruckIcon className="size-5 mr-1" />
      <span className="text-sm capitalize">{text}</span>
    </div>
  );
};

export default DraggableCapacityIcon;
