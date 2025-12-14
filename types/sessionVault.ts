/**
 * Session Vault Types
 * Enhanced vault system for managing projects with multiple assets
 */

export type AssetType = 
  | "MASTER_AUDIO"
  | "ALT_BOUNCE"
  | "STEM"
  | "DAW_SESSION"
  | "REFERENCE"
  | "DOCUMENT"
  | "OTHER"

export type ProjectStatus =
  | "IDEA"
  | "IN_PROGRESS"
  | "READY_FOR_SALE"
  | "PLACED"
  | "LOCKED"

export type ProjectRoleContext = 
  | "PRODUCER" 
  | "ARTIST" 
  | "ENGINEER" 
  | "STUDIO"

export interface Asset {
  id: string
  projectId: string
  name: string           // human display name
  filename: string       // original file name
  url: string            // storage URL
  type: AssetType
  extension: string
  sizeBytes: number
  durationSec?: number   // for audio
  isPrimary?: boolean    // which file is primary preview
  createdAt: string
  modifiedAt: string
  modifiedBy?: string    // user ID who last modified
  uploadedBy: string     // user ID who uploaded
  comments: AssetComment[]
}

export interface Project {
  id: string
  ownerUserId: string
  title: string
  roleContext: ProjectRoleContext
  status: ProjectStatus
  bpm?: number
  key?: string
  genre?: string
  mood?: string
  tags: string[]         // "beat", "song_demo", "sync", etc.
  hasStems: boolean
  hasSession: boolean
  hasContracts: boolean
  folders: string[]      // logical "collections"
  notes?: string
  createdAt: string
  updatedAt: string
  modifiedBy?: string    // user ID who last modified
  collaborators: ProjectCollaborator[]
  comments: ProjectComment[]
  color?: string         // for visual organization
}

export interface ProposedProject {
  groupKey: string
  title: string
  assets: ProposedAsset[]
  detectedBpm?: number
  detectedKey?: string
  detectedGenre?: string
  hasStems: boolean
  hasSession: boolean
}

export interface ProposedAsset {
  filename: string
  extension: string
  sizeBytes: number
  type: AssetType
  isPrimary: boolean
}

export interface ImportReviewPayload {
  proposedProjects: ProposedProject[]
  totalFiles: number
  totalSize: number
}

export interface CommitImportRequest {
  projects: Array<{
    title: string
    groupKey: string
    roleContext: ProjectRoleContext
    tags: string[]
  }>
}

export interface VaultFilters {
  search?: string
  status?: ProjectStatus[]
  hasStems?: boolean
  hasSession?: boolean
  hasContracts?: boolean
  tags?: string[]
  bpmRange?: [number, number]
  roleContext?: ProjectRoleContext[]
}

// File extension mappings
export const AUDIO_EXTENSIONS = ['wav', 'mp3', 'aiff', 'flac', 'ogg', 'm4a', 'aac']
export const DAW_EXTENSIONS = ['flp', 'ptx', 'ptf', 'als', 'logicx', 'band', 'rpp', 'cpr', 'npr']
export const ARCHIVE_EXTENSIONS = ['zip', 'rar', '7z', 'tar', 'gz']
export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md']

// Stem detection keywords
export const STEM_KEYWORDS = [
  'kick', 'snare', 'hat', 'hihat', 'clap', 'perc', 'percussion',
  'bass', 'sub', '808', 
  'lead', 'melody', 'synth', 'pad', 'chord',
  'vocal', 'vox', 'acapella',
  'drum', 'drums',
  'fx', 'sfx', 'effect',
  'guitar', 'piano', 'keys',
  'string', 'brass', 'horn'
]

// Version/suffix patterns to strip
export const VERSION_PATTERNS = [
  /_v\d+$/i,
  /-v\d+$/i,
  /_version\d+$/i,
  /_mix$/i,
  /_master$/i,
  /_final$/i,
  /_bounce$/i,
  /_stereo$/i,
  /_mono$/i,
  /_instrumental$/i,
  /_inst$/i,
  /_acapella$/i,
  /_clean$/i,
  /_dirty$/i,
  /_radio$/i,
  /_extended$/i,
  /_short$/i,
]

// DAW detection
export const DAW_MAP: Record<string, string> = {
  'flp': 'FL Studio',
  'ptx': 'Pro Tools',
  'ptf': 'Pro Tools',
  'als': 'Ableton Live',
  'logicx': 'Logic Pro',
  'band': 'GarageBand',
  'rpp': 'REAPER',
  'cpr': 'Cubase',
  'npr': 'Nuendo',
}

// Collaborator & Comment Types
export interface ProjectCollaborator {
  id: string
  userId: string
  userName: string
  role: 'owner' | 'producer' | 'artist' | 'engineer' | 'viewer'
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    canComment: boolean
  }
  addedAt: string
  addedBy: string
}

export interface ProjectComment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  editedAt?: string
  replyTo?: string  // parent comment ID
}

export interface AssetComment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp?: number  // for audio comments (in seconds)
  createdAt: string
  editedAt?: string
}

// Sidebar & Organization Types
export type SidebarView = 
  | 'recents'
  | 'favorites'
  | 'shared'
  | 'folders'
  | 'tags'
  | 'collaborators'
  | 'documents'
  | 'listings'

export type SortBy = 
  | 'name'
  | 'date-modified'
  | 'date-created'
  | 'size'
  | 'type'
  | 'status'

export type SortOrder = 'asc' | 'desc'

export interface FolderStructure {
  id: string
  name: string
  parentId: string | null
  color?: string
  icon?: string
  projectIds: string[]
  createdAt: string
  createdBy: string
}

export interface ActivityLog {
  id: string
  projectId?: string
  assetId?: string
  userId: string
  userName: string
  action: 'created' | 'modified' | 'deleted' | 'commented' | 'shared' | 'uploaded'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}
