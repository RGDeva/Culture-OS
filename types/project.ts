/**
 * Project types for Vault - Enhanced for collaboration and funding
 */

export type ProjectStatus = 'IDEA' | 'IN_PROGRESS' | 'DONE'
export type ProjectVisibility = 'PRIVATE' | 'NETWORK' | 'PUBLIC'
export type FileType = 'AUDIO' | 'VIDEO' | 'IMAGE' | 'DOC' | 'OTHER'
export type AccessType = 'FREE' | 'PAY_FOR_ACCESS' | 'FLAT_FEE'
export type CompensationType = 'FLAT_FEE' | 'REV_SHARE' | 'HYBRID' | 'OPEN'
export type FundingMode = 'SELF_FUNDED' | 'LOOKING_FOR_STUDIO_PARTNER' | 'LOOKING_FOR_BACKERS'

export interface ProjectFile {
  id: string
  name: string
  url: string
  sizeBytes?: number
  type: FileType
  uploadedBy?: string
  createdAt?: string
}

export interface ProjectRole {
  id: string
  title: string
  compensationType: CompensationType
  budgetUsd?: number
  notes?: string
  createBountyFromRole?: boolean
}

export interface Project {
  id: string
  ownerId: string
  title: string
  description?: string
  status: ProjectStatus
  tags: string[]
  
  // Media & Assets
  previewUrl?: string
  stemsUrl?: string
  files: ProjectFile[]
  
  // Access & Pricing
  accessType: AccessType
  priceUsd?: number
  
  // Collaboration & Roles
  rolesNeeded: ProjectRole[]
  visibility: ProjectVisibility
  collaborators?: string[] // User IDs
  
  // Funding & Ownership
  fundingMode: FundingMode
  targetBudgetUsd?: number
  ownershipNotes?: string
  splitNotes?: string
  
  // Studio Association
  hostStudioId?: string | null
  openToStudioProposals: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  description?: string
  status?: ProjectStatus
  tags?: string[]
  previewUrl?: string
  stemsUrl?: string
  accessType?: AccessType
  priceUsd?: number
  rolesNeeded?: ProjectRole[]
  visibility?: ProjectVisibility
  fundingMode?: FundingMode
  targetBudgetUsd?: number
  ownershipNotes?: string
  splitNotes?: string
  hostStudioId?: string | null
  openToStudioProposals?: boolean
}

export interface Studio {
  id: string
  name: string
  location?: string
  verified?: boolean
}
