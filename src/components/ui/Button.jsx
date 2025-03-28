import React from 'react';

const Button = ({
    children,
    onClick,
    className = '',
    variant = 'default',
    type = 'button',
    disabled = false,
    ...props
}) => {
    // Define variant styles
    const variants = {
        default: 'bg-gray-700 hover:bg-gray-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        ghost: 'hover:bg-[#333333] text-gray-300',
        link: 'text-blue-400 hover:text-blue-300 hover:underline',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        transition-all duration-200 ease-in-out rounded-md
        ${variants[variant] || variants.default}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${variant !== 'link' && variant !== 'ghost' ? 'hover:shadow-md transform hover:translate-y-[-1px]' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button; 