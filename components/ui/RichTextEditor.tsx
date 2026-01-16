"use client";

import React, { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export default function RichTextEditor({ value, onChange, label, placeholder, className, required }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };
    const initialValue = useRef(value).current; // Use ref to keep initial value stable

    // Sync external value to internal HTML only if different/empty to avoid cursor jumps
    useEffect(() => {
        if (editorRef.current) {
            const isActive = document.activeElement === editorRef.current;
            // Only update if NOT focused, or if force-clearing (value is empty)
            if (!isActive && editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            } else if (value === '' && editorRef.current.innerHTML !== '') {
                // Handle explicit reset even if focused (e.g. after submit)
                editorRef.current.innerHTML = '';
            }
        }
    }, [value]);

    const [recentColors, setRecentColors] = useState<string[]>([]);

    // Load recent colors from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('editor_recent_colors');
        if (saved) {
            try {
                setRecentColors(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent colors', e);
            }
        } else {
            // Default palette
            setRecentColors(['#C4161C', '#111827', '#4B5563', '#2563EB', '#16A34A', '#D97706']);
        }
    }, []);

    const updateRecentColors = (color: string) => {
        setRecentColors(prev => {
            const updated = [color, ...prev.filter(c => c !== color)].slice(0, 6);
            localStorage.setItem('editor_recent_colors', JSON.stringify(updated));
            return updated;
        });
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg: string | undefined = undefined) => {
        document.execCommand(command, false, arg);
        handleInput(); // Trigger update
        if (command === 'foreColor' && arg) {
            updateRecentColors(arg);
        }
        editorRef.current?.focus();
    };

    const ToolbarButton = ({ cmd, arg, icon, title, onClick }: { cmd?: string, arg?: string, icon: React.ReactNode, title: string, onClick?: (e: React.MouseEvent) => void }) => (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // Keep focus in editor
                if (onClick) onClick(e);
                else if (cmd) execCommand(cmd, arg);
            }}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            title={title}
        >
            {icon}
        </button>
    );

    const [showListOptions, setShowListOptions] = useState(false);
    const listOptionsRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (listOptionsRef.current && !listOptionsRef.current.contains(event.target as Node)) {
                setShowListOptions(false);
            }
        };

        if (showListOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showListOptions]);

    return (
        <div className={`${className} ${isFullScreen ? 'fixed inset-0 z-[100] bg-white dark:bg-[#0F0F0F] p-4 h-screen w-screen' : ''}`}>
            {label && !isFullScreen && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>}

            <div className={`border rounded-md overflow-hidden bg-white dark:bg-[#0F0F0F] transition-all flex flex-col ${isFullScreen
                ? 'h-full border-none shadow-none'
                : isFocused ? 'border-primary ring-[0.5px] ring-primary' : 'border-gray-300 dark:border-neutral-300'
                }`}>
                {/* Toolbar */}
                <div className="flex items-center flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <div className="flex items-center gap-1 mr-2">
                        <ToolbarButton
                            title="Paragraph"
                            onClick={() => execCommand('formatBlock', 'P')}
                            icon={<span className="font-serif font-bold text-sm">P</span>}
                        />
                        <ToolbarButton
                            title="Heading 2"
                            onClick={() => execCommand('formatBlock', 'H2')}
                            icon={<span className="font-serif font-bold text-sm">H2</span>}
                        />
                        <ToolbarButton
                            title="Heading 3"
                            onClick={() => execCommand('formatBlock', 'H3')}
                            icon={<span className="font-serif font-bold text-sm">H3</span>}
                        />
                    </div>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    <ToolbarButton cmd="bold" icon={<b className="font-serif font-bold text-lg">B</b>} title="Bold" />
                    <ToolbarButton cmd="italic" icon={<i className="font-serif italic text-lg">I</i>} title="Italic" />
                    <ToolbarButton cmd="underline" icon={<u className="font-serif underline text-lg">U</u>} title="Underline" />
                    <ToolbarButton cmd="strikeThrough" icon={<s className="font-serif text-lg">S</s>} title="Strikethrough" />

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    {/* Advanced List Dropdown */}
                    <div className="relative" ref={listOptionsRef}>
                        <button
                            type="button"
                            onClick={() => setShowListOptions(!showListOptions)}
                            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1 ${showListOptions ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                            title="List Options"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16M9 6v12m-3-6h.01" /></svg>
                            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showListOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {showListOptions && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 p-1">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Bullets</div>
                                <button type="button" onClick={() => { execCommand('insertUnorderedList'); setShowListOptions(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <span className="w-4 text-center">•</span> Disc (Default)
                                </button>
                                <button type="button" onClick={() => { execCommand('insertUnorderedList'); setTimeout(() => { const s = window.getSelection(); if (s?.anchorNode) { const ul = s.anchorNode.parentElement?.closest('ul'); if (ul) ul.style.listStyleType = 'circle'; handleInput(); } }, 10); setShowListOptions(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <span className="w-4 text-center">○</span> Circle
                                </button>
                                <button type="button" onClick={() => { execCommand('insertUnorderedList'); setTimeout(() => { const s = window.getSelection(); if (s?.anchorNode) { const ul = s.anchorNode.parentElement?.closest('ul'); if (ul) ul.style.listStyleType = 'square'; handleInput(); } }, 10); setShowListOptions(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <span className="w-4 text-center">■</span> Square
                                </button>

                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Numbering</div>
                                <button type="button" onClick={() => { execCommand('insertOrderedList'); setShowListOptions(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <span className="w-4 text-center">1.</span> Decimal
                                </button>
                                <button type="button" onClick={() => { execCommand('insertOrderedList'); setTimeout(() => { const s = window.getSelection(); if (s?.anchorNode) { const ol = s.anchorNode.parentElement?.closest('ol'); if (ol) ol.style.listStyleType = 'lower-roman'; handleInput(); } }, 10); setShowListOptions(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <span className="w-4 text-center">i.</span> Roman (Lower)
                                </button>
                                <button type="button" onClick={() => { execCommand('insertOrderedList'); setTimeout(() => { const s = window.getSelection(); if (s?.anchorNode) { const ol = s.anchorNode.parentElement?.closest('ol'); if (ol) ol.style.listStyleType = 'lower-alpha'; handleInput(); } }, 10); setShowListOptions(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <span className="w-4 text-center">a.</span> Alpha (Lower)
                                </button>
                            </div>
                        )}
                    </div>

                    <ToolbarButton
                        title="Blockquote"
                        onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        } />

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    <ToolbarButton cmd="justifyLeft" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16" /></svg>
                    } title="Align Left" />
                    <ToolbarButton cmd="justifyCenter" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M4 18h16" /></svg>
                    } title="Align Center" />
                    <ToolbarButton cmd="justifyRight" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16" /></svg>
                    } title="Align Right" />
                    <ToolbarButton cmd="justifyFull" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    } title="Justify" />

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    <ToolbarButton
                        title="Insert Link"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        }
                        onClick={() => {
                            const url = prompt('Enter Link URL:', 'https://');
                            if (url) execCommand('createLink', url);
                        }}
                    />

                    <ToolbarButton
                        title="Insert Image"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        }
                        onClick={() => {
                            const url = prompt('Enter Image URL:', 'https://');
                            if (url) execCommand('insertImage', url);
                        }}
                    />

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    <ToolbarButton cmd="undo" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    } title="Undo" />
                    <ToolbarButton cmd="redo" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                    } title="Redo" />

                    <ToolbarButton cmd="removeFormat" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    } title="Clear Format" />

                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mr-1 hidden sm:inline-block">Colors</span>
                        {/* Recent Colors */}
                        <div className="flex items-center gap-1">
                            {recentColors.map((color, idx) => (
                                <button
                                    key={`${color}-${idx}`}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        execCommand('foreColor', color);
                                    }}
                                    className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                        <div className="relative group">
                            <input
                                type="color"
                                onChange={(e) => execCommand('foreColor', e.target.value)}
                                className="w-8 h-8 p-0.5 border border-gray-200 dark:border-gray-700 rounded cursor-pointer bg-white dark:bg-gray-800"
                                title="Pick Color"
                            />
                            <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-gray-300 rounded"></div>
                        </div>

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                        <ToolbarButton
                            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                            onClick={toggleFullScreen}
                            icon={
                                isFullScreen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                )
                            }
                        />
                    </div>
                </div>

                {/* Editor Area */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`p-4 overflow-y-auto outline-none text-gray-900 dark:text-white prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:cursor-text text-lg leading-relaxed
                        [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 
                        [&_li]:marker:text-gray-500 [&_li]:marker:dark:text-gray-400
                        ${isFullScreen ? 'flex-1 h-full' : 'min-h-[500px] max-h-[800px]'
                        }`}
                    data-placeholder={placeholder}
                />
            </div>
        </div>
    );
}
