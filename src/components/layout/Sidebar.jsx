import React from 'react';

const Sidebar = ({
    buckets,
    selectedBucket,
    setSelectedBucket,
    editBucket,
    deleteBucket,
    showBucketForm,
    dragHandlers
}) => {
    const {
        handleBucketDragStart,
        handleBucketDragOver,
        handleBucketDrop,
        handleBucketDragEnd,
        draggedBucket,
        dropTargetBucket
    } = dragHandlers;

    return (
        <div className="w-1/3 h-full border-r border-[#2A2A2A] bg-[#171717] flex flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-sm uppercase text-gray-400 font-medium mb-3">Buckets</h2>
                <div className="space-y-1">
                    {buckets.map(bucket => (
                        <div
                            key={bucket}
                            className="group relative"
                            draggable={bucket !== 'all'}
                            onDragStart={(e) => handleBucketDragStart(e, bucket)}
                            onDragOver={(e) => handleBucketDragOver(e, bucket)}
                            onDrop={(e) => handleBucketDrop(e, bucket)}
                            onDragEnd={handleBucketDragEnd}
                        >
                            {/* Drop target indicator */}
                            {dropTargetBucket === bucket && draggedBucket !== bucket && (
                                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 opacity-70 animate-pulse"></div>
                            )}

                            <div className="flex items-center">
                                {/* Drag handle for buckets */}
                                {bucket !== 'all' && (
                                    <div
                                        className="absolute left-1 top-0 bottom-0 flex items-center justify-center px-1 cursor-grab opacity-0 group-hover:opacity-60"
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                            <circle cx="9" cy="7" r="1" fill="currentColor" />
                                            <circle cx="9" cy="12" r="1" fill="currentColor" />
                                            <circle cx="9" cy="17" r="1" fill="currentColor" />
                                            <circle cx="15" cy="7" r="1" fill="currentColor" />
                                            <circle cx="15" cy="12" r="1" fill="currentColor" />
                                            <circle cx="15" cy="17" r="1" fill="currentColor" />
                                        </svg>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedBucket(bucket)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${selectedBucket === bucket
                                            ? 'bg-gray-700 text-white'
                                            : 'hover:bg-[#2A2A2A] hover:translate-x-1 text-gray-300'
                                        } ${bucket !== 'all' ? 'pl-6' : ''}`}
                                >
                                    {bucket === 'all' ? 'All Items' : bucket}
                                </button>
                            </div>

                            {bucket !== 'all' && (
                                <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <button
                                        onClick={(e) => editBucket(bucket, e)}
                                        className="p-1 rounded hover:bg-[#3A3A3A] text-gray-400 hover:text-white transition-all duration-200 hover:shadow-sm"
                                        title="Edit bucket"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => deleteBucket(bucket, e)}
                                        className="p-1 rounded hover:bg-[#3A3A3A] text-gray-400 hover:text-red-400 transition-all duration-200 hover:shadow-sm"
                                        title="Delete bucket"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={showBucketForm}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-300 hover:bg-[#252525] transition-all duration-200 flex items-center"
                    >
                        <svg className="mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        New Bucket
                    </button>
                </div>
            </div>
            {/* GitHub Star Button - Fixed at bottom */}
            <div className="p-4 border-t border-[#2A2A2A]">
                <a
                    href="https://github.com/SamayXd/clippit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] rounded-md text-sm text-gray-300 hover:text-white transition-colors transform hover:scale-105 duration-200"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    ⭐ on GitHub
                </a>
            </div>
        </div>
    );
};

export default Sidebar; 