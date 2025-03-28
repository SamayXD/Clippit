import React from 'react';
import Button from './Button';

const EmptyState = ({
    title = 'No items found',
    description = 'Start by adding your first item.',
    icon,
    action,
    actionLabel,
    className = ''
}) => {
    const defaultIcon = (
        <svg
            className="w-12 h-12 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
        </svg>
    );

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#1E1E1E]">
                    {icon || defaultIcon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-200 crisp-text">{title}</h3>
                <p className="mt-1 text-sm text-gray-400">{description}</p>
                {action && actionLabel && (
                    <div className="mt-6">
                        <Button
                            onClick={action}
                            className="inline-flex items-center px-4 py-2"
                        >
                            {actionLabel}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState; 