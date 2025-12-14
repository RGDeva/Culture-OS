'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import {
  Project,
  Asset,
  ProjectRoleContext,
  SidebarView,
  SortBy,
  SortOrder,
  FolderStructure,
  ActivityLog,
  ProjectComment,
  ProjectCollaborator,
} from '@/types/sessionVault'
import { ProjectCard } from '@/components/session-vault/ProjectCard'
import { ProjectDetailModal } from '@/components/session-vault/ProjectDetailModal'
import { VaultSidebar } from '@/components/session-vault/VaultSidebar'
import { VaultToolbar } from '@/components/session-vault/VaultToolbar'
import { ActivityPanel } from '@/components/session-vault/ActivityPanel'
import { UploadStatus, UploadFile } from '@/components/session-vault/UploadStatus'
import { Search, Upload, Loader2 } from 'lucide-react'
import { getUserName } from '@/lib/userUtils'

export default function SessionVaultV2Page() {
  const { user, authenticated } = usePrivy()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(true)
  
  // Sidebar state
  const [activeView, setActiveView] = useState<SidebarView>('recents')
  const [folders, setFolders] = useState<FolderStructure[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [selectedTag, setSelectedTag] = useState<string>()
  
  // Toolbar state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date-modified')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set())
  
  // Search & upload
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [roleContext] = useState<ProjectRoleContext>('PRODUCER')
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [showUploadStatus, setShowUploadStatus] = useState(false)
  
  // Activity data
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [comments, setComments] = useState<ProjectComment[]>([])
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([])

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!user?.id) return

    try {
      const params = new URLSearchParams({ userId: user.id })
      const response = await fetch(`/api/session-vault/projects?${params}`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('[SESSION_VAULT_V2] Failed to fetch projects:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (authenticated) {
      fetchProjects()
    }
  }, [authenticated, fetchProjects])

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.genre?.toLowerCase().includes(query)
      )
    }

    // Apply view filters
    if (activeView === 'recents') {
      filtered = filtered.slice(0, 10)
    } else if (activeView === 'favorites') {
      // TODO: Add favorites flag
      filtered = []
    } else if (activeView === 'shared') {
      filtered = filtered.filter(p => p.collaborators.length > 1)
    }

    // Apply folder filter
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId)
      if (folder) {
        filtered = filtered.filter(p => folder.projectIds.includes(p.id))
      }
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags.includes(selectedTag))
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'date-modified':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'date-created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredProjects(filtered)
  }, [projects, searchQuery, activeView, selectedFolderId, selectedTag, sortBy, sortOrder, folders])

  // Handle file upload
  const handleFiles = async (files: FileList) => {
    if (!user?.id || files.length === 0) return

    // Initialize upload status
    const fileArray = Array.from(files)
    const uploadFilesList: UploadFile[] = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      status: 'pending',
    }))
    
    setUploadFiles(uploadFilesList)
    setShowUploadStatus(true)
    setIsUploading(true)

    try {
      // Update all to uploading
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))
      
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('roleContext', roleContext)

      fileArray.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/vault/upload-direct', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update to analyzing
        setUploadFiles(prev => prev.map(f => ({ ...f, status: 'analyzing' })))
        
        // Wait a bit for effect
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mark as complete
        setUploadFiles(prev => prev.map(f => ({ ...f, status: 'complete' })))
        
        // Add projects to list
        setProjects(prev => [...data.projects, ...prev])
        
        // Add activity log
        const newActivity: ActivityLog = {
          id: `activity_${Date.now()}`,
          userId: user.id,
          userName: getUserName(user, 'You'),
          action: 'uploaded',
          description: `uploaded ${files.length} files and created ${data.projects.length} projects`,
          timestamp: new Date().toISOString(),
        }
        setActivity(prev => [newActivity, ...prev])
        
        console.log('[SESSION_VAULT_V2] Upload successful:', data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[SESSION_VAULT_V2] Upload failed:', errorData)
        
        // Mark all as error
        setUploadFiles(prev => prev.map(f => ({ 
          ...f, 
          status: 'error',
          error: errorData.error || 'Upload failed'
        })))
      }
    } catch (error: any) {
      console.error('[SESSION_VAULT_V2] Upload error:', error)
      
      // Mark all as error
      setUploadFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error',
        error: error.message || 'Upload failed'
      })))
    } finally {
      setIsUploading(false)
    }
  }

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [user?.id])

  // Handle project click
  const handleProjectClick = async (project: Project) => {
    try {
      const response = await fetch(`/api/session-vault/projects/${project.id}`)
      const data = await response.json()
      setSelectedProject(data.project)
      setSelectedAssets(data.assets)
      setComments(data.project.comments || [])
      setCollaborators(data.project.collaborators || [])
      setShowDetailModal(true)
    } catch (error) {
      console.error('[SESSION_VAULT_V2] Failed to fetch project details:', error)
    }
  }

  // Handle project update
  const handleProjectUpdate = async (updates: Partial<Project>) => {
    if (!selectedProject) return

    try {
      const response = await fetch(`/api/session-vault/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedProject(data.project)
        setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p))
        
        // Add activity
        const newActivity: ActivityLog = {
          id: `activity_${Date.now()}`,
          projectId: selectedProject.id,
          userId: user?.id || '',
          userName: getUserName(user, 'You'),
          action: 'modified',
          description: `modified project "${selectedProject.title}"`,
          timestamp: new Date().toISOString(),
        }
        setActivity(prev => [newActivity, ...prev])
      }
    } catch (error) {
      console.error('[SESSION_VAULT_V2] Failed to update project:', error)
    }
  }

  // Handle project delete
  const handleProjectDelete = async () => {
    if (!selectedProject) return

    try {
      const response = await fetch(`/api/session-vault/projects/${selectedProject.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== selectedProject.id))
        setShowDetailModal(false)
        setSelectedProject(null)
        
        // Add activity
        const newActivity: ActivityLog = {
          id: `activity_${Date.now()}`,
          userId: user?.id || '',
          userName: getUserName(user, 'You'),
          action: 'deleted',
          description: `deleted project "${selectedProject.title}"`,
          timestamp: new Date().toISOString(),
        }
        setActivity(prev => [newActivity, ...prev])
      }
    } catch (error) {
      console.error('[SESSION_VAULT_V2] Failed to delete project:', error)
    }
  }

  // Handle comments
  const handleAddComment = (content: string) => {
    if (!selectedProject || !user) return

    const newComment: ProjectComment = {
      id: `comment_${Date.now()}`,
      userId: user.id,
      userName: getUserName(user, 'You'),
      content,
      createdAt: new Date().toISOString(),
    }

    setComments(prev => [...prev, newComment])
    
    // Add activity
    const newActivity: ActivityLog = {
      id: `activity_${Date.now()}`,
      projectId: selectedProject.id,
      userId: user.id,
      userName: getUserName(user, 'You'),
      action: 'commented',
      description: `commented on "${selectedProject.title}"`,
      timestamp: new Date().toISOString(),
    }
    setActivity(prev => [newActivity, ...prev])
  }

  // Handle collaborators
  const handleAddCollaborator = (email: string, role: string) => {
    if (!selectedProject || !user || !email || typeof email !== 'string') return

    const newCollab: ProjectCollaborator = {
      id: `collab_${Date.now()}`,
      userId: `user_${Date.now()}`,
      userName: email.includes('@') ? email.split('@')[0] : email,
      role: role as any,
      permissions: {
        canEdit: role !== 'viewer',
        canDelete: false,
        canInvite: role === 'owner',
        canComment: true,
      },
      addedAt: new Date().toISOString(),
      addedBy: user.id,
    }

    setCollaborators(prev => [...prev, newCollab])
    
    // Add activity
    const newActivity: ActivityLog = {
      id: `activity_${Date.now()}`,
      projectId: selectedProject.id,
      userId: user.id,
      userName: getUserName(user, 'You'),
      action: 'shared',
      description: `added ${email} as ${role}`,
      timestamp: new Date().toISOString(),
    }
    setActivity(prev => [newActivity, ...prev])
  }

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
  }

  // Get all unique tags
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)))

  // Project counts
  const projectCounts = {
    recents: Math.min(projects.length, 10),
    favorites: 0,
    shared: projects.filter(p => p.collaborators.length > 1).length,
    total: projects.length,
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-4">
            &gt; SESSION_VAULT
          </h1>
          <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
            Please sign in to access your vault
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="h-screen dark:bg-black bg-white flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Global Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-green-400/20 dark:bg-green-400/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="border-4 border-dashed dark:border-green-400 border-green-600 rounded-lg p-12 dark:bg-black/80 bg-white/80">
            <Upload className="h-16 w-16 dark:text-green-400 text-green-700 mx-auto mb-4" />
            <p className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
              DROP FILES ANYWHERE
            </p>
            <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mt-2">
              We'll auto-group them into projects
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="border-b-2 dark:border-green-400/30 border-green-600/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
            &gt; SESSION_VAULT
          </h1>
          <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <VaultSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          folders={folders}
          onCreateFolder={() => {
            const name = prompt('Folder name:')
            if (name) {
              const newFolder: FolderStructure = {
                id: `folder_${Date.now()}`,
                name,
                parentId: null,
                projectIds: [],
                createdAt: new Date().toISOString(),
                createdBy: user?.id || '',
              }
              setFolders(prev => [...prev, newFolder])
            }
          }}
          onSelectFolder={setSelectedFolderId}
          selectedFolderId={selectedFolderId}
          tags={allTags}
          onSelectTag={setSelectedTag}
          selectedTag={selectedTag}
          projectCounts={projectCounts}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <VaultToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            selectedCount={selectedProjectIds.size}
            onBulkAction={(action) => console.log('Bulk action:', action)}
          />

          {/* Projects Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isUploading && (
              <div className="mb-6 p-4 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-green-400/5 bg-green-50 flex items-center gap-3">
                <Loader2 className="h-5 w-5 dark:text-green-400 text-green-700 animate-spin" />
                <span className="font-mono text-sm dark:text-green-400 text-green-700">
                  Uploading and grouping files...
                </span>
              </div>
            )}

            {/* Upload Button (Click to Browse) */}
            <div className="mb-6">
              <button
                onClick={() => document.getElementById('file-input-v2')?.click()}
                className="w-full border-2 dark:border-green-400/50 border-green-600/50 p-6 text-center transition-all cursor-pointer hover:dark:border-green-400 hover:border-green-600 hover:dark:bg-green-400/5 hover:bg-green-50"
              >
                <input
                  id="file-input-v2"
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                  accept="audio/*,.flp,.als,.ptx,.logicx,.zip"
                />
                <Upload className="h-8 w-8 dark:text-green-400 text-green-700 mx-auto mb-2" />
                <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-1">
                  CLICK TO BROWSE FILES
                </h3>
                <p className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                  Or drag & drop anywhere on this page
                </p>
              </button>
            </div>

            {/* Projects Grid/List */}
            {filteredProjects.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 dark:border-green-400/30 border-green-600/40">
                <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                  No projects found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Panel */}
        {showActivityPanel && selectedProject && (
          <ActivityPanel
            projectId={selectedProject.id}
            comments={comments}
            collaborators={collaborators}
            activity={activity}
            currentUserId={user?.id || ''}
            currentUserName={getUserName(user, 'You')}
            onAddComment={handleAddComment}
            onAddCollaborator={handleAddCollaborator}
            onRemoveCollaborator={handleRemoveCollaborator}
          />
        )}
      </div>

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <ProjectDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedProject(null)
          }}
          project={selectedProject}
          assets={selectedAssets}
          onUpdate={handleProjectUpdate}
          onDelete={handleProjectDelete}
        />
      )}
      
      {/* Upload Status */}
      {showUploadStatus && uploadFiles.length > 0 && (
        <UploadStatus
          files={uploadFiles}
          onClose={() => {
            setShowUploadStatus(false)
            setUploadFiles([])
          }}
        />
      )}
    </div>
  )
}
