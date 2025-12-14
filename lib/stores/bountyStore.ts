import { Bounty, BountyCreateInput, BountyUpdateInput, BountyFilters, BountyApplicant } from '../types/bounties';

// In-memory store for bounties
const bounties = new Map<string, Bounty>();
let nextId = 1;

export function getBounty(id: string): Bounty | null {
  return bounties.get(id) || null;
}

export function getAllBounties(filters?: BountyFilters): Bounty[] {
  let result = Array.from(bounties.values());
  
  if (filters) {
    if (filters.status) {
      result = result.filter(b => b.status === filters.status);
    }
    if (filters.roleNeeded) {
      result = result.filter(b => 
        b.roleNeeded.toLowerCase().includes(filters.roleNeeded!.toLowerCase())
      );
    }
    if (filters.minBudget !== undefined) {
      result = result.filter(b => (b.budgetAmount || 0) >= filters.minBudget!);
    }
    if (filters.maxBudget !== undefined) {
      result = result.filter(b => (b.budgetAmount || 0) <= filters.maxBudget!);
    }
    if (filters.postedByUserId) {
      result = result.filter(b => b.postedByUserId === filters.postedByUserId);
    }
  }
  
  return result;
}

export function getBountiesByUser(userId: string): Bounty[] {
  return Array.from(bounties.values()).filter(b => b.postedByUserId === userId);
}

export function getBountiesByProject(projectId: string): Bounty[] {
  return Array.from(bounties.values()).filter(b => b.projectId === projectId);
}

export function createBounty(postedByUserId: string, input: BountyCreateInput): Bounty {
  const id = `bounty_${nextId++}`;
  const bounty: Bounty = {
    id,
    postedByUserId,
    projectId: input.projectId,
    roleNeeded: input.roleNeeded,
    budgetAmount: input.budgetAmount,
    budgetCurrency: input.budgetCurrency || 'USD',
    compensationType: input.compensationType,
    description: input.description,
    tags: input.tags || [],
    deadline: input.deadline,
    status: 'OPEN',
    applicants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  bounties.set(id, bounty);
  return bounty;
}

export function updateBounty(id: string, input: BountyUpdateInput): Bounty | null {
  const existing = bounties.get(id);
  if (!existing) return null;
  
  const updated: Bounty = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  
  bounties.set(id, updated);
  return updated;
}

export function applyToBounty(bountyId: string, userId: string, message?: string): Bounty | null {
  const existing = bounties.get(bountyId);
  if (!existing) return null;
  
  // Check if already applied
  if (existing.applicants.some(a => a.userId === userId)) {
    return existing;
  }
  
  const applicant: BountyApplicant = {
    userId,
    message,
    appliedAt: new Date().toISOString(),
  };
  
  const updated: Bounty = {
    ...existing,
    applicants: [...existing.applicants, applicant],
    updatedAt: new Date().toISOString(),
  };
  
  bounties.set(bountyId, updated);
  return updated;
}

export function acceptApplicant(bountyId: string, userId: string): Bounty | null {
  const existing = bounties.get(bountyId);
  if (!existing) return null;
  
  const updated: Bounty = {
    ...existing,
    acceptedUserId: userId,
    status: 'IN_PROGRESS',
    updatedAt: new Date().toISOString(),
  };
  
  bounties.set(bountyId, updated);
  return updated;
}

export function deleteBounty(id: string): boolean {
  return bounties.delete(id);
}
