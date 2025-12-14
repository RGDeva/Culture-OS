'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import {
  Upload,
  Music2,
  Filter,
  Search,
  Grid3x3,
  List,
  Plus,
  FolderPlus,
  Users,
  ShoppingCart,
  Play,
  Pause,
  Download,
  Share2,
  MoreVertical,
  X,
  Loader2,
  FileAudio,
  Check,
  Edit,
} from 'lucide-react'
import { CreativeAsset, AssetType, AssetStatus, UserRole, VaultFilters } from '@/types/vault'
import { getRoleUploadHints } from '@/lib/audioUtils'
import { AssetDetailModalV2 } from '@/components/vault/AssetDetailModalV2'
import { CyaniteFilters } from '@/components/vault/CyaniteFilters'
import { CyaniteAnalysisBadge } from '@/components/vault/CyaniteAnalysisBadge'
import { CreateProjectModal } from '@/components/vault/CreateProjectModal'
import { SmartUpload } from '@/components/vault/SmartUpload'
import { VaultSidebar } from '@/components/session-vault/VaultSidebar'
import { SidebarView, FolderStructure } from '@/types/sessionVault'

export default function VaultPage() {
  const { authenticated, user, login } = usePrivy()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [assets, setAssets] = useState<CreativeAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<Array<{ name: string; progress: number; status: 'uploading' | 'complete' | 'error' }>>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<CreativeAsset | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'lastOpened' | 'kind' | 'size'>('date')
  
  // Filters
  const [filters, setFilters] = useState<VaultFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modals
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showSmartUpload, setShowSmartUpload] = useState(false)
  
  // Sidebar state
  const [sidebarView, setSidebarView] = useState<SidebarView>('recents')
  const [folders, setFolders] = useState<FolderStructure[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  
  // Drag and drop state
  const [draggedAsset, setDraggedAsset] = useState<CreativeAsset | null>(null)
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null)
  const [dropTargetAsset, setDropTargetAsset] = useState<string | null>(null)
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    asset: CreativeAsset
  } | null>(null)
  const [renameAsset, setRenameAsset] = useState<CreativeAsset | null>(null)
  const [newAssetName, setNewAssetName] = useState('')
  
  // User profile data
  const [userRoles, setUserRoles] = useState<UserRole[]>(['PRODUCER'])
  
  // Load user profile to get roles
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/profile?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.roles && data.roles.length > 0) {
            setUserRoles(data.roles)
          }
        }
      } catch (error) {
        console.error('[VAULT_V2] Error loading profile:', error)
      }
    }
    
    loadProfile()
  }, [user?.id])
  
  // Load assets
  useEffect(() => {
    if (authenticated && user?.id) {
      fetchAssets()
    } else {
      setLoading(false)
    }
  }, [authenticated, user?.id, filters, searchQuery])
  
  const fetchAssets = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams({ ownerId: user.id })
      
      if (filters.assetType) params.append('assetType', filters.assetType)
      if (filters.status) params.append('status', filters.status)
      if (filters.genre) params.append('genre', filters.genre)
      if (filters.key) params.append('key', filters.key)
      if (searchQuery) params.append('search', searchQuery)
      if (filters.bpmRange?.min) params.append('bpmMin', filters.bpmRange.min.toString())
      if (filters.bpmRange?.max) params.append('bpmMax', filters.bpmRange.max.toString())
      
      const response = await fetch(`/api/vault/assets?${params}`)
      if (response.ok) {
        const data = await response.json()
        const fetchedAssets = data.assets || []
        setAssets(fetchedAssets)
        
        // Extract unique tags from assets
        const allTags = new Set<string>()
        fetchedAssets.forEach((asset: CreativeAsset) => {
          if (asset.genre) allTags.add(asset.genre)
          if (asset.moodTags) asset.moodTags.forEach(tag => allTags.add(tag))
        })
        setTags(Array.from(allTags))
      }
    } catch (error) {
      console.error('[VAULT] Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Handle file upload - optimized for bulk uploads (10-20 files)
  const handleFileUpload = async (files: FileList) => {
    if (!user?.id || files.length === 0) return
    
    setUploading(true)
    
    // Initialize upload queue
    const queue = Array.from(files).map(file => ({
      name: file.name,
      progress: 0,
      status: 'uploading' as const,
    }))
    setUploadQueue(queue)
    
    console.log(`[VAULT] Starting bulk upload of ${files.length} files...`)
    
    // Check for related files and auto-create folders/projects
    const { groupRelatedFiles, extractBaseFilename, isProjectFile, detectProjectGroup } = await import('@/lib/audioUtils')
    const fileNames = Array.from(files).map(f => f.name)
    const fileGroups = groupRelatedFiles(fileNames)
    
    // Detect if this is a project upload (.ptx, .flp, or multiple related files)
    const projectName = detectProjectGroup(fileNames)
    const hasProjectFiles = fileNames.some(f => isProjectFile(f))
    
    // Create folders for groups with 2+ files OR if project files detected
    const createdFolders = new Map<string, string>()
    for (const [baseName, groupFiles] of fileGroups.entries()) {
      const shouldCreateFolder = groupFiles.length >= 2 || groupFiles.some(f => isProjectFile(f))
      
      if (shouldCreateFolder) {
        const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const isProjectFolder = groupFiles.some(f => isProjectFile(f))
        
        const newFolder: FolderStructure = {
          id: folderId,
          name: baseName,
          parentId: null,
          color: isProjectFolder ? '#9d4edd' : '#00ffff', // Purple for project folders, Cyan for auto-created
          projectIds: [],
          createdAt: new Date().toISOString(),
          createdBy: user.id,
        }
        setFolders(prev => [...prev, newFolder])
        createdFolders.set(baseName, folderId)
        
        const folderType = isProjectFolder ? 'PROJECT' : 'FOLDER'
        console.log(`[VAULT] Auto-created ${folderType} "${baseName}" for ${groupFiles.length} related files`)
      }
    }
    
    try {
      // Upload files in parallel batches of 5 for better performance
      const batchSize = 5
      const fileArray = Array.from(files)
      
      for (let batchStart = 0; batchStart < fileArray.length; batchStart += batchSize) {
        const batch = fileArray.slice(batchStart, batchStart + batchSize)
        
        // Process batch in parallel
        await Promise.all(
          batch.map(async (file, batchIdx) => {
            const i = batchStart + batchIdx
            
            try {
              // Update progress
              setUploadQueue(prev => prev.map((item, idx) => 
                idx === i ? { ...item, progress: 25 } : item
              ))
              
              const formData = new FormData()
              formData.append('file', file)
              formData.append('userId', user.id)
              formData.append('userRoles', JSON.stringify(userRoles))
              
              setUploadQueue(prev => prev.map((item, idx) => 
                idx === i ? { ...item, progress: 50 } : item
              ))
              
              const response = await fetch('/api/vault/upload', {
                method: 'POST',
                body: formData,
              })
              
              if (response.ok) {
                const { asset } = await response.json()
                
                setUploadQueue(prev => prev.map((item, idx) => 
                  idx === i ? { ...item, progress: 100, status: 'complete' } : item
                ))
                
                // Only parse audio metadata for actual audio files (not .ptx, .zip, etc.)
                const audioExtensions = ['.mp3', '.wav', '.aiff', '.aif', '.flac', '.m4a', '.ogg', '.wma']
                const isAudioFile = audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
                
                if (isAudioFile) {
                  try {
                    const { parseAudioFile, detectBPM } = await import('@/lib/audioParser')
                    const metadata = await parseAudioFile(file)
                    const bpm = await detectBPM(file)
                    
                    // Update asset with parsed metadata (non-blocking)
                    fetch(`/api/vault/assets/${asset.id}/metadata`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        duration: metadata.duration,
                        sampleRate: metadata.sampleRate,
                        bpm: bpm || metadata.bpm,
                        key: metadata.key,
                        genre: metadata.genre,
                      }),
                    }).catch(err => console.warn('[VAULT] Metadata update failed:', err))
                    
                    console.log('[VAULT] Parsed audio metadata:', { file: file.name, duration: metadata.duration, bpm })
                  } catch (parseError) {
                    console.warn('[VAULT] Audio parsing skipped or failed:', file.name, parseError)
                  }
                } else {
                  console.log('[VAULT] Skipping audio parsing for non-audio file:', file.name)
                }
              } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                setUploadQueue(prev => prev.map((item, idx) => 
                  idx === i ? { ...item, status: 'error' } : item
                ))
                console.error(`Failed to upload ${file.name}:`, errorData.error)
              }
            } catch (error) {
              console.error(`Error uploading ${file.name}:`, error)
              setUploadQueue(prev => prev.map((item, idx) => 
                idx === i ? { ...item, status: 'error' } : item
              ))
            }
          })
        )
      }
      
      console.log(`[VAULT] Bulk upload complete: ${files.length} files processed`)
      
      // Refresh assets
      await fetchAssets()
      
      // Clear queue after 1.5 seconds for faster UI response
      setTimeout(() => setUploadQueue([]), 1500)
    } catch (error) {
      console.error('[VAULT] Bulk upload error:', error)
    } finally {
      setUploading(false)
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
    // Only set to false if leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const items = e.dataTransfer.items
    const allFiles: File[] = []
    const folderStructure: { [folderName: string]: File[] } = {}
    
    // Process all dropped items (files and folders)
    if (items) {
      const promises: Promise<void>[] = []
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        if (item.kind === 'file') {
          const entry = (item as any).webkitGetAsEntry?.() || (item as any).getAsEntry?.()
          
          if (entry) {
            promises.push(
              (async () => {
                if (entry.isFile) {
                  const file = await new Promise<File>((resolve) => {
                    (entry as any).file((f: File) => resolve(f))
                  })
                  allFiles.push(file)
                } else if (entry.isDirectory) {
                  // Handle folder
                  const folderName = entry.name
                  const files = await readDirectory(entry as any)
                  folderStructure[folderName] = files
                  allFiles.push(...files)
                  
                  // Auto-create folder and project
                  const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                  const newFolder: FolderStructure = {
                    id: folderId,
                    name: folderName,
                    parentId: null,
                    color: '#ff00ff', // Magenta for dropped folders
                    projectIds: [],
                    createdAt: new Date().toISOString(),
                    createdBy: user?.id || 'unknown',
                  }
                  setFolders(prev => [...prev, newFolder])
                  console.log(`[VAULT] Auto-created folder "${folderName}" from dropped folder`)
                }
              })()
            )
          }
        }
      }
      
      await Promise.all(promises)
    } else {
      // Fallback for browsers that don't support items
      const files = e.dataTransfer.files
      if (files.length > 0) {
        allFiles.push(...Array.from(files))
      }
    }
    
    if (allFiles.length > 0) {
      const fileList = createFileList(allFiles)
      handleFileUpload(fileList)
    }
  }, [user?.id, userRoles])
  
  // Helper to read directory recursively
  const readDirectory = async (dirEntry: any): Promise<File[]> => {
    const files: File[] = []
    const reader = dirEntry.createReader()
    
    const readEntries = (): Promise<void> => {
      return new Promise((resolve) => {
        reader.readEntries(async (entries: any[]) => {
          if (entries.length === 0) {
            resolve()
            return
          }
          
          for (const entry of entries) {
            if (entry.isFile) {
              const file = await new Promise<File>((res) => {
                entry.file((f: File) => res(f))
              })
              // Only add audio files
              if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|flac|aac|ogg)$/i)) {
                files.push(file)
              }
            } else if (entry.isDirectory) {
              const subFiles = await readDirectory(entry)
              files.push(...subFiles)
            }
          }
          
          await readEntries() // Continue reading
          resolve()
        })
      })
    }
    
    await readEntries()
    return files
  }
  
  // Helper to create FileList from File array
  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer()
    files.forEach(file => dataTransfer.items.add(file))
    return dataTransfer.files
  }
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files)
    }
  }
  
  // Filter handlers
  const updateFilter = (key: keyof VaultFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  
  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }
  
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Music2 className="h-16 w-16 dark:text-green-400 text-green-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-4">
            &gt; VAULT_ACCESS_REQUIRED
          </h2>
          <p className="dark:text-green-400/70 text-green-700/70 font-mono mb-6">
            Login to access your creative vault
          </p>
          <Button
            onClick={login}
            className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
          >
            LOGIN
          </Button>
        </div>
      </div>
    )
  }
  
  const uploadHints = getRoleUploadHints(userRoles[0] || 'PRODUCER')
  const activeFiltersCount = Object.keys(filters).filter(k => {
    const value = filters[k as keyof VaultFilters]
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined)
    }
    return !!value
  }).length
  
  const handleCreateFolder = () => {
    setShowCreateFolder(true)
  }

  const handleFolderCreated = (folderName: string, color: string) => {
    const newFolder: FolderStructure = {
      id: `folder-${Date.now()}`,
      name: folderName,
      parentId: null,
      color: color || '#00ff41',
      projectIds: [],
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'unknown',
    }
    setFolders([...folders, newFolder])
    setShowCreateFolder(false)
  }

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId)
    // Filter assets by folder
    // TODO: Implement folder-asset relationship
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/vault/folders?folderId=${folderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove folder from state
        setFolders(prev => prev.filter(f => f.id !== folderId))
        
        // Deselect if this folder was selected
        if (selectedFolderId === folderId) {
          setSelectedFolderId(undefined)
        }
        
        console.log('[VAULT] Folder deleted:', folderId)
      }
    } catch (error) {
      console.error('[VAULT] Error deleting folder:', error)
    }
  }

  // Asset drag-to-folder handlers
  const handleAssetDragStart = (asset: CreativeAsset) => {
    console.log('[VAULT_DRAG] Starting drag:', asset.title)
    setDraggedAsset(asset)
  }

  const handleAssetDragEnd = () => {
    console.log('[VAULT_DRAG] Drag ended')
    setDraggedAsset(null)
    setDropTargetFolder(null)
    setDropTargetAsset(null)
  }

  // Handler for dragging asset over another asset
  const handleAssetDragOver = (e: React.DragEvent, assetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedAsset && draggedAsset.id !== assetId) {
      console.log('[VAULT_DRAG] Hovering over:', assetId)
      setDropTargetAsset(assetId)
    }
  }

  const handleAssetDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    console.log('[VAULT_DRAG] Left drop target')
    setDropTargetAsset(null)
  }

  // Handler for dropping asset onto another asset - creates a project folder
  const handleAssetDrop = async (e: React.DragEvent, targetAsset: CreativeAsset) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('[VAULT_DRAG] Drop triggered!', {
      draggedAsset: draggedAsset?.title,
      targetAsset: targetAsset.title
    })
    
    if (!draggedAsset || draggedAsset.id === targetAsset.id) {
      console.log('[VAULT_DRAG] Drop cancelled - same asset or no dragged asset')
      return
    }
    
    // Generate project name from common prefix of both files
    const getBaseName = (title: string) => {
      // Remove file extension
      const withoutExt = title.replace(/\.[^/.]+$/, '')
      // Remove trailing numbers and common suffixes
      return withoutExt.replace(/[-_]?\d+$/, '').replace(/[-_]?(v\d+|final|mix|master|stem|alt)$/i, '').trim()
    }
    
    const baseName1 = getBaseName(draggedAsset.title)
    const baseName2 = getBaseName(targetAsset.title)
    
    // Find common prefix or use the shorter base name
    let projectName = baseName1
    if (baseName1.toLowerCase() === baseName2.toLowerCase()) {
      projectName = baseName1
    } else {
      // Find common prefix
      let commonPrefix = ''
      const minLen = Math.min(baseName1.length, baseName2.length)
      for (let i = 0; i < minLen; i++) {
        if (baseName1[i].toLowerCase() === baseName2[i].toLowerCase()) {
          commonPrefix += baseName1[i]
        } else {
          break
        }
      }
      projectName = commonPrefix.trim().replace(/[-_]$/, '') || baseName1
    }
    
    // Create new project folder
    const newFolder: FolderStructure = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${projectName}.track`,
      color: '#00ff41',
      projectIds: [draggedAsset.id, targetAsset.id],
      createdAt: new Date().toISOString(),
      parentId: null,
      createdBy: user?.id || '',
    }
    
    // Add folder to state
    setFolders(prev => [...prev, newFolder])
    
    // Update both assets to belong to this folder
    try {
      await Promise.all([
        fetch('/api/vault/assets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId: draggedAsset.id,
            updates: { folderId: newFolder.id },
          }),
        }),
        fetch('/api/vault/assets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId: targetAsset.id,
            updates: { folderId: newFolder.id },
          }),
        }),
      ])
      
      // Refresh assets
      await fetchAssets()
      
      // Switch to folders view and select the new folder
      setSidebarView('folders')
      setSelectedFolderId(newFolder.id)
      
      console.log(`[VAULT] Created project folder "${newFolder.name}" with ${draggedAsset.title} and ${targetAsset.title}`)
      
      // Show success notification
      alert(`✓ Project folder "${newFolder.name}" created with 2 files!`)
    } catch (error) {
      console.error('[VAULT] Error creating project from assets:', error)
      alert('Failed to create project folder')
    }
    
    setDraggedAsset(null)
    setDropTargetAsset(null)
  }

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTargetFolder(folderId)
  }

  const handleFolderDragLeave = () => {
    setDropTargetFolder(null)
  }

  const handleFolderDrop = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedAsset) return
    
    try {
      // Update asset's folder assignment
      const response = await fetch('/api/vault/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: draggedAsset.id,
          updates: {
            folderId: folderId,
          },
        }),
      })
      
      if (response.ok) {
        // Update folder's projectIds
        setFolders(folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              projectIds: [...folder.projectIds, draggedAsset.id],
            }
          }
          return folder
        }))
        
        // Refresh assets
        await fetchAssets()
      }
    } catch (error) {
      console.error('[VAULT] Error moving asset to folder:', error)
    }
    
    setDraggedAsset(null)
    setDropTargetFolder(null)
  }

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, asset: CreativeAsset) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      asset,
    })
  }

  const handleRename = async () => {
    if (!renameAsset || !newAssetName.trim()) return
    
    try {
      const response = await fetch('/api/vault/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: renameAsset.id,
          updates: { title: newAssetName.trim() },
        }),
      })
      
      if (response.ok) {
        await fetchAssets()
        setRenameAsset(null)
        setNewAssetName('')
      }
    } catch (error) {
      console.error('[VAULT] Error renaming asset:', error)
    }
  }

  const handleAddToProject = (asset: CreativeAsset) => {
    setSelectedAsset(asset)
    setContextMenu(null)
  }

  const handleCreateProjectFromAsset = async (asset: CreativeAsset) => {
    const baseName = asset.title.replace(/\.[^/.]+$/, '').replace(/[-_]?\d+$/, '').trim()
    
    const newFolder: FolderStructure = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${baseName}.track`,
      color: '#9d4edd',
      projectIds: [asset.id],
      createdAt: new Date().toISOString(),
      parentId: null,
      createdBy: user?.id || '',
    }
    
    setFolders(prev => [...prev, newFolder])
    
    try {
      await fetch('/api/vault/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          updates: { folderId: newFolder.id },
        }),
      })
      
      await fetchAssets()
      setSidebarView('folders')
      setSelectedFolderId(newFolder.id)
      setContextMenu(null)
      
      alert(`✓ Project "${newFolder.name}" created!`)
    } catch (error) {
      console.error('[VAULT] Error creating project:', error)
    }
  }

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  const projectCounts = {
    recents: assets.filter(a => {
      const createdDate = new Date(a.createdAt)
      const daysSince = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 7
    }).length,
    favorites: assets.filter(a => a.status === 'FOR_SALE').length,
    shared: 0, // TODO: implement shared logic
    total: assets.length,
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <VaultSidebar
        activeView={sidebarView}
        onViewChange={setSidebarView}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onSelectFolder={handleSelectFolder}
        onDeleteFolder={handleDeleteFolder}
        selectedFolderId={selectedFolderId}
        tags={tags}
        onSelectTag={setSelectedTag}
        selectedTag={selectedTag}
        projectCounts={projectCounts}
        onFolderDragOver={handleFolderDragOver}
        onFolderDragLeave={handleFolderDragLeave}
        onFolderDrop={handleFolderDrop}
        dropTargetFolder={dropTargetFolder}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Music2 className="h-8 w-8 dark:text-green-400 text-green-700" />
              <h1 className="text-4xl font-bold font-mono dark:text-green-400 text-green-700">
                &gt; VAULT
              </h1>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".wav,.mp3,.aiff,.flac,.m4a,.zip"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm font-mono dark:text-green-400/60 text-green-700/70">
            <span>{assets.length} ASSETS</span>
            <span>•</span>
            <span>ROLE: {userRoles.join(', ')}</span>
            {activeFiltersCount > 0 && (
              <>
                <span>•</span>
                <span>{activeFiltersCount} FILTER{activeFiltersCount !== 1 ? 'S' : ''} ACTIVE</span>
              </>
            )}
          </div>
          
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b-2 dark:border-green-400/30 border-green-600/40">
            <button
              onClick={() => { setSidebarView('recents'); setSelectedFolderId(undefined); }}
              className={`px-4 py-2 text-sm font-mono transition-colors ${
                sidebarView === 'recents' && !selectedFolderId
                  ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600'
                  : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
              }`}
            >
              ALL_FILES
            </button>
            <button
              onClick={() => { setSidebarView('folders'); setSelectedFolderId(undefined); }}
              className={`px-4 py-2 text-sm font-mono transition-colors ${
                sidebarView === 'folders' || selectedFolderId
                  ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600'
                  : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
              }`}
            >
              PROJECTS
            </button>
            <button
              onClick={() => setSidebarView('collaborators')}
              className={`px-4 py-2 text-sm font-mono transition-colors ${
                sidebarView === 'collaborators'
                  ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600'
                  : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
              }`}
            >
              COLLABORATORS
            </button>
            <button
              onClick={() => setSidebarView('listings')}
              className={`px-4 py-2 text-sm font-mono transition-colors ${
                sidebarView === 'listings'
                  ? 'dark:bg-pink-400/20 bg-pink-600/20 dark:text-pink-400 text-pink-700 border-b-2 dark:border-pink-400 border-pink-600'
                  : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
              }`}
            >
              MY_LISTINGS
            </button>
          </div>
        </div>
        
        {/* Search and Filters Bar */}
        <div className="mb-6 border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, genre, or tags..."
                className="w-full pl-10 pr-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none dark:focus:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="border-2 dark:border-green-400/30 border-green-600/40 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'dark:bg-green-400 dark:text-black bg-green-600 text-white'
                    : 'dark:text-green-400 text-green-700'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l-2 dark:border-green-400/30 border-green-600/40 ${
                  viewMode === 'list'
                    ? 'dark:bg-green-400 dark:text-black bg-green-600 text-white'
                    : 'dark:text-green-400 text-green-700'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {/* Sort By Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none"
            >
              <option value="date">Date Added</option>
              <option value="name">Name</option>
              <option value="lastOpened">Last Opened</option>
              <option value="kind">File Kind</option>
              <option value="size">Size</option>
            </select>
            
            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              FILTERS
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 dark:bg-green-400 dark:text-black bg-green-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-mono dark:text-pink-400 text-pink-600 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                CLEAR
              </button>
            )}
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t-2 dark:border-green-400/20 border-green-600/30">
              {/* Product Category */}
              <div>
                <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                  PRODUCT_TYPE:
                </label>
                <select
                  value={filters.productCategory || ''}
                  onChange={(e) => updateFilter('productCategory', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none"
                >
                  <option value="">ALL</option>
                  <option value="LOOP">🔁 LOOP</option>
                  <option value="BEAT">🎵 BEAT</option>
                  <option value="DRUM_KIT">🥁 DRUM_KIT</option>
                  <option value="SAMPLE">🎹 SAMPLE</option>
                  <option value="ONE_SHOT">⚡ ONE_SHOT</option>
                  <option value="VOCAL_SAMPLE">🎤 VOCAL</option>
                  <option value="MIDI">🎼 MIDI</option>
                  <option value="PRESET">⚙️ PRESET</option>
                  <option value="SAMPLE_PACK">📦 SAMPLE_PACK</option>
                  <option value="BEAT_PACK">📦 BEAT_PACK</option>
                  <option value="STEMS">🎚️ STEMS</option>
                  <option value="FULL_SONG">🎧 FULL_SONG</option>
                  <option value="SESSION_FILES">📁 SESSION</option>
                </select>
              </div>
              
              {/* Asset Type */}
              <div>
                <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                  ASSET_TYPE:
                </label>
                <select
                  value={filters.assetType || ''}
                  onChange={(e) => updateFilter('assetType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none"
                >
                  <option value="">ALL</option>
                  <option value="BEAT">BEAT</option>
                  <option value="SONG_DEMO">SONG_DEMO</option>
                  <option value="VOCAL">VOCAL</option>
                  <option value="LOOP">LOOP</option>
                  <option value="STEMS">STEMS</option>
                  <option value="MIX">MIX</option>
                  <option value="MASTER">MASTER</option>
                  <option value="REFERENCE">REFERENCE</option>
                  <option value="SESSION_FILES">SESSION_FILES</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                  STATUS:
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none"
                >
                  <option value="">ALL</option>
                  <option value="IDEA">IDEA</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="FOR_SALE">FOR_SALE</option>
                  <option value="PLACED">PLACED</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
              </div>
              
              {/* Genre */}
              <div>
                <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                  GENRE:
                </label>
                <input
                  type="text"
                  value={filters.genre || ''}
                  onChange={(e) => updateFilter('genre', e.target.value || undefined)}
                  placeholder="Hip-Hop, Trap, etc."
                  className="w-full px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Cyanite AI Filters */}
        {showFilters && (
          <div className="mb-6">
            <CyaniteFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <Button
            onClick={() => setShowSmartUpload(true)}
            className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            SMART_UPLOAD
          </Button>
          <Button
            onClick={() => setShowCreateProject(true)}
            variant="outline"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-sm"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            NEW_PROJECT
          </Button>
        </div>
        
        {/* Drag and Drop Zone + Assets */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative min-h-[400px] border-2 transition-all ${
            isDragging
              ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
              : 'dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80'
          }`}
        >
          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center dark:bg-green-400/20 bg-green-600/20 backdrop-blur-sm">
              <div className="text-center">
                <Upload className="h-16 w-16 dark:text-green-400 text-green-700 mx-auto mb-4 animate-bounce" />
                <p className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                  DROP_FILES_HERE
                </p>
                <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mt-2">
                  Supports: WAV, MP3, AIFF, FLAC, M4A, PTX, ZIP, MIDI, etc.
                </p>
                <p className="text-xs font-mono dark:text-cyan-400 text-cyan-600 mt-3 px-4">
                  💡 Bulk Upload: Drop 10-20 files at once!
                </p>
              </div>
            </div>
          )}
          
          {/* Upload Queue - Enhanced for Bulk Uploads */}
          {uploadQueue.length > 0 && (
            <div className="absolute top-4 right-4 z-20 w-96 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-mono font-bold dark:text-green-400 text-green-700 text-sm">
                  BULK UPLOAD: {uploadQueue.filter(i => i.status === 'complete').length}/{uploadQueue.length} FILES
                </h4>
                <Loader2 className="h-4 w-4 dark:text-green-400 text-green-700 animate-spin" />
              </div>
              
              {/* Overall Progress Bar */}
              <div className="mb-3">
                <div className="h-2 dark:bg-green-400/20 bg-green-600/20 rounded-full overflow-hidden">
                  <div
                    className="h-full dark:bg-green-400 bg-green-600 transition-all duration-300"
                    style={{ 
                      width: `${(uploadQueue.filter(i => i.status === 'complete').length / uploadQueue.length) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                  <span>{uploadQueue.filter(i => i.status === 'complete').length} completed</span>
                  <span>{uploadQueue.filter(i => i.status === 'error').length} errors</span>
                  <span>{uploadQueue.filter(i => i.status === 'uploading').length} uploading</span>
                </div>
              </div>
              
              {/* Individual File Progress */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadQueue.map((item, idx) => (
                  <div key={idx} className="text-xs font-mono">
                    <div className="flex items-center justify-between mb-1">
                      <span className="dark:text-green-400/70 text-green-700/70 truncate flex-1">
                        {item.name}
                      </span>
                      {item.status === 'complete' && (
                        <Check className="h-3 w-3 dark:text-green-400 text-green-700 ml-2 flex-shrink-0" />
                      )}
                      {item.status === 'error' && (
                        <X className="h-3 w-3 dark:text-red-400 text-red-600 ml-2 flex-shrink-0" />
                      )}
                      {item.status === 'uploading' && (
                        <span className="dark:text-cyan-400 text-cyan-600 ml-2 flex-shrink-0">{item.progress}%</span>
                      )}
                    </div>
                    {item.status === 'uploading' && (
                      <div className="h-1 dark:bg-green-400/20 bg-green-600/20 rounded-full overflow-hidden">
                        <div
                          className="h-full dark:bg-green-400 bg-green-600 transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-mono dark:text-green-400/60 text-green-700/70">LOADING_ASSETS...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <FileAudio className="h-16 w-16 dark:text-green-400/30 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                  NO_ASSETS_YET
                </h3>
                <p className="dark:text-green-400/60 text-green-700/70 font-mono mb-4">
                  Drag and drop audio files here or click to browse
                </p>
                <p className="text-xs font-mono dark:text-green-400/50 text-green-700/50 mb-6">
                  {uploadHints && uploadHints.length > 0 ? uploadHints[0] : 'Upload beats, loops, stems, and more'}
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  BROWSE_FILES
                </Button>
              </div>
            ) : (
              <>
                {/* Slim dropzone bar when assets exist */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-6 p-4 border-2 border-dashed dark:border-green-400/30 border-green-600/40 dark:hover:border-green-400/50 hover:border-green-600/50 cursor-pointer transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                    <span className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                      Drop audio files here or click to browse
                    </span>
                  </div>
                </div>
                
                {/* Projects Grid - Show when in folders view and no folder selected */}
                {sidebarView === 'folders' && !selectedFolderId && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
                      &gt; ALL_PROJECTS ({folders.length})
                    </h3>
                    {folders.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed dark:border-green-400/30 border-green-600/30">
                        <FolderPlus className="h-12 w-12 mx-auto mb-4 dark:text-green-400/50 text-green-700/50" />
                        <p className="font-mono dark:text-green-400/60 text-green-700/70 mb-4">
                          No projects yet. Create one to organize your files.
                        </p>
                        <Button
                          onClick={() => setShowCreateProject(true)}
                          className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          CREATE_PROJECT
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {folders.map((folder) => (
                          <button
                            key={folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                            onDragLeave={handleFolderDragLeave}
                            onDrop={(e) => handleFolderDrop(e, folder.id)}
                            className={`text-left p-4 border-2 transition-all ${
                              dropTargetFolder === folder.id
                                ? 'dark:border-cyan-400 border-cyan-600 dark:bg-cyan-400/20 bg-cyan-600/20'
                                : 'dark:border-green-400/30 border-green-600/40 dark:hover:border-green-400 hover:border-green-600'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: folder.color || '#00ff41' }}
                              />
                              <h4 className="font-mono font-bold dark:text-green-400 text-green-700 truncate">
                                {folder.name}
                              </h4>
                            </div>
                            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60">
                              {folder.projectIds?.length || 0} files • {new Date(folder.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Collaborators View */}
                {sidebarView === 'collaborators' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
                      &gt; MY_COLLABORATORS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Sample collaborators - in production, fetch from API */}
                      <div className="p-4 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-black font-bold">
                            JD
                          </div>
                          <div>
                            <p className="font-mono font-bold dark:text-green-400 text-green-700">John Doe</p>
                            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60">Producer</p>
                          </div>
                        </div>
                        <p className="text-xs font-mono dark:text-green-400/50 text-green-700/50 mb-2">
                          3 shared projects
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
                        >
                          VIEW_PROJECTS
                        </Button>
                      </div>
                      
                      {/* Add Collaborator Card */}
                      <button
                        onClick={() => router.push('/network')}
                        className="p-4 border-2 border-dashed dark:border-green-400/30 border-green-600/40 flex flex-col items-center justify-center gap-2 hover:dark:border-green-400 hover:border-green-600 transition-colors"
                      >
                        <Users className="h-8 w-8 dark:text-green-400/50 text-green-700/50" />
                        <span className="font-mono text-sm dark:text-green-400/70 text-green-700/70">
                          FIND_COLLABORATORS
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* My Listings View */}
                {sidebarView === 'listings' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-mono dark:text-pink-400 text-pink-700 mb-4">
                      &gt; MY_LISTINGS ({assets.filter(a => a.status === 'FOR_SALE').length})
                    </h3>
                    {assets.filter(a => a.status === 'FOR_SALE').length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed dark:border-pink-400/30 border-pink-600/30">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 dark:text-pink-400/50 text-pink-700/50" />
                        <p className="font-mono dark:text-pink-400/60 text-pink-700/70 mb-4">
                          No listings yet. List your beats for sale to see them here.
                        </p>
                        <Button
                          onClick={() => { setSidebarView('recents'); }}
                          className="bg-pink-600 text-white hover:bg-pink-500 dark:bg-pink-400 dark:text-black dark:hover:bg-pink-300 font-mono"
                        >
                          <Music2 className="h-4 w-4 mr-2" />
                          BROWSE_FILES
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {assets.filter(a => a.status === 'FOR_SALE').map((asset) => (
                          <div
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className="p-4 border-2 dark:border-pink-400/30 border-pink-600/40 dark:bg-black/50 bg-white/80 cursor-pointer hover:dark:border-pink-400 hover:border-pink-600 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <Music2 className="h-6 w-6 dark:text-pink-400 text-pink-700" />
                              <span className="text-xs font-mono dark:text-green-400 text-green-600 font-bold">
                                FOR_SALE
                              </span>
                            </div>
                            <h4 className="font-mono font-bold dark:text-pink-400 text-pink-700 mb-2 truncate">
                              {asset.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs font-mono dark:text-pink-400/60 text-pink-700/60">
                              {asset.bpm && <span>{asset.bpm} BPM</span>}
                              {asset.key && <span>• {asset.key}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show folder header with back button when folder is selected */}
                {selectedFolderId && (
                  <div className="mb-4 flex items-center gap-4">
                    <button
                      onClick={() => setSelectedFolderId(undefined)}
                      className="flex items-center gap-2 px-3 py-1 border dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-sm hover:dark:bg-green-400/10 hover:bg-green-600/10"
                    >
                      ← BACK_TO_PROJECTS
                    </button>
                    <h3 className="font-mono font-bold dark:text-green-400 text-green-700">
                      {folders.find(f => f.id === selectedFolderId)?.name || 'Project'}
                    </h3>
                  </div>
                )}
                
                {/* Assets Grid/List */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
                  {assets
                    .filter(asset => {
                      // Filter by selected folder
                      if (selectedFolderId) {
                        return asset.folderId === selectedFolderId
                      }
                      
                      // Hide assets when showing projects overview
                      if (sidebarView === 'folders' && !selectedFolderId) {
                        return false
                      }
                      
                      // Filter by sidebar view
                      if (sidebarView === 'recents') {
                        // Show all files, sorted by date (most recent first)
                        return true
                      }
                      if (sidebarView === 'favorites') {
                        return asset.status === 'FOR_SALE' // Using FOR_SALE as favorite indicator
                      }
                      if (sidebarView === 'documents') {
                        // Show document files (PDFs, contracts, etc.)
                        const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf']
                        const ext = asset.title?.split('.').pop()?.toLowerCase()
                        return ext && docExtensions.includes(ext)
                      }
                      if (sidebarView === 'listings') {
                        // Show only assets that are listed for sale
                        return asset.status === 'FOR_SALE'
                      }
                      if (sidebarView === 'collaborators') {
                        // Hide assets in collaborators view - we show collaborators list instead
                        return false
                      }
                      
                      return true
                    })
                    .sort((a, b) => {
                      // Apply sorting based on sortBy state
                      switch (sortBy) {
                        case 'name':
                          return a.title.localeCompare(b.title)
                        case 'date':
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        case 'lastOpened':
                          // For now, use createdAt as proxy for lastOpened
                          // In production, track actual last opened time
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        case 'kind':
                          // Sort by file extension
                          const extA = a.title.split('.').pop()?.toLowerCase() || ''
                          const extB = b.title.split('.').pop()?.toLowerCase() || ''
                          return extA.localeCompare(extB)
                        case 'size':
                          // Sort by file size if available
                          return (b.fileSize || 0) - (a.fileSize || 0)
                        default:
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      }
                    })
                    .map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      viewMode={viewMode}
                      onClick={() => setSelectedAsset(asset)}
                      onContextMenu={(e) => handleContextMenu(e, asset)}
                      onDragStart={handleAssetDragStart}
                      onDragEnd={handleAssetDragEnd}
                      onAssetDragOver={handleAssetDragOver}
                      onAssetDragLeave={handleAssetDragLeave}
                      onAssetDrop={handleAssetDrop}
                      isDropTarget={dropTargetAsset === asset.id}
                    />
                  ))}
                </div>
                
                {/* Show message if folder is selected but empty */}
                {selectedFolderId && assets.filter(a => a.folderId === selectedFolderId).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-mono">
                      No files in this folder yet. Drag files here to add them.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Asset Detail Modal V2 - WITH STEM SEPARATION */}
        {selectedAsset && (
          <AssetDetailModalV2
            asset={selectedAsset}
            isOpen={!!selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onUpdate={async (updates) => {
              try {
                const response = await fetch('/api/vault/assets', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    assetId: selectedAsset.id,
                    updates,
                  }),
                })
                
                if (response.ok) {
                  await fetchAssets()
                  setSelectedAsset(null)
                }
              } catch (error) {
                console.error('[VAULT_V2] Error updating asset:', error)
              }
            }}
            onDelete={async () => {
              if (confirm('Are you sure you want to delete this asset?')) {
                try {
                  const response = await fetch(`/api/vault/assets?assetId=${selectedAsset.id}`, {
                    method: 'DELETE',
                  })
                  
                  if (response.ok) {
                    await fetchAssets()
                    setSelectedAsset(null)
                  }
                } catch (error) {
                  console.error('[VAULT_V2] Error deleting asset:', error)
                }
              }
            }}
          />
        )}
        
        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onSuccess={(project) => {
            console.log('[VAULT] Project created:', project)
            // Add project as a folder and stay on vault page
            const newFolder: FolderStructure = {
              id: project.id,
              name: project.title,
              parentId: null,
              color: project.color || '#00ff41',
              projectIds: [],
              createdAt: project.createdAt || new Date().toISOString(),
              createdBy: user?.id || 'unknown',
            }
            setFolders(prev => [...prev, newFolder])
            setShowCreateProject(false)
            // Switch to projects view to show the new project
            setSidebarView('folders')
          }}
          userId={user?.id || ''}
        />
        
        {/* Smart Upload Modal */}
        {showSmartUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-6">
              <button
                onClick={() => setShowSmartUpload(false)}
                className="absolute top-4 right-4 dark:text-green-400 text-green-700 hover:opacity-70"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-6">
                {'>'} SMART_FILE_UPLOAD
              </h2>
              <SmartUpload
                onUploadComplete={(groups) => {
                  console.log('[VAULT] Upload complete:', groups)
                  setShowSmartUpload(false)
                  fetchAssets()
                }}
              />
            </div>
          </div>
        )}
        
        {/* Folder Creation Modal */}
        {showCreateFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-6">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="absolute top-4 right-4 dark:text-green-400 text-green-700 hover:opacity-70"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-6">
                {'>'} CREATE_FOLDER
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                    FOLDER_NAME
                  </label>
                  <input
                    type="text"
                    id="folder-name-input"
                    placeholder="e.g., Beat Packs, Client Work..."
                    className="w-full px-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none dark:focus:border-green-400 focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                    COLOR
                  </label>
                  <div className="flex gap-2">
                    {['#00ff41', '#00ffff', '#ff00ff', '#ffff00', '#ff6b6b', '#4ecdc4'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          const input = document.getElementById('folder-color-input') as HTMLInputElement
                          if (input) input.value = color
                        }}
                        className="w-8 h-8 rounded border-2 dark:border-green-400/30 border-green-600/30 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="hidden"
                    id="folder-color-input"
                    defaultValue="#00ff41"
                  />
                </div>
                <Button
                  onClick={() => {
                    const nameInput = document.getElementById('folder-name-input') as HTMLInputElement
                    const colorInput = document.getElementById('folder-color-input') as HTMLInputElement
                    if (nameInput?.value) {
                      handleFolderCreated(nameInput.value, colorInput?.value || '#00ff41')
                    }
                  }}
                  className="w-full bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                >
                  CREATE_FOLDER
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 shadow-lg"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <div className="py-2">
              <button
                onClick={() => {
                  setRenameAsset(contextMenu.asset)
                  setNewAssetName(contextMenu.asset.title.replace(/\.[^/.]+$/, ''))
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left font-mono text-sm dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                RENAME
              </button>
              <button
                onClick={() => handleAddToProject(contextMenu.asset)}
                className="w-full px-4 py-2 text-left font-mono text-sm dark:text-cyan-400 text-cyan-700 hover:dark:bg-cyan-400/10 hover:bg-cyan-600/10 flex items-center gap-2"
              >
                <FolderPlus className="h-4 w-4" />
                ADD_TO_PROJECT
              </button>
              <button
                onClick={() => handleCreateProjectFromAsset(contextMenu.asset)}
                className="w-full px-4 py-2 text-left font-mono text-sm dark:text-purple-400 text-purple-700 hover:dark:bg-purple-400/10 hover:bg-purple-600/10 flex items-center gap-2"
              >
                <FolderPlus className="h-4 w-4" />
                CREATE_PROJECT
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.asset.id)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left font-mono text-sm dark:text-yellow-400 text-yellow-700 hover:dark:bg-yellow-400/10 hover:bg-yellow-600/10 flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                COPY_ID
              </button>
            </div>
          </div>
        )}
        
        {/* Rename Modal */}
        {renameAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-6">
              <button
                onClick={() => {
                  setRenameAsset(null)
                  setNewAssetName('')
                }}
                className="absolute top-4 right-4 dark:text-green-400 text-green-700 hover:opacity-70"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-6">
                {'>'} RENAME_FILE
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                    NEW_NAME
                  </label>
                  <input
                    type="text"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename()
                    }}
                    className="w-full px-4 py-2 dark:bg-black bg-white border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                    placeholder="Enter new name..."
                    autoFocus
                  />
                  <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mt-2">
                    Extension will be preserved: {renameAsset.title.match(/\.[^/.]+$/)?.[0] || ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRename}
                    className="flex-1 bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                  >
                    RENAME
                  </Button>
                  <Button
                    onClick={() => {
                      setRenameAsset(null)
                      setNewAssetName('')
                    }}
                    variant="outline"
                    className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

// Asset Card Component
function AssetCard({
  asset,
  viewMode,
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onAssetDragOver,
  onAssetDragLeave,
  onAssetDrop,
  isDropTarget,
}: {
  asset: CreativeAsset
  viewMode: 'grid' | 'list'
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  onDragStart?: (asset: CreativeAsset) => void
  onDragEnd?: () => void
  onAssetDragOver?: (e: React.DragEvent, assetId: string) => void
  onAssetDragLeave?: (e: React.DragEvent) => void
  onAssetDrop?: (e: React.DragEvent, asset: CreativeAsset) => void
  isDropTarget?: boolean
}) {
  const statusColors = {
    IDEA: 'dark:text-cyan-400 text-cyan-600',
    IN_PROGRESS: 'dark:text-yellow-400 text-yellow-600',
    FOR_SALE: 'dark:text-green-400 text-green-600',
    PLACED: 'dark:text-purple-400 text-purple-600',
    LOCKED: 'dark:text-red-400 text-red-600',
  }
  
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        onContextMenu={onContextMenu}
        draggable="true"
        onDragStart={(e) => {
          console.log('[ASSET_CARD] Drag start:', asset.title)
          onDragStart?.(asset)
        }}
        onDragEnd={(e) => {
          console.log('[ASSET_CARD] Drag end')
          onDragEnd?.()
        }}
        onDragOver={(e) => {
          console.log('[ASSET_CARD] Drag over:', asset.title)
          onAssetDragOver?.(e, asset.id)
        }}
        onDragLeave={(e) => {
          console.log('[ASSET_CARD] Drag leave')
          onAssetDragLeave?.(e)
        }}
        onDrop={(e) => {
          console.log('[ASSET_CARD] Drop on:', asset.title)
          onAssetDrop?.(e, asset)
        }}
        className={`relative w-full text-left border-2 p-4 transition-all cursor-move ${
          isDropTarget 
            ? 'dark:border-cyan-400 border-cyan-600 dark:bg-cyan-400/20 bg-cyan-600/20 scale-105' 
            : 'dark:border-green-400/20 border-gray-300 dark:hover:border-green-400/50 hover:border-green-600/50 dark:bg-black/50 bg-white/80'
        }`}
      >
        {isDropTarget && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-400/30 dark:bg-cyan-400/40 z-10 pointer-events-none rounded">
            <span className="font-mono text-sm dark:text-cyan-400 text-cyan-700 font-bold bg-black/50 px-2 py-1 rounded">DROP TO COMBINE</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Music2 className="h-5 w-5 dark:text-green-400 text-green-700" />
              <h3 className="font-mono font-bold dark:text-green-400 text-green-700">
                {asset.title}
              </h3>
              {asset.productCategory && (
                <span className="text-xs px-2 py-1 border dark:border-cyan-400/50 dark:text-cyan-400 border-cyan-600/50 text-cyan-700 font-mono">
                  {asset.productCategory}
                </span>
              )}
              <span className="text-xs px-2 py-1 border dark:border-pink-400/50 dark:text-pink-400 border-pink-600/50 text-pink-700 font-mono">
                {asset.assetType}
              </span>
              <span className={`text-xs font-mono ${statusColors[asset.status]}`}>
                {asset.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono dark:text-green-400/60 text-green-700/70">
              <CyaniteAnalysisBadge asset={asset} compact />
              <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <MoreVertical className="h-5 w-5 dark:text-green-400/50 text-green-700/50" />
        </div>
      </button>
    )
  }
  
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      draggable="true"
      onDragStart={(e) => {
        console.log('[ASSET_CARD] Drag start:', asset.title)
        onDragStart?.(asset)
      }}
      onDragEnd={(e) => {
        console.log('[ASSET_CARD] Drag end')
        onDragEnd?.()
      }}
      onDragOver={(e) => {
        console.log('[ASSET_CARD] Drag over:', asset.title)
        onAssetDragOver?.(e, asset.id)
      }}
      onDragLeave={(e) => {
        console.log('[ASSET_CARD] Drag leave')
        onAssetDragLeave?.(e)
      }}
      onDrop={(e) => {
        console.log('[ASSET_CARD] Drop on:', asset.title)
        onAssetDrop?.(e, asset)
      }}
      className={`relative text-left border-2 p-4 transition-all cursor-move ${
        isDropTarget 
          ? 'dark:border-cyan-400 border-cyan-600 dark:bg-cyan-400/20 bg-cyan-600/20 scale-105 ring-2 ring-cyan-400' 
          : 'dark:border-green-400/20 border-gray-300 dark:hover:border-green-400 hover:border-green-600 dark:bg-black/50 bg-white/80'
      }`}
    >
      {isDropTarget && (
        <div className="absolute inset-0 flex items-center justify-center bg-cyan-400/30 dark:bg-cyan-400/40 z-10 pointer-events-none rounded">
          <span className="font-mono text-sm dark:text-cyan-400 text-cyan-700 font-bold bg-black/50 px-2 py-1 rounded">DROP TO COMBINE</span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <Music2 className="h-6 w-6 dark:text-green-400 text-green-700" />
        <span className={`text-xs font-mono ${statusColors[asset.status]}`}>
          {asset.status}
        </span>
      </div>
      
      <h3 className="font-mono font-bold dark:text-green-400 text-green-700 mb-2 truncate">
        {asset.title}
      </h3>
      
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {asset.productCategory && (
          <span className="text-xs px-2 py-1 border dark:border-cyan-400/50 dark:text-cyan-400 border-cyan-600/50 text-cyan-700 font-mono">
            {asset.productCategory}
          </span>
        )}
        <span className="text-xs px-2 py-1 border dark:border-pink-400/50 dark:text-pink-400 border-pink-600/50 text-pink-700 font-mono">
          {asset.assetType}
        </span>
      </div>
      
      <div className="space-y-2">
        <CyaniteAnalysisBadge asset={asset} />
        <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
          {new Date(asset.createdAt).toLocaleDateString()}
        </div>
      </div>
    </button>
  )
}
