/* global chrome */
import { useState, useEffect } from 'react'

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

  // Load items and buckets from storage when component mounts
  useEffect(() => {
    chrome.storage.sync.get(['clipboardItems', 'clipboardBuckets', 'sidebarHidden'], (result) => {
      if (result.clipboardItems) {
        setItems(result.clipboardItems)
      }
      if (result.clipboardBuckets) {
        setBuckets(result.clipboardBuckets)
      }
      if (result.sidebarHidden !== undefined) {
        setSidebarHidden(result.sidebarHidden)
      }
    })
  }, [])

  // Save items and buckets to storage whenever they change
  useEffect(() => {
    chrome.storage.sync.set({ clipboardItems: items })
  }, [items])

  useEffect(() => {
    chrome.storage.sync.set({ clipboardBuckets: buckets })
  }, [buckets])

  useEffect(() => {
    chrome.storage.sync.set({ sidebarHidden: sidebarHidden })
  }, [sidebarHidden])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newItem.label && newItem.content) {
      let bucketsToUse = [...newItem.buckets]

      // If creating a new bucket within the form
      if (showNewBucketField && newBucketInForm) {
        if (!buckets.includes(newBucketInForm)) {
          setBuckets([...buckets, newBucketInForm])
          if (!bucketsToUse.includes(newBucketInForm)) {
            bucketsToUse.push(newBucketInForm)
          }
        }
      }

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
    }
  }

  const deleteItem = (id, e) => {
    e.stopPropagation()
    setItems(items.filter(item => item.id !== id))
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

  const deleteBucket = (bucketName, e) => {
    e.stopPropagation();

    if (bucketName === 'all') return; // Don't allow deletion of 'all' bucket

    // Remove bucket from items
    const updatedItems = items.map(item => {
      if (item.buckets && item.buckets.includes(bucketName)) {
        return {
          ...item,
          buckets: item.buckets.filter(b => b !== bucketName)
        };
      }
      return item;
    });

    setItems(updatedItems);
    setBuckets(buckets.filter(b => b !== bucketName));

    // If the deleted bucket was selected, reset to 'all'
    if (selectedBucket === bucketName) {
      setSelectedBucket('all');
    }
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
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const filteredItems = items && selectedBucket === 'all'
    ? items
    : items?.filter(item => item.buckets && item.buckets.includes(selectedBucket)) || []

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
    <div className="w-[550px] h-[600px] flex flex-col bg-[#111111] text-gray-100 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarHidden(!sidebarHidden)}
            className="mr-3 p-1.5 rounded-md hover:bg-[#333] transition-colors"
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
          <h1 className="text-2xl font-bold text-white">
            Clippit
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setNewItem({ label: '', content: '', buckets: ['all'] })
            setShowForm(true)
          }}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
        >
          + Add
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!sidebarHidden && (
          <div className="w-1/3 h-full border-r border-[#2A2A2A] overflow-y-auto bg-[#171717]">
            <div className="p-4">
              <h2 className="text-sm uppercase text-gray-400 font-medium mb-3">Buckets</h2>
              <div className="space-y-1">
                {buckets.map(bucket => (
                  <div
                    key={bucket}
                    className="group relative"
                  >
                    <button
                      onClick={() => setSelectedBucket(bucket)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedBucket === bucket
                        ? 'bg-gray-700 text-white'
                        : 'hover:bg-[#2A2A2A] text-gray-300'
                        }`}
                    >
                      {bucket === 'all' ? 'All Items' : bucket}
                    </button>
                    {bucket !== 'all' && (
                      <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                        <button
                          onClick={(e) => editBucket(bucket, e)}
                          className="p-1 rounded hover:bg-[#3A3A3A] text-gray-400 hover:text-white transition-colors"
                          title="Edit bucket"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            if (window.confirm(`Are you sure you want to delete the "${bucket}" bucket? This will remove it from all items.`)) {
                              deleteBucket(bucket, e);
                            }
                          }}
                          className="p-1 rounded hover:bg-[#3A3A3A] text-gray-400 hover:text-red-400 transition-colors"
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
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  + New Bucket
                </button>
              </div>
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
                  className={`group relative p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] cursor-pointer hover:shadow-md ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                  onClick={() => copyToClipboard(item.content, item.id)}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDrop={(e) => handleDrop(e, item)}
                  onDragEnd={handleDragEnd}
                >
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
                    <div className="absolute inset-0 bg-gray-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-medium">
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
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isLikelyUrl(item.content) && (
                      <button
                        onClick={(e) => openLink(item.content, e)}
                        className="p-1.5 rounded-md hover:bg-[#444444] text-gray-400 hover:text-blue-400 transition-colors"
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
                      className="p-1.5 rounded-md hover:bg-[#444444] text-gray-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => deleteItem(item.id, e)}
                      className="p-1.5 rounded-md hover:bg-[#444444] text-gray-400 hover:text-red-400 transition-colors"
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
      </div>

      {/* Popup Form for New Item */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="bg-[#1A1A1A] p-6 rounded-lg w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-white">
              {editingItem ? 'Edit Item' : 'Add New Item'}
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
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${newItem.buckets.includes(bucket)
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
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-colors font-medium"
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
                  className="px-4 py-2 hover:bg-[#333333] text-gray-300 rounded-md transition-colors"
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowBucketForm(false)}
        >
          <div
            className="bg-[#1A1A1A] p-6 rounded-lg w-80 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-white">
              {editingBucket ? 'Edit Bucket' : 'Add New Bucket'}
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
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-colors font-medium"
                >
                  {editingBucket ? 'Save Changes' : 'Add Bucket'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBucketForm(false);
                    setEditingBucket(null);
                  }}
                  className="px-4 py-2 hover:bg-[#333333] text-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
