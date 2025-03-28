import React from 'react';
import Button from '../ui/Button';

const ConfirmModal = ({
    isVisible,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    type = 'warning' // warning, danger, info
}) => {
    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return (
                    <svg className="mr-2 text-red-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="mr-2 text-yellow-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg className="mr-2 text-blue-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="bg-[#1A1A1A] p-6 rounded-lg w-96 shadow-xl animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-2 text-white flex items-center crisp-text">
                    {getIcon()}
                    {title}
                </h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={type === 'danger' ? 'danger' : 'default'}
                        className="flex-1 py-2 font-medium"
                        onClick={onConfirm}
                    >
                        {confirmButtonText}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 px-4 py-2"
                        onClick={onClose}
                    >
                        {cancelButtonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal; 