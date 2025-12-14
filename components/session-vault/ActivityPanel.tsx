'use client'

import { useState } from 'react'
import { ActivityLog, ProjectComment, ProjectCollaborator } from '@/types/sessionVault'
import {
  MessageSquare,
  Users,
  Activity,
  Send,
  MoreVertical,
  UserPlus,
  X,
} from 'lucide-react'

interface ActivityPanelProps {
  projectId: string
  comments: ProjectComment[]
  collaborators: ProjectCollaborator[]
  activity: ActivityLog[]
  currentUserId: string
  currentUserName: string
  onAddComment: (content: string) => void
  onAddCollaborator: (email: string, role: string) => void
  onRemoveCollaborator: (collaboratorId: string) => void
}

export function ActivityPanel({
  projectId,
  comments,
  collaborators,
  activity,
  currentUserId,
  currentUserName,
  onAddComment,
  onAddCollaborator,
  onRemoveCollaborator,
}: ActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'collaborators' | 'activity'>('comments')
  const [newComment, setNewComment] = useState('')
  const [showAddCollaborator, setShowAddCollaborator] = useState(false)
  const [newCollabEmail, setNewCollabEmail] = useState('')
  const [newCollabRole, setNewCollabRole] = useState<'producer' | 'artist' | 'engineer' | 'viewer'>('viewer')

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }

  const handleAddCollaborator = () => {
    if (newCollabEmail.trim()) {
      onAddCollaborator(newCollabEmail.trim(), newCollabRole)
      setNewCollabEmail('')
      setShowAddCollaborator(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'dark:text-yellow-400 text-yellow-700 dark:border-yellow-400/50 border-yellow-600/50'
      case 'producer':
        return 'dark:text-green-400 text-green-700 dark:border-green-400/50 border-green-600/50'
      case 'artist':
        return 'dark:text-pink-400 text-pink-700 dark:border-pink-400/50 border-pink-600/50'
      case 'engineer':
        return 'dark:text-cyan-400 text-cyan-700 dark:border-cyan-400/50 border-cyan-600/50'
      default:
        return 'dark:text-gray-400 text-gray-700 dark:border-gray-400/50 border-gray-600/50'
    }
  }

  return (
    <div className="w-80 border-l-2 dark:border-green-400/30 border-green-600/40 dark:bg-black bg-white h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b-2 dark:border-green-400/30 border-green-600/40 flex">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-3 text-xs font-mono border-r dark:border-green-400/30 border-green-600/40 transition-colors ${
            activeTab === 'comments'
              ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
          }`}
        >
          <MessageSquare className="h-4 w-4 mx-auto mb-1" />
          COMMENTS
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`flex-1 px-4 py-3 text-xs font-mono border-r dark:border-green-400/30 border-green-600/40 transition-colors ${
            activeTab === 'collaborators'
              ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
          }`}
        >
          <Users className="h-4 w-4 mx-auto mb-1" />
          TEAM
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 px-4 py-3 text-xs font-mono transition-colors ${
            activeTab === 'activity'
              ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
              : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
          }`}
        >
          <Activity className="h-4 w-4 mx-auto mb-1" />
          ACTIVITY
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'comments' && (
          <div className="p-4 space-y-4">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-xs font-mono dark:text-green-400 text-green-700 font-bold">
                        {comment.userName}
                      </div>
                      <div className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                        {formatTime(comment.createdAt)}
                      </div>
                    </div>
                    <button className="p-1 dark:text-green-400/50 text-green-700/50 hover:dark:text-green-400 hover:text-green-700">
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-sm font-mono dark:text-green-400/80 text-green-700/80">
                    {comment.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono dark:text-green-400/50 text-green-700/50">
                No comments yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'collaborators' && (
          <div className="p-4 space-y-3">
            {!showAddCollaborator && (
              <button
                onClick={() => setShowAddCollaborator(true)}
                className="w-full px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 font-mono text-xs flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                ADD_COLLABORATOR
              </button>
            )}

            {showAddCollaborator && (
              <div className="border-2 dark:border-green-400/50 border-green-600/50 p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono dark:text-green-400 text-green-700 font-bold">
                    ADD_COLLABORATOR
                  </span>
                  <button
                    onClick={() => setShowAddCollaborator(false)}
                    className="dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="email"
                  value={newCollabEmail}
                  onChange={(e) => setNewCollabEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-2 py-1 text-xs font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                />
                <select
                  value={newCollabRole}
                  onChange={(e) => setNewCollabRole(e.target.value as any)}
                  className="w-full px-2 py-1 text-xs font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="producer">Producer</option>
                  <option value="artist">Artist</option>
                  <option value="engineer">Engineer</option>
                </select>
                <button
                  onClick={handleAddCollaborator}
                  className="w-full px-3 py-1 dark:bg-green-400 dark:text-black bg-green-600 text-white hover:dark:bg-green-300 hover:bg-green-500 font-mono text-xs"
                >
                  ADD
                </button>
              </div>
            )}

            <div className="space-y-2">
              {collaborators.map(collab => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-2 border dark:border-green-400/30 border-green-600/40"
                >
                  <div className="flex-1">
                    <div className="text-xs font-mono dark:text-green-400 text-green-700 font-bold">
                      {collab.userName}
                    </div>
                    <div className={`text-xs px-1 border ${getRoleBadgeColor(collab.role)} inline-block mt-1 font-mono`}>
                      {collab.role.toUpperCase()}
                    </div>
                  </div>
                  {collab.role !== 'owner' && (
                    <button
                      onClick={() => onRemoveCollaborator(collab.id)}
                      className="p-1 dark:text-red-400/70 text-red-700/70 hover:dark:text-red-400 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-4 space-y-3">
            {activity.length > 0 ? (
              activity.map(log => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full dark:bg-green-400 bg-green-700 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-mono dark:text-green-400/80 text-green-700/80">
                        <span className="font-bold">{log.userName}</span> {log.description}
                      </div>
                      <div className="text-xs font-mono dark:text-green-400/50 text-green-700/50">
                        {formatTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono dark:text-green-400/50 text-green-700/50">
                No activity yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Input (only show on comments tab) */}
      {activeTab === 'comments' && (
        <div className="border-t-2 dark:border-green-400/30 border-green-600/40 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 px-2 py-1 text-xs font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-3 py-1 dark:bg-green-400 dark:text-black bg-green-600 text-white hover:dark:bg-green-300 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
