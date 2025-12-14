'use client'

import { useState } from 'react'
import { VaultFolder } from '@/types/vaultFolders'
import { Button } from '@/components/ui/button'
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Music,
  Mic,
  Headphones,
  Disc,
  Radio,
  Guitar,
} from 'lucide-react'
import { FOLDER_COLORS } from '@/types/vaultFolders'

interface FolderManagerProps {
  folders: VaultFolder[]
  currentFolderId?: string
  onFolderSelect: (folderId: string | null) => void
  onCreateFolder: (name: string, color?: string, parentId?: string) => void
  onUpdateFolder: (folderId: string, updates: Partial<VaultFolder>) => void
  onDeleteFolder: (folderId: string) => void
}

export function FolderManager({
  folders,
  currentFolderId,
  onFolderSelect,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
}: FolderManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('green')

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor)
      setNewFolderName('')
      setNewFolderColor('green')
      setShowCreateModal(false)
    }
  }

  const renderFolder = (folder: VaultFolder, depth: number = 0) => {
    const isSelected = currentFolderId === folder.id
    const isExpanded = expandedFolders.has(folder.id)
    const hasChildren = folders.some(f => f.parentId === folder.id)
    const children = folders.filter(f => f.parentId === folder.id)

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
            isSelected
              ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(folder.id)
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Folder Icon */}
          <Folder
            className="h-4 w-4 flex-shrink-0"
            style={{ color: getFolderColor(folder.color) }}
          />

          {/* Folder Name */}
          <div
            onClick={() => onFolderSelect(folder.id)}
            className="flex-1 text-sm font-mono truncate"
          >
            {folder.name}
          </div>

          {/* Asset Count */}
          <span className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
            {folder.assetIds.length}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingFolder(folder.id)
              }}
              className="p-1 hover:dark:bg-green-400/20 hover:bg-green-600/20 rounded"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete folder "${folder.name}"?`)) {
                  onDeleteFolder(folder.id)
                }
              }}
              className="p-1 hover:dark:bg-red-400/20 hover:bg-red-600/20 rounded"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && children.map(child => renderFolder(child, depth + 1))}
      </div>
    )
  }

  const rootFolders = folders.filter(f => !f.parentId)

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80">
      {/* Header */}
      <div className="border-b-2 dark:border-green-400/30 border-green-600/40 p-3 flex items-center justify-between">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
          FOLDERS
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1 dark:text-green-400 text-green-700 hover:opacity-70"
          title="Create folder"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      {/* All Assets */}
      <div
        onClick={() => onFolderSelect(null)}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          !currentFolderId
            ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
            : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
        }`}
      >
        <Music className="h-4 w-4" />
        <span className="flex-1 text-sm font-mono">All Assets</span>
      </div>

      {/* Folder List */}
      <div className="max-h-96 overflow-y-auto">
        {rootFolders.map(folder => renderFolder(folder))}
      </div>

      {/* Empty State */}
      {folders.length === 0 && (
        <div className="p-6 text-center text-sm font-mono dark:text-green-400/50 text-green-700/50">
          No folders yet. Create one to organize your assets.
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
          <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-md w-full p-6">
            <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700 mb-4">
              &gt; CREATE_FOLDER
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-1 block">
                  NAME:
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My Folder"
                  className="w-full px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                  autoFocus
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                  COLOR:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewFolderColor(color.value)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        newFolderColor === color.value
                          ? 'border-white scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: getFolderColor(color.value) }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono disabled:opacity-50"
                >
                  CREATE
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewFolderName('')
                    setNewFolderColor('green')
                  }}
                  variant="outline"
                  className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getFolderColor(color?: string): string {
  const colors: Record<string, string> = {
    green: '#4ade80',
    cyan: '#22d3ee',
    blue: '#60a5fa',
    purple: '#a78bfa',
    pink: '#f472b6',
    red: '#f87171',
    orange: '#fb923c',
    yellow: '#fbbf24',
  }
  return colors[color || 'green'] || colors.green
}
