'use client'

import React, { useState } from 'react'
import { CreativeAsset, AssetStatus } from '@/types/vault'
import { Button } from '@/components/ui/button'
import {
  X,
  Play,
  Pause,
  Download,
  Share2,
  Edit,
  Trash2,
  Users,
  ShoppingCart,
  FolderPlus,
  Music2,
  DollarSign,
  Percent,
} from 'lucide-react'
import { CyaniteAnalysisPanel } from './CyaniteAnalysisPanel'
import { PricingTiersModal } from './PricingTiersModal'
import { ContractSplitModal } from './ContractSplitModal'
import { AudioPlayer } from './AudioPlayer'

interface AssetDetailModalProps {
  asset: CreativeAsset
  isOpen: boolean
  onClose: () => void
  onUpdate?: (updates: Partial<CreativeAsset>) => void
  onDelete?: () => void
}

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: AssetDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAsset, setEditedAsset] = useState(asset)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showAddToProjectModal, setShowAddToProjectModal] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  
  // Fetch projects when modal opens
  React.useEffect(() => {
    if (showAddToProjectModal && projects.length === 0) {
      fetchProjects()
    }
  }, [showAddToProjectModal])
  
  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await fetch('/api/session-vault/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('[ASSET_DETAIL] Failed to fetch projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }
  
  const handleAddToProject = async (projectId: string) => {
    try {
      // Update asset with projectId
      if (onUpdate) {
        await onUpdate({ projectId })
      }
      setShowAddToProjectModal(false)
    } catch (error) {
      console.error('[ASSET_DETAIL] Failed to add to project:', error)
    }
  }
  
  if (!isOpen) return null
  
  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate({
        title: editedAsset.title,
        genre: editedAsset.genre,
        moodTags: editedAsset.moodTags,
        status: editedAsset.status,
      })
    }
    setIsEditing(false)
  }
  
  const statusColors = {
    IDEA: 'dark:bg-cyan-400/20 dark:text-cyan-400 bg-cyan-100 text-cyan-700',
    IN_PROGRESS: 'dark:bg-yellow-400/20 dark:text-yellow-400 bg-yellow-100 text-yellow-700',
    FOR_SALE: 'dark:bg-green-400/20 dark:text-green-400 bg-green-100 text-green-700',
    PLACED: 'dark:bg-purple-400/20 dark:text-purple-400 bg-purple-100 text-purple-700',
    LOCKED: 'dark:bg-red-400/20 dark:text-red-400 bg-red-100 text-red-700',
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 dark:bg-black bg-white border-b-2 dark:border-green-400/30 border-green-600/30 p-6 flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedAsset.title}
                onChange={(e) => setEditedAsset({ ...editedAsset, title: e.target.value })}
                className="text-3xl font-bold font-mono dark:text-green-400 text-green-700 dark:bg-black bg-white border-2 dark:border-green-400/50 border-green-600/50 px-2 py-1 w-full focus:outline-none"
              />
            ) : (
              <h2 className="text-3xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                {asset.title}
              </h2>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 border dark:border-pink-400/50 dark:text-pink-400 border-pink-600/50 text-pink-700 font-mono">
                {asset.assetType}
              </span>
              <span className={`text-xs px-2 py-1 font-mono ${statusColors[asset.status]}`}>
                {asset.status}
              </span>
              {asset.ownerRoles.map(role => (
                <span key={role} className="text-xs px-2 py-1 border dark:border-cyan-400/50 dark:text-cyan-400 border-cyan-600/50 text-cyan-700 font-mono">
                  {role}
                </span>
              ))}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 hover:opacity-70 transition-opacity"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            {asset.fileUrl && (
              <AudioPlayer
                src={asset.fileUrl}
                title={asset.title}
              />
            )}
            
            {/* Metadata */}
            <div>
              <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                &gt; METADATA
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {asset.bpm && (
                  <div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                      BPM:
                    </div>
                    <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                      {asset.bpm}
                    </div>
                  </div>
                )}
                
                {asset.key && (
                  <div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                      KEY:
                    </div>
                    <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                      {asset.key}
                    </div>
                  </div>
                )}
                
                {asset.genre && (
                  <div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                      GENRE:
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedAsset.genre}
                        onChange={(e) => setEditedAsset({ ...editedAsset, genre: e.target.value })}
                        className="text-sm font-mono dark:text-green-400 text-green-700 dark:bg-black bg-white border dark:border-green-400/50 border-green-600/50 px-2 py-1 w-full focus:outline-none"
                      />
                    ) : (
                      <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                        {asset.genre}
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                    CREATED:
                  </div>
                  <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {asset.fileSize && (
                  <div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                      SIZE:
                    </div>
                    <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                      {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                    STATUS:
                  </div>
                  {isEditing ? (
                    <select
                      value={editedAsset.status}
                      onChange={(e) => setEditedAsset({ ...editedAsset, status: e.target.value as AssetStatus })}
                      className="text-sm font-mono dark:text-green-400 text-green-700 dark:bg-black bg-white border dark:border-green-400/50 border-green-600/50 px-2 py-1 w-full focus:outline-none"
                    >
                      <option value="IDEA">IDEA</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="FOR_SALE">FOR_SALE</option>
                      <option value="PLACED">PLACED</option>
                      <option value="LOCKED">LOCKED</option>
                    </select>
                  ) : (
                    <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                      {asset.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Cyanite AI Analysis */}
            <CyaniteAnalysisPanel asset={asset} />
            
            {/* Tags */}
            {asset.moodTags && asset.moodTags.length > 0 && (
              <div>
                <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                  &gt; TAGS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {asset.moodTags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 border dark:border-green-400/30 border-green-600/40 dark:text-green-400/70 text-green-700/70 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Actions */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="w-full bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                >
                  SAVE_CHANGES
                </Button>
                <Button
                  onClick={() => {
                    setEditedAsset(asset)
                    setIsEditing(false)
                  }}
                  variant="outline"
                  className="w-full dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
                >
                  CANCEL
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  EDIT
                </Button>
                
                <Button
                  onClick={() => setShowSplitModal(true)}
                  variant="outline"
                  className="w-full dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 font-mono flex items-center justify-center gap-2"
                >
                  <Percent className="h-4 w-4" />
                  CONTRACT_SPLITS
                </Button>
                
                <Button
                  onClick={() => setShowPricingModal(true)}
                  variant="outline"
                  className="w-full dark:border-yellow-400/50 border-yellow-600/50 dark:text-yellow-400 text-yellow-700 font-mono flex items-center justify-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  SET_PRICING
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  ADD_COLLABORATORS
                </Button>
                
                <Button
                  onClick={() => setShowAddToProjectModal(true)}
                  variant="outline"
                  className="w-full dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono flex items-center justify-center gap-2"
                >
                  <FolderPlus className="h-4 w-4" />
                  ADD_TO_PROJECT
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full dark:border-pink-500/50 border-pink-600/50 dark:text-pink-400 text-pink-700 font-mono flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  LIST_IN_MARKETPLACE
                </Button>
                
                {onDelete && (
                  <Button
                    onClick={onDelete}
                    variant="outline"
                    className="w-full dark:border-red-500/50 border-red-600/50 dark:text-red-400 text-red-700 font-mono flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    DELETE
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Pricing Tiers Modal */}
      <PricingTiersModal
        asset={asset}
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSave={(tiers) => {
          console.log('[ASSET_DETAIL] Pricing tiers saved:', tiers)
          // TODO: Save to backend
        }}
      />
      
      {/* Contract Split Modal */}
      <ContractSplitModal
        asset={asset}
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        onSave={(splits) => {
          console.log('[ASSET_DETAIL] Contract splits saved:', splits)
          // TODO: Save to backend
        }}
      />
      
      {/* Add to Project Modal */}
      {showAddToProjectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
          <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
                {'>'} ADD_TO_PROJECT
              </h3>
              <button
                onClick={() => setShowAddToProjectModal(false)}
                className="dark:text-green-400 text-green-700 hover:opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {loadingProjects ? (
              <div className="text-center py-8 font-mono dark:text-green-400/60 text-green-700/70">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-mono dark:text-green-400/60 text-green-700/70 mb-4">
                  No projects found
                </p>
                <Button
                  onClick={() => {
                    setShowAddToProjectModal(false)
                    // Navigate to create project
                    window.location.href = '/session-vault'
                  }}
                  className="dark:bg-green-400 dark:text-black bg-green-600 text-white font-mono"
                >
                  CREATE_PROJECT
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleAddToProject(project.id)}
                    className="w-full text-left p-3 border-2 dark:border-green-400/30 border-green-600/30 dark:hover:border-green-400 hover:border-green-600 transition-colors"
                  >
                    <div className="font-mono font-bold dark:text-green-400 text-green-700">
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                        {project.description}
                      </div>
                    )}
                    <div className="text-xs font-mono dark:text-cyan-400 text-cyan-600 mt-1">
                      {project.status} • {project.assetCount || 0} assets
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
