// Comprehensive type definitions for multi-role Vault system

export type UserRole =
  | 'ARTIST'
  | 'PRODUCER'
  | 'ENGINEER'
  | 'STUDIO'
  | 'MANAGER'
  | 'OTHER';

export type AssetType =
  | 'BEAT'
  | 'SONG_DEMO'
  | 'VOCAL'
  | 'LOOP'
  | 'STEMS'
  | 'MIX'
  | 'MASTER'
  | 'REFERENCE'
  | 'SESSION_FILES';

export type ProductCategory =
  | 'LOOP'
  | 'BEAT'
  | 'DRUM_KIT'
  | 'SAMPLE'
  | 'ONE_SHOT'
  | 'VOCAL_SAMPLE'
  | 'MIDI'
  | 'PRESET'
  | 'SAMPLE_PACK'
  | 'BEAT_PACK'
  | 'STEMS'
  | 'FULL_SONG'
  | 'SESSION_FILES';

export type AssetStatus =
  | 'IDEA'
  | 'IN_PROGRESS'
  | 'FOR_SALE'
  | 'PLACED'
  | 'LOCKED';

export type ProjectStatus =
  | 'IDEA'
  | 'IN_PROGRESS'
  | 'DONE';

export type ListingCategory =
  | 'BEAT'
  | 'SONG'
  | 'SERVICE'
  | 'SESSION'
  | 'PACK';

export type LicenseType =
  | 'LEASE'
  | 'EXCLUSIVE'
  | 'CUSTOM_WORK'
  | 'SERVICE_AGREEMENT';

export type DealStatus =
  | 'PENDING_PAYMENT'
  | 'AWAITING_SIGNATURES'
  | 'ACTIVE'
  | 'REFUNDED'
  | 'CANCELLED';

export type Currency = 'USDC' | 'USD';

export interface CreativeAsset {
  id: string;
  ownerId: string;
  ownerRoles: UserRole[];
  title: string;
  fileUrl: string;
  assetType: AssetType;
  productCategory?: ProductCategory; // For marketplace categorization
  bpm?: number;
  key?: string;
  musicalKey?: string;
  genre?: string;
  moodTags?: string[];
  projectId?: string;
  folderId?: string; // Folder this asset belongs to
  status: AssetStatus;
  duration?: number;
  sampleRate?: number;
  fileSize?: number;
  waveformUrl?: string;
  
  // Marketplace fields
  price?: number;
  currency?: Currency;
  isForSale?: boolean;
  
  // Cyanite AI Analysis
  cyaniteAnalysisId?: string;
  cyaniteStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  energy?: number;
  moods?: string[];
  genres?: string[];
  valence?: number;
  danceability?: number;
  instrumentalness?: number;
  acousticness?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  rolesNeeded: UserRole[];
  tags?: string[];
  budgetRange?: {
    min?: number;
    max?: number;
    currency?: Currency;
  };
  assetIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetContributor {
  id: string;
  assetId: string;
  userId: string;
  userName?: string;
  role: UserRole;
  splitPercent?: number;
  accepted?: boolean;
  createdAt: string;
}

export interface LicenseTemplate {
  id: string;
  name: string;
  category: ListingCategory;
  type: LicenseType;
  baseTerms: string;
  variables?: string[];
  createdAt: string;
}

export interface Listing {
  id: string;
  assetId?: string;
  projectId?: string;
  sellerId: string;
  sellerName?: string;
  title: string;
  description?: string;
  category: ListingCategory;
  rolesServed: UserRole[];
  price: number;
  currency: Currency;
  licenseTemplateId: string;
  status: 'ACTIVE' | 'PAUSED' | 'SOLD_OUT';
  tags?: string[];
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  amount: number;
  currency: Currency;
  status: DealStatus;
  contractId?: string;
  transactionHash?: string;
  createdAt: string;
  expiresAt: string;
  refundedAt?: string;
  completedAt?: string;
}

export interface Contract {
  id: string;
  dealId: string;
  listingId: string;
  assetId?: string;
  projectId?: string;
  sellerId: string;
  sellerName?: string;
  buyerId: string;
  buyerName?: string;
  licenseTemplateId: string;
  termsText: string;
  sellerAccepted: boolean;
  buyerAccepted: boolean;
  createdAt: string;
  finalizedAt?: string;
}

// Metadata extraction types
export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  duration?: number;
  sampleRate?: number;
  bitrate?: number;
  bpm?: number;
  key?: string;
}

// Filter types
export interface VaultFilters {
  ownerRole?: UserRole;
  assetType?: AssetType;
  productCategory?: ProductCategory;
  status?: AssetStatus;
  bpmRange?: { min?: number; max?: number };
  key?: string;
  genre?: string;
  search?: string;
  projectId?: string;
  isForSale?: boolean;
  
  // Cyanite-powered filters
  moods?: string[];
  genres?: string[];
  energyRange?: { min?: number; max?: number };
  danceabilityRange?: { min?: number; max?: number };
}

export interface MarketplaceFilters {
  category?: ListingCategory;
  rolesServed?: UserRole[];
  priceRange?: { min?: number; max?: number };
  genre?: string;
  search?: string;
  sellerId?: string;
}
