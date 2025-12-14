import { VaultFolder, VaultCollection, CollectionRule } from '@/types/vaultFolders'
import { CreativeAsset } from '@/types/vault'

// In-memory storage for folders and collections
const folders: Map<string, VaultFolder> = new Map()
const collections: Map<string, VaultCollection> = new Map()

// FOLDER OPERATIONS

export function createFolder(data: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt'>): VaultFolder {
  const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const folder: VaultFolder = {
    ...data,
    id,
    assetIds: data.assetIds || [],
    createdAt: now,
    updatedAt: now,
  }
  
  folders.set(id, folder)
  console.log('[VAULT_FOLDERS] Created folder:', id)
  
  return folder
}

export function getFolder(id: string): VaultFolder | undefined {
  return folders.get(id)
}

export function getFoldersByOwner(ownerId: string): VaultFolder[] {
  return Array.from(folders.values())
    .filter(f => f.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateFolder(id: string, updates: Partial<Omit<VaultFolder, 'id' | 'createdAt'>>): VaultFolder | null {
  const existing = folders.get(id)
  if (!existing) return null
  
  const updated: VaultFolder = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  folders.set(id, updated)
  console.log('[VAULT_FOLDERS] Updated folder:', id)
  
  return updated
}

export function deleteFolder(id: string): boolean {
  const deleted = folders.delete(id)
  if (deleted) {
    console.log('[VAULT_FOLDERS] Deleted folder:', id)
  }
  return deleted
}

export function addAssetToFolder(folderId: string, assetId: string): VaultFolder | null {
  const folder = folders.get(folderId)
  if (!folder) return null
  
  if (!folder.assetIds.includes(assetId)) {
    folder.assetIds.push(assetId)
    folder.updatedAt = new Date().toISOString()
    folders.set(folderId, folder)
    console.log('[VAULT_FOLDERS] Added asset to folder:', { folderId, assetId })
  }
  
  return folder
}

export function removeAssetFromFolder(folderId: string, assetId: string): VaultFolder | null {
  const folder = folders.get(folderId)
  if (!folder) return null
  
  folder.assetIds = folder.assetIds.filter(id => id !== assetId)
  folder.updatedAt = new Date().toISOString()
  folders.set(folderId, folder)
  console.log('[VAULT_FOLDERS] Removed asset from folder:', { folderId, assetId })
  
  return folder
}

export function moveAssetsBetweenFolders(
  assetIds: string[],
  fromFolderId: string | null,
  toFolderId: string
): boolean {
  try {
    // Remove from source folder
    if (fromFolderId) {
      const fromFolder = folders.get(fromFolderId)
      if (fromFolder) {
        fromFolder.assetIds = fromFolder.assetIds.filter(id => !assetIds.includes(id))
        fromFolder.updatedAt = new Date().toISOString()
        folders.set(fromFolderId, fromFolder)
      }
    }
    
    // Add to destination folder
    const toFolder = folders.get(toFolderId)
    if (!toFolder) return false
    
    assetIds.forEach(assetId => {
      if (!toFolder.assetIds.includes(assetId)) {
        toFolder.assetIds.push(assetId)
      }
    })
    toFolder.updatedAt = new Date().toISOString()
    folders.set(toFolderId, toFolder)
    
    console.log('[VAULT_FOLDERS] Moved assets:', { assetIds, fromFolderId, toFolderId })
    return true
  } catch (error) {
    console.error('[VAULT_FOLDERS] Error moving assets:', error)
    return false
  }
}

// COLLECTION OPERATIONS

export function createCollection(data: Omit<VaultCollection, 'id' | 'createdAt' | 'updatedAt'>): VaultCollection {
  const id = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const collection: VaultCollection = {
    ...data,
    id,
    assetIds: data.assetIds || [],
    createdAt: now,
    updatedAt: now,
  }
  
  collections.set(id, collection)
  console.log('[VAULT_COLLECTIONS] Created collection:', id)
  
  return collection
}

export function getCollection(id: string): VaultCollection | undefined {
  return collections.get(id)
}

export function getCollectionsByOwner(ownerId: string): VaultCollection[] {
  return Array.from(collections.values())
    .filter(c => c.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateCollection(id: string, updates: Partial<Omit<VaultCollection, 'id' | 'createdAt'>>): VaultCollection | null {
  const existing = collections.get(id)
  if (!existing) return null
  
  const updated: VaultCollection = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  collections.set(id, updated)
  console.log('[VAULT_COLLECTIONS] Updated collection:', id)
  
  return updated
}

export function deleteCollection(id: string): boolean {
  const deleted = collections.delete(id)
  if (deleted) {
    console.log('[VAULT_COLLECTIONS] Deleted collection:', id)
  }
  return deleted
}

// Smart collection evaluation
export function evaluateSmartCollection(collection: VaultCollection, allAssets: CreativeAsset[]): string[] {
  if (collection.type !== 'smart' || !collection.rules || collection.rules.length === 0) {
    return collection.assetIds
  }
  
  return allAssets
    .filter(asset => matchesAllRules(asset, collection.rules!))
    .map(asset => asset.id)
}

function matchesAllRules(asset: CreativeAsset, rules: CollectionRule[]): boolean {
  return rules.every(rule => matchesRule(asset, rule))
}

function matchesRule(asset: CreativeAsset, rule: CollectionRule): boolean {
  const value = (asset as any)[rule.field]
  
  switch (rule.operator) {
    case 'equals':
      return value === rule.value
    
    case 'contains':
      if (Array.isArray(value)) {
        return value.some(v => v.toLowerCase().includes(rule.value.toLowerCase()))
      }
      return String(value).toLowerCase().includes(String(rule.value).toLowerCase())
    
    case 'greaterThan':
      return Number(value) > Number(rule.value)
    
    case 'lessThan':
      return Number(value) < Number(rule.value)
    
    case 'between':
      const [min, max] = rule.value
      return Number(value) >= Number(min) && Number(value) <= Number(max)
    
    case 'in':
      if (Array.isArray(value)) {
        return value.some(v => rule.value.includes(v))
      }
      return rule.value.includes(value)
    
    default:
      return false
  }
}

// Batch operations
export function batchAddToFolder(folderId: string, assetIds: string[]): VaultFolder | null {
  const folder = folders.get(folderId)
  if (!folder) return null
  
  assetIds.forEach(assetId => {
    if (!folder.assetIds.includes(assetId)) {
      folder.assetIds.push(assetId)
    }
  })
  
  folder.updatedAt = new Date().toISOString()
  folders.set(folderId, folder)
  console.log('[VAULT_FOLDERS] Batch added assets to folder:', { folderId, count: assetIds.length })
  
  return folder
}

export function batchRemoveFromFolder(folderId: string, assetIds: string[]): VaultFolder | null {
  const folder = folders.get(folderId)
  if (!folder) return null
  
  folder.assetIds = folder.assetIds.filter(id => !assetIds.includes(id))
  folder.updatedAt = new Date().toISOString()
  folders.set(folderId, folder)
  console.log('[VAULT_FOLDERS] Batch removed assets from folder:', { folderId, count: assetIds.length })
  
  return folder
}

// Get folder tree (for nested folders)
export function getFolderTree(ownerId: string): VaultFolder[] {
  const userFolders = getFoldersByOwner(ownerId)
  
  // Build tree structure
  const rootFolders = userFolders.filter(f => !f.parentId)
  
  function attachChildren(folder: VaultFolder): VaultFolder & { children?: VaultFolder[] } {
    const children = userFolders.filter(f => f.parentId === folder.id)
    return {
      ...folder,
      children: children.length > 0 ? children.map(attachChildren) : undefined,
    }
  }
  
  return rootFolders.map(attachChildren)
}
