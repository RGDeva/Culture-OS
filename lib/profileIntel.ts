/**
 * Profile Intelligence - Mock analytics and campaign suggestions
 * Based on which links are present in the profile
 */

import { Profile, ProfileIntel } from '@/types/profile'

export function generateProfileIntel(profile: Profile): ProfileIntel {
  // Check which platforms are connected
  const hasSpotify = !!profile.spotifyUrl
  const hasAppleMusic = !!profile.appleMusicUrl
  const hasYoutube = !!profile.youtubeUrl
  const hasSoundcloud = !!profile.soundcloudUrl
  const hasInstagram = !!profile.instagramUrl
  const hasTikTok = !!profile.tiktokUrl
  const hasX = !!profile.xUrl
  
  // Calculate profile completeness
  const totalFields = 15 // all possible profile fields
  const filledFields = [
    profile.displayName,
    profile.roles.length > 0,
    profile.primaryGoal,
    profile.locationRegion,
    profile.spotifyUrl,
    profile.appleMusicUrl,
    profile.youtubeUrl,
    profile.soundcloudUrl,
    profile.instagramUrl,
    profile.tiktokUrl,
    profile.xUrl,
    profile.websiteUrl,
    profile.linkInBioUrl
  ].filter(Boolean).length
  
  const profileCompleteness = Math.round((filledFields / totalFields) * 100)
  
  // Mock estimated metrics based on connected platforms
  let estimatedMonthlyListeners = 0
  let estimatedSocialFollowers = 0
  
  if (hasSpotify) estimatedMonthlyListeners += 25000
  if (hasAppleMusic) estimatedMonthlyListeners += 15000
  if (hasYoutube) estimatedMonthlyListeners += 10000
  if (hasSoundcloud) estimatedMonthlyListeners += 5000
  
  if (hasInstagram) estimatedSocialFollowers += 30000
  if (hasTikTok) estimatedSocialFollowers += 50000
  if (hasX) estimatedSocialFollowers += 15000
  if (hasYoutube) estimatedSocialFollowers += 20000
  
  // Generate campaign suggestions based on role and platforms
  const suggestedCampaigns = generateCampaignSuggestions(profile, {
    hasSpotify,
    hasAppleMusic,
    hasYoutube,
    hasSoundcloud,
    hasInstagram,
    hasTikTok,
    hasX
  })
  
  // Generate savings message based on role and goals
  const suggestedSavingsMessage = generateSavingsMessage(profile, estimatedMonthlyListeners, estimatedSocialFollowers)
  
  return {
    hasSpotify,
    hasAppleMusic,
    hasYoutube,
    hasSoundcloud,
    hasInstagram,
    hasTikTok,
    hasX,
    estimatedMonthlyListeners,
    estimatedSocialFollowers,
    suggestedCampaigns,
    suggestedSavingsMessage,
    profileCompleteness
  }
}

function generateCampaignSuggestions(profile: Profile, platforms: Record<string, boolean>): string[] {
  const suggestions: string[] = []
  const isArtist = profile.roles.includes('ARTIST')
  const isProducer = profile.roles.includes('PRODUCER')
  const isEngineer = profile.roles.includes('ENGINEER')
  const isStudio = profile.roles.includes('STUDIO')
  
  // Role-based suggestions
  if (isProducer) {
    suggestions.push('Bundle your best beat pack with 1:1 feedback sessions')
    suggestions.push('Offer a producer toolkit with your signature sound')
  }
  
  if (isEngineer) {
    suggestions.push('Create a mixing/mastering package for your top repeat clients')
    suggestions.push('Offer tiered service packages (Bronze/Silver/Gold) in your Marketplace')
  }
  
  if (isStudio) {
    suggestions.push('Package studio time with mixing/mastering services')
    suggestions.push('Create location-based bundles for local artists')
  }
  
  if (isArtist) {
    suggestions.push('Create a private drop for your top 100 fans using access passes')
    suggestions.push('Offer exclusive stems and project files to engaged followers')
  }
  
  // Platform-based suggestions
  if (platforms.hasSpotify || platforms.hasAppleMusic) {
    suggestions.push('Move repeat buyers from streaming platforms into your own Marketplace storefront')
  }
  
  if (platforms.hasTikTok || platforms.hasInstagram) {
    suggestions.push('Convert social media engagement into direct sales with limited drops')
  }
  
  if (platforms.hasYoutube) {
    suggestions.push('Monetize your YouTube audience with exclusive tutorial bundles')
  }
  
  // Goal-based suggestions
  if (profile.primaryGoal?.toLowerCase().includes('sell')) {
    suggestions.push('Set up instant split payouts for collaborations to attract more buyers')
  }
  
  if (profile.primaryGoal?.toLowerCase().includes('collab')) {
    suggestions.push('Use Creator Map to find local artists in your region')
  }
  
  // Return top 4-5 most relevant suggestions
  return suggestions.slice(0, 5)
}

function generateSavingsMessage(profile: Profile, listeners: number, followers: number): string {
  const isProducer = profile.roles.includes('PRODUCER')
  const isEngineer = profile.roles.includes('ENGINEER')
  const isArtist = profile.roles.includes('ARTIST')
  
  // Calculate potential savings based on audience size
  const platformFees = listeners * 0.01 + followers * 0.005 // Mock calculation
  const potentialSavings = Math.round(platformFees * 0.25) // 25% savings estimate
  
  if (isProducer) {
    return `You could save $${Math.max(150, potentialSavings)}-$${Math.max(300, potentialSavings * 2)}/month in platform fees by driving repeat buyers into your own NoCulture Marketplace storefront.`
  }
  
  if (isEngineer) {
    return `Estimated gain: $${Math.max(200, potentialSavings)}-$${Math.max(400, potentialSavings * 2)}/month by offering packaged services directly to clients vs. marketplace middlemen.`
  }
  
  if (isArtist) {
    return `You could save 15-25% vs. traditional distributor + marketplace fees using direct fan passes and instant splits. Estimated: $${Math.max(100, potentialSavings)}-$${Math.max(250, potentialSavings * 2)}/month.`
  }
  
  return `You could save $${Math.max(150, potentialSavings)}-$${Math.max(300, potentialSavings * 2)}/month in platform fees using your own storefront and direct relationships.`
}
