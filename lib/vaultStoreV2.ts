// Comprehensive in-memory Vault store for multi-role system
// Replace with actual database in production

import {
  CreativeAsset,
  Project,
  AssetContributor,
  LicenseTemplate,
  Listing,
  Deal,
  Contract,
  VaultFilters,
  MarketplaceFilters,
  AssetType,
  UserRole,
  ListingCategory,
  LicenseType,
} from '@/types/vault'

// In-memory stores
const assets = new Map<string, CreativeAsset>()
const projects = new Map<string, Project>()
const contributors = new Map<string, AssetContributor>()
const licenseTemplates = new Map<string, LicenseTemplate>()
const listings = new Map<string, Listing>()
const deals = new Map<string, Deal>()
const contracts = new Map<string, Contract>()

// Helper to generate IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// CREATIVE ASSETS
// ============================================================================

export function createAsset(data: Omit<CreativeAsset, 'id' | 'createdAt' | 'updatedAt'>): CreativeAsset {
  const id = generateId('asset')
  const now = new Date().toISOString()
  
  const asset: CreativeAsset = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  assets.set(id, asset)
  console.log(`[VAULT_V2] Created asset: ${id}`)
  
  return asset
}

export function getAsset(id: string): CreativeAsset | undefined {
  return assets.get(id)
}

