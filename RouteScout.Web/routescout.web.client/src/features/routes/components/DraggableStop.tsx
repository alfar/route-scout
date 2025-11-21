import { useDraggable } from '@dnd-kit/core';
import React from 'react';

export interface DraggableStopProps {
    id: string;
    name: string;
    index: number;
    onDragStart?: (id: string, index: number) => void;
    onDrop?: (id: string, index: number) => void;
}

export const DraggableStop: React.FC<DraggableStopProps> = ({
    id,
    name,
    index,
    onDragStart,
    onDrop
}) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', id);
        if (onDragStart) {
            onDragStart(id, index);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedId = e.dataTransfer.getData('text/plain');
        if (onDrop) {
            onDrop(droppedId, index);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const { attributes, listeners, setNodeRef, active } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                opacity: active ? 0.5 : 1,
                cursor: 'grab',
                padding: '8px',
                border: '1px solid #ccc',
                marginBottom: '4px',
                background: '#fff',
                borderRadius: '4px',
            }}
        >
            {name}
        </div>
    );
};

export default DraggableStop;