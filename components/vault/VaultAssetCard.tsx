'use client'

import React, { useState } from 'react'
import { Music2, Edit2, Check, X, MoreVertical, Download, Share2, Trash2 } from 'lucide-react'
import { VaultAsset } from '@/types/vault'

interface VaultAssetCardProps {
  asset: VaultAsset
  onUpdate: (id: string, updates: Partial<VaultAsset>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClick: () => void
}

export function VaultAssetCard({ asset, onUpdate, onDelete, onClick }: VaultAssetCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(asset.title)
  const [showMenu, setShowMenu] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (editedTitle.trim() === asset.title) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    try {
      await onUpdate(asset.id, { title: editedTitle.trim() })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update asset:', error)
      setEditedTitle(asset.title) // Revert on error
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedTitle(asset.title)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${asset.title}"?`)) return
    
    try {
      await onDelete(asset.id)
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  const getStatusColor = () => {
    switch (asset.status) {
      case 'PROCESSING':
        return 'dark:bg-yellow-400/20 bg-yellow-600/20 dark:text-yellow-400 text-yellow-700 dark:border-yellow-400/30 border-yellow-600/40'
      case 'READY':
        return 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 dark:border-green-400/30 border-green-600/40'
      case 'ERROR':
        return 'dark:bg-red-400/20 bg-red-600/20 dark:text-red-400 text-red-700 dark:border-red-400/30 border-red-600/40'
      default:
        return 'dark:bg-gray-400/20 bg-gray-600/20 dark:text-gray-400 text-gray-700 dark:border-gray-400/30 border-gray-600/40'
    }
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80 hover:dark:border-green-400 hover:border-green-600 transition-all group">
      {/* Header */}
      <div className="p-4 border-b dark:border-green-400/20 border-green-600/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="dark:text-green-400 text-green-700 mt-1">
              <Music2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave()
                      if (e.key === 'Escape') handleCancel()
                    }}
                    className="flex-1 px-2 py-1 border dark:border-green-400/50 border-green-600/50 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                    autoFocus
                    disabled={saving}
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-1 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="p-1 dark:text-red-400 text-red-700 hover:dark:bg-red-400/10 hover:bg-red-600/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onClick}
                  className="text-left w-full group/title"
                >
                  <h3 className="font-mono text-sm dark:text-green-400 text-green-700 truncate group-hover/title:underline">
                    {asset.title}
                  </h3>
                </button>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 border font-mono ${getStatusColor()}`}>
                  {asset.status}
                </span>
                {asset.genre && (
                  <span className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                    {asset.genre}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 dark:bg-black bg-white border-2 dark:border-green-400/30 border-green-600/40 shadow-lg z-20">
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 flex items-center gap-2"
                  >
                    <Edit2 className="h-3 w-3" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement download
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement share
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 flex items-center gap-2"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>
                  <div className="border-t dark:border-green-400/20 border-green-600/30" />
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleDelete()
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-mono dark:text-red-400 text-red-700 hover:dark:bg-red-400/10 hover:bg-red-600/10 flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="dark:text-green-400/50 text-green-700/60 mb-1">TYPE</div>
            <div className="dark:text-green-400 text-green-700">{asset.assetType}</div>
          </div>
          {asset.bpm && (
            <div>
              <div className="dark:text-green-400/50 text-green-700/60 mb-1">BPM</div>
              <div className="dark:text-green-400 text-green-700">{asset.bpm}</div>
            </div>
          )}
          {asset.key && (
            <div>
              <div className="dark:text-green-400/50 text-green-700/60 mb-1">KEY</div>
              <div className="dark:text-green-400 text-green-700">{asset.key}</div>
            </div>
          )}
          <div>
            <div className="dark:text-green-400/50 text-green-700/60 mb-1">UPLOADED</div>
            <div className="dark:text-green-400 text-green-700">
              {new Date(asset.uploadedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {asset.tags && asset.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {asset.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t dark:border-green-400/20 border-green-600/30 flex items-center justify-between">
        <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
          {asset.fileSize ? `${(asset.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
        </div>
        <button
          onClick={onClick}
          className="text-xs font-mono dark:text-green-400 text-green-700 hover:underline"
        >
          VIEW_DETAILS &gt;
        </button>
      </div>
    </div>
  )
}
