import React from 'react';

const BucketItem = ({
    bucket,
    selectedBucket,
    setSelectedBucket,
    editBucket,
    deleteBucket,
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

    const isDefault = bucket === 'all';
    const isDropTarget = dropTargetBucket === bucket && draggedBucket !== bucket;

    return (
        <div
            className="group relative"
            draggable={!isDefault}
            onDragStart={(e) => handleBucketDragStart(e, bucket)}
            onDragOver={(e) => handleBucketDragOver(e, bucket)}
            onDrop={(e) => handleBucketDrop(e, bucket)}
            onDragEnd={handleBucketDragEnd}
        >
            {/* Drop target indicator */}
            {isDropTarget && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 opacity-50 animate-pulse"></div>
            )}

            <div className="flex items-center">
                {/* Drag handle for buckets */}
                {!isDefault && (
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
                    className={`
            w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 
            ${selectedBucket === bucket ? 'bg-gray-700 text-white' : 'hover:bg-[#2A2A2A] hover:translate-x-1 text-gray-300'} 
            ${!isDefault ? 'pl-6' : ''}
          `}
                >
                    {isDefault ? 'All Items' : bucket}
                </button>
            </div>

            {!isDefault && (
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
    );
};

export default BucketItem; 