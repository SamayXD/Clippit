/* global chrome */
import { useState, useEffect } from 'react'

function App() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ label: '', content: '' })
  const [showForm, setShowForm] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  // Load items from storage when component mounts
  useEffect(() => {
    chrome.storage.sync.get(['clipboardItems'], (result) => {
      if (result.clipboardItems) {
        setItems(result.clipboardItems)
      }
    })
  }, [])

  // Save items to storage whenever they change
  useEffect(() => {
    chrome.storage.sync.set({ clipboardItems: items })
  }, [items])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newItem.label && newItem.content) {
      setItems([{ ...newItem, id: Date.now() }, ...items])
      setNewItem({ label: '', content: '' })
      setShowForm(false)
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

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="w-[350px] min-h-[400px] p-4 bg-[#1E1E1E] text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Clippit
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors font-medium"
        >
          + Add
        </button>
      </div>

      {/* List of items */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative p-3 bg-[#2D2D2D] rounded-lg hover:bg-[#353535] transition-colors cursor-pointer"
            onClick={() => copyToClipboard(item.content, item.id)}
          >
            {copiedId === item.id && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm animate-fadeIn">
                <span className="text-white font-medium">
                  Copied!
                </span>
              </div>
            )}
            <div className="font-medium text-gray-200 mb-1">{item.label}</div>
            <div className="text-sm text-gray-400 break-words">{item.content}</div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteItem(item.id)
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <div className="text-4xl mb-2">📋</div>
          <p>Your clipboard is empty</p>
        </div>
      )}

      {/* Popup Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="bg-[#2D2D2D] p-6 rounded-lg w-80 shadow-xl animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-white">Add New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Label</label>
                <input
                  type="text"
                  placeholder="e.g., 'Work Email'"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  placeholder="Content to copy"
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-[#404040] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                  rows="3"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md transition-colors font-medium"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 hover:bg-[#3D3D3D] text-gray-300 rounded-md transition-colors"
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
