/**
 * Recoupable API Client
 * Docs: https://docs.recoupable.com/getting-started
 * Base URL: https://api.recoupable.com/api
 */

import type {
  RecoupSnapshot,
  ArtistSocialResponse,
  SpotifyArtistResponse,
  RecoupSong,
  RecoupTask,
  RecoupSegment,
  RecoupPost,
  CampaignRecommendation,
} from '@/types/recoupable'
import { getProfile } from './profileStore'

const RECOUP_API_URL = process.env.NEXT_PUBLIC_RECOUP_API_URL || 'https://api.recoupable.com/api'
const DEFAULT_ARTIST_ACCOUNT_ID = process.env.RECOUP_DEFAULT_ARTIST_ACCOUNT_ID || '09a73efd-b43c-4a53-8a41-ec16ea632bd9'

// In-memory snapshot store (replace with DB in production)
const snapshotStore = new Map<string, RecoupSnapshot>()

/**
 * Helper: Safe fetch with timeout and error handling
 */
async function safeFetch<T>(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<T | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    console.log('[RECOUP] Fetching:', url)
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        // Note: Recoup docs show "coming soon" for API key auth
        // If needed later: 'Authorization': `Bearer ${process.env.RECOUP_API_KEY}`
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[RECOUP] API returned ${response.status}: ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data as T
  } catch (error: any) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      console.warn('[RECOUP] Request timeout:', url)
    } else {
      console.error('[RECOUP] Request failed:', error.message)
    }
    return null
  }
}

/**
 * Fetch artist social accounts
 */
export async function fetchArtistSocials(
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
): Promise<ArtistSocialResponse[]> {
  const data = await safeFetch<ArtistSocialResponse[]>(
    `${RECOUP_API_URL}/artist-socials?artistAccountId=${artistAccountId}`
  )
  return data || []
}

/**
 * Fetch artist segments
 */
export async function fetchArtistSegments(
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
): Promise<RecoupSegment[]> {
  const data = await safeFetch<RecoupSegment[]>(
    `${RECOUP_API_URL}/artist-segments?artistAccountId=${artistAccountId}`
  )
  return data || []
}

/**
 * Fetch social posts
 */
export async function fetchSocialPosts(
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
): Promise<RecoupPost[]> {
  const data = await safeFetch<RecoupPost[]>(
    `${RECOUP_API_URL}/social/posts?artistAccountId=${artistAccountId}`
  )
  return data || []
}

/**
 * Search Spotify artist
 */
export async function searchSpotifyArtist(query: string): Promise<SpotifyArtistResponse | null> {
  const data = await safeFetch<{ artists: { items: SpotifyArtistResponse[] } }>(
    `${RECOUP_API_URL}/spotify/search?q=${encodeURIComponent(query)}&type=artist`
  )
  return data?.artists?.items?.[0] || null
}

/**
 * Fetch Spotify artist details
 */
export async function fetchSpotifyArtist(
  spotifyArtistId: string
): Promise<SpotifyArtistResponse | null> {
  return await safeFetch<SpotifyArtistResponse>(
    `${RECOUP_API_URL}/spotify/artist/${spotifyArtistId}`
  )
}

/**
 * Fetch Spotify artist top tracks
 */
export async function fetchSpotifyTopTracks(spotifyArtistId: string) {
  const data = await safeFetch<any>(
    `${RECOUP_API_URL}/spotify/artist-top-tracks/${spotifyArtistId}`
  )
  return data?.tracks || []
}

/**
 * Fetch fan data
 */
export async function fetchFans(
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
) {
  return await safeFetch<any>(
    `${RECOUP_API_URL}/segment/fans?artistAccountId=${artistAccountId}`
  )
}

/**
 * Fetch songs for artist
 */
export async function fetchSongs(
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
): Promise<RecoupSong[]> {
  const data = await safeFetch<RecoupSong[]>(
    `${RECOUP_API_URL}/songs?artistAccountId=${artistAccountId}`
  )
  return data || []
}

/**
 * Fetch tasks
 */
export async function fetchTasks(
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
): Promise<RecoupTask[]> {
  const data = await safeFetch<RecoupTask[]>(
    `${RECOUP_API_URL}/tasks?artistAccountId=${artistAccountId}`
  )
  return data || []
}

/**
 * Create a new task
 */
export async function createTask(
  task: Partial<RecoupTask>,
  artistAccountId: string = DEFAULT_ARTIST_ACCOUNT_ID
): Promise<RecoupTask | null> {
  return await safeFetch<RecoupTask>(
    `${RECOUP_API_URL}/tasks`,
    {
      method: 'POST',
      body: JSON.stringify({ ...task, artistAccountId }),
    }
  )
}

/**
 * Main sync function: Aggregates all Recoupable data for a user
 */
export async function syncArtistDataForUser(userId: string): Promise<RecoupSnapshot> {
  console.log('[RECOUP] Starting sync for user:', userId)

  // Get user profile to find their artist account ID and Spotify info
  const profile = getProfile(userId)
  const artistAccountId = profile?.recoupArtistAccountId || DEFAULT_ARTIST_ACCOUNT_ID
  const spotifyArtistId = profile?.spotifyArtistId

  console.log('[RECOUP] Using artistAccountId:', artistAccountId)
  console.log('[RECOUP] Spotify artist ID:', spotifyArtistId)

  // Fetch data in parallel
  const [socials, segments, posts, fans, songs, spotifyData, topTracks] = await Promise.all([
    fetchArtistSocials(artistAccountId),
    fetchArtistSegments(artistAccountId),
    fetchSocialPosts(artistAccountId),
    fetchFans(artistAccountId),
    fetchSongs(artistAccountId),
    spotifyArtistId ? fetchSpotifyArtist(spotifyArtistId) : Promise.resolve(null),
    spotifyArtistId ? fetchSpotifyTopTracks(spotifyArtistId) : Promise.resolve([]),
  ])

  // Aggregate socials data
  const socialsData: RecoupSnapshot['socials'] = {
    igFollowers: socials.find(s => s.platform === 'instagram')?.followers,
    tiktokFollowers: socials.find(s => s.platform === 'tiktok')?.followers,
    xFollowers: socials.find(s => s.platform === 'twitter')?.followers,
    youtubeSubscribers: socials.find(s => s.platform === 'youtube')?.followers,
  }

  // Build snapshot
  const snapshot: RecoupSnapshot = {
    userId,
    artistAccountId,
    fetchedAt: new Date().toISOString(),
    spotify: spotifyData ? {
      artistId: spotifyData.id,
      artistName: spotifyData.name,
      followers: spotifyData.followers?.total,
      monthlyListeners: undefined, // Not directly available from this endpoint
      topTracks: topTracks.slice(0, 5).map((t: any) => ({
        id: t.id,
        name: t.name,
        popularity: t.popularity,
        previewUrl: t.preview_url,
      })),
    } : undefined,
    socials: socialsData,
    fans: fans ? {
      totalFans: fans.total || fans.length,
      topCountries: fans.topCountries || [],
    } : undefined,
    segments: segments || [],
    posts: posts || [],
  }

  // Store snapshot
  snapshotStore.set(userId, snapshot)
  console.log('[RECOUP] Sync complete, snapshot stored for user:', userId)

  return snapshot
}

/**
 * Get latest snapshot for user
 */
export function getSnapshot(userId: string): RecoupSnapshot | null {
  return snapshotStore.get(userId) || null
}

/**
 * Generate campaign recommendations based on snapshot data
 */
export function generateCampaignRecommendations(
  snapshot: RecoupSnapshot
): CampaignRecommendation[] {
  const recommendations: CampaignRecommendation[] = []

  // Rule 1: Top country + platform targeting
  const topCountry = snapshot.fans?.topCountries?.[0]
  const hasTikTok = (snapshot.socials?.tiktokFollowers || 0) > 1000
  const hasIG = (snapshot.socials?.igFollowers || 0) > 1000

  if (topCountry && hasTikTok) {
    recommendations.push({
      id: 'rec_tiktok_top_country',
      title: `Target ${topCountry} on TikTok`,
      description: `Run a short-form video campaign targeting ${topCountry} where your fans are concentrated.`,
      priority: 'high',
      targetPlatform: 'TikTok',
      targetCountry: topCountry,
      reasoning: `${topCountry} is your top country with ${snapshot.socials?.tiktokFollowers || 0} TikTok followers`,
      estimatedReach: Math.floor((snapshot.socials?.tiktokFollowers || 0) * 0.15),
    })
  }

  // Rule 2: Spotify top tracks promo
  if (snapshot.spotify?.topTracks && snapshot.spotify.topTracks.length > 0) {
    const topTrack = snapshot.spotify.topTracks[0]
    recommendations.push({
      id: 'rec_spotify_promo',
      title: `Promote "${topTrack.name}" snippet`,
      description: `Create 15-30s clips of your top track and share across all platforms with a Spotify link.`,
      priority: 'high',
      targetPlatform: 'All',
      reasoning: `${topTrack.name} is your most popular track (${topTrack.popularity}/100)`,
      estimatedReach: Math.floor((snapshot.spotify.followers || 0) * 0.2),
    })
  }

  // Rule 3: Instagram Reels if high engagement
  if (hasIG && snapshot.posts) {
    const igPosts = snapshot.posts.filter(p => p.platform === 'instagram')
    const avgEngagement = igPosts.reduce((sum, p) => sum + p.engagementScore, 0) / (igPosts.length || 1)

    if (avgEngagement > 100 || igPosts.length === 0) {
      recommendations.push({
        id: 'rec_ig_reels',
        title: 'Launch Instagram Reels series',
        description: 'Post 3-5 Reels per week showcasing behind-the-scenes, studio sessions, or song teasers.',
        priority: 'medium',
        targetPlatform: 'Instagram',
        reasoning: `You have ${snapshot.socials?.igFollowers || 0} Instagram followers`,
        estimatedReach: Math.floor((snapshot.socials?.igFollowers || 0) * 0.1),
      })
    }
  }

  // Rule 4: Fan segment targeting
  if (snapshot.segments && snapshot.segments.length > 0) {
    const largestSegment = snapshot.segments.reduce((max, seg) =>
      seg.size > max.size ? seg : max
    )
    recommendations.push({
      id: 'rec_segment_campaign',
      title: `Engage "${largestSegment.segmentName}" segment`,
      description: `Direct campaign to your ${largestSegment.size} fans in the "${largestSegment.segmentName}" segment.`,
      priority: 'medium',
      reasoning: `Your largest segment with ${largestSegment.size} engaged fans`,
      estimatedReach: largestSegment.size,
    })
  }

  // Rule 5: General marketplace tip
  recommendations.push({
    id: 'rec_marketplace',
    title: 'List exclusive content on NoCulture Marketplace',
    description: 'Drive repeat buyers by offering stems, sample packs, or studio time directly to fans.',
    priority: 'low',
    reasoning: 'Reduce platform fees and own your fan relationships',
  })

  return recommendations
}
