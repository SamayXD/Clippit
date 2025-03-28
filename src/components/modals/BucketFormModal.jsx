import React from 'react';
import Button from '../ui/Button';

const BucketFormModal = ({
    showBucketForm,
    setShowBucketForm,
    newBucket,
    setNewBucket,
    handleBucketSubmit,
    editingBucket,
    setEditingBucket
}) => {
    if (!showBucketForm) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.target === e.currentTarget && setShowBucketForm(false)}
        >
            <div
                className="bg-[#1A1A1A] p-6 rounded-lg w-96 shadow-xl animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4 text-white flex items-center crisp-text">
                    {editingBucket ?
                        <>
                            <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Bucket
                        </> :
                        <>
                            <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"></path>
                            </svg>
                            Add New Bucket
                        </>
                    }
                </h2>
                <form onSubmit={handleBucketSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Bucket Name</label>
                        <input
                            type="text"
                            placeholder="e.g., 'Work', 'Personal'"
                            value={newBucket}
                            onChange={(e) => setNewBucket(e.target.value)}
                            className="w-full px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-gray-100"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            className="flex-1 py-2 font-medium"
                        >
                            {editingBucket ? 'Save Changes' : 'Add Bucket'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 px-4 py-2"
                            onClick={() => {
                                setShowBucketForm(false);
                                setEditingBucket(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BucketFormModal; 