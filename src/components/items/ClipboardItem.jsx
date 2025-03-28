import React from 'react';

const ClipboardItem = ({
    item,
    copyToClipboard,
    editItem,
    deleteItem,
    openLink,
    isLikelyUrl,
    truncateText,
    dragHandlers,
    copiedId
}) => {
    const { handleDragStart, handleDragOver, handleDrop, handleDragEnd } = dragHandlers;

    return (
        <div
            className={`group relative p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] cursor-pointer hover:shadow-md transition-all duration-200 ease-in-out ${dragHandlers.draggedItem?.id === item.id ? 'opacity-50' : ''}`}
            onClick={() => copyToClipboard(item.content, item.id)}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, item)}
            onDrop={(e) => handleDrop(e, item)}
            onDragEnd={handleDragEnd}
        >
            {/* Drop indicator */}
            {dragHandlers.dropTarget === item.id && dragHandlers.dropTarget !== dragHandlers.draggedItem?.id && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 opacity-70 animate-pulse"></div>
            )}

            {/* Drag handle */}
            <div
                className="absolute left-1 top-0 bottom-0 flex items-center justify-center px-1 cursor-grab opacity-40 group-hover:opacity-100"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <circle cx="9" cy="7" r="1" fill="currentColor" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="9" cy="17" r="1" fill="currentColor" />
                    <circle cx="15" cy="7" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="17" r="1" fill="currentColor" />
                </svg>
            </div>

            {copiedId === item.id && (
                <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm animate-fadeIn">
                    <span className="text-white font-medium flex items-center">
                        <svg className="mr-1 text-green-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Copied!
                    </span>
                </div>
            )}
            <div className="font-medium text-white mb-1 pl-5">{item.label}</div>
            <div className="text-sm text-gray-400 break-words pl-5">
                {truncateText(item.content)}
            </div>
            {item.buckets && item.buckets.filter(b => b !== 'all').length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 pl-5">
                    {item.buckets.filter(b => b !== 'all').map(bucket => (
                        <span key={bucket} className="text-xs bg-[#333333] text-gray-300 px-2 py-0.5 rounded-full">
                            {bucket}
                        </span>
                    ))}
                </div>
            )}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-1">
                {isLikelyUrl(item.content) && (
                    <button
                        onClick={(e) => openLink(item.content, e)}
                        className="p-1.5 rounded-md hover:bg-[#444444] text-gray-400 hover:text-blue-400 transition-all duration-200 hover:shadow-sm"
                        title="Open link"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <path d="M15 3h6v6"></path>
                            <path d="M10 14L21 3"></path>
                        </svg>
                    </button>
                )}
                <button
                    onClick={(e) => editItem(item, e)}
                    className="p-1.5 rounded-md hover:bg-[#444444] text-gray-400 hover:text-white transition-all duration-200 hover:shadow-sm"
                    title="Edit"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button
                    onClick={(e) => deleteItem(item.id, e)}
                    className="p-1.5 rounded-md hover:bg-[#444444] text-gray-400 hover:text-red-400 transition-all duration-200 hover:shadow-sm"
                    title="Delete"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ClipboardItem; 