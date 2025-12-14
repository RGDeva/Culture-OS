'use client'

import { useState } from 'react'
import {
  Clock,
  Star,
  Users,
  Folder,
  Tag,
  ChevronRight,
  ChevronDown,
  Plus,
  FolderOpen,
  Home,
  Archive,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Music,
} from 'lucide-react'
import { SidebarView, FolderStructure } from '@/types/sessionVault'

interface VaultSidebarProps {
  activeView: SidebarView
  onViewChange: (view: SidebarView) => void
  folders: FolderStructure[]
  onCreateFolder: () => void
  onSelectFolder: (folderId: string) => void
  onDeleteFolder?: (folderId: string) => void
  selectedFolderId?: string
  tags: string[]
  onSelectTag: (tag: string) => void
  selectedTag?: string
  projectCounts: {
    recents: number
    favorites: number
    shared: number
    total: number
  }
  // Drag and drop handlers
  onFolderDragOver?: (e: React.DragEvent, folderId: string) => void
  onFolderDragLeave?: () => void
  onFolderDrop?: (e: React.DragEvent, folderId: string) => void
  dropTargetFolder?: string | null
}

export function VaultSidebar({
  activeView,
  onViewChange,
  folders,
  onCreateFolder,
  onSelectFolder,
  onDeleteFolder,
  selectedFolderId,
  tags,
  onSelectTag,
  selectedTag,
  projectCounts,
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
  dropTargetFolder,
}: VaultSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showFolders, setShowFolders] = useState(true)
  const [showTags, setShowTags] = useState(true)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getFolderTree = () => {
    const rootFolders = folders.filter(f => !f.parentId)
    const buildTree = (parentId: string | null): FolderStructure[] => {
      return folders
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
    }
    return { rootFolders, buildTree }
  }

  const { rootFolders, buildTree } = getFolderTree()

  const renderFolder = (folder: FolderStructure, depth: number = 0) => {
    const hasChildren = folders.some(f => f.parentId === folder.id)
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const isDropTarget = dropTargetFolder === folder.id

    return (
      <div key={folder.id}>
        <button
          onClick={() => {
            onSelectFolder(folder.id)
            if (hasChildren) {
              toggleFolder(folder.id)
            }
          }}
          onDragOver={(e) => onFolderDragOver?.(e, folder.id)}
          onDragLeave={onFolderDragLeave}
          onDrop={(e) => onFolderDrop?.(e, folder.id)}
          className={`group w-full flex items-center gap-2 px-3 py-1.5 text-sm font-mono transition-colors ${
            isSelected
              ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
              : isDropTarget
              ? 'dark:bg-cyan-400/30 bg-cyan-600/30 dark:text-cyan-400 text-cyan-700 border-2 border-dashed dark:border-cyan-400 border-cyan-600'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {hasChildren && (
            <span className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
          )}
          {!hasChildren && <span className="w-3" />}
          <FolderOpen
            className="h-4 w-4 flex-shrink-0"
            style={{ color: folder.color }}
          />
          <span className="flex-1 text-left truncate">{folder.name}</span>
          <span className="text-xs dark:text-green-400/50 text-green-700/50">
            {folder.projectIds.length}
          </span>
          {onDeleteFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete folder "${folder.name}"?`)) {
                  onDeleteFolder(folder.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              title="Delete folder"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div>
            {buildTree(folder.id).map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 border-r-2 dark:border-green-400/30 border-green-600/40 dark:bg-black bg-white h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-2 dark:border-green-400/30 border-green-600/40">
        <h2 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
          &gt; VAULT
        </h2>
      </div>

      {/* Quick Access */}
      <div className="p-2">
        <div className="text-xs font-bold font-mono dark:text-green-400/60 text-green-700/70 px-3 py-2">
          QUICK_ACCESS
        </div>
        <button
          onClick={() => onViewChange('recents')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors ${
            activeView === 'recents'
              ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span className="flex-1 text-left">Recents</span>
          <span className="text-xs dark:text-green-400/50 text-green-700/50">
            {projectCounts.recents}
          </span>
        </button>
        <button
          onClick={() => onViewChange('favorites')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors ${
            activeView === 'favorites'
              ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
          }`}
        >
          <Star className="h-4 w-4" />
          <span className="flex-1 text-left">Favorites</span>
          <span className="text-xs dark:text-green-400/50 text-green-700/50">
            {projectCounts.favorites}
          </span>
        </button>
        <button
          onClick={() => onViewChange('shared')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors ${
            activeView === 'shared'
              ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
          }`}
        >
          <Users className="h-4 w-4" />
          <span className="flex-1 text-left">Shared</span>
          <span className="text-xs dark:text-green-400/50 text-green-700/50">
            {projectCounts.shared}
          </span>
        </button>
      </div>

      {/* Folders */}
      <div className="p-2 border-t-2 dark:border-green-400/30 border-green-600/40">
        <div className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold font-mono dark:text-green-400/60 text-green-700/70">
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="flex items-center gap-2 hover:dark:bg-green-400/5 hover:bg-green-600/5 flex-1"
          >
            {showFolders ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <Music className="h-3 w-3" />
            <span className="flex-1 text-left">PROJECTS</span>
          </button>
          <button
            onClick={onCreateFolder}
            className="p-1 hover:dark:bg-green-400/20 hover:bg-green-600/20 rounded"
            aria-label="Create folder"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        {showFolders && (
          <div className="mt-1">
            {rootFolders.length > 0 ? (
              rootFolders.map(folder => renderFolder(folder))
            ) : (
              <div className="px-3 py-2 text-xs font-mono dark:text-green-400/50 text-green-700/50">
                No folders yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="p-2 border-t-2 dark:border-green-400/30 border-green-600/40">
        <button
          onClick={() => onViewChange('documents' as SidebarView)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors ${
            activeView === 'documents'
              ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span className="flex-1 text-left">Documents</span>
        </button>
        <div className="ml-6 space-y-0.5">
          <button
            onClick={() => onViewChange('documents' as SidebarView)}
            className="w-full flex items-center gap-2 px-3 py-1 text-xs font-mono dark:text-green-400/60 text-green-700/60 hover:dark:bg-green-400/10 hover:bg-green-600/10"
          >
            <FileCheck className="h-3 w-3" />
            <span>Split Sheets</span>
          </button>
          <button
            onClick={() => onViewChange('documents' as SidebarView)}
            className="w-full flex items-center gap-2 px-3 py-1 text-xs font-mono dark:text-green-400/60 text-green-700/60 hover:dark:bg-green-400/10 hover:bg-green-600/10"
          >
            <FileText className="h-3 w-3" />
            <span>Contracts</span>
          </button>
          <button
            onClick={() => onViewChange('documents' as SidebarView)}
            className="w-full flex items-center gap-2 px-3 py-1 text-xs font-mono dark:text-green-400/60 text-green-700/60 hover:dark:bg-green-400/10 hover:bg-green-600/10"
          >
            <FileSpreadsheet className="h-3 w-3" />
            <span>Royalty Reports</span>
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="p-2 border-t-2 dark:border-green-400/30 border-green-600/40">
        <button
          onClick={() => setShowTags(!showTags)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold font-mono dark:text-green-400/60 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5"
        >
          {showTags ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span className="flex-1 text-left">TAGS</span>
        </button>
        {showTags && (
          <div className="mt-1">
            {tags.length > 0 ? (
              tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm font-mono transition-colors ${
                    selectedTag === tag
                      ? 'dark:bg-cyan-400/20 bg-cyan-600/20 dark:text-cyan-400 text-cyan-700'
                      : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  <span className="flex-1 text-left truncate">{tag}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs font-mono dark:text-green-400/50 text-green-700/50">
                No tags yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Storage Info */}
      <div className="mt-auto p-4 border-t-2 dark:border-green-400/30 border-green-600/40">
        <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
          <div className="flex justify-between mb-1">
            <span>STORAGE</span>
            <span>2.4 GB / 25 GB</span>
          </div>
          <div className="w-full h-1 dark:bg-green-400/20 bg-green-600/20 rounded-full overflow-hidden">
            <div
              className="h-full dark:bg-green-400 bg-green-600"
              style={{ width: '9.6%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
