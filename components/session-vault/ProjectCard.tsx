'use client'

import { Project } from '@/types/sessionVault'
import { Music, Disc, FileAudio, FolderOpen } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDEA':
        return 'dark:text-gray-400 text-gray-600 dark:border-gray-400/50 border-gray-600/50'
      case 'IN_PROGRESS':
        return 'dark:text-yellow-400 text-yellow-600 dark:border-yellow-400/50 border-yellow-600/50'
      case 'READY_FOR_SALE':
        return 'dark:text-green-400 text-green-600 dark:border-green-400/50 border-green-600/50'
      case 'PLACED':
        return 'dark:text-cyan-400 text-cyan-600 dark:border-cyan-400/50 border-cyan-600/50'
      case 'LOCKED':
        return 'dark:text-red-400 text-red-600 dark:border-red-400/50 border-red-600/50'
      default:
        return 'dark:text-gray-400 text-gray-600 dark:border-gray-400/50 border-gray-600/50'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div
      onClick={onClick}
      className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80 hover:dark:border-green-400 hover:border-green-600 hover:dark:bg-green-400/5 hover:bg-green-50 transition-all cursor-pointer group active:scale-[0.98]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Title */}
      <div className="flex items-start gap-2 mb-3">
        <FolderOpen className="h-5 w-5 dark:text-green-400 text-green-700 mt-0.5 flex-shrink-0" />
        <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 group-hover:dark:text-green-300 group-hover:text-green-600 transition-colors">
          {project.title}
        </h3>
      </div>

      {/* Tags & Flags */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {project.tags.map(tag => (
          <span
            key={tag}
            className="text-xs px-2 py-1 border dark:border-cyan-400/50 dark:text-cyan-400 border-cyan-600/50 text-cyan-700 font-mono uppercase"
          >
            {tag}
          </span>
        ))}
        {project.hasStems && (
          <span className="text-xs px-2 py-1 border dark:border-pink-400/50 dark:text-pink-400 border-pink-600/50 text-pink-700 font-mono flex items-center gap-1">
            <FileAudio className="h-3 w-3" />
            STEMS
          </span>
        )}
        {project.hasSession && (
          <span className="text-xs px-2 py-1 border dark:border-purple-400/50 dark:text-purple-400 border-purple-600/50 text-purple-700 font-mono flex items-center gap-1">
            <Disc className="h-3 w-3" />
            SESSION
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 mb-3 text-sm font-mono dark:text-green-400/70 text-green-700/70">
        {project.bpm && <span>{project.bpm} BPM</span>}
        {project.key && <span>• {project.key}</span>}
        {project.genre && <span>• {project.genre}</span>}
      </div>

      {/* Status & Date */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className={`px-2 py-1 border ${getStatusColor(project.status)}`}>
          ● {project.status.replace('_', ' ')}
        </span>
        <span className="dark:text-green-400/50 text-green-700/50">
          {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  )
}
