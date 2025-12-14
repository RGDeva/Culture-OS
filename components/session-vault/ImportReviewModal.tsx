'use client'

import { useState } from 'react'
import { ProposedProject, ProjectRoleContext } from '@/types/sessionVault'
import { Button } from '@/components/ui/button'
import { X, Music, Disc, FileAudio, FileCode, FileText, Folder } from 'lucide-react'

interface ImportReviewModalProps {
  isOpen: boolean
  onClose: () => void
  proposedProjects: ProposedProject[]
  totalFiles: number
  totalSize: number
  sessionId: string
  userId: string
  roleContext: ProjectRoleContext
  onCommit: (projects: any[]) => void
}

export function ImportReviewModal({
  isOpen,
  onClose,
  proposedProjects,
  totalFiles,
  totalSize,
  sessionId,
  userId,
  roleContext,
  onCommit,
}: ImportReviewModalProps) {
  const [projects, setProjects] = useState(proposedProjects)
  const [isCommitting, setIsCommitting] = useState(false)

  if (!isOpen) return null

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'MASTER_AUDIO':
      case 'ALT_BOUNCE':
        return <Music className="h-4 w-4" />
      case 'STEM':
        return <FileAudio className="h-4 w-4" />
      case 'DAW_SESSION':
        return <Disc className="h-4 w-4" />
      case 'DOCUMENT':
        return <FileText className="h-4 w-4" />
      default:
        return <FileCode className="h-4 w-4" />
    }
  }

  const getDefaultTags = (roleContext: ProjectRoleContext, hasStems: boolean, hasSession: boolean) => {
    const tags = []
    
    if (roleContext === 'PRODUCER') {
      tags.push(hasStems ? 'beat' : 'loop')
    } else if (roleContext === 'ARTIST') {
      tags.push('song_demo')
    } else if (roleContext === 'ENGINEER') {
      tags.push('mix_session')
    }
    
    if (hasStems) tags.push('stems')
    if (hasSession) tags.push('session')
    
    return tags
  }

  const handleRename = (index: number, newTitle: string) => {
    const updated = [...projects]
    updated[index].title = newTitle
    setProjects(updated)
  }

  const handleCommit = async () => {
    setIsCommitting(true)
    
    try {
      const projectsData = projects.map(p => ({
        title: p.title,
        groupKey: p.groupKey,
        roleContext,
        tags: getDefaultTags(roleContext, p.hasStems, p.hasSession),
      }))
      
      await onCommit(projectsData)
      onClose()
    } catch (error) {
      console.error('[IMPORT_REVIEW] Commit failed:', error)
    } finally {
      setIsCommitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/90 bg-black/80 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b-2 dark:border-green-400/30 border-green-600/40 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
              &gt; REVIEW_IMPORT
            </h2>
            <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mt-1">
              {totalFiles} files → {projects.length} projects • {formatSize(totalSize)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {projects.map((project, index) => (
            <div
              key={project.groupKey}
              className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-green-400/5 bg-green-50"
            >
              {/* Project Header */}
              <div className="flex items-start gap-3 mb-3">
                <Folder className="h-5 w-5 dark:text-green-400 text-green-700 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => handleRename(index, e.target.value)}
                    className="w-full px-2 py-1 text-lg font-bold font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {project.detectedBpm && (
                      <span className="text-xs px-2 py-1 border dark:border-green-400/50 dark:text-green-400 border-green-600/50 text-green-700 font-mono">
                        {project.detectedBpm} BPM
                      </span>
                    )}
                    {project.detectedKey && (
                      <span className="text-xs px-2 py-1 border dark:border-green-400/50 dark:text-green-400 border-green-600/50 text-green-700 font-mono">
                        {project.detectedKey}
                      </span>
                    )}
                    {project.detectedGenre && (
                      <span className="text-xs px-2 py-1 border dark:border-cyan-400/50 dark:text-cyan-400 border-cyan-600/50 text-cyan-700 font-mono">
                        {project.detectedGenre}
                      </span>
                    )}
                    {project.hasStems && (
                      <span className="text-xs px-2 py-1 border dark:border-pink-400/50 dark:text-pink-400 border-pink-600/50 text-pink-700 font-mono">
                        HAS_STEMS
                      </span>
                    )}
                    {project.hasSession && (
                      <span className="text-xs px-2 py-1 border dark:border-purple-400/50 dark:text-purple-400 border-purple-600/50 text-purple-700 font-mono">
                        HAS_SESSION
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assets List */}
              <div className="space-y-1 ml-8">
                {project.assets.map((asset, assetIndex) => (
                  <div
                    key={assetIndex}
                    className="flex items-center gap-2 text-sm font-mono dark:text-green-400/70 text-green-700/70"
                  >
                    {getAssetIcon(asset.type)}
                    <span className={asset.isPrimary ? 'dark:text-green-400 text-green-700 font-bold' : ''}>
                      {asset.filename}
                    </span>
                    {asset.isPrimary && (
                      <span className="text-xs px-1 dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700">
                        PRIMARY
                      </span>
                    )}
                    <span className="text-xs dark:text-green-400/50 text-green-700/50">
                      {formatSize(asset.sizeBytes)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t-2 dark:border-green-400/30 border-green-600/40 p-4 flex items-center justify-between">
          <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
            {projects.length} project{projects.length !== 1 ? 's' : ''} ready to create
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isCommitting}
              className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleCommit}
              disabled={isCommitting}
              className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
            >
              {isCommitting ? 'CREATING...' : `CREATE ${projects.length} PROJECT${projects.length !== 1 ? 'S' : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
