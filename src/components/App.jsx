/* global chrome */
import { useState, useEffect, useMemo, useCallback } from 'react'

// UI Components
import Button from './ui/Button'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorMessage from './ui/ErrorMessage'
import EmptyState from './ui/EmptyState'

// Layout Components
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'

// Item Components
import ItemList from './items/ItemList'

// Modal Components
import ItemFormModal from './modals/ItemFormModal'
import BucketFormModal from './modals/BucketFormModal'
import ConfirmModal from './modals/ConfirmModal'

// Simple debounce function
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function App() {
    const [items, setItems] = useState([])
    const [newItem, setNewItem] = useState({ label: '', content: '', buckets: ['all'] })
    const [showForm, setShowForm] = useState(false)
    const [copiedId, setCopiedId] = useState(null)
    const [showBucketForm, setShowBucketForm] = useState(false)
    const [newBucket, setNewBucket] = useState('')
    const [buckets, setBuckets] = useState(['all', 'work', 'personal'])
    const [selectedBucket, setSelectedBucket] = useState('all')
    const [editingItem, setEditingItem] = useState(null)
    const [newBucketInForm, setNewBucketInForm] = useState('')
    const [showNewBucketField, setShowNewBucketField] = useState(false)
    const [sidebarHidden, setSidebarHidden] = useState(false)
    const [editingBucket, setEditingBucket] = useState(null)
    const [draggedItem, setDraggedItem] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [bucketToDelete, setBucketToDelete] = useState(null)
    const [dropTarget, setDropTarget] = useState(null)
    const [draggedBucket, setDraggedBucket] = useState(null)
    const [dropTargetBucket, setDropTargetBucket] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Create debounced save functions
    const debouncedSaveItems = useCallback(
        debounce((items) => {
            try {
                chrome.storage.sync.set({ clipboardItems: items }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving items:', chrome.runtime.lastError)
                    }
                })
            } catch (err) {
                console.error('Error saving items:', err)
            }
        }, 300),
        []
    );

    const debouncedSaveBuckets = useCallback(
        debounce((buckets) => {
            try {
                chrome.storage.sync.set({ clipboardBuckets: buckets }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving buckets:', chrome.runtime.lastError)
                    }
                })
            } catch (err) {
                console.error('Error saving buckets:', err)
            }
        }, 300),
        []
    );

    // Load items and buckets from storage when component mounts
    useEffect(() => {
        try {
            setIsLoading(true)
            chrome.storage.sync.get(['clipboardItems', 'clipboardBuckets', 'sidebarHidden'], (result) => {
                if (chrome.runtime.lastError) {
                    console.error('Error loading data:', chrome.runtime.lastError)
                    setError('Failed to load data. Please try reloading the extension.')
                    setIsLoading(false)
                    return
                }

                if (result.clipboardItems) {
                    setItems(result.clipboardItems)
                }
                if (result.clipboardBuckets) {
                    setBuckets(result.clipboardBuckets)
                }
                if (result.sidebarHidden !== undefined) {
                    setSidebarHidden(result.sidebarHidden)
                }
                setIsLoading(false)
            })
        } catch (err) {
            console.error('Error in storage access:', err)
            setError('Failed to access storage. Please try reloading the extension.')
            setIsLoading(false)
        }
    }, [])

    // Use debounced save functions
    useEffect(() => {
        if (isLoading) return // Don't save during initial load
        debouncedSaveItems(items);
    }, [items, isLoading, debouncedSaveItems])

    useEffect(() => {
        if (isLoading) return // Don't save during initial load
        debouncedSaveBuckets(buckets);
    }, [buckets, isLoading, debouncedSaveBuckets])

    useEffect(() => {
        if (isLoading) return // Don't save during initial load

        try {
            chrome.storage.sync.set({ sidebarHidden: sidebarHidden }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving sidebar state:', chrome.runtime.lastError)
                }
            })
        } catch (err) {
            console.error('Error saving sidebar state:', err)
        }
    }, [sidebarHidden, isLoading])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (newItem.label && newItem.content) {
            let bucketsToUse = [...newItem.buckets]

            // If creating a new bucket within the form
            if (showNewBucketField && newBucketInForm) {
                if (!buckets.includes(newBucketInForm)) {
                    // Check bucket count limit
                    if (buckets.length >= 20) {
                        setError("You've reached the maximum number of buckets (20). Please delete some before adding more.")
                        setTimeout(() => setError(null), 3000)
                        return
                    }

                    setBuckets([...buckets, newBucketInForm])
                    if (!bucketsToUse.includes(newBucketInForm)) {
                        bucketsToUse.push(newBucketInForm)
                    }
                }
            }

            try {
                // Check storage limit (Chrome extension storage has limits)
                const newItems = editingItem
                    ? items.map(item => item.id === editingItem.id ? { ...newItem, buckets: bucketsToUse, id: item.id } : item)
                    : [{ ...newItem, buckets: bucketsToUse, id: Date.now() }, ...items];

                // Rough estimation of size in bytes (not exact but gives a reasonable approximation)
                const estimatedSize = JSON.stringify(newItems).length;

                // Chrome sync storage has a limit of ~100KB per item
                if (estimatedSize > 80000) { // Leave some margin
                    setError("Storage limit reached. Please delete some items before adding more.")
                    setTimeout(() => setError(null), 3000)
                    return
                }

                // Update state only after size check
                if (editingItem) {
                    setItems(items.map(item =>
                        item.id === editingItem.id
                            ? { ...newItem, buckets: bucketsToUse, id: item.id }
                            : item
                    ))
                    setEditingItem(null)
                } else {
                    setItems([{ ...newItem, buckets: bucketsToUse, id: Date.now() }, ...items])
                }

                setNewItem({ label: '', content: '', buckets: ['all'] })
                setNewBucketInForm('')
                setShowNewBucketField(false)
                setShowForm(false)
            } catch (err) {
                console.error('Error adding item:', err)
                setError('Failed to add item. Please try again.')
                setTimeout(() => setError(null), 3000)
            }
        }
    }

    // Function to handle potential data recovery if storage is corrupted
    const recoverData = () => {
        try {
            setIsLoading(true)

            // Create a backup of current data
            const backupItems = [...items]
            const backupBuckets = [...buckets]

            // Clear storage and try to rebuild
            chrome.storage.sync.clear(() => {
                if (chrome.runtime.lastError) {
                    console.error('Error clearing storage:', chrome.runtime.lastError)
                    setError('Failed to recover data. Please try manual reset.')
                    setIsLoading(false)
                    return
                }

                // Restore with backup data 
                chrome.storage.sync.set({
                    clipboardItems: backupItems.length ? backupItems : [],
                    clipboardBuckets: backupBuckets.length ? backupBuckets : ['all', 'work', 'personal'],
                    sidebarHidden: false
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error restoring data:', chrome.runtime.lastError)
                        setError('Failed to restore data. Using default settings.')

                        // Set default values as last resort
                        setItems([])
                        setBuckets(['all', 'work', 'personal'])
                        setSidebarHidden(false)
                    } else {
                        // Successfully restored
                        setItems(backupItems.length ? backupItems : [])
                        setBuckets(backupBuckets.length ? backupBuckets : ['all', 'work', 'personal'])
                        setSidebarHidden(false)
                    }
                    setIsLoading(false)
                    setError(null)
                })
            })
        } catch (err) {
            console.error('Error in recovery process:', err)
            setError('Recovery failed. Please reload the extension.')
            setIsLoading(false)
        }
    }

    const handleBucketSubmit = (e) => {
        e.preventDefault()

        if (editingBucket) {
            // Editing existing bucket
            if (newBucket && newBucket !== editingBucket && !buckets.includes(newBucket)) {
                // Update bucket name in all items
                const updatedItems = items.map(item => {
                    if (item.buckets && item.buckets.includes(editingBucket)) {
                        const newBuckets = [...item.buckets];
                        const index = newBuckets.indexOf(editingBucket);
                        if (index !== -1) {
                            newBuckets[index] = newBucket;
                        }
                        return { ...item, buckets: newBuckets };
                    }
                    return item;
                });

                setItems(updatedItems);

                // Update buckets list
                const updatedBuckets = [...buckets];
                const bucketIndex = updatedBuckets.indexOf(editingBucket);
                if (bucketIndex !== -1) {
                    updatedBuckets[bucketIndex] = newBucket;
                    setBuckets(updatedBuckets);
                }

                if (selectedBucket === editingBucket) {
                    setSelectedBucket(newBucket);
                }

                setEditingBucket(null);
                setNewBucket('');
                setShowBucketForm(false);
            }
        } else {
            // Adding new bucket
            if (newBucket && !buckets.includes(newBucket)) {
                setBuckets([...buckets, newBucket])
                setNewBucket('')
                setShowBucketForm(false)
            }
        }
    }

    const copyToClipboard = async (content, id) => {
        try {
            await navigator.clipboard.writeText(content)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 1000)
        } catch (err) {
            console.error('Failed to copy:', err)
            setError('Failed to copy to clipboard. Please check permissions.')
            setTimeout(() => setError(null), 3000)
        }
    }

    const deleteItem = (id, e) => {
        e.stopPropagation()
        setItemToDelete(id)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = () => {
        if (itemToDelete) {
            setItems(items.filter(item => item.id !== itemToDelete))
            setItemToDelete(null)
        } else if (bucketToDelete) {
            // Remove bucket from items
            const updatedItems = items.map(item => {
                if (item.buckets && item.buckets.includes(bucketToDelete)) {
                    return {
                        ...item,
                        buckets: item.buckets.filter(b => b !== bucketToDelete)
                    };
                }
                return item;
            });

            setItems(updatedItems);
            setBuckets(buckets.filter(b => b !== bucketToDelete));

            // If the deleted bucket was selected, reset to 'all'
            if (selectedBucket === bucketToDelete) {
                setSelectedBucket('all');
            }

            setBucketToDelete(null)
        }
        setShowDeleteConfirm(false)
    }

    const cancelDelete = () => {
        setItemToDelete(null)
        setBucketToDelete(null)
        setShowDeleteConfirm(false)
    }

    const deleteBucket = (bucketName, e) => {
        e.stopPropagation();
        if (bucketName === 'all') return; // Don't allow deletion of 'all' bucket
        setBucketToDelete(bucketName)
        setShowDeleteConfirm(true)
    }

    const editItem = (item, e) => {
        e.stopPropagation()
        setEditingItem(item)
        setNewItem({
            label: item.label,
            content: item.content,
            buckets: item.buckets || ['all']
        })
        setShowForm(true)
    }

    const editBucket = (bucketName, e) => {
        e.stopPropagation();

        if (bucketName === 'all') return; // Don't allow editing of 'all' bucket

        setEditingBucket(bucketName);
        setNewBucket(bucketName);
        setShowBucketForm(true);
    }

    const openLink = (content, e) => {
        e.stopPropagation()
        // Check if content is a valid URL
        let url = content
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }

        try {
            chrome.tabs.create({ url })
        } catch (error) {
            console.error('Failed to open link:', error)
            // Fallback to window.open if chrome.tabs is not available
            window.open(url, '_blank')
        }
    }

    const toggleBucketSelection = (bucket) => {
        setNewItem(prev => {
            const buckets = [...prev.buckets];

            if (buckets.includes(bucket)) {
                if (bucket !== 'all') {
                    // Remove if it's not 'all'
                    return {
                        ...prev,
                        buckets: buckets.filter(b => b !== bucket)
                    };
                }
                // Don't remove if it's the only bucket or 'all'
                return prev;
            } else {
                // Add the bucket
                return {
                    ...prev,
                    buckets: [...buckets, bucket]
                };
            }
        });
    }

    // Drag and drop handlers
    const handleDragStart = (e, item) => {
        setDraggedItem(item);
    };

    const handleDragOver = (e, item) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === item.id) return;
        setDropTarget(item.id);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetItem) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetItem.id) return;

        // Create a new array with the dragged item in the new position
        const newItems = [...items];
        const [movedItem] = newItems.splice(items.findIndex(item => item.id === draggedItem.id), 1);

        // Find the index in the original array where to insert
        const originalTargetIndex = items.findIndex(item => item.id === targetItem.id);
        newItems.splice(originalTargetIndex, 0, movedItem);

        setItems(newItems);
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTarget(null);
    };

    // Bucket drag handlers
    const handleBucketDragStart = (e, bucket) => {
        if (bucket === 'all') return; // Don't allow dragging the 'all' bucket
        setDraggedBucket(bucket);
    };

    const handleBucketDragOver = (e, bucket) => {
        e.preventDefault();
        if (!draggedBucket || draggedBucket === bucket || bucket === 'all') return;
        setDropTargetBucket(bucket);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleBucketDrop = (e, targetBucket) => {
        e.preventDefault();
        if (!draggedBucket || draggedBucket === targetBucket || targetBucket === 'all') return;

        // Create a new array with the dragged bucket in the new position
        const bucketsCopy = [...buckets];
        const sourceIndex = bucketsCopy.indexOf(draggedBucket);
        const targetIndex = bucketsCopy.indexOf(targetBucket);

        if (sourceIndex !== -1 && targetIndex !== -1) {
            bucketsCopy.splice(sourceIndex, 1);
            bucketsCopy.splice(targetIndex, 0, draggedBucket);
            setBuckets(bucketsCopy);
        }

        setDraggedBucket(null);
        setDropTargetBucket(null);
    };

    const handleBucketDragEnd = () => {
        setDraggedBucket(null);
        setDropTargetBucket(null);
    };

    // Memoize filteredItems to prevent unnecessary calculations
    const filteredItems = useMemo(() => {
        if (!items) return [];
        return selectedBucket === 'all'
            ? items
            : items.filter(item => item.buckets && item.buckets.includes(selectedBucket)) || [];
    }, [items, selectedBucket]);

    // Determine if content might be a URL
    const isLikelyUrl = (text) => {
        return text.includes('.') && !text.includes(' ') && text.length > 3;
    }

    // Function to truncate text with ellipsis
    const truncateText = (text, maxLength = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Create drag handlers objects to pass to components
    const itemDragHandlers = {
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd
    };

    const bucketDragHandlers = {
        handleBucketDragStart,
        handleBucketDragOver,
        handleBucketDrop,
        handleBucketDragEnd
    };

    // Create a showAddForm handler to pass to the Header
    const showAddForm = () => {
        setEditingItem(null);
        setNewItem({ label: '', content: '', buckets: ['all'] });
        setShowForm(true);
    };

    return (
        <div className="w-[580px] h-[580px] flex flex-col bg-[#111111] text-gray-100 overflow-hidden">
            {/* Header Component */}
            <Header
                sidebarHidden={sidebarHidden}
                setSidebarHidden={setSidebarHidden}
                showAddForm={showAddForm}
                isLoading={isLoading}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Error Message */}
                {error && (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <ErrorMessage
                            message={error}
                            onRetry={() => window.location.reload()}
                            className="max-w-md"
                        />
                    </div>
                )}

                {/* Loading State */}
                {isLoading && !error && (
                    <LoadingSpinner fullScreen size="lg" />
                )}

                {/* Main Content When Loaded */}
                {!isLoading && !error && (
                    <>
                        {/* Sidebar Component */}
                        {!sidebarHidden && (
                            <Sidebar
                                buckets={buckets}
                                selectedBucket={selectedBucket}
                                setSelectedBucket={setSelectedBucket}
                                editBucket={editBucket}
                                deleteBucket={deleteBucket}
                                showBucketForm={() => {
                                    setEditingBucket(null);
                                    setNewBucket('');
                                    setShowBucketForm(true);
                                }}
                                dragHandlers={bucketDragHandlers}
                            />
                        )}

                        {/* Main Content Area with Item List */}
                        <div className={`${sidebarHidden ? 'w-full' : 'w-2/3'} h-full p-4 overflow-y-auto`}>
                            {!items || filteredItems.length === 0 ? (
                                <EmptyState
                                    title={selectedBucket === 'all' ? 'Your clipboard is empty' : `No items in "${selectedBucket}"`}
                                    description="Start by adding your first item using the Add button."
                                    action={showAddForm}
                                    actionLabel="Add Item"
                                />
                            ) : (
                                <ItemList
                                    filteredItems={filteredItems}
                                    copyToClipboard={copyToClipboard}
                                    editItem={editItem}
                                    deleteItem={deleteItem}
                                    openLink={openLink}
                                    isLikelyUrl={isLikelyUrl}
                                    truncateText={truncateText}
                                    dragHandlers={itemDragHandlers}
                                    copiedId={copiedId}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <ItemFormModal
                showForm={showForm}
                setShowForm={setShowForm}
                handleSubmit={handleSubmit}
                newItem={newItem}
                setNewItem={setNewItem}
                buckets={buckets}
                toggleBucketSelection={toggleBucketSelection}
                showNewBucketField={showNewBucketField}
                setShowNewBucketField={setShowNewBucketField}
                newBucketInForm={newBucketInForm}
                setNewBucketInForm={setNewBucketInForm}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
            />

            <BucketFormModal
                showBucketForm={showBucketForm}
                setShowBucketForm={setShowBucketForm}
                newBucket={newBucket}
                setNewBucket={setNewBucket}
                handleBucketSubmit={handleBucketSubmit}
                editingBucket={editingBucket}
                setEditingBucket={setEditingBucket}
            />

            <ConfirmModal
                isVisible={showDeleteConfirm}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Confirm Delete"
                message={itemToDelete
                    ? "Are you sure you want to delete this item?"
                    : `Are you sure you want to delete the "${bucketToDelete}" bucket? This will remove it from all items.`}
                confirmButtonText="Delete"
                type="danger"
            />
        </div>
    )
}

export default App 