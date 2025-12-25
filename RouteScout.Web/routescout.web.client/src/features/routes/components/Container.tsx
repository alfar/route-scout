import React, { ReactNode } from "react";

interface ContainerProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Container component for wrapping route-related content.
 * Accepts optional className and style props for customization.
 */
const Container: React.FC<ContainerProps> = ({ children, className = "", style }) => {
    return (
        <div className={`border border-gray-600 rounded p-3 ${className}`} style={style}>
            {children}
        </div>
    );
};

export default Container;