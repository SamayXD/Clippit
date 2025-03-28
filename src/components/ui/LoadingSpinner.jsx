import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4'
    };

    const spinnerElement = (
        <div className={`${sizeClasses[size]} ${className} rounded-full border-t-transparent border-blue-500 animate-spin`}></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center">
                    {spinnerElement}
                    <p className="mt-4 text-gray-300 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return spinnerElement;
};

export default LoadingSpinner; 