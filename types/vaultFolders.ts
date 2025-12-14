export interface VaultFolder {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string // For nested folders
  ownerId: string
  assetIds: string[]
  createdAt: string
  updatedAt: string
}

export interface VaultCollection {
  id: string
  name: string
  description?: string
  type: 'smart' | 'manual'
  ownerId: string
  assetIds: string[]
  // Smart collection rules
  rules?: CollectionRule[]
  createdAt: string
  updatedAt: string
}

export interface CollectionRule {
  field: 'bpm' | 'key' | 'genre' | 'mood' | 'energy' | 'status' | 'assetType' | 'createdAt'
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in'
  value: any
}

export const FOLDER_COLORS = [
  { name: 'Green', value: 'green' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Blue', value: 'blue' },
  { name: 'Purple', value: 'purple' },
  { name: 'Pink', value: 'pink' },
  { name: 'Red', value: 'red' },
  { name: 'Orange', value: 'orange' },
  { name: 'Yellow', value: 'yellow' },
]

export const FOLDER_ICONS = [
  'folder',
  'music',
  'mic',
  'headphones',
  'disc',
  'radio',
  'guitar',
  'piano',
]
