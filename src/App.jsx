/* global chrome */
import { useState, useEffect, useMemo, useCallback } from 'react'

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

  return (
    <div className="w-[580px] h-[580px] flex flex-col bg-[#111111] text-gray-100 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#161616] to-[#1D1D1D]">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarHidden(!sidebarHidden)}
            className="mr-3 p-1.5 rounded-md hover:bg-[#333] transition-all duration-200"
            title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarHidden ? (
                <path d="M3 12h18M3 6h18M3 18h18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="flex items-center">
            <img src="/clippit_icon_nbg.png" alt="Clippit" className="w-8 h-8 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center crisp-text">
                Clippit <span className="ml-2 text-xs font-normal text-gray-400 bg-[#252525] px-2 py-0.5 rounded">v1.0.0-beta</span>
              </h1>
              <div className="text-xs text-gray-400">
                by <a href="https://github.com/SamayXd" className="text-blue-400 hover:underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">SamayXd</a>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setNewItem({ label: '', content: '', buckets: ['all'] })
            setShowForm(true)
          }}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all duration-200 ease-in-out hover:shadow-md transform hover:translate-y-[-1px] font-medium"
          disabled={isLoading}
        >
          + Add
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Error message */}
        {error && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="bg-red-900/20 text-red-400 p-4 rounded-md max-w-md">
              <div className="flex items-center mb-2">
                <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-3 py-1 bg-red-700 hover:bg-red-600 rounded-md text-white transition-all duration-200"
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 w-10 h-10 border-4 border-gray-700 border-t-gray-300 rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading your clipboard items...</p>
            </div>
          </div>
        )}

        {/* Main content when loaded */}
        {!isLoading && !error && (
          <>
            {/* Sidebar */}
            {!sidebarHidden && (
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
                          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 opacity-50 animate-pulse"></div>
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
                              onClick={(e) => {
                                deleteBucket(bucket, e);
                              }}
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
                      onClick={() => {
                        setEditingBucket(null);
                        setNewBucket('');
                        setShowBucketForm(true);
                      }}
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
            )}

            <div className={`${sidebarHidden ? 'w-full' : 'w-2/3'} h-full p-4 overflow-y-auto`}>
              {!items || filteredItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p>{selectedBucket === 'all' ? 'Your clipboard is empty' : `No items in "${selectedBucket}"`}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group relative p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] cursor-pointer hover:shadow-md transition-all duration-200 ease-in-out ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                      onClick={() => copyToClipboard(item.content, item.id)}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={(e) => handleDragOver(e, item)}
                      onDrop={(e) => handleDrop(e, item)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Drop indicator */}
                      {dropTarget === item.id && dropTarget !== draggedItem?.id && (
                        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-white opacity-30 animate-pulse"></div>
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
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Popup Form for New Item */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="bg-[#1A1A1A] p-6 rounded-lg w-96 shadow-xl animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
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
                <button
                  type="submit"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-all duration-200 ease-in-out hover:shadow-md transform hover:scale-[1.02] font-medium"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                    setShowNewBucketField(false)
                  }}
                  className="px-4 py-2 hover:bg-[#333333] text-gray-300 rounded-md transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form for New/Edit Bucket */}
      {showBucketForm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowBucketForm(false)}
        >
          <div
            className="bg-[#1A1A1A] p-6 rounded-lg w-80 shadow-xl animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
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
                    <path d="M19 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2z"></path>
                    <path d="M17 7l-5-5-5 5"></path>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
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
                  placeholder="e.g., 'Work' or 'Personal'"
                  value={newBucket}
                  onChange={(e) => setNewBucket(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-gray-100"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-all duration-200 ease-in-out hover:shadow-md transform hover:scale-[1.02] font-medium"
                >
                  {editingBucket ? 'Save Changes' : 'Add Bucket'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBucketForm(false);
                    setEditingBucket(null);
                  }}
                  className="px-4 py-2 hover:bg-[#333333] text-gray-300 rounded-md transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-[#1A1A1A] p-6 rounded-lg w-80 shadow-xl animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
              <svg className="mr-2 text-red-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Confirm Delete
            </h2>
            <p className="text-gray-300 mb-6">
              {itemToDelete
                ? "Are you sure you want to delete this item?"
                : `Are you sure you want to delete the "${bucketToDelete}" bucket? This will remove it from all items.`}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-all duration-200 ease-in-out hover:shadow-md transform hover:scale-[1.02] font-medium"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 hover:bg-[#333333] text-gray-300 rounded-md transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
