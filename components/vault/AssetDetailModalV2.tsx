'use client'

import React, { useState, useEffect } from 'react'
import { CreativeAsset, AssetStatus } from '@/types/vault'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Sparkles,
  Info,
  MessageSquare,
  History,
  Send,
} from 'lucide-react'
import { CyaniteAnalysisPanel } from './CyaniteAnalysisPanel'
import { AnalysisTab } from './AnalysisTab'
import { EnhancedAnalysisPanel } from './EnhancedAnalysisPanel'
import StemSeparationPanel from './StemSeparationPanel'
import { PricingTiersModal } from './PricingTiersModal'
import { ContractSplitModal } from './ContractSplitModal'
import { AudioPlayer } from './AudioPlayer'

// Comments Panel Component
function CommentsPanel({ assetId, ownerId }: { assetId: string; ownerId: string }) {
  const [comments, setComments] = useState<Array<{
    id: string
    userId: string
    userName: string
    content: string
    createdAt: string
  }>>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock comments for demo
  useEffect(() => {
    setComments([
      {
        id: '1',
        userId: ownerId,
        userName: 'You',
        content: 'Initial upload - needs mixing adjustments',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ])
  }, [ownerId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: `comment_${Date.now()}`,
      userId: ownerId,
      userName: 'You',
      content: newComment,
      createdAt: new Date().toISOString(),
    }
    setComments([...comments, comment])
    setNewComment('')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
        &gt; COMMENTS ({comments.length})
      </h3>
      
      {/* Comment List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm font-mono dark:text-green-400/50 text-green-700/50">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 border dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold dark:text-cyan-400 text-cyan-700">
                  @{comment.userName}
                </span>
                <span className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-mono dark:text-green-400 text-green-700">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 text-sm font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

// Files Panel Component - Upload additional tracks with drag-and-drop
function FilesPanel({ assetId, asset, onProjectFolderCreated }: { 
  assetId: string; 
  asset: CreativeAsset;
  onProjectFolderCreated?: (folderName: string) => void;
}) {
  const [relatedFiles, setRelatedFiles] = useState<Array<{
    id: string
    name: string
    type: string
    size: string
    uploadedAt: string
  }>>([])
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [projectFolderCreated, setProjectFolderCreated] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const processFiles = async (files: FileList | File[]) => {
    setUploading(true)
    
    // Auto-create project folder when first file is added
    if (relatedFiles.length === 0 && !projectFolderCreated) {
      const baseName = asset.title.replace(/\.[^/.]+$/, '').replace(/[-_]?\d+$/, '').trim()
      const folderName = `${baseName}.track`
      
      console.log(`[FILES_PANEL] Auto-creating project folder: ${folderName}`)
      setProjectFolderCreated(true)
      onProjectFolderCreated?.(folderName)
    }
    
    for (const file of Array.from(files)) {
      const newFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type.includes('audio') ? 'Audio' : file.type.includes('video') ? 'Video' : 'Document',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
      }
      setRelatedFiles(prev => [...prev, newFile])
    }
    setUploading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const removeFile = (fileId: string) => {
    setRelatedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
          &gt; RELATED_FILES ({relatedFiles.length})
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1 text-xs font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white disabled:opacity-50"
        >
          {uploading ? 'UPLOADING...' : '+ ADD_FILES'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".wav,.mp3,.aiff,.flac,.m4a,.pdf,.doc,.docx,.mp4,.mov,.zip"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      {!projectFolderCreated && relatedFiles.length === 0 && (
        <div className="p-3 border dark:border-cyan-400/30 border-cyan-600/30 dark:bg-cyan-400/10 bg-cyan-600/10">
          <p className="text-xs font-mono dark:text-cyan-400 text-cyan-700">
            💡 Adding files will auto-create a project folder: <strong>{asset.title.replace(/\.[^/.]+$/, '').replace(/[-_]?\d+$/, '').trim()}.track</strong>
          </p>
        </div>
      )}
      
      <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60">
        Drag & drop stems, alternate versions, videos, or documents here.
      </p>
      
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'dark:border-green-400 border-green-600 dark:bg-green-400/20 bg-green-600/20'
            : 'dark:border-green-400/30 border-green-600/30 hover:dark:border-green-400/50 hover:border-green-600/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Music2 className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'dark:text-green-400 text-green-700 animate-bounce' : 'dark:text-green-400/50 text-green-700/50'}`} />
        <p className={`text-sm font-mono ${isDragging ? 'dark:text-green-400 text-green-700' : 'dark:text-green-400/50 text-green-700/50'}`}>
          {isDragging ? 'DROP FILES HERE' : relatedFiles.length === 0 ? 'No additional files yet' : 'Drop more files here'}
        </p>
        <p className="text-xs font-mono dark:text-green-400/40 text-green-700/40 mt-1">
          Audio, Video, Documents, ZIP files
        </p>
      </div>
      
      {relatedFiles.length > 0 && (
        <div className="space-y-2">
          {relatedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5"
            >
              <div className="flex items-center gap-3">
                <Music2 className="h-4 w-4 dark:text-green-400 text-green-700" />
                <div>
                  <p className="text-sm font-mono dark:text-green-400 text-green-700">{file.name}</p>
                  <p className="text-xs font-mono dark:text-green-400/50 text-green-700/50">{file.type} • {file.size}</p>
                </div>
              </div>
              <button 
                onClick={() => removeFile(file.id)}
                className="text-xs font-mono dark:text-red-400 text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Split Sheet Modal Component - Auto-generate when collaborators added
function SplitSheetModal({ 
  asset, 
  collaborators,
  onClose, 
  onSuccess 
}: { 
  asset: CreativeAsset
  collaborators: Array<{ id: string; name: string; email: string; role: string; splitPercent?: number }>
  onClose: () => void
  onSuccess: (splitSheet: any) => void 
}) {
  const [splits, setSplits] = useState<Array<{ id: string; name: string; email: string; role: string; percent: number; walletAddress: string }>>(() => {
    const equalSplit = Math.floor(100 / (collaborators.length + 1))
    const remainder = 100 - (equalSplit * (collaborators.length + 1))
    return [
      { id: 'owner', name: 'You (Owner)', email: '', role: 'OWNER', percent: equalSplit + remainder, walletAddress: '' },
      ...collaborators.map(c => ({ ...c, percent: equalSplit, walletAddress: '' }))
    ]
  })
  const [projectTitle, setProjectTitle] = useState(asset.title)
  const [submitting, setSubmitting] = useState(false)
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false)

  const totalPercent = splits.reduce((sum, s) => sum + s.percent, 0)

  const updateSplit = (id: string, percent: number) => {
    setSplits(splits.map(s => s.id === id ? { ...s, percent: Math.max(0, Math.min(100, percent)) } : s))
  }

  const updateWallet = (id: string, walletAddress: string) => {
    setSplits(splits.map(s => s.id === id ? { ...s, walletAddress } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalPercent !== 100) return

    setSubmitting(true)
    // Generate split sheet with blockchain tracking
    const splitSheet = {
      id: `split_${Date.now()}`,
      assetId: asset.id,
      projectTitle,
      splits: splits.map(s => ({
        ...s,
        signedAt: null,
        signature: null,
      })),
      status: 'PENDING_SIGNATURES',
      createdAt: new Date().toISOString(),
      blockchainTxHash: null, // Will be set when recorded on-chain
    }
    
    setTimeout(() => {
      onSuccess(splitSheet)
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto dark:bg-black bg-white border-2 dark:border-cyan-400 border-cyan-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-mono dark:text-cyan-400 text-cyan-700">
            &gt; SPLIT_SHEET_GENERATOR
          </h3>
          <button onClick={onClose} className="dark:text-cyan-400 text-cyan-700 hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Project Info */}
        <div className="mb-4 p-3 border dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full bg-transparent text-sm font-mono dark:text-green-400 text-green-700 font-bold border-none focus:outline-none"
          />
          <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mt-1">
            {asset.bpm && `${asset.bpm} BPM`} {asset.key && `• ${asset.key}`} {asset.genre && `• ${asset.genre}`}
          </p>
        </div>

        {/* Blockchain Info Toggle */}
        <button
          type="button"
          onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
          className="w-full mb-4 p-2 border dark:border-purple-400/30 border-purple-600/30 dark:bg-purple-400/10 bg-purple-600/10 text-xs font-mono dark:text-purple-400 text-purple-700 flex items-center justify-center gap-2"
        >
          <span>🔗</span> BLOCKCHAIN_ROYALTY_TRACKING {showBlockchainInfo ? '▼' : '▶'}
        </button>
        
        {showBlockchainInfo && (
          <div className="mb-4 p-3 border dark:border-purple-400/30 border-purple-600/30 text-xs font-mono dark:text-purple-400/80 text-purple-700/80 space-y-2">
            <p>• Split sheet will be recorded on-chain for immutable proof</p>
            <p>• Royalties auto-distribute to connected wallets</p>
            <p>• All parties receive notification to sign</p>
            <p>• PDF export available after all signatures</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Splits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono dark:text-cyan-400 text-cyan-700 font-bold">
                ROYALTY_SPLITS
              </label>
              <span className={`text-sm font-mono font-bold ${totalPercent === 100 ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-600'}`}>
                {totalPercent}% / 100%
              </span>
            </div>
            
            {splits.map((split) => (
              <div key={split.id} className="p-3 border dark:border-cyan-400/20 border-cyan-600/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono dark:text-cyan-400 text-cyan-700 font-bold">{split.name}</p>
                    <p className="text-xs font-mono dark:text-cyan-400/60 text-cyan-700/60">{split.role} {split.email && `• ${split.email}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={split.percent}
                      onChange={(e) => updateSplit(split.id, parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-20 px-2 py-1 text-sm font-mono border dark:border-cyan-400/50 border-cyan-600/50 dark:bg-black bg-white dark:text-cyan-400 text-cyan-700 text-center"
                    />
                    <span className="text-sm font-mono dark:text-cyan-400/60 text-cyan-700/60">%</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={split.walletAddress}
                  onChange={(e) => updateWallet(split.id, e.target.value)}
                  placeholder="Wallet address for royalty payments (optional)"
                  className="w-full px-2 py-1 text-xs font-mono border dark:border-cyan-400/30 border-cyan-600/30 dark:bg-black bg-white dark:text-cyan-400/80 text-cyan-700/80"
                />
              </div>
            ))}
          </div>
          
          {/* Role Types Info */}
          <div className="p-3 border dark:border-gray-400/20 border-gray-600/20 text-xs font-mono dark:text-gray-400 text-gray-600">
            <p className="font-bold mb-1">SUPPORTED ROLES:</p>
            <p>Producer • Artist • Engineer • Songwriter • Videographer • Studio • Manager • Label</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 font-mono text-sm"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={totalPercent !== 100 || submitting}
              className="flex-1 px-4 py-2 dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white font-mono text-sm disabled:opacity-50"
            >
              {submitting ? 'GENERATING...' : 'GENERATE_SPLIT_SHEET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Create Project Folder Modal
function CreateProjectFolderModal({ 
  asset, 
  onClose, 
  onSuccess 
}: { 
  asset: CreativeAsset
  onClose: () => void
  onSuccess: (folder: any) => void 
}) {
  const [folderName, setFolderName] = useState(asset.title.replace(/\.[^/.]+$/, ''))
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#00ff41')
  const [submitting, setSubmitting] = useState(false)

  const colorPresets = ['#00ff41', '#00ffff', '#ff00ff', '#ffff00', '#ff6b6b', '#4ecdc4', '#a29bfe', '#fd79a8']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setSubmitting(true)
    const folder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: folderName.trim(),
      description,
      color,
      assetIds: [asset.id],
      createdAt: new Date().toISOString(),
    }
    
    setTimeout(() => {
      onSuccess(folder)
      setSubmitting(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-md dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
            &gt; CREATE_PROJECT_FOLDER
          </h3>
          <button onClick={onClose} className="dark:text-green-400 text-green-700 hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
              PROJECT_NAME
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="My Project"
              className="w-full px-3 py-2 text-sm font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
              DESCRIPTION (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project notes..."
              rows={2}
              className="w-full px-3 py-2 text-sm font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
              COLOR
            </label>
            <div className="flex gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-sm"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || submitting}
              className="flex-1 px-4 py-2 dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-sm disabled:opacity-50"
            >
              {submitting ? 'CREATING...' : 'CREATE_FOLDER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Collaborators Panel Component
function CollaboratorsPanel({ assetId, ownerId, projectId }: { assetId: string; ownerId: string; projectId?: string }) {
  const [collaborators, setCollaborators] = useState<Array<{
    id: string
    name: string
    email: string
    role: string
    status: 'pending' | 'accepted'
    addedAt: string
  }>>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('COLLABORATOR')
  const [sending, setSending] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  // Load existing invitations
  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const params = new URLSearchParams()
        if (projectId) params.append('projectId', projectId)
        else params.append('assetId', assetId)
        
        const response = await fetch(`/api/collaborators/invite?${params}`)
        if (response.ok) {
          const data = await response.json()
          const formatted = data.invitations.map((inv: any) => ({
            id: inv.id,
            name: inv.email.split('@')[0],
            email: inv.email,
            role: inv.role,
            status: inv.status,
            addedAt: inv.createdAt,
          }))
          setCollaborators(formatted)
        }
      } catch (error) {
        console.error('[COLLABORATORS] Error loading invitations:', error)
      }
    }
    
    loadInvitations()
  }, [assetId, projectId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/collaborators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: projectId ? undefined : assetId,
          projectId: projectId || undefined,
          email: inviteEmail,
          role: inviteRole,
          invitedBy: ownerId,
          invitedByName: 'You',
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const newCollaborator = {
          id: data.invitation.id,
          name: inviteEmail.split('@')[0],
          email: inviteEmail,
          role: inviteRole,
          status: 'pending' as const,
          addedAt: data.invitation.createdAt,
        }
        setCollaborators([...collaborators, newCollaborator])
        setInviteEmail('')
        setInviteUrl(data.inviteUrl)
        
        // Show success message
        alert(`✓ Invitation sent to ${inviteEmail}!\n\nInvite link: ${data.inviteUrl}`)
      } else {
        alert('Failed to send invitation. Please try again.')
      }
    } catch (error) {
      console.error('[COLLABORATORS] Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Cancel this invitation?')) return
    
    try {
      const response = await fetch(`/api/collaborators/invite?id=${inviteId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setCollaborators(collaborators.filter(c => c.id !== inviteId))
      }
    } catch (error) {
      console.error('[COLLABORATORS] Error canceling invitation:', error)
    }
  }

  const handleResendInvite = async (collab: any) => {
    alert(`Resending invitation to ${collab.email}...\n\nIn production, this would send another email.`)
  }

  const pendingInvites = collaborators.filter(c => c.status === 'pending')
  const acceptedCollabs = collaborators.filter(c => c.status === 'accepted')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
          &gt; COLLABORATORS ({acceptedCollabs.length})
        </h3>
        {pendingInvites.length > 0 && (
          <span className="text-xs font-mono dark:text-yellow-400 text-yellow-600 px-2 py-1 border dark:border-yellow-400/50 border-yellow-600/50">
            {pendingInvites.length} PENDING
          </span>
        )}
      </div>
      
      {/* Invite Form */}
      <form onSubmit={handleInvite} className="space-y-3 p-4 border dark:border-cyan-400/30 border-cyan-600/30 dark:bg-cyan-400/5 bg-cyan-600/5">
        <p className="text-xs font-mono dark:text-cyan-400/70 text-cyan-700/70">
          💌 Invite collaborators to work on this track
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address..."
            className="flex-1 px-3 py-2 text-sm font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2 text-sm font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700"
          >
            <option value="COLLABORATOR">Collaborator</option>
            <option value="PRODUCER">Producer</option>
            <option value="ARTIST">Artist</option>
            <option value="ENGINEER">Engineer</option>
            <option value="WRITER">Writer</option>
          </select>
          <button
            type="submit"
            disabled={!inviteEmail.trim() || sending}
            className="px-4 py-2 dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white font-mono text-sm disabled:opacity-50"
          >
            {sending ? '...' : 'INVITE'}
          </button>
        </div>
      </form>
      
      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold font-mono dark:text-yellow-400 text-yellow-600">
            ⏳ PENDING_INVITATIONS ({pendingInvites.length})
          </h4>
          {pendingInvites.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-3 border-2 dark:border-yellow-400/30 border-yellow-600/30 dark:bg-yellow-400/5 bg-yellow-600/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full dark:bg-yellow-400/20 bg-yellow-600/20 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold dark:text-yellow-400 text-yellow-700">
                    {collab.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-mono dark:text-yellow-400 text-yellow-700">{collab.email}</p>
                  <p className="text-xs font-mono dark:text-yellow-400/60 text-yellow-700/60">
                    {collab.role} • Invitation sent {new Date(collab.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleResendInvite(collab)}
                  className="text-xs font-mono dark:text-yellow-400 text-yellow-600 hover:underline px-2 py-1 border dark:border-yellow-400/50 border-yellow-600/50"
                >
                  RESEND
                </button>
                <button 
                  onClick={() => handleCancelInvite(collab.id)}
                  className="text-xs font-mono dark:text-red-400 text-red-600 hover:underline"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Active Collaborators */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold font-mono dark:text-green-400 text-green-700">
          ✓ ACTIVE_COLLABORATORS ({acceptedCollabs.length})
        </h4>
        {acceptedCollabs.length === 0 ? (
          <p className="text-sm font-mono dark:text-green-400/50 text-green-700/50 text-center py-4 border dark:border-green-400/20 border-green-600/20">
            {pendingInvites.length > 0 ? 'Waiting for invitations to be accepted...' : 'No collaborators yet. Invite someone to get started!'}
          </p>
        ) : (
          acceptedCollabs.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full dark:bg-green-400/20 bg-green-600/20 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold dark:text-green-400 text-green-700">
                    {collab.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-mono dark:text-green-400 text-green-700">{collab.email}</p>
                  <p className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                    {collab.role} • Joined {new Date(collab.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="text-xs font-mono dark:text-red-400 text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Activity Panel Component
function ActivityPanel({ assetId, asset }: { assetId: string; asset: CreativeAsset }) {
  const [activities, setActivities] = useState<Array<{
    id: string
    action: string
    userId: string
    userName: string
    timestamp: string
    details?: string
  }>>([])

  // Generate activity log from asset data
  useEffect(() => {
    const logs: typeof activities = [
      {
        id: '1',
        action: 'CREATED',
        userId: asset.ownerId,
        userName: 'You',
        timestamp: asset.createdAt,
        details: `File "${asset.title}" uploaded`,
      },
    ]
    
    if (asset.updatedAt && asset.updatedAt !== asset.createdAt) {
      logs.push({
        id: '2',
        action: 'MODIFIED',
        userId: asset.ownerId,
        userName: 'You',
        timestamp: asset.updatedAt,
        details: 'Metadata updated',
      })
    }
    
    if (asset.cyaniteStatus === 'COMPLETE') {
      logs.push({
        id: '3',
        action: 'ANALYZED',
        userId: 'system',
        userName: 'AI System',
        timestamp: asset.updatedAt || asset.createdAt,
        details: 'AI analysis completed',
      })
    }
    
    setActivities(logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  }, [asset])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'dark:text-green-400 text-green-700'
      case 'MODIFIED': return 'dark:text-yellow-400 text-yellow-700'
      case 'DELETED': return 'dark:text-red-400 text-red-700'
      case 'ANALYZED': return 'dark:text-cyan-400 text-cyan-700'
      case 'SHARED': return 'dark:text-purple-400 text-purple-700'
      default: return 'dark:text-green-400 text-green-700'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
        &gt; ACTIVITY_LOG
      </h3>
      
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm font-mono dark:text-green-400/50 text-green-700/50">
            No activity recorded yet.
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 border-l-2 dark:border-green-400/30 border-green-600/30"
            >
              <div className="flex-shrink-0">
                <History className="h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono font-bold ${getActionColor(activity.action)}`}>
                    [{activity.action}]
                  </span>
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                    by @{activity.userName}
                  </span>
                  <span className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
                {activity.details && (
                  <p className="text-sm font-mono dark:text-green-400/80 text-green-700/80 mt-1">
                    {activity.details}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface AssetDetailModalV2Props {
  asset: CreativeAsset
  isOpen: boolean
  onClose: () => void
  onUpdate?: (updates: Partial<CreativeAsset>) => void
  onDelete?: () => void
}

export function AssetDetailModalV2({
  asset,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: AssetDetailModalV2Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAsset, setEditedAsset] = useState(asset)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showSplitSheetModal, setShowSplitSheetModal] = useState(false)
  const [showAddToProjectModal, setShowAddToProjectModal] = useState(false)
  const [showCreateProjectFolder, setShowCreateProjectFolder] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [collaboratorsList, setCollaboratorsList] = useState<Array<{ id: string; name: string; email: string; role: string }>>([])
  const [createdFolders, setCreatedFolders] = useState<any[]>([])
  
  // Handler for auto-creating project folder when files are added
  const handleProjectFolderCreated = async (folderName: string) => {
    try {
      // Create folder via API or local state
      const newFolder = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        color: '#00ff41',
        projectIds: [asset.id],
        createdAt: new Date().toISOString(),
      }
      
      setCreatedFolders(prev => [...prev, newFolder])
      
      // Update asset to belong to this folder
      await fetch('/api/vault/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          updates: { folderId: newFolder.id },
        }),
      })
      
      console.log(`[ASSET_MODAL] Created project folder: ${folderName}`)
      
      // Show success notification
      alert(`✓ Project folder "${folderName}" created successfully!`)
    } catch (error) {
      console.error('[ASSET_MODAL] Error creating project folder:', error)
      alert('Failed to create project folder')
    }
  }
  
  // Fetch analysis data
  useEffect(() => {
    if (isOpen && asset.id) {
      fetchAnalysis()
    }
  }, [isOpen, asset.id])
  
  const fetchAnalysis = async () => {
    setLoadingAnalysis(true)
    try {
      const response = await fetch(`/api/analysis/queue?assetId=${asset.id}`)
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
      } else if (response.status === 404) {
        // No analysis exists yet
        setAnalysis(null)
      }
    } catch (error) {
      console.error('[ASSET_DETAIL] Failed to fetch analysis:', error)
    } finally {
      setLoadingAnalysis(false)
    }
  }
  
  // Fetch projects when modal opens
  useEffect(() => {
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-6xl max-h-[90vh] overflow-auto dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 dark:bg-black bg-white border-b-2 dark:border-green-400 border-green-600 p-6 flex items-start justify-between z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAsset.title}
                    onChange={(e) => setEditedAsset({ ...editedAsset, title: e.target.value })}
                    className="w-full dark:bg-black bg-white border dark:border-green-400/50 border-green-600/50 px-2 py-1 font-mono dark:text-green-400 text-green-700 focus:outline-none"
                  />
                ) : (
                  `> ${asset.title}`
                )}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs px-2 py-1 border dark:border-green-400/50 border-green-600/50 dark:text-green-400/70 text-green-700/70 font-mono">
                  {asset.assetType}
                </span>
                <span className={`text-xs px-2 py-1 font-mono ${statusColors[asset.status as keyof typeof statusColors]}`}>
                  {asset.status}
                </span>
                {asset.bpm && (
                  <span className="text-xs px-2 py-1 border dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400/70 text-cyan-700/70 font-mono">
                    {asset.bpm} BPM
                  </span>
                )}
                {asset.key && (
                  <span className="text-xs px-2 py-1 border dark:border-purple-400/50 border-purple-600/50 dark:text-purple-400/70 text-purple-700/70 font-mono">
                    {asset.key}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="dark:text-green-400 text-green-700 hover:opacity-70 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Audio Player */}
          {asset.fileUrl && (
            <div className="p-6 border-b dark:border-green-400/20 border-green-600/20">
              <AudioPlayer
                src={asset.fileUrl}
                title={asset.title}
              />
            </div>
          )}
          
          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b dark:border-green-400/20 border-green-600/20 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="font-mono data-[state=active]:dark:text-green-400 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:dark:border-green-400 data-[state=active]:border-green-600 rounded-none"
              >
                <Info className="h-4 w-4 mr-2" />
                DETAILS
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="font-mono data-[state=active]:dark:text-green-400 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:dark:border-green-400 data-[state=active]:border-green-600 rounded-none"
              >
                <Music2 className="h-4 w-4 mr-2" />
                FILES
              </TabsTrigger>
              <TabsTrigger
                value="collaborators"
                className="font-mono data-[state=active]:dark:text-green-400 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:dark:border-green-400 data-[state=active]:border-green-600 rounded-none"
              >
                <Users className="h-4 w-4 mr-2" />
                COLLABORATORS
              </TabsTrigger>
              <TabsTrigger
                value="stems"
                className="font-mono data-[state=active]:dark:text-green-400 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:dark:border-green-400 data-[state=active]:border-green-600 rounded-none"
              >
                <Music2 className="h-4 w-4 mr-2" />
                STEM_SEPARATION
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="font-mono data-[state=active]:dark:text-green-400 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:dark:border-green-400 data-[state=active]:border-green-600 rounded-none"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                COMMENTS
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="font-mono data-[state=active]:dark:text-green-400 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:dark:border-green-400 data-[state=active]:border-green-600 rounded-none"
              >
                <History className="h-4 w-4 mr-2" />
                ACTIVITY
              </TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Metadata */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Metadata Grid */}
                  <div>
                    <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                      &gt; METADATA
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {asset.duration && (
                        <div>
                          <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                            DURATION:
                          </div>
                          <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                            {Math.floor(asset.duration / 60)}:{String(Math.floor(asset.duration % 60)).padStart(2, '0')}
                          </div>
                        </div>
                      )}
                      
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
                              value={editedAsset.genre || ''}
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
                    </div>
                  </div>
                  
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
                <div className="space-y-3">
                  <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                    &gt; ACTIONS
                  </h3>
                  
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
                        className="w-full bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        EDIT
                      </Button>
                      
                      <Button
                        onClick={() => setShowSplitModal(true)}
                        variant="outline"
                        className="w-full dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 font-mono flex items-center justify-center gap-2 text-sm"
                      >
                        <Percent className="h-4 w-4" />
                        SPLITS
                      </Button>
                      
                      <Button
                        onClick={() => setShowPricingModal(true)}
                        variant="outline"
                        className="w-full dark:border-yellow-400/50 border-yellow-600/50 dark:text-yellow-400 text-yellow-700 font-mono flex items-center justify-center gap-2 text-sm hover:dark:bg-yellow-400/10 hover:bg-yellow-600/10"
                      >
                        <DollarSign className="h-4 w-4" />
                        LIST_FOR_SALE
                      </Button>
                      
                      <Button
                        onClick={() => setShowAddToProjectModal(true)}
                        variant="outline"
                        className="w-full dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono flex items-center justify-center gap-2 text-sm"
                      >
                        <FolderPlus className="h-4 w-4" />
                        ADD_TO_PROJECT
                      </Button>
                      
                      <Button
                        onClick={() => setShowCreateProjectFolder(true)}
                        variant="outline"
                        className="w-full dark:border-purple-500/50 border-purple-600/50 dark:text-purple-400 text-purple-700 font-mono flex items-center justify-center gap-2 text-sm"
                      >
                        <FolderPlus className="h-4 w-4" />
                        CREATE_PROJECT_FOLDER
                      </Button>
                      
                      {onDelete && (
                        <Button
                          onClick={onDelete}
                          variant="outline"
                          className="w-full dark:border-red-500/50 border-red-600/50 dark:text-red-400 text-red-700 font-mono flex items-center justify-center gap-2 text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          DELETE
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Files Tab - Upload more tracks */}
            <TabsContent value="files" className="p-6">
              <FilesPanel 
                assetId={asset.id} 
                asset={asset} 
                onProjectFolderCreated={handleProjectFolderCreated}
              />
            </TabsContent>
            
            {/* Collaborators Tab */}
            <TabsContent value="collaborators" className="p-6">
              <CollaboratorsPanel assetId={asset.id} ownerId={asset.ownerId} />
            </TabsContent>
            
            {/* Stem Separation Tab */}
            <TabsContent value="stems" className="p-6">
              <StemSeparationPanel assetId={asset.id} audioUrl={asset.fileUrl} />
            </TabsContent>
            
            {/* Comments Tab */}
            <TabsContent value="comments" className="p-6">
              <CommentsPanel assetId={asset.id} ownerId={asset.ownerId} />
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6">
              <ActivityPanel assetId={asset.id} asset={asset} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modals */}
      {showPricingModal && (
        <PricingTiersModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          asset={asset}
          onSave={(tiers) => {
            console.log('Pricing tiers saved:', tiers)
            setShowPricingModal(false)
          }}
        />
      )}
      
      {showSplitModal && (
        <ContractSplitModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          asset={asset}
          onSave={(splits) => {
            console.log('Contract splits saved:', splits)
            setShowSplitModal(false)
          }}
        />
      )}
      
      {/* Add to Project Modal */}
      {showAddToProjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
                &gt; ADD_TO_PROJECT
              </h3>
              <button
                onClick={() => setShowAddToProjectModal(false)}
                className="dark:text-green-400 text-green-700 hover:opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {loadingProjects ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleAddToProject(project.id)}
                    className="w-full text-left p-3 border dark:border-green-400/30 border-green-600/30 dark:hover:border-green-400 hover:border-green-600 transition-colors font-mono dark:text-green-400 text-green-700"
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="font-mono dark:text-green-400/60 text-green-700/70 mb-4">
                  No projects found
                </p>
                <Button
                  onClick={() => {
                    setShowAddToProjectModal(false)
                    setShowCreateProjectFolder(true)
                  }}
                  className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                >
                  CREATE_PROJECT
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Split Sheet Modal */}
      {showSplitSheetModal && (
        <SplitSheetModal
          asset={asset}
          collaborators={collaboratorsList}
          onClose={() => setShowSplitSheetModal(false)}
          onSuccess={(splitSheet) => {
            console.log('[ASSET] Split sheet generated:', splitSheet)
            setShowSplitSheetModal(false)
          }}
        />
      )}
      
      {/* Create Project Folder Modal */}
      {showCreateProjectFolder && (
        <CreateProjectFolderModal
          asset={asset}
          onClose={() => setShowCreateProjectFolder(false)}
          onSuccess={(folder) => {
            console.log('[ASSET] Project folder created:', folder)
            setCreatedFolders(prev => [...prev, folder])
            setShowCreateProjectFolder(false)
          }}
        />
      )}
    </>
  )
}
