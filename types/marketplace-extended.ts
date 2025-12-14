/**
 * Extended Marketplace Types
 * Supports multiple pricing models, bidding, and collaboration
 */

// Pricing models
export type PricingModel = 
  | 'X402_PAY_PER_ACCESS'  // x402 pay-to-play
  | 'DIRECT_PURCHASE'      // One-time purchase
  | 'FREE'                 // Free access
  | 'BIDDING'              // Auction/bidding
  | 'NAME_YOUR_PRICE'      // Pay what you want

// Product types
export type ExtendedProductType =
  | 'BEAT'                 // Finished beat
  | 'KIT'                  // Sample/preset kit
  | 'STEMS'                // Individual stems
  | 'UNFINISHED'           // Work in progress
  | 'COLLABORATION'        // Open for collaboration
  | 'SERVICE'              // Service offering
  | 'ACCESS'               // Community/course access
  | 'PRESET_PACK'          // Synth presets
  | 'MIDI_PACK'            // MIDI files
  | 'LOOP_PACK'            // Audio loops

// Access levels for x402
export type AccessLevel =
  | 'PREVIEW_ONLY'         // 30-second preview
  | 'FULL_AUDIO'           // Full track playback
  | 'STEMS'                // Access to stems
  | 'PROJECT_FILE'         // Full project file
  | 'UNLIMITED'            // All access

// Collaboration status
export type CollabStatus =
  | 'OPEN'                 // Open for collaborators
  | 'IN_PROGRESS'          // Currently working
  | 'COMPLETED'            // Collaboration closed
  | 'SEEKING_SPECIFIC'     // Looking for specific role

// Bidding status
export type BidStatus =
  | 'ACTIVE'               // Bidding open
  | 'ENDING_SOON'          // Less than 24hrs
  | 'CLOSED'               // Bidding closed
  | 'SOLD'                 // Item sold

export interface Bid {
  id: string
  userId: string
  userName: string
  amount: number
  timestamp: string
  message?: string
}

export interface CollaborationRequest {
  id: string
  userId: string
  userName: string
  role: string             // e.g., "Vocalist", "Mixer", "Producer"
  message: string
  portfolioUrl?: string
  timestamp: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

export interface ExtendedProduct {
  id: string
  title: string
  description: string
  type: ExtendedProductType
  
  // Creator info
  creatorId: string
  creatorName: string
  creatorWallet?: string
  
  // Pricing
  pricingModel: PricingModel
  priceUSDC?: number        // For direct purchase
  minimumBid?: number       // For bidding
  currentBid?: number       // Current highest bid
  suggestedPrice?: number   // For name-your-price
  
  // x402 specific
  x402Enabled: boolean
  x402AccessLevel?: AccessLevel
  x402PricePerAccess?: number
  
  // Media
  coverUrl?: string
  previewUrl?: string       // 30-second preview
  fullAudioUrl?: string     // Full track (for purchases)
  stemsUrl?: string[]       // Stem files
  projectFileUrl?: string   // DAW project file
  
  // Collaboration
  openForCollab: boolean
  collabStatus?: CollabStatus
  seekingRoles?: string[]   // ["Vocalist", "Mixer", etc.]
  collabRequests?: CollaborationRequest[]
  collaborators?: Array<{
    userId: string
    userName: string
    role: string
    split: number          // Percentage split
  }>
  
  // Bidding
  biddingEnabled: boolean
  bidStatus?: BidStatus
  bidEndTime?: string
  bids?: Bid[]
  reservePrice?: number    // Minimum price to meet
  
  // Metadata
  bpm?: number
  key?: string
  genre?: string[]
  tags?: string[]
  duration?: number        // in seconds
  completionStatus?: 'FINISHED' | 'WIP' | 'SKETCH'
  
  // Stats
  views: number
  likes: number
  purchases: number
  accessCount: number      // For x402
  
  // Timestamps
  createdAt: string
  updatedAt: string
  listingExpiresAt?: string
}

// Purchase record
export interface ExtendedPurchase {
  id: string
  userId: string
  productId: string
  
  // Purchase details
  purchaseType: 'DIRECT' | 'X402_ACCESS' | 'BID_WON' | 'FREE' | 'NAME_YOUR_PRICE'
  amountPaid: number
  paymentMethod: 'WALLET' | 'CARD' | 'X402'
  
  // Access rights
  accessLevel: AccessLevel
  accessCount?: number     // For x402 tracking
  unlimitedAccess: boolean
  
  // Transaction
  txHash?: string
  network?: string
  
  // Timestamps
  purchasedAt: string
  expiresAt?: string       // For time-limited access
}

// Collaboration proposal
export interface CollabProposal {
  id: string
  productId: string
  proposerId: string
  proposerName: string
  
  role: string
  message: string
  proposedSplit: number    // Percentage
  portfolioUrl?: string
  samplesUrl?: string[]
  
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NEGOTIATING'
  creatorResponse?: string
  
  createdAt: string
  respondedAt?: string
}

// Analytics for creators
export interface CreatorAnalytics {
  creatorId: string
  
  // Revenue
  totalEarnings: number
  x402Earnings: number
  directSalesEarnings: number
  biddingEarnings: number
  
  // Engagement
  totalViews: number
  totalLikes: number
  totalPurchases: number
  x402AccessCount: number
  
  // Collaboration
  activeCollabs: number
  completedCollabs: number
  collabRequests: number
  
  // Popular items
  topSellingProducts: Array<{
    productId: string
    title: string
    earnings: number
  }>
  
  // Time period
  period: 'DAY' | 'WEEK' | 'MONTH' | 'ALL_TIME'
  startDate: string
  endDate: string
}
