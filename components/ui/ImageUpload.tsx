import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    label?: string;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    onUploadStart,
    onUploadEnd,
    label = "Featured Image",
    className = ""
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const processFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB Limit
            setError('Error: File too large (Max 5MB). Please resize.');
            return;
        }

        if (file.size > 150 * 1024) { // 150KB Warning/Info
            setError('Info: Image > 150KB. It will be optimized automatically.');
        }

        setFileSize(formatFileSize(file.size));
        setUploading(true);
        if (onUploadStart) onUploadStart();

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string);
            setUploading(false);
            if (onUploadEnd) onUploadEnd();
        };
        reader.onerror = () => {
            setError('Failed to read file');
            setUploading(false);
            if (onUploadEnd) onUploadEnd();
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault();
            processFile(e.clipboardData.files[0]);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-[var(--text-secondary)] mb-4 border-b border-gray-100 dark:border-[#1a1a1a] pb-2 flex justify-between">
                {label}
                {fileSize && !value && <span className="text-xs normal-case font-normal text-primary">{fileSize}</span>}
            </h3>

            <div
                className={`relative group border-2 border-dashed rounded-lg transition-all duration-200 outline-none
                    ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600'}
                    ${value ? 'h-48 border-none' : 'h-32'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onPaste={handlePaste}
                tabIndex={0} // Make focusable for paste
            >
                {!value ? (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className={`w-8 h-8 mb-3 ${dragActive ? 'text-primary' : 'text-gray-400'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 text-center px-4">
                                Recommended: 50KB - 150KB.
                                <span className="block text-gray-400">Larger images will be automatically optimized.</span>
                                <span className="block mt-1 text-xs opacity-70">Paste (Ctrl+V) supported</span>
                            </p>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                ) : (
                    <div className="relative w-full h-full bg-gray-100 dark:bg-neutral-900 rounded-md overflow-hidden">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <span className="text-white text-xs font-mono mb-2">{fileSize || 'Image Uploaded'}</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => inputRef.current?.click()}
                                    className="bg-white/90 hover:bg-white text-black border-none"
                                >
                                    Change
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        onChange('');
                                        setFileSize(null);
                                        setError(null);
                                    }}
                                    className="bg-red-500/90 hover:bg-red-500 text-white border-none"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {fileSize && parseInt(fileSize) > 150 && fileSize.includes('KB') ? 'Optimizing...' : 'Processing...'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className={`mt-2 text-xs ${error.startsWith('Error') ? 'text-red-500' :
                    error.startsWith('Info') ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'
                    }`}>
                    {error}
                </p>
            )}
        </div>
    );
}
