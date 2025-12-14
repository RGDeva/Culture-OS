/**
 * Session Vault Store
 * In-memory storage for Projects and Assets
 */

import { Project, Asset, ProjectRoleContext, ProjectStatus } from '@/types/sessionVault'

// In-memory storage
const projects: Map<string, Project> = new Map()
const assets: Map<string, Asset> = new Map()

// PROJECT OPERATIONS

export function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const project: Project = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
    collaborators: data.collaborators || [],
    comments: data.comments || [],
  }
  
  projects.set(id, project)
  console.log('[SESSION_VAULT] Created project:', id, project.title)
  
  return project
}

export function getProject(id: string): Project | undefined {
  return projects.get(id)
}

export function getProjectsByOwner(ownerId: string): Project[] {
  return Array.from(projects.values())
    .filter(p => p.ownerUserId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
  const existing = projects.get(id)
  if (!existing) return null
  
  const updated: Project = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  projects.set(id, updated)
  console.log('[SESSION_VAULT] Updated project:', id)
  
  return updated
}

export function deleteProject(id: string): boolean {
  // Also delete all associated assets
  const projectAssets = getAssetsByProject(id)
  projectAssets.forEach(asset => assets.delete(asset.id))
  
  const deleted = projects.delete(id)
  if (deleted) {
    console.log('[SESSION_VAULT] Deleted project and', projectAssets.length, 'assets:', id)
  }
  return deleted
}

// ASSET OPERATIONS

export function createAsset(data: Omit<Asset, 'id' | 'createdAt'>): Asset {
  const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const asset: Asset = {
    ...data,
    id,
    createdAt: now,
    modifiedAt: data.modifiedAt || now,
    comments: data.comments || [],
  }
  
  assets.set(id, asset)
  console.log('[SESSION_VAULT] Created asset:', id, asset.filename)
  
  return asset
}

export function getAsset(id: string): Asset | undefined {
  return assets.get(id)
}

export function getAssetsByProject(projectId: string): Asset[] {
  return Array.from(assets.values())
    .filter(a => a.projectId === projectId)
    .sort((a, b) => {
      // Primary assets first
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      // Then by type
      const typeOrder = ['MASTER_AUDIO', 'ALT_BOUNCE', 'STEM', 'DAW_SESSION', 'REFERENCE', 'DOCUMENT', 'OTHER']
      const aIndex = typeOrder.indexOf(a.type)
      const bIndex = typeOrder.indexOf(b.type)
      if (aIndex !== bIndex) return aIndex - bIndex
      // Then by name
      return a.name.localeCompare(b.name)
    })
}

export function updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>): Asset | null {
  const existing = assets.get(id)
  if (!existing) return null
  
  const updated: Asset = {
    ...existing,
    ...updates,
  }
  
  assets.set(id, updated)
  console.log('[SESSION_VAULT] Updated asset:', id)
  
  return updated
}

export function deleteAsset(id: string): boolean {
  const deleted = assets.delete(id)
  if (deleted) {
    console.log('[SESSION_VAULT] Deleted asset:', id)
  }
  return deleted
}

// SEARCH & FILTER

export function searchProjects(
  ownerId: string,
  filters: {
    search?: string
    status?: ProjectStatus[]
    hasStems?: boolean
    hasSession?: boolean
    hasContracts?: boolean
    tags?: string[]
    bpmRange?: [number, number]
    roleContext?: ProjectRoleContext[]
  }
): Project[] {
  let results = getProjectsByOwner(ownerId)
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    results = results.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.tags.some(t => t.toLowerCase().includes(searchLower)) ||
      p.genre?.toLowerCase().includes(searchLower) ||
      p.mood?.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.status && filters.status.length > 0) {
    results = results.filter(p => filters.status!.includes(p.status))
  }
  
  if (filters.hasStems !== undefined) {
    results = results.filter(p => p.hasStems === filters.hasStems)
  }
  
  if (filters.hasSession !== undefined) {
    results = results.filter(p => p.hasSession === filters.hasSession)
  }
  
  if (filters.hasContracts !== undefined) {
    results = results.filter(p => p.hasContracts === filters.hasContracts)
  }
  
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(p => 
      filters.tags!.some(tag => p.tags.includes(tag))
    )
  }
  
  if (filters.bpmRange) {
    const [min, max] = filters.bpmRange
    results = results.filter(p => p.bpm && p.bpm >= min && p.bpm <= max)
  }
  
  if (filters.roleContext && filters.roleContext.length > 0) {
    results = results.filter(p => filters.roleContext!.includes(p.roleContext))
  }
  
  return results
}

// STATS

export function getVaultStats(ownerId: string) {
  const userProjects = getProjectsByOwner(ownerId)
  const userAssets = userProjects.flatMap(p => getAssetsByProject(p.id))
  
  return {
    totalProjects: userProjects.length,
    totalAssets: userAssets.length,
    totalSize: userAssets.reduce((sum, a) => sum + a.sizeBytes, 0),
    byStatus: {
      IDEA: userProjects.filter(p => p.status === 'IDEA').length,
      IN_PROGRESS: userProjects.filter(p => p.status === 'IN_PROGRESS').length,
      READY_FOR_SALE: userProjects.filter(p => p.status === 'READY_FOR_SALE').length,
      PLACED: userProjects.filter(p => p.status === 'PLACED').length,
      LOCKED: userProjects.filter(p => p.status === 'LOCKED').length,
    },
    withStems: userProjects.filter(p => p.hasStems).length,
    withSessions: userProjects.filter(p => p.hasSession).length,
    withContracts: userProjects.filter(p => p.hasContracts).length,
  }
}
