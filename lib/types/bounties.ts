export type BountyStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CompensationType = 'FLAT_FEE' | 'REV_SHARE' | 'HYBRID';

export interface BountyApplicant {
  userId: string;
  message?: string;
  appliedAt: string;
}

export interface Bounty {
  id: string;
  projectId?: string;
  postedByUserId: string;
  roleNeeded: string;   // e.g. "Hook writer", "Drum programmer"
  budgetAmount?: number;
  budgetCurrency?: 'USD' | 'USDC';
  compensationType: CompensationType;
  description: string;
  tags?: string[];
  deadline?: string;
  status: BountyStatus;
  applicants: BountyApplicant[];
  acceptedUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BountyCreateInput {
  projectId?: string;
  roleNeeded: string;
  budgetAmount?: number;
  budgetCurrency?: 'USD' | 'USDC';
  compensationType: CompensationType;
  description: string;
  tags?: string[];
  deadline?: string;
}

export interface BountyUpdateInput extends Partial<BountyCreateInput> {
  status?: BountyStatus;
  acceptedUserId?: string;
}

export interface BountyFilters {
  status?: BountyStatus;
  roleNeeded?: string;
  minBudget?: number;
  maxBudget?: number;
  postedByUserId?: string;
}
