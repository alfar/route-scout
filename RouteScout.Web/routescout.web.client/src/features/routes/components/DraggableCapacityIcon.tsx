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
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `capacity/${kind}` });

  const text = label ?? kind.charAt(0).toUpperCase() + kind.slice(1);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border bg-white cursor-grab select-none"
    >
      <TruckIcon className="w-5 h-5" />
      <span className="text-sm capitalize">{text}</span>
    </div>
  );
};

export default DraggableCapacityIcon;
