import React from 'react';
import BucketItem from '../buckets/BucketItem';

const Sidebar = ({
    buckets,
    selectedBucket,
    setSelectedBucket,
    editBucket,
    deleteBucket,
    showBucketForm,
    dragHandlers
}) => {
    return (
        <div className="w-1/3 h-full border-r border-[#2A2A2A] bg-[#171717] flex flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-sm uppercase text-gray-400 font-medium mb-3">Buckets</h2>
                <div className="space-y-1">
                    {buckets.map(bucket => (
                        <BucketItem
                            key={bucket}
                            bucket={bucket}
                            selectedBucket={selectedBucket}
                            setSelectedBucket={setSelectedBucket}
                            editBucket={editBucket}
                            deleteBucket={deleteBucket}
                            dragHandlers={dragHandlers}
                        />
                    ))}
                    <button
                        onClick={() => showBucketForm()}
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