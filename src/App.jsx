/* global chrome */
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ label: '', content: '' })

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
      setItems([...items, { ...newItem, id: Date.now() }])
      setNewItem({ label: '', content: '' })
    }
  }

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="w-[350px] min-h-[400px] p-4 bg-white text-gray-800">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Clippit</h1>

      {/* Add new item form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Label (e.g., 'Work Email')"
          value={newItem.label}
          onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <textarea
          placeholder="Content to copy"
          value={newItem.content}
          onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows="2"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Item
        </button>
      </form>

      {/* List of items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative p-3 border border-gray-200 rounded-md hover:border-blue-300 cursor-pointer transition-colors"
            onClick={() => copyToClipboard(item.content)}
          >
            <div className="font-medium text-gray-700">{item.label}</div>
            <div className="text-sm text-gray-500 truncate">{item.content}</div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteItem(item.id)
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No items yet. Add something to get started!
        </p>
      )}
    </div>
  )
}

export default App
