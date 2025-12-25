import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableContainerProps {
    id: string;
    className?: string;
    children?: React.ReactNode;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({
    id,
    className,
    children,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`border border-gray-600 rounded p-3 ${className ?? ""} ${isOver ? "droppable-over" : ""}`}
        >
            {children}
        </div>
    );
};

export default DroppableContainer;