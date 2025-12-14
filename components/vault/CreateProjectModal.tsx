'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, FolderPlus, Loader2 } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: any) => void
  userId: string
}

export function CreateProjectModal({ isOpen, onClose, onSuccess, userId }: CreateProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#00ff41')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const response = await fetch('/api/session-vault/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          description,
          color,
          status: 'ACTIVE',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const data = await response.json()
      onSuccess(data.project)
      
      // Reset form
      setTitle('')
      setDescription('')
      setColor('#00ff41')
      onClose()
    } catch (err: any) {
      console.error('[CREATE_PROJECT] Error:', err)
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const colorPresets = [
    '#00ff41', // Green
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffff00', // Yellow
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#a29bfe', // Purple
    '#fd79a8', // Pink
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b-2 dark:border-green-400/50 border-green-600/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 dark:text-green-400 text-green-700" />
            <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
              &gt; CREATE_PROJECT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 border-2 dark:border-red-400 border-red-600 dark:bg-red-400/10 bg-red-600/10 text-sm font-mono dark:text-red-400 text-red-700">
              {error}
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; PROJECT_TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="My New Beat Pack"
              className="w-full px-3 py-2 font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional project description..."
              rows={3}
              className="w-full px-3 py-2 font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40 resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; PROJECT_COLOR
            </label>
            <div className="grid grid-cols-8 gap-2 mb-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`h-10 w-10 rounded border-2 transition-all ${
                    color === preset
                      ? 'border-white scale-110'
                      : 'dark:border-green-400/30 border-green-600/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 border-2 dark:border-green-400/50 border-green-600/50 cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Info */}
          <div className="px-3 py-2 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
            <p className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
              <strong>Projects</strong> help you organize related files, collaborate with others, and track versions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={creating || !title.trim()}
              className="flex-1 font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  CREATING...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  CREATE_PROJECT
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="font-mono dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
