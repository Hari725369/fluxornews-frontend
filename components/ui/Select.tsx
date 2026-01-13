"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface Option {
    value: string;
    label: string | React.ReactNode;
}

interface SelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function Select({ options, value, onChange, placeholder = "Select...", className, disabled }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use string comparison to match value (robust against number/string mismatch)
    const selectedOption = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "w-full px-4 py-2.5 text-left border rounded-md transition-all duration-200 flex items-center justify-between",
                    "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-black dark:text-white",
                    "focus:outline-none focus:ring-[0.5px] focus:ring-primary focus:border-primary",
                    disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900",
                    isOpen && "ring-[0.5px] ring-primary border-primary",
                    !selectedOption && "text-gray-500 dark:text-gray-400"
                )}
                disabled={disabled}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={cn(
                        "w-4 h-4 transition-transform duration-200 text-gray-400",
                        isOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                                "px-4 py-2 cursor-pointer transition-colors text-sm",
                                "text-gray-700 dark:text-gray-200",
                                "hover:bg-primary hover:text-white",
                                String(option.value) === String(value) && "bg-primary/10 dark:bg-primary/20 text-primary font-medium dark:text-primary-300"
                            )}
                        >
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
}
