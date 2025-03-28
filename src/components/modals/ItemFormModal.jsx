import React from 'react';
import Button from '../ui/Button';

const ItemFormModal = ({
    showForm,
    setShowForm,
    handleSubmit,
    newItem,
    setNewItem,
    buckets,
    toggleBucketSelection,
    showNewBucketField,
    setShowNewBucketField,
    newBucketInForm,
    setNewBucketInForm,
    editingItem,
    setEditingItem
}) => {
    if (!showForm) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
            <div
                className="bg-[#1A1A1A] p-6 rounded-lg w-96 shadow-xl animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4 text-white flex items-center crisp-text">
                    {editingItem ?
                        <>
                            <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Item
                        </> :
                        <>
                            <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"></path>
                            </svg>
                            Add New Item
                        </>
                    }
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Label</label>
                        <input
                            type="text"
                            placeholder="e.g., 'Work Email'"
                            value={newItem.label}
                            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                            className="w-full px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Content</label>
                        <textarea
                            placeholder="Content to copy"
                            value={newItem.content}
                            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                            className="w-full px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-gray-100"
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Buckets</label>
                        <div className="mb-2 flex flex-wrap gap-1">
                            {buckets.map(bucket => (
                                <button
                                    key={bucket}
                                    type="button"
                                    onClick={() => toggleBucketSelection(bucket)}
                                    className={`px-2 py-1 text-xs rounded-full transition-all duration-200 ${newItem.buckets.includes(bucket)
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-[#252525] text-gray-400 hover:bg-[#333333]'
                                        }`}
                                >
                                    {bucket === 'all' ? 'All Items' : bucket}
                                </button>
                            ))}
                        </div>
                        {showNewBucketField ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="New bucket name"
                                    value={newBucketInForm}
                                    onChange={(e) => setNewBucketInForm(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewBucketField(false)}
                                    className="px-2 py-2 hover:bg-[#333333] text-gray-400 hover:text-white rounded-md transition-colors"
                                    title="Cancel"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 12H5"></path>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowNewBucketField(true)}
                                className="w-full text-center py-2 text-sm bg-[#252525] hover:bg-[#333333] text-gray-400 hover:text-white rounded-md transition-colors"
                            >
                                + Add New Bucket
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            className="flex-1 py-2 font-medium"
                        >
                            {editingItem ? 'Save Changes' : 'Add Item'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 px-4 py-2"
                            onClick={() => {
                                setShowForm(false)
                                setEditingItem(null)
                                setShowNewBucketField(false)
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

export default ItemFormModal; 