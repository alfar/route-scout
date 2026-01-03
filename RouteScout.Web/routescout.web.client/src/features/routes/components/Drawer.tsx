import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DrawerProps {
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    itemCount: number;
    side?: 'left' | 'right';
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onToggle, children, itemCount, side = 'left' }) => {
    const hasItems = itemCount > 0;

    if (side === 'right') {
        // Right side drawer - handle on left, content slides right
        return (
            <>
                {/* Drawer Handle - on the left of content */}
                <div className="flex-shrink-0 h-full flex items-start pt-16">
                    <button
                        onClick={onToggle}
                        className={`
                            h-32 w-10 flex items-center justify-center
                            ${hasItems && !isOpen
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                            }
                            rounded-l-lg
                        `}
                        aria-label={isOpen ? 'Close drawer' : 'Open drawer'}
                    >
                        <div className="flex flex-col items-center gap-2 py-2">
                            {isOpen ? (
                                <ChevronRightIcon className="w-5 h-5" />
                            ) : (
                                <>
                                    <ChevronLeftIcon className="w-5 h-5" />
                                    {hasItems && (
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-bold">{itemCount}</span>
                                            <span className="text-[10px] leading-tight text-center px-1">
                                                {itemCount === 1 ? 'route' : 'routes'}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </button>
                </div>

                {/* Drawer Content - slides from right */}
                <div
                    className={`h-full overflow-hidden ${
                        isOpen ? 'w-full' : 'w-0'
                    }`}
                >
                    <div className={`p-4 h-full ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 delay-0`}>
                        {children}
                    </div>
                </div>
            </>
        );
    }

    // Left side drawer - handle on right, content slides left
    return (
        <>
            {/* Drawer Content - slides from left */}
            <div
                className={`h-full overflow-hidden ${
                    isOpen ? 'w-full translate-x-0' : 'w-0 -translate-x-full'
                }`}
            >
                <div className={`p-4 h-full ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 delay-0`}>
                    {children}
                </div>
            </div>

            {/* Drawer Handle - on the right of content */}
            <div className="flex-shrink-0 h-full flex items-start pt-16">
                <button
                    onClick={onToggle}
                    className={`
                        h-32 w-10 flex items-center justify-center                        
                        ${hasItems && !isOpen
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        }
                        rounded-r-lg
                    `}
                    aria-label={isOpen ? 'Close drawer' : 'Open drawer'}
                >
                    <div className="flex flex-col items-center gap-2 py-2">
                        {isOpen ? (
                            <ChevronLeftIcon className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronRightIcon className="w-5 h-5" />
                                {hasItems && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold">{itemCount}</span>
                                        <span className="text-[10px] leading-tight text-center px-1">
                                            {itemCount === 1 ? 'stop' : 'stops'}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </button>
            </div>
        </>
    );
};

export default Drawer;
