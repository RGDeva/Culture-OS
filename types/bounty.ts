/**
 * Bounty types for open collaboration system
 */

export type BountyStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type BountyRole =
  | 'ARTIST'
  | 'PRODUCER'
  | 'ENGINEER'
  | 'SONGWRITER'
  | 'MUSICIAN'
  | 'STUDIO'
  | 'OTHER';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface BountyApplication {
  id: string;
  bountyId: string;
  applicantId: string;
  applicantName: string;
  message?: string; // Application message/cover letter
  coverLetter?: string; // Backwards compatibility
  portfolioUrl?: string;
  proposedBudget?: number;
  estimatedDeliveryDays?: number;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export type CompensationType = 'FLAT_FEE' | 'REV_SHARE' | 'HYBRID'

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Bounty {
  id: string;
  projectId?: string;            // Vault project this belongs to
  postedByUserId: string;        // who posted the bounty (alias for creatorId)
  userId?: string;               // alias for postedByUserId
  creatorId?: string;            // backwards compatibility
  creatorName?: string;          // cached creator name
  roleNeeded: string;            // e.g. 'Hook writer', 'Drums', 'Promo campaign'
  title?: string;                // backwards compatibility
  description: string;
  deliverables?: string;         // What the collaborator needs to deliver
  role?: BountyRole;             // backwards compatibility
  genreTags?: string[];          // ['trap', 'hyperpop']
  budgetAmount?: number;         // Primary budget amount
  budgetCurrency?: 'USD' | 'USDC';
  compensationType: CompensationType;
  budgetType?: 'FLAT_FEE' | 'REV_SHARE' | 'FLAT_PLUS_POINTS' | 'OPEN_TO_OFFERS'; // backwards compat
  budgetMinUSDC?: number | null;
  budgetMaxUSDC?: number | null;
  deadline?: string | null;      // ISO timestamp
  remoteOk?: boolean;
  locationCity?: string | null;
  locationCountry?: string | null;
  coordinates?: Coordinates | null; // Geocoded location for distance calculation
  status: BountyStatus;
  applicants: BountyApplication[]; // Array of applications
  applicantsCount?: number;
  acceptedCollaboratorId?: string | null; // User who was accepted for the bounty
  acceptedUserId?: string | null; // backwards compatibility
  selectedUserId?: string | null; // backwards compatibility
  escrowAmount?: number | null;  // Amount held in escrow
  escrowReleased?: boolean;      // Whether payment has been released
  attachedFiles?: string[];      // URLs or IDs of attached files/references
  createdAt: string;
  updatedAt: string;
}
