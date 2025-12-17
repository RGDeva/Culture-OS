// Sample campaigns for seeding and fallback display
export const SAMPLE_CAMPAIGNS = [
  {
    id: 'sample-joyner-lucas-corleone',
    creatorId: 'joyner-lucas',
    creatorName: 'Joyner Lucas',
    title: 'Joyner Lucas — "Corleone" Clipping Campaign',
    description: 'Create viral clips from Joyner Lucas\'s new single "Corleone". Top performers get reposted by Joyner himself. Earn $2 per 1,000 views on your clips across TikTok, Instagram Reels, and YouTube Shorts.',
    campaignType: 'CONTENT_REWARDS',
    status: 'OPEN',
    budgetCents: 100000, // $1,000
    payoutType: 'PER_VIEWS',
    payoutRuleJson: JSON.stringify({
      perThousandViews: 200, // $2 per 1,000 views
      bonus: 'Top viewed clip gets reposted by Joyner',
      maxPayoutPerSubmission: 10000, // $100 cap per submission
    }),
    requirementsJson: JSON.stringify({
      platforms: ['TIKTOK', 'INSTAGRAM', 'YOUTUBE'],
      hashtags: ['#JoynerLucas', '#Corleone', '#NoCulture'],
      minDuration: 15,
      maxDuration: 60,
      instructions: 'Use any clip from the official "Corleone" music video or audio. Be creative!',
    }),
    assets: [
      {
        id: 'asset-1',
        title: 'Official Audio Snippet',
        assetType: 'AUDIO',
        url: 'https://drive.google.com/file/d/example-audio/view',
        description: '30-second official audio clip for use in your content'
      },
      {
        id: 'asset-2',
        title: 'Cover Art (High-Res)',
        assetType: 'IMAGE',
        url: 'https://drive.google.com/file/d/example-cover/view',
        description: '4K cover art for thumbnails and backgrounds'
      },
      {
        id: 'asset-3',
        title: 'Caption Pack',
        assetType: 'DOC',
        url: 'https://docs.google.com/document/d/example-captions/edit',
        description: 'Pre-written captions and hashtag suggestions'
      },
      {
        id: 'asset-4',
        title: 'Brand Voice Demo',
        assetType: 'VIDEO',
        url: 'https://drive.google.com/file/d/example-demo/view',
        description: 'Example clips showing the vibe we\'re looking for'
      }
    ],
    startAt: new Date('2024-12-01'),
    endAt: new Date('2025-01-31'),
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    remoteOk: true,
  },
  {
    id: 'sample-beat-placement-challenge',
    creatorId: 'noculture-official',
    creatorName: 'NoCulture',
    title: 'Open Verse / Beat Placement Challenge',
    description: 'Submit your best verse or beat for a chance to be featured on the next NoCulture compilation. Top 3 entries win cash prizes and get their work distributed to major streaming platforms.',
    campaignType: 'OPPORTUNITY',
    status: 'OPEN',
    budgetCents: 250000, // $2,500
    payoutType: 'LEADERBOARD',
    payoutRuleJson: JSON.stringify({
      prizes: [
        { place: 1, amountCents: 100000, description: '1st Place: $1,000 + Feature' },
        { place: 2, amountCents: 75000, description: '2nd Place: $750 + Feature' },
        { place: 3, amountCents: 50000, description: '3rd Place: $500 + Feature' },
      ],
      bonus: 'All top 10 get reposted and featured in newsletter',
    }),
    requirementsJson: JSON.stringify({
      platforms: ['OTHER'],
      acceptedFormats: ['MP3', 'WAV'],
      maxFileSize: '50MB',
      instructions: 'Submit your original beat or verse. Must be unpublished. Include BPM and key in notes.',
      deadline: '2025-01-15',
    }),
    startAt: new Date('2024-12-10'),
    endAt: new Date('2025-01-15'),
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    remoteOk: true,
    location: null,
  },
  {
    id: 'sample-producer-pack-affiliate',
    creatorId: 'xen-producer',
    creatorName: 'XEN_PRODUCER',
    title: 'Promote Producer Pack — Earn 15% Per Sale',
    description: 'Promote the "Midnight Drill" producer pack and earn 15% commission on every sale you drive. High-converting product with average order value of $49. Perfect for music content creators.',
    campaignType: 'AFFILIATE',
    status: 'OPEN',
    budgetCents: 500000, // $5,000 total pool
    payoutType: 'MILESTONE',
    payoutRuleJson: JSON.stringify({
      commissionPct: 15,
      averageOrderCents: 4900,
      averageCommissionCents: 735,
      bonusTiers: [
        { sales: 10, bonusCents: 5000, description: '10 sales: $50 bonus' },
        { sales: 25, bonusCents: 15000, description: '25 sales: $150 bonus' },
        { sales: 50, bonusCents: 50000, description: '50 sales: $500 bonus' },
      ],
    }),
    requirementsJson: JSON.stringify({
      platforms: ['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'X'],
      instructions: 'Share your unique affiliate link. Create content showcasing the sounds. Mention discount code.',
      disclosureRequired: true,
      approvalRequired: false,
    }),
    startAt: new Date('2024-11-01'),
    endAt: new Date('2025-03-01'),
    featured: true,
    linkedProductId: 'midnight-drill-pack',
    commissionPct: 0.15,
    imageUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=800',
    remoteOk: true,
  },
  {
    id: 'sample-mixing-engineer-gig',
    creatorId: 'atlantic-records',
    creatorName: 'Atlantic Records A&R',
    title: 'Mixing Engineer Needed — Album Project',
    description: 'Atlantic Records is looking for a skilled mixing engineer for an upcoming album project. Remote work available. Must have credits on commercially released projects.',
    campaignType: 'OPPORTUNITY',
    status: 'OPEN',
    budgetCents: 1000000, // $10,000
    payoutType: 'FIXED',
    payoutRuleJson: JSON.stringify({
      fixedAmount: 1000000,
      paymentTerms: '50% upfront, 50% on delivery',
      estimatedDuration: '4-6 weeks',
    }),
    requirementsJson: JSON.stringify({
      platforms: ['OTHER'],
      instructions: 'Submit portfolio with at least 3 recent mixes. Include streaming links and credits.',
      experience: 'Minimum 2 years professional experience',
      genre: 'Hip-Hop / R&B',
    }),
    startAt: new Date('2024-12-15'),
    endAt: new Date('2025-01-31'),
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
    remoteOk: true,
    location: 'Remote / Los Angeles',
  },
  {
    id: 'sample-wavewarz-promo',
    creatorId: 'wavewarz',
    creatorName: 'WaveWarZ',
    title: 'WaveWarZ Season 5 — Promo Clip Challenge',
    description: 'Create hype clips for WaveWarZ Season 5 battles. Best clips get featured on the official WaveWarZ socials. Earn based on engagement.',
    campaignType: 'CONTENT_REWARDS',
    status: 'UPCOMING',
    budgetCents: 50000, // $500
    payoutType: 'LEADERBOARD',
    payoutRuleJson: JSON.stringify({
      prizes: [
        { place: 1, amountCents: 20000, description: '1st: $200' },
        { place: 2, amountCents: 15000, description: '2nd: $150' },
        { place: 3, amountCents: 10000, description: '3rd: $100' },
      ],
      participationReward: 500, // $5 for approved submissions
    }),
    requirementsJson: JSON.stringify({
      platforms: ['TIKTOK', 'INSTAGRAM'],
      hashtags: ['#WaveWarZ', '#Season5'],
      minDuration: 10,
      maxDuration: 30,
    }),
    startAt: new Date('2025-01-15'),
    endAt: new Date('2025-02-15'),
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    remoteOk: true,
  },
]

// Helper to format payout summary for display
export function formatPayoutSummary(campaign: typeof SAMPLE_CAMPAIGNS[0]): string {
  const rules = JSON.parse(campaign.payoutRuleJson)
  
  switch (campaign.payoutType) {
    case 'PER_VIEWS':
      const perK = rules.perThousandViews / 100
      return `$${perK} per 1,000 views`
    case 'FIXED':
      return `$${(rules.fixedAmount / 100).toLocaleString()} fixed`
    case 'LEADERBOARD':
      if (rules.prizes && rules.prizes[0]) {
        return `Up to $${(rules.prizes[0].amountCents / 100).toLocaleString()}`
      }
      return 'Leaderboard prizes'
    case 'MILESTONE':
      if (rules.commissionPct) {
        return `${rules.commissionPct}% commission`
      }
      return 'Milestone rewards'
    default:
      return `$${(campaign.budgetCents / 100).toLocaleString()} budget`
  }
}

// Helper to get campaign type display label
export function getCampaignTypeLabel(type: string): string {
  switch (type) {
    case 'CONTENT_REWARDS':
      return 'Content Rewards'
    case 'OPPORTUNITY':
      return 'Opportunity'
    case 'AFFILIATE':
      return 'Affiliate'
    default:
      return type
  }
}

// Helper to get status display config
export function getStatusConfig(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', color: 'text-green-400', bg: 'bg-green-400/10' }
    case 'UPCOMING':
      return { label: 'Upcoming', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    case 'CLOSED':
      return { label: 'Closed', color: 'text-gray-400', bg: 'bg-gray-400/10' }
    default:
      return { label: status, color: 'text-gray-400', bg: 'bg-gray-400/10' }
  }
}

// Helper to get campaign type config
export function getCampaignTypeConfig(type: string): { label: string; color: string; bg: string; icon: string } {
  switch (type) {
    case 'CONTENT_REWARDS':
      return { label: 'Content Rewards', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: 'Scissors' }
    case 'OPPORTUNITY':
      return { label: 'Opportunity', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: 'Briefcase' }
    case 'AFFILIATE':
      return { label: 'Affiliate', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: 'TrendingUp' }
    default:
      return { label: type, color: 'text-gray-400', bg: 'bg-gray-400/10', icon: 'Zap' }
  }
}
