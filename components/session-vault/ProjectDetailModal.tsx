'use client'

import { useState } from 'react'
import { Project, Asset, ProjectStatus } from '@/types/sessionVault'
import { Button } from '@/components/ui/button'
import {
  X,
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Edit2,
  Upload,
  Music,
  FileAudio,
  Disc,
  FileText,
  Users,
  DollarSign,
  ShoppingCart,
  Percent,
} from 'lucide-react'
import { AudioPlayer } from '@/components/vault/AudioPlayer'
import { DAW_MAP } from '@/types/sessionVault'
import { SplitsEditor, Split } from './SplitsEditor'
import { MarketplaceListingModal, MarketplaceListing } from './MarketplaceListingModal'

interface ProjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  assets: Asset[]
  onUpdate: (updates: Partial<Project>) => void
  onDelete: () => void
}

export function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  assets,
  onUpdate,
  onDelete,
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'folders' | 'splits'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(project.title)
  const [editedNotes, setEditedNotes] = useState(project.notes || '')
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false)
  const [showSplitsEditor, setShowSplitsEditor] = useState(false)

  if (!isOpen) return null

  const primaryAsset = assets.find(a => a.isPrimary) || assets.find(a => a.type === 'MASTER_AUDIO') || assets[0]
  const masterAssets = assets.filter(a => a.type === 'MASTER_AUDIO' || a.type === 'ALT_BOUNCE')
  const stemAssets = assets.filter(a => a.type === 'STEM')
  const dawAssets = assets.filter(a => a.type === 'DAW_SESSION')
  const otherAssets = assets.filter(a => !['MASTER_AUDIO', 'ALT_BOUNCE', 'STEM', 'DAW_SESSION'].includes(a.type))

  const handleSave = () => {
    onUpdate({
      title: editedTitle,
      notes: editedNotes,
    })
    setIsEditing(false)
  }

  const handleStatusChange = (status: ProjectStatus) => {
    onUpdate({ status })
  }

  const handleSaveSplits = async (splits: Split[]) => {
    try {
      // Save splits to project metadata
      console.log('[SPLITS] Saving splits:', splits)
      // In a real app, you'd save to database
      // For now, store in project notes
      const splitsData = JSON.stringify(splits, null, 2)
      onUpdate({
        notes: `${project.notes || ''}\n\n--- SPLITS DATA ---\n${splitsData}`.trim()
      })
    } catch (error) {
      console.error('[SPLITS] Error saving:', error)
    }
  }

  const handleGenerateContract = async () => {
    console.log('[CONTRACT] Generating contract for project:', project.id)
    // TODO: Implement contract generation
    alert('Contract generation coming soon! This will create a PDF agreement with all split details.')
  }

  const handleListOnMarketplace = async (listing: MarketplaceListing) => {
    try {
      const response = await fetch('/api/vault/list-on-marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      })

      if (!response.ok) {
        throw new Error('Failed to list on marketplace')
      }

      const data = await response.json()
      console.log('[MARKETPLACE] Listed:', data.listing.id)
      
      // Update project status
      onUpdate({ status: 'READY_FOR_SALE' })
      
      setShowMarketplaceModal(false)
    } catch (error: any) {
      console.error('[MARKETPLACE] Error:', error)
      throw error
    }
  }

  const handleDownloadFile = async (assetId: string, filename: string) => {
    try {
      const response = await fetch(`/api/vault/download/${assetId}`)
      if (response.redirected) {
        window.open(response.url, '_blank')
      } else {
        const data = await response.json()
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('[DOWNLOAD] Error:', error)
      alert('Failed to download file')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/90 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="border-b-2 dark:border-green-400/30 border-green-600/40 p-4">
          <div className="flex items-start justify-between mb-3">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-2xl font-bold font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                &gt; {project.title}
              </h2>
            )}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="dark:bg-green-400 dark:text-black bg-green-600 text-white font-mono"
                  >
                    SAVE
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedTitle(project.title)
                      setEditedNotes(project.notes || '')
                    }}
                    size="sm"
                    variant="outline"
                    className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
                  >
                    CANCEL
                  </Button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 dark:text-green-400 text-green-700 hover:opacity-70"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 dark:text-green-400 text-green-700 hover:opacity-70"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tags & Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {project.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 border dark:border-cyan-400/50 dark:text-cyan-400 border-cyan-600/50 text-cyan-700 font-mono uppercase"
              >
                {tag}
              </span>
            ))}
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="text-xs px-2 py-1 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono cursor-pointer"
            >
              <option value="IDEA">● IDEA</option>
              <option value="IN_PROGRESS">● IN PROGRESS</option>
              <option value="READY_FOR_SALE">● READY FOR SALE</option>
              <option value="PLACED">● PLACED</option>
              <option value="LOCKED">● LOCKED</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 dark:border-green-400/30 border-green-600/40 flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-mono text-sm border-r-2 dark:border-green-400/30 border-green-600/40 transition-colors ${
              activeTab === 'overview'
                ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-6 py-3 font-mono text-sm border-r-2 dark:border-green-400/30 border-green-600/40 transition-colors ${
              activeTab === 'files'
                ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
            }`}
          >
            FILES & VERSIONS
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            className={`px-6 py-3 font-mono text-sm border-r-2 dark:border-green-400/30 border-green-600/40 transition-colors ${
              activeTab === 'folders'
                ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
            }`}
          >
            FOLDERS
          </button>
          <button
            onClick={() => setActiveTab('splits')}
            className={`px-6 py-3 font-mono text-sm transition-colors ${
              activeTab === 'splits'
                ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
            }`}
          >
            SPLITS & CREDITS
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Audio Player */}
              {primaryAsset && (
                <div>
                  <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                    &gt; AUDIO_PLAYER
                  </h3>
                  <AudioPlayer
                    src={primaryAsset.url}
                    title={primaryAsset.name}
                  />
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                  &gt; METADATA
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.bpm && (
                    <div>
                      <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">BPM:</div>
                      <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">{project.bpm}</div>
                    </div>
                  )}
                  {project.key && (
                    <div>
                      <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">KEY:</div>
                      <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">{project.key}</div>
                    </div>
                  )}
                  {project.genre && (
                    <div>
                      <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">GENRE:</div>
                      <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">{project.genre}</div>
                    </div>
                  )}
                  {project.mood && (
                    <div>
                      <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">MOOD:</div>
                      <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">{project.mood}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                  &gt; NOTES
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add notes about this project..."
                    className="w-full px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none min-h-[100px] placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                  />
                ) : (
                  <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70 whitespace-pre-wrap">
                    {project.notes || 'No notes yet. Click edit to add notes.'}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                  &gt; QUICK_ACTIONS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setActiveTab('splits')}
                    className="flex items-center gap-2 px-4 py-3 border-2 dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 hover:dark:bg-cyan-400/10 hover:bg-cyan-600/10 transition-colors font-mono text-sm"
                  >
                    <Users className="h-4 w-4" />
                    ADD_COLLABORATOR
                  </button>
                  <button 
                    onClick={() => setActiveTab('splits')}
                    className="flex items-center gap-2 px-4 py-3 border-2 dark:border-yellow-400/50 border-yellow-600/50 dark:text-yellow-400 text-yellow-700 hover:dark:bg-yellow-400/10 hover:bg-yellow-600/10 transition-colors font-mono text-sm"
                  >
                    <Percent className="h-4 w-4" />
                    SPLITS_&_CONTRACTS
                  </button>
                  <button 
                    onClick={() => setShowMarketplaceModal(true)}
                    className="flex items-center gap-2 px-4 py-3 border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors font-mono text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    LIST_IN_MARKETPLACE
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              {/* Master Audio */}
              {masterAssets.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3 flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    MASTER_AUDIO
                  </h3>
                  <div className="space-y-2">
                    {masterAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-green-400/5 bg-green-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Music className="h-4 w-4 dark:text-green-400 text-green-700" />
                          <div>
                            <div className="font-mono text-sm dark:text-green-400 text-green-700">
                              {asset.name}
                              {asset.isPrimary && (
                                <span className="ml-2 text-xs px-1 dark:bg-green-400/20 bg-green-600/20">PRIMARY</span>
                              )}
                            </div>
                            <div className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                              {formatSize(asset.sizeBytes)} • {formatDuration(asset.durationSec)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDownloadFile(asset.id, asset.name)}
                            className="p-2 dark:text-green-400 text-green-700 hover:opacity-70"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-2 dark:text-red-400 text-red-700 hover:opacity-70"
                            title="Remove file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stems */}
              {stemAssets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 flex items-center gap-2">
                      <FileAudio className="h-4 w-4" />
                      STEMS ({stemAssets.length})
                    </h3>
                    <button className="text-xs px-3 py-1 border-2 dark:border-pink-400/50 border-pink-600/50 dark:text-pink-400 text-pink-700 hover:dark:bg-pink-400/10 hover:bg-pink-600/10 font-mono">
                      DOWNLOAD_ALL
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {stemAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-2 border dark:border-pink-400/30 border-pink-600/40 text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileAudio className="h-3 w-3 dark:text-pink-400 text-pink-700 flex-shrink-0" />
                          <span className="font-mono dark:text-pink-400 text-pink-700 truncate">{asset.name}</span>
                        </div>
                        <span className="text-xs font-mono dark:text-pink-400/50 text-pink-700/50 ml-2">
                          {formatSize(asset.sizeBytes)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DAW Sessions */}
              {dawAssets.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3 flex items-center gap-2">
                    <Disc className="h-4 w-4" />
                    DAW_SESSIONS
                  </h3>
                  <div className="space-y-2">
                    {dawAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 border-2 dark:border-purple-400/30 border-purple-600/40 dark:bg-purple-400/5 bg-purple-50"
                      >
                        <div className="flex items-center gap-3">
                          <Disc className="h-4 w-4 dark:text-purple-400 text-purple-700" />
                          <div>
                            <div className="font-mono text-sm dark:text-purple-400 text-purple-700">{asset.name}</div>
                            <div className="text-xs font-mono dark:text-purple-400/70 text-purple-700/70">
                              {DAW_MAP[asset.extension.toLowerCase()] || asset.extension.toUpperCase()} • {formatSize(asset.sizeBytes)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 dark:text-purple-400 text-purple-700 hover:opacity-70">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Files */}
              {otherAssets.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    OTHER_FILES
                  </h3>
                  <div className="space-y-2">
                    {otherAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-2 border dark:border-green-400/30 border-green-600/40 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 dark:text-green-400 text-green-700" />
                          <span className="font-mono dark:text-green-400 text-green-700">{asset.filename}</span>
                        </div>
                        <span className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                          {formatSize(asset.sizeBytes)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New File */}
              <button className="w-full py-4 border-2 border-dashed dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/5 hover:bg-green-600/5 transition-colors font-mono text-sm flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                UPLOAD_NEW_FILE
              </button>
            </div>
          )}

          {activeTab === 'folders' && (
            <div>
              <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                &gt; COLLECTIONS
              </h3>
              <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                {project.folders.length > 0 ? (
                  <div className="space-y-2">
                    {project.folders.map(folder => (
                      <div key={folder} className="px-3 py-2 border dark:border-green-400/30 border-green-600/40">
                        {folder}
                      </div>
                    ))}
                  </div>
                ) : (
                  'Not in any collections yet.'
                )}
              </div>
            </div>
          )}

          {activeTab === 'splits' && (
            <SplitsEditor
              projectId={project.id}
              projectTitle={project.title}
              splits={[]} // TODO: Load from project metadata
              onSave={handleSaveSplits}
              onGenerateContract={handleGenerateContract}
            />
          )}
        </div>

        {/* Marketplace Listing Modal */}
        <MarketplaceListingModal
          isOpen={showMarketplaceModal}
          onClose={() => setShowMarketplaceModal(false)}
          project={project}
          onList={handleListOnMarketplace}
        />

        {/* Footer */}
        <div className="border-t-2 dark:border-green-400/30 border-green-600/40 p-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Delete this project and all its files?')) {
                onDelete()
              }
            }}
            className="px-4 py-2 border-2 dark:border-red-400/50 border-red-600/50 dark:text-red-400 text-red-700 hover:dark:bg-red-400/10 hover:bg-red-600/10 font-mono text-sm flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            DELETE_PROJECT
          </button>
          <Button
            onClick={onClose}
            className="dark:bg-green-400 dark:text-black bg-green-600 text-white font-mono"
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  )
}
