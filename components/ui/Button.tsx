import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variantStyles = {
        // Primary CTA - Red background, high emphasis
        primary: 'bg-primary dark:bg-primary hover:bg-primary-600 dark:hover:bg-primary-600 text-white focus:ring-primary dark:focus:ring-primary shadow-sm',

        // Secondary CTA - Outlined, medium emphasis
        secondary: 'border-2 border-gray-300 dark:border-neutral-200 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 focus:ring-gray-400',

        // Tertiary CTA - Minimal, low emphasis
        tertiary: 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 focus:ring-gray-400',

        // Ghost - Text only, lowest emphasis
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 focus:ring-gray-400',
    };

    const sizeStyles = {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-lg',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}

// Icon Button variant for search, menu, etc.
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label: string;
    size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
    icon,
    label,
    size = 'md',
    className = '',
    ...props
}: IconButtonProps) {
    const sizeStyles = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <button
            className={`${sizeStyles[size]} inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-95 ${className}`}
            aria-label={label}
            {...props}
        >
            {icon}
        </button>
    );
}
