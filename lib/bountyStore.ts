/**
 * Bounty storage - in-memory store
 * Can be upgraded to Prisma/Supabase later
 */

import { Bounty, BountyApplication, BountyStatus, ApplicationStatus } from '@/types/bounty'
import { getProfile } from './profileStore'

// In-memory stores
const bounties: Map<string, Bounty> = new Map()
const applications: Map<string, BountyApplication> = new Map()

/**
 * Create a new bounty
 */
export function createBounty(data: Omit<Bounty, 'id' | 'status' | 'applicants' | 'createdAt' | 'updatedAt'>): Bounty {
  const id = `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Get creator name from profile
  const profile = getProfile(data.postedByUserId)
  
  const bounty: Bounty = {
    ...data,
    id,
    creatorName: profile?.displayName || 'Anonymous',
    status: 'OPEN',
    applicants: [],
    applicantsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  bounties.set(id, bounty)
  console.log('[BOUNTY_STORE] Created bounty:', id)
  
  return bounty
}

/**
 * Get bounty by ID
 */
export function getBounty(id: string): Bounty | null {
  return bounties.get(id) || null
}

/**
 * Get all bounties with optional filters
 */
export function getAllBounties(filters?: {
  status?: BountyStatus
  postedByUserId?: string
  search?: string
  role?: string
  remoteOnly?: boolean
}): Bounty[] {
  let results = Array.from(bounties.values())
  
  if (filters?.status) {
    results = results.filter(b => b.status === filters.status)
  }
  
  if (filters?.postedByUserId) {
    results = results.filter(b => b.postedByUserId === filters.postedByUserId)
  }
  
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    results = results.filter(b => 
      b.roleNeeded.toLowerCase().includes(search) ||
      b.description.toLowerCase().includes(search) ||
      b.genreTags?.some(tag => tag.toLowerCase().includes(search))
    )
  }
  
  if (filters?.role) {
    results = results.filter(b => b.roleNeeded.toLowerCase().includes(filters.role!.toLowerCase()))
  }
  
  if (filters?.remoteOnly) {
    results = results.filter(b => b.remoteOk === true)
  }
  
  // Sort by created date (newest first)
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return results
}

/**
 * Update bounty
 */
export function updateBounty(id: string, updates: Partial<Bounty>): Bounty | null {
  const bounty = bounties.get(id)
  if (!bounty) return null
  
  const updated = {
    ...bounty,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  bounties.set(id, updated)
  console.log('[BOUNTY_STORE] Updated bounty:', id)
  
  return updated
}

/**
 * Delete bounty
 */
export function deleteBounty(id: string): boolean {
  return bounties.delete(id)
}

/**
 * Create a bounty application
 */
export function createApplication(data: Omit<BountyApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): BountyApplication {
  const id = `application_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const application: BountyApplication = {
    ...data,
    id,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  applications.set(id, application)
  
  // Add application to bounty
  const bounty = bounties.get(data.bountyId)
  if (bounty) {
    bounty.applicants.push(application)
    bounty.applicantsCount = bounty.applicants.length
    bounty.updatedAt = new Date().toISOString()
    bounties.set(data.bountyId, bounty)
  }
  
  console.log('[BOUNTY_STORE] Created application:', id)
  
  return application
}

/**
 * Get applications for a bounty
 */
export function getApplicationsForBounty(bountyId: string): BountyApplication[] {
  return Array.from(applications.values()).filter(a => a.bountyId === bountyId)
}

/**
 * Get applications by a user
 */
export function getApplicationsByUser(userId: string): BountyApplication[] {
  return Array.from(applications.values()).filter(a => a.applicantId === userId)
}

/**
 * Update application status
 */
export function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): BountyApplication | null {
  const application = applications.get(applicationId)
  if (!application) return null
  
  application.status = status
  application.updatedAt = new Date().toISOString()
  applications.set(applicationId, application)
  
  // Update bounty if application is accepted
  if (status === 'ACCEPTED') {
    const bounty = bounties.get(application.bountyId)
    if (bounty) {
      bounty.status = 'IN_PROGRESS'
      bounty.acceptedCollaboratorId = application.applicantId
      bounty.updatedAt = new Date().toISOString()
      bounties.set(application.bountyId, bounty)
    }
  }
  
  console.log('[BOUNTY_STORE] Updated application status:', applicationId, status)
  
  return application
}

/**
 * Mark bounty as completed
 */
export function completeBounty(bountyId: string): Bounty | null {
  const bounty = bounties.get(bountyId)
  if (!bounty) return null
  
  bounty.status = 'COMPLETED'
  bounty.updatedAt = new Date().toISOString()
  bounties.set(bountyId, bounty)
  
  console.log('[BOUNTY_STORE] Completed bounty:', bountyId)
  
  return bounty
}

/**
 * Get bounty statistics for a user
 */
export function getBountyStats(userId: string) {
  const allBounties = Array.from(bounties.values())
  const allApplications = Array.from(applications.values())
  
  return {
    posted: allBounties.filter(b => b.postedByUserId === userId).length,
    claimed: allBounties.filter(b => b.acceptedCollaboratorId === userId).length,
    applied: allApplications.filter(a => a.applicantId === userId).length,
    completed: allBounties.filter(b => 
      b.status === 'COMPLETED' && 
      (b.postedByUserId === userId || b.acceptedCollaboratorId === userId)
    ).length,
  }
}
