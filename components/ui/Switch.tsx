import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export default function Switch({
    checked,
    onChange,
    size = 'md',
    disabled = false,
    className = ''
}: SwitchProps) {
    const sizeClasses = {
        sm: {
            switch: 'w-8 h-4',
            thumb: 'w-3 h-3',
            translate: 'translate-x-4',
            initial: 'translate-x-0.5'
        },
        md: {
            switch: 'w-11 h-6',
            thumb: 'w-5 h-5',
            translate: 'translate-x-full',
            initial: 'translate-x-[2px]'
        },
        lg: {
            switch: 'w-14 h-7',
            thumb: 'w-6 h-6',
            translate: 'translate-x-full',
            initial: 'translate-x-[2px]'
        }
    };

    const currentSize = sizeClasses[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
                relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20
                ${currentSize.switch}
                ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out
                    ${currentSize.thumb}
                    ${checked ? `${currentSize.translate} -translate-x-[2px]` : currentSize.initial}
                `}
            />
        </button>
    );
}