export function getAssets(filters?: VaultFilters): CreativeAsset[] {
  let results = Array.from(assets.values())
  
  if (!filters) return results
  
  if (filters.assetType) {
    results = results.filter(a => a.assetType === filters.assetType)
  }
  
  if (filters.productCategory) {
    results = results.filter(a => a.productCategory === filters.productCategory)
  }
  
  if (filters.status) {
    results = results.filter(a => a.status === filters.status)
  }
  
  if (filters.isForSale !== undefined) {
    results = results.filter(a => a.isForSale === filters.isForSale)
  }
  
  if (filters.ownerRole) {
    results = results.filter(a => a.ownerRoles.includes(filters.ownerRole!))
  }
  
  if (filters.bpmRange) {
    results = results.filter(a => {
      if (!a.bpm) return false
      const { min, max } = filters.bpmRange!
      if (min && a.bpm < min) return false
      if (max && a.bpm > max) return false
      return true
    })
  }
  
  if (filters.key) {
    results = results.filter(a => a.key === filters.key)
  }
  
  if (filters.genre) {
    results = results.filter(a => a.genre?.toLowerCase().includes(filters.genre!.toLowerCase()))
  }
  
  if (filters.projectId) {
    results = results.filter(a => a.projectId === filters.projectId)
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    results = results.filter(a =>
      a.title.toLowerCase().includes(search) ||
      a.genre?.toLowerCase().includes(search) ||
      a.moodTags?.some(tag => tag.toLowerCase().includes(search))
    )
  }
  
  // Cyanite-powered filters
  if (filters.moods && filters.moods.length > 0) {
    results = results.filter(a =>
      a.moods?.some(mood => filters.moods!.includes(mood))
    )
  }
  
  if (filters.genres && filters.genres.length > 0) {
    results = results.filter(a =>
      a.genres?.some(genre => filters.genres!.includes(genre))
    )
  }
  
  if (filters.energyRange) {
    results = results.filter(a => {
      if (a.energy === undefined) return false
      const { min, max } = filters.energyRange!
      if (min !== undefined && a.energy < min) return false
      if (max !== undefined && a.energy > max) return false
      return true
    })
  }
  
  if (filters.danceabilityRange) {
    results = results.filter(a => {
      if (a.danceability === undefined) return false
      const { min, max } = filters.danceabilityRange!
      if (min !== undefined && a.danceability < min) return false
      if (max !== undefined && a.danceability > max) return false
      return true
    })
  }
  
  return results.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getAssetsByOwner(ownerId: string): CreativeAsset[] {
  return Array.from(assets.values())
    .filter(a => a.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateAsset(id: string, updates: Partial<Omit<CreativeAsset, 'id' | 'createdAt'>>): CreativeAsset | null {
  const existing = assets.get(id)
  if (!existing) return null
  
  const updated: CreativeAsset = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  assets.set(id, updated)
  console.log(`[VAULT_V2] Updated asset: ${id}`)
  
  return updated
}

export function deleteAsset(id: string): boolean {
  const deleted = assets.delete(id)
  if (deleted) {
    console.log(`[VAULT_V2] Deleted asset: ${id}`)
  }
  return deleted
}

// ============================================================================
// PROJECTS
// ============================================================================

export function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const id = generateId('project')
  const now = new Date().toISOString()
  
  const project: Project = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  projects.set(id, project)
  console.log(`[VAULT_V2] Created project: ${id}`)
  
  return project
}

export function getProject(id: string): Project | undefined {
  return projects.get(id)
}

export function getProjects(): Project[] {
  return Array.from(projects.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getProjectsByOwner(ownerId: string): Project[] {
  return Array.from(projects.values())
    .filter(p => p.ownerId === ownerId)
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
  console.log(`[VAULT_V2] Updated project: ${id}`)
  
  return updated
}

export function deleteProject(id: string): boolean {
  const deleted = projects.delete(id)
  if (deleted) {
    console.log(`[VAULT_V2] Deleted project: ${id}`)
  }
  return deleted
}

// ============================================================================
// CONTRIBUTORS
// ============================================================================

export function addContributor(data: Omit<AssetContributor, 'id' | 'createdAt'>): AssetContributor {
  const id = generateId('contributor')
  const now = new Date().toISOString()
  
  const contributor: AssetContributor = {
    ...data,
    id,
    createdAt: now,
  }
  
  contributors.set(id, contributor)
  console.log(`[VAULT_V2] Added contributor: ${id}`)
  
  return contributor
}

export function getContributorsByAsset(assetId: string): AssetContributor[] {
  return Array.from(contributors.values()).filter(c => c.assetId === assetId)
}

export function updateContributor(id: string, updates: Partial<Omit<AssetContributor, 'id' | 'createdAt'>>): AssetContributor | null {
  const existing = contributors.get(id)
  if (!existing) return null
  
  const updated: AssetContributor = {
    ...existing,
    ...updates,
  }
  
  contributors.set(id, updated)
  console.log(`[VAULT_V2] Updated contributor: ${id}`)
  
  return updated
}

export function deleteContributor(id: string): boolean {
  return contributors.delete(id)
}

// ============================================================================
// LICENSE TEMPLATES
// ============================================================================

export function createLicenseTemplate(data: Omit<LicenseTemplate, 'id' | 'createdAt'>): LicenseTemplate {
  const id = generateId('license')
  const now = new Date().toISOString()
  
  const template: LicenseTemplate = {
    ...data,
    id,
    createdAt: now,
  }
  
  licenseTemplates.set(id, template)
  console.log(`[VAULT_V2] Created license template: ${id}`)
  
  return template
}

export function getLicenseTemplate(id: string): LicenseTemplate | undefined {
  return licenseTemplates.get(id)
}

export function getLicenseTemplates(category?: ListingCategory): LicenseTemplate[] {
  let results = Array.from(licenseTemplates.values())
  
  if (category) {
    results = results.filter(t => t.category === category)
  }
  
  return results
}

// ============================================================================
// LISTINGS
// ============================================================================

export function createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Listing {
  const id = generateId('listing')
  const now = new Date().toISOString()
  
  const listing: Listing = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }
  
  listings.set(id, listing)
  console.log(`[VAULT_V2] Created listing: ${id}`)
  
  return listing
}

export function getListing(id: string): Listing | undefined {
  return listings.get(id)
}

export function getListings(filters?: MarketplaceFilters): Listing[] {
  let results = Array.from(listings.values()).filter(l => l.status === 'ACTIVE')
  
  if (!filters) return results
  
  if (filters.category) {
    results = results.filter(l => l.category === filters.category)
  }
  
  if (filters.rolesServed && filters.rolesServed.length > 0) {
    results = results.filter(l =>
      l.rolesServed.some(role => filters.rolesServed!.includes(role))
    )
  }
  
  if (filters.priceRange) {
    results = results.filter(l => {
      const { min, max } = filters.priceRange!
      if (min && l.price < min) return false
      if (max && l.price > max) return false
      return true
    })
  }
  
  if (filters.sellerId) {
    results = results.filter(l => l.sellerId === filters.sellerId)
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    results = results.filter(l =>
      l.title.toLowerCase().includes(search) ||
      l.description?.toLowerCase().includes(search) ||
      l.tags?.some(tag => tag.toLowerCase().includes(search))
    )
  }
  
  return results.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getListingsBySeller(sellerId: string): Listing[] {
  return Array.from(listings.values())
    .filter(l => l.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateListing(id: string, updates: Partial<Omit<Listing, 'id' | 'createdAt'>>): Listing | null {
  const existing = listings.get(id)
  if (!existing) return null
  
  const updated: Listing = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  listings.set(id, updated)
  console.log(`[VAULT_V2] Updated listing: ${id}`)
  
  return updated
}

export function deleteListing(id: string): boolean {
  const deleted = listings.delete(id)
  if (deleted) {
    console.log(`[VAULT_V2] Deleted listing: ${id}`)
  }
  return deleted
}

// ============================================================================
// DEALS
// ============================================================================

export function createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'expiresAt'>): Deal {
  const id = generateId('deal')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days
  
  const deal: Deal = {
    ...data,
    id,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
  
  deals.set(id, deal)
  console.log(`[VAULT_V2] Created deal: ${id}`)
  
  return deal
}

export function getDeal(id: string): Deal | undefined {
  return deals.get(id)
}

export function getDeals(): Deal[] {
  return Array.from(deals.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getDealsBySeller(sellerId: string): Deal[] {
  return Array.from(deals.values())
    .filter(d => d.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getDealsByBuyer(buyerId: string): Deal[] {
  return Array.from(deals.values())
    .filter(d => d.buyerId === buyerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateDeal(id: string, updates: Partial<Omit<Deal, 'id' | 'createdAt' | 'expiresAt'>>): Deal | null {
  const existing = deals.get(id)
  if (!existing) return null
  
  const updated: Deal = {
    ...existing,
    ...updates,
  }
  
  deals.set(id, updated)
  console.log(`[VAULT_V2] Updated deal: ${id}`)
  
  return updated
}

// ============================================================================
// CONTRACTS
// ============================================================================

export function createContract(data: Omit<Contract, 'id' | 'createdAt'>): Contract {
  const id = generateId('contract')
  const now = new Date().toISOString()
  
  const contract: Contract = {
    ...data,
    id,
    createdAt: now,
  }
  
  contracts.set(id, contract)
  console.log(`[VAULT_V2] Created contract: ${id}`)
  
  return contract
}

export function getContract(id: string): Contract | undefined {
  return contracts.get(id)
}

export function getContractByDeal(dealId: string): Contract | undefined {
  return Array.from(contracts.values()).find(c => c.dealId === dealId)
}

export function updateContract(id: string, updates: Partial<Omit<Contract, 'id' | 'createdAt'>>): Contract | null {
  const existing = contracts.get(id)
  if (!existing) return null
  
  const updated: Contract = {
    ...existing,
    ...updates,
  }
  
  contracts.set(id, updated)
  console.log(`[VAULT_V2] Updated contract: ${id}`)
  
  return updated
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Cleanup expired deals
export function cleanupExpiredDeals(): number {
  const now = new Date()
  let count = 0
  
  for (const [id, deal] of deals.entries()) {
    if (
      deal.status === 'AWAITING_SIGNATURES' &&
      new Date(deal.expiresAt) < now
    ) {
      updateDeal(id, {
        status: 'REFUNDED',
        refundedAt: now.toISOString(),
      })
      count++
    }
  }
  
  if (count > 0) {
    console.log(`[VAULT_V2] Cleaned up ${count} expired deals`)
  }
  
  return count
}

// Release funds for a deal (stub)
export function releaseFunds(dealId: string): boolean {
  const deal = deals.get(dealId)
  if (!deal) return false
  
  console.log(`[VAULT_V2] STUB: Releasing ${deal.amount} ${deal.currency} to seller ${deal.sellerId}`)
  
  updateDeal(dealId, {
    status: 'ACTIVE',
    completedAt: new Date().toISOString(),
  })
  
  return true
}

// Refund a deal (stub)
export function refundDeal(dealId: string): boolean {
  const deal = deals.get(dealId)
  if (!deal) return false
  
  console.log(`[VAULT_V2] STUB: Refunding ${deal.amount} ${deal.currency} to buyer ${deal.buyerId}`)
  
  updateDeal(dealId, {
    status: 'REFUNDED',
    refundedAt: new Date().toISOString(),
  })
  
  return true
}

// Initialize default license templates
export function initializeDefaultTemplates() {
  if (licenseTemplates.size > 0) return
  
  createLicenseTemplate({
    name: 'Non-Exclusive Beat Lease',
    category: 'BEAT',
    type: 'LEASE',
    baseTerms: `# Non-Exclusive Beat Lease Agreement

**Beat Title:** {{title}}
**Producer:** {{sellerName}}
**Artist:** {{buyerName}}
**Price:** {{amount}} {{currency}}

## Terms
1. This is a non-exclusive license
2. Artist may use the beat for unlimited streaming
3. Artist may distribute up to 10,000 copies
4. Producer retains all ownership rights
5. Artist must credit producer as "Produced by {{sellerName}}"

**Accepted on:** {{date}}`,
    variables: ['title', 'sellerName', 'buyerName', 'amount', 'currency', 'date'],
  })
  
  createLicenseTemplate({
    name: 'Exclusive Beat Sale',
    category: 'BEAT',
    type: 'EXCLUSIVE',
    baseTerms: `# Exclusive Beat Sale Agreement

**Beat Title:** {{title}}
**Producer:** {{sellerName}}
**Artist:** {{buyerName}}
**Price:** {{amount}} {{currency}}

## Terms
1. This is an EXCLUSIVE license
2. All rights transfer to the artist
3. Producer may not resell or relicense this beat
4. Artist has unlimited distribution rights
5. Artist must credit producer as "Produced by {{sellerName}}"

**Accepted on:** {{date}}`,
    variables: ['title', 'sellerName', 'buyerName', 'amount', 'currency', 'date'],
  })
  
  createLicenseTemplate({
    name: 'Mixing Service Agreement',
    category: 'SERVICE',
    type: 'SERVICE_AGREEMENT',
    baseTerms: `# Mixing Service Agreement

**Service:** Professional Mixing
**Engineer:** {{sellerName}}
**Client:** {{buyerName}}
**Price:** {{amount}} {{currency}}

## Deliverables
1. Mixed stereo file (WAV, 24-bit/44.1kHz)
2. Up to 3 rounds of revisions
3. Delivery within 7 business days

## Terms
1. Client provides stems/tracks in agreed format
2. Engineer will mix to industry standards
3. Client retains all rights to the final mix
4. Engineer may use mix in portfolio with client permission

**Accepted on:** {{date}}`,
    variables: ['sellerName', 'buyerName', 'amount', 'currency', 'date'],
  })
  
  createLicenseTemplate({
    name: 'Mastering Service Agreement',
    category: 'SERVICE',
    type: 'SERVICE_AGREEMENT',
    baseTerms: `# Mastering Service Agreement

**Service:** Professional Mastering
**Engineer:** {{sellerName}}
**Client:** {{buyerName}}
**Price:** {{amount}} {{currency}}

## Deliverables
1. Mastered stereo file (WAV, 24-bit/44.1kHz)
2. MP3 version (320kbps)
3. Up to 2 rounds of revisions
4. Delivery within 5 business days

## Terms
1. Client provides mixed stereo file
2. Engineer will master to streaming standards
3. Client retains all rights to the final master
4. Engineer may use master in portfolio with client permission

**Accepted on:** {{date}}`,
    variables: ['sellerName', 'buyerName', 'amount', 'currency', 'date'],
  })
  
  createLicenseTemplate({
    name: 'Recording Session Agreement',
    category: 'SESSION',
    type: 'SERVICE_AGREEMENT',
    baseTerms: `# Recording Session Agreement

**Studio:** {{sellerName}}
**Client:** {{buyerName}}
**Price:** {{amount}} {{currency}}
**Duration:** {{sessionDuration}} hours

## Included
1. Studio time with engineer
2. Professional recording equipment
3. Basic mixing during session
4. Session files provided after

## Terms
1. Client must arrive on time or forfeit time
2. Studio provides all equipment and software
3. Client retains all rights to recordings
4. Cancellations require 48hr notice for refund

**Accepted on:** {{date}}`,
    variables: ['sellerName', 'buyerName', 'amount', 'currency', 'sessionDuration', 'date'],
  })
  
  console.log('[VAULT_V2] Initialized default license templates')
}
