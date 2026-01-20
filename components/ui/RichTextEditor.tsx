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
    const [showTableModal, setShowTableModal] = useState(false);
    const [tableDims, setTableDims] = useState({ rows: 3, cols: 3 });

    // Image insert modal state
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageConfig, setImageConfig] = useState({
        url: '',
        width: '100%',
        height: 'auto',
        borderRadius: '8px'
    });

    // Column resize state
    const [isResizing, setIsResizing] = useState(false);
    const resizeDataRef = useRef<{
        table: HTMLTableElement;
        colIndex: number;
        startX: number;
        startWidth: number;
    } | null>(null);

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

    // Column resize handlers
    const handleResizeMouseDown = (e: React.MouseEvent, table: HTMLTableElement, colIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        const col = table.querySelectorAll('col')[colIndex];
        if (!col) return;

        const startWidth = col.getBoundingClientRect().width;
        resizeDataRef.current = {
            table,
            colIndex,
            startX: e.clientX,
            startWidth
        };
        setIsResizing(true);

        // Prevent text selection during resize
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
        if (!isResizing || !resizeDataRef.current) return;

        const { table, colIndex, startX, startWidth } = resizeDataRef.current;
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Min 50px

        const col = table.querySelectorAll('col')[colIndex];
        if (col) {
            (col as HTMLElement).style.width = `${newWidth}px`;
        }
    };

    const handleResizeMouseUp = () => {
        if (isResizing) {
            setIsResizing(false);
            resizeDataRef.current = null;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            handleInput(); // Save changes
        }
    };

    // Attach global mouse events for resizing
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResizeMouseMove);
            window.addEventListener('mouseup', handleResizeMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
        };
    }, [isResizing]);

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

    const [savedRange, setSavedRange] = useState<Range | null>(null);
    const [activeTable, setActiveTable] = useState<HTMLTableElement | null>(null);
    const [tableMenuPos, setTableMenuPos] = useState({ top: 0, left: 0 });

    // Save selection when opening modal
    const openTableModal = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            setSavedRange(selection.getRangeAt(0));
        }
        setShowTableModal(true);
    };

    // Handle clicks to detect table selection for editing
    const handleEditorClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        const target = (e as any).target as HTMLElement;
        const table = target.closest('table');
        if (table) {
            setActiveTable(table as HTMLTableElement);
            // Position menu above the table
            const rect = table.getBoundingClientRect();
            const editorRect = editorRef.current?.getBoundingClientRect();
            if (editorRect) {
                // Calculate center top position
                const tableCenterX = (rect.left - editorRect.left) + (rect.width / 2);

                setTableMenuPos({
                    top: rect.top - editorRect.top - 40, // 40px above table
                    left: tableCenterX // Center relative to table
                });
            }
        } else {
            setActiveTable(null);
        }
    };

    // Table manipulation functions
    const addRow = () => {
        if (!activeTable) return;
        const cols = activeTable.rows[0].cells.length;
        const row = activeTable.insertRow();
        for (let i = 0; i < cols; i++) {
            const cell = row.insertCell();
            cell.className = "border border-gray-300 dark:border-gray-600 p-2 min-w-[50px] text-[14px]";
            cell.innerHTML = "New";
        }
        handleInput();
    };

    const addCol = () => {
        if (!activeTable) return;
        for (let i = 0; i < activeTable.rows.length; i++) {
            const cell = activeTable.rows[i].insertCell();
            cell.className = "border border-gray-300 dark:border-gray-600 p-2 min-w-[50px] text-[14px]";
            cell.innerHTML = "New";
        }
        handleInput();
    };

    const deleteRow = () => {
        if (!activeTable || activeTable.rows.length <= 1) return;
        activeTable.deleteRow(activeTable.rows.length - 1);
        handleInput();
    };

    const deleteCol = () => {
        if (!activeTable || activeTable.rows[0].cells.length <= 1) return;
        const lastColIdx = activeTable.rows[0].cells.length - 1;
        for (let i = 0; i < activeTable.rows.length; i++) {
            activeTable.rows[i].deleteCell(lastColIdx);
        }
        handleInput();
    };

    const deleteTable = () => {
        if (!activeTable) return;
        activeTable.remove();
        setActiveTable(null);
        handleInput();
    };

    return (
        <div className={`${className} ${isFullScreen ? 'fixed inset-0 z-[100] bg-white dark:bg-[#0F0F0F] p-4 flex flex-col' : ''}`}>
            {label && !isFullScreen && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>}

            <div className={`border rounded-md overflow-hidden bg-white dark:bg-[#0F0F0F] transition-all flex flex-col ${isFullScreen
                ? 'flex-1 border-none shadow-none'
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
                            // Save selection before opening modal
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                                setSavedRange(selection.getRangeAt(0));
                            }
                            setShowImageModal(true);
                        }}
                    />

                    <ToolbarButton
                        title="Insert Table"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7-4h14M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
                        }
                        onClick={openTableModal}
                    />

                    {/* Table Modal */}
                    {showTableModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-80">
                                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Insert Table</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rows</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={tableDims.rows}
                                            onChange={(e) => setTableDims(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={tableDims.cols}
                                            onChange={(e) => setTableDims(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => setShowTableModal(false)}
                                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                const { rows, cols } = tableDims;
                                                if (rows > 0 && cols > 0) {
                                                    // Restore selection!
                                                    if (savedRange) {
                                                        const selection = window.getSelection();
                                                        if (selection) {
                                                            selection.removeAllRanges();
                                                            selection.addRange(savedRange);
                                                        }
                                                    } else {
                                                        editorRef.current?.focus();
                                                    }

                                                    // Fixed-width columns with colgroup, 14px font, resize handles
                                                    const colWidth = `${100 / cols}%`;
                                                    let html = '<div class="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 my-4">';
                                                    html += '<table class="w-full border-collapse resizable-table" style="table-layout: fixed;">';
                                                    html += '<colgroup>';
                                                    for (let j = 0; j < cols; j++) {
                                                        html += `<col style="width: ${colWidth};">`;
                                                    }
                                                    html += '</colgroup><tbody>';
                                                    for (let i = 0; i < rows; i++) {
                                                        html += '<tr>';
                                                        for (let j = 0; j < cols; j++) {
                                                            // 14px font, resizable cells
                                                            html += `<td class="border border-gray-300 dark:border-gray-600 p-2 break-words text-wrap align-top text-[14px] resize-handle" data-col-index="${j}">Cell</td>`;
                                                        }
                                                        html += '</tr>';
                                                    }
                                                    html += '</tbody></table></div><p><br/></p>';
                                                    execCommand('insertHTML', html);
                                                    setShowTableModal(false);
                                                }
                                            }}
                                            className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600"
                                        >
                                            Insert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Insert Modal */}
                    {showImageModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-96 max-w-full mx-4">
                                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Insert Image</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={imageConfig.url}
                                            onChange={(e) => setImageConfig(prev => ({ ...prev, url: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white text-sm"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    {/* OR divider */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">OR</span>
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload from Computer</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('image', file);

                                                        const token = localStorage.getItem('adminToken');
                                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                                        const uploadUrl = `${apiUrl}/api/upload`;
                                                        console.log('Uploading to:', uploadUrl);

                                                        const response = await fetch(uploadUrl, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: formData
                                                        });

                                                        const data = await response.json();
                                                        if (data.success && data.data.url) {
                                                            setImageConfig(prev => ({ ...prev, url: data.data.url }));
                                                        }
                                                    } catch (error) {
                                                        console.error('Upload failed:', error);
                                                        alert('Failed to upload image');
                                                    }
                                                }
                                            }}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width</label>
                                            <input
                                                type="text"
                                                value={imageConfig.width}
                                                onChange={(e) => setImageConfig(prev => ({ ...prev, width: e.target.value }))}
                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white text-sm"
                                                placeholder="100%"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                                            <input
                                                type="text"
                                                value={imageConfig.height}
                                                onChange={(e) => setImageConfig(prev => ({ ...prev, height: e.target.value }))}
                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white text-sm"
                                                placeholder="auto"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corner Radius</label>
                                        <input
                                            type="text"
                                            value={imageConfig.borderRadius}
                                            onChange={(e) => setImageConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-transparent dark:text-white text-sm"
                                            placeholder="8px"
                                        />
                                    </div>
                                    {imageConfig.url && (
                                        <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                                            <img
                                                src={imageConfig.url}
                                                alt="Preview"
                                                className="max-h-40 mx-auto rounded-lg"
                                                style={{ borderRadius: imageConfig.borderRadius, maxWidth: '100%', objectFit: 'contain' }}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                setShowImageModal(false);
                                                setImageConfig({ url: '', width: '100%', height: 'auto', borderRadius: '8px' });
                                            }}
                                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (imageConfig.url) {
                                                    if (savedRange) {
                                                        const selection = window.getSelection();
                                                        if (selection) {
                                                            selection.removeAllRanges();
                                                            selection.addRange(savedRange);
                                                        }
                                                    } else {
                                                        editorRef.current?.focus();
                                                    }
                                                    const html = `<img src="${imageConfig.url}" style="width: ${imageConfig.width}; height: ${imageConfig.height}; border-radius: ${imageConfig.borderRadius}; display: block; margin: 1rem auto; max-width: 100%;" alt="Article image" /><p><br/></p>`;
                                                    execCommand('insertHTML', html);
                                                    setShowImageModal(false);
                                                    setImageConfig({ url: '', width: '100%', height: 'auto', borderRadius: '8px' });
                                                }
                                            }}
                                            className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50"
                                            disabled={!imageConfig.url}
                                        >
                                            Insert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

                {/* Editor Area with Table Menu */}
                <div className="relative flex-1 overflow-hidden">
                    {/* Floating Table Toolbar */}
                    {/* Floating Table Toolbar */}
                    {activeTable && (
                        <div
                            className="absolute z-40 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded p-1 flex gap-2 items-center transform -translate-x-1/2"
                            style={{ top: `${tableMenuPos.top}px`, left: `${tableMenuPos.left}px` }}
                        >
                            <button
                                type="button"
                                onClick={deleteTable}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded transition-colors"
                                title="Delete Table"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>

                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

                            <div className="flex items-center rounded border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                <button type="button" onClick={deleteRow} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors" title="Delete Row">-</button>
                                <span className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700 py-1 select-none">Row</span>
                                <button type="button" onClick={addRow} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors" title="Add Row">+</button>
                            </div>

                            <div className="flex items-center rounded border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                <button type="button" onClick={deleteCol} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors" title="Delete Column">-</button>
                                <span className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700 py-1 select-none">Col</span>
                                <button type="button" onClick={addCol} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors" title="Add Column">+</button>
                            </div>
                        </div>
                    )}

                    {/* 
                     Custom styles for editor content:
                     1. Force tables to be fixed width.
                     2. Remove outer borders of cells inside rounded wrappers to prevent broken corners.
                    */}
                    <style jsx global>{`
                        .prose table { width: 100% !important; }
                        .prose .rounded-lg > table tr:first-child td { border-top: 0 !important; }
                        .prose .rounded-lg > table tr:last-child td { border-bottom: 0 !important; }
                        .prose .rounded-lg > table tr td:first-child { border-left: 0 !important; }
                        .prose .rounded-lg > table tr td:last-child { border-right: 0 !important; }
                        
                        /* Resize handle styles */
                        .resize-handle {
                            position: relative;
                        }
                        
                        .resize-handle::after {
                            content: '';
                            position: absolute;
                            right: 0;
                            top: 0;
                            width: 8px;
                            height: 100%;
                            cursor: col-resize;
                            user-select: none;
                        }
                        
                        .resize-handle:hover::after {
                            background: rgba(59, 130, 246, 0.15);
                        }
                        
                        .resize-handle:last-child::after {
                            display: none; /* No resize on last column */
                        }
                    `}</style>
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onClick={handleEditorClick}
                        onKeyUp={handleEditorClick} // Update menu on typing too
                        onMouseDown={(e) => {
                            // Check if clicking on resize handle
                            const target = e.target as HTMLElement;
                            if (target.classList.contains('resize-handle')) {
                                const rect = target.getBoundingClientRect();
                                const isOnResizeArea = e.clientX >= rect.right - 8;

                                if (isOnResizeArea) {
                                    const table = target.closest('table') as HTMLTableElement;
                                    const colIndex = parseInt(target.getAttribute('data-col-index') || '0');
                                    if (table && colIndex !== undefined) {
                                        handleResizeMouseDown(e, table, colIndex);
                                    }
                                }
                            }
                        }}
                        className={`p-4 overflow-y-auto outline-none text-gray-900 dark:text-white prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:cursor-text text-lg leading-relaxed
                            [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                            [&_li]:marker:text-gray-500 [&_li]:marker:dark:text-gray-400
                            ${isFullScreen ? 'h-full' : 'min-h-[500px] max-h-[800px]'
                            }`}
                        data-placeholder={placeholder}
                    />
                </div>
            </div>
        </div>
    );
}
