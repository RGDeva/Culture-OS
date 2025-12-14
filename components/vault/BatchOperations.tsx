'use client'

import { useState } from 'react'
import { CreativeAsset } from '@/types/vault'
import { VaultFolder } from '@/types/vaultFolders'
import { Button } from '@/components/ui/button'
import {
  FolderInput,
  Tag,
  Trash2,
  Download,
  Share2,
  X,
  Check,
} from 'lucide-react'

interface BatchOperationsProps {
  selectedAssets: CreativeAsset[]
  folders: VaultFolder[]
  onClearSelection: () => void
  onMoveToFolder: (folderId: string) => void
  onAddTags: (tags: string[]) => void
  onDelete: () => void
  onDownload: () => void
}

export function BatchOperations({
  selectedAssets,
  folders,
  onClearSelection,
  onMoveToFolder,
  onAddTags,
  onDelete,
  onDownload,
}: BatchOperationsProps) {
  const [showFolderMenu, setShowFolderMenu] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInput, setTagInput] = useState('')

  if (selectedAssets.length === 0) return null

  const handleAddTags = () => {
    if (tagInput.trim()) {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
      onAddTags(tags)
      setTagInput('')
      setShowTagInput(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Selection Count */}
          <div className="flex items-center gap-2 pr-3 border-r-2 dark:border-green-400/30 border-green-600/40">
            <Check className="h-4 w-4 dark:text-green-400 text-green-700" />
            <span className="text-sm font-mono dark:text-green-400 text-green-700">
              {selectedAssets.length} selected
            </span>
          </div>

          {/* Move to Folder */}
          <div className="relative">
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors"
            >
              <FolderInput className="h-4 w-4" />
              MOVE_TO_FOLDER
            </button>

            {showFolderMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-64 max-h-64 overflow-y-auto border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white shadow-lg">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMoveToFolder(folder.id)
                      setShowFolderMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{folder.name}</span>
                    <span className="text-xs dark:text-green-400/50 text-green-700/50">
                      {folder.assetIds.length}
                    </span>
                  </button>
                ))}
                {folders.length === 0 && (
                  <div className="px-3 py-4 text-sm font-mono dark:text-green-400/50 text-green-700/50 text-center">
                    No folders available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Tags */}
          <div className="relative">
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors"
            >
              <Tag className="h-4 w-4" />
              ADD_TAGS
            </button>

            {showTagInput && (
              <div className="absolute bottom-full mb-2 left-0 w-64 border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white shadow-lg p-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTags()}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-2 py-1.5 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40 mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTags}
                    className="flex-1 px-2 py-1 text-xs font-mono dark:bg-green-400 dark:text-black bg-green-600 text-white hover:opacity-80"
                  >
                    ADD
                  </button>
                  <button
                    onClick={() => {
                      setShowTagInput(false)
                      setTagInput('')
                    }}
                    className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download */}
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors"
          >
            <Download className="h-4 w-4" />
            DOWNLOAD
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm(`Delete ${selectedAssets.length} asset(s)?`)) {
                onDelete()
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-mono border-2 dark:border-red-400/50 border-red-600/50 dark:text-red-400 text-red-700 hover:dark:bg-red-400/10 hover:bg-red-600/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            DELETE
          </button>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1.5 dark:text-green-400 text-green-700 hover:opacity-70 ml-2"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
