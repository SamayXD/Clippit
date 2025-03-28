import React from 'react';
import Button from './Button';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
    return (
        <div className={`bg-red-900/30 border border-red-800 rounded-md p-4 ${className}`}>
            <div className="flex items-start">
                <svg
                    className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                    />
                </svg>
                <div className="flex-1">
                    <p className="text-sm text-red-200">{message}</p>
                    {onRetry && (
                        <div className="mt-3">
                            <Button
                                variant="danger"
                                onClick={onRetry}
                                className="px-3 py-1.5 text-sm"
                            >
                                Retry
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage; 