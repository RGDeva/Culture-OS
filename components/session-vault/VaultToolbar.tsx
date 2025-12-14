'use client'

import { SortBy, SortOrder } from '@/types/sessionVault'
import {
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  FileText,
  HardDrive,
  Type,
  Activity,
} from 'lucide-react'

interface VaultToolbarProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  sortBy: SortBy
  onSortByChange: (sortBy: SortBy) => void
  sortOrder: SortOrder
  onSortOrderChange: (order: SortOrder) => void
  selectedCount: number
  onBulkAction?: (action: string) => void
}

export function VaultToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  selectedCount,
  onBulkAction,
}: VaultToolbarProps) {
  const sortOptions: Array<{ value: SortBy; label: string; icon: any }> = [
    { value: 'name', label: 'Name', icon: Type },
    { value: 'date-modified', label: 'Date Modified', icon: Calendar },
    { value: 'date-created', label: 'Date Created', icon: Calendar },
    { value: 'size', label: 'Size', icon: HardDrive },
    { value: 'type', label: 'Type', icon: FileText },
    { value: 'status', label: 'Status', icon: Activity },
  ]

  const currentSort = sortOptions.find(opt => opt.value === sortBy)

  return (
    <div className="border-b-2 dark:border-green-400/30 border-green-600/40 p-3 flex items-center justify-between dark:bg-black/50 bg-white/80">
      {/* Left: Selection Info */}
      <div className="flex items-center gap-3">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm font-mono dark:text-green-400 text-green-700">
              {selectedCount} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkAction?.('move')}
                className="px-3 py-1 text-xs border dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 hover:dark:bg-cyan-400/10 hover:bg-cyan-600/10 font-mono"
              >
                MOVE
              </button>
              <button
                onClick={() => onBulkAction?.('tag')}
                className="px-3 py-1 text-xs border dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 hover:dark:bg-cyan-400/10 hover:bg-cyan-600/10 font-mono"
              >
                TAG
              </button>
              <button
                onClick={() => onBulkAction?.('delete')}
                className="px-3 py-1 text-xs border dark:border-red-400/50 border-red-600/50 dark:text-red-400 text-red-700 hover:dark:bg-red-400/10 hover:bg-red-600/10 font-mono"
              >
                DELETE
              </button>
            </div>
          </>
        ) : (
          <span className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
            All Projects
          </span>
        )}
      </div>

      {/* Right: View & Sort Controls */}
      <div className="flex items-center gap-2">
        {/* Sort By */}
        <div className="flex items-center gap-1 border dark:border-green-400/50 border-green-600/50">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="px-2 py-1 text-xs font-mono dark:bg-black bg-white dark:text-green-400 text-green-700 border-none focus:outline-none cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 border-l dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* View Mode */}
        <div className="flex items-center border dark:border-green-400/50 border-green-600/50">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-2 py-1 ${
              viewMode === 'grid'
                ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-2 py-1 border-l dark:border-green-400/50 border-green-600/50 ${
              viewMode === 'list'
                ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
