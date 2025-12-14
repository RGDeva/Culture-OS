"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  MapPin, 
  Music, 
  Instagram, 
  Twitter,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import type { RecoupSnapshot, CampaignRecommendation } from '@/types/recoupable'

interface RecoupDataPanelProps {
  userId: string
}

export function RecoupDataPanel({ userId }: RecoupDataPanelProps) {
  const [snapshot, setSnapshot] = useState<RecoupSnapshot | null>(null)
  const [recommendations, setRecommendations] = useState<CampaignRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSnapshot = async () => {
    try {
      setLoading(true)
      setError(null)

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`/api/recoup/snapshot?userId=${userId}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.status === 404) {
        // No data synced yet
        setSnapshot(null)
        setError(null)
        return
      }

      if (response.status === 503) {
        // Database not configured
        console.warn('[RECOUP_PANEL] Database not configured')
        setSnapshot(null)
        setError(null)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const data = await response.json()
      setSnapshot(data.snapshot)

      // Generate recommendations
      if (data.snapshot) {
        const recs = generateRecommendations(data.snapshot)
        setRecommendations(recs)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('[RECOUP_PANEL] Snapshot fetch timeout')
        setError(null) // Don't show error on timeout
      } else {
        console.error('[RECOUP_PANEL] Error loading snapshot:', err)
        setError(err.message || 'Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setError(null)

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for sync

      const response = await fetch('/api/recoup/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.status === 503) {
        setError('Database not configured. Please run: npx prisma generate && npx prisma db push')
        return
      }

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      // Reload snapshot
      await loadSnapshot()
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Sync timeout - this may take a while. Try again later.')
      } else {
        console.error('[RECOUP_PANEL] Sync error:', err)
        setError(err.message || 'Sync failed')
      }
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    loadSnapshot()
  }, [userId])

  // Simple rule-based recommendations
  const generateRecommendations = (snap: RecoupSnapshot): CampaignRecommendation[] => {
    const recs: CampaignRecommendation[] = []

    const topCountry = snap.fans?.topCountries?.[0]
    const hasTikTok = (snap.socials?.tiktokFollowers || 0) > 500
    const hasIG = (snap.socials?.igFollowers || 0) > 500

    if (topCountry && hasTikTok) {
      recs.push({
        id: 'tiktok_country',
        title: `Target ${topCountry} on TikTok`,
        description: `Run short-form video campaign in ${topCountry}`,
        priority: 'high',
        targetPlatform: 'TikTok',
        targetCountry: topCountry,
        reasoning: `${topCountry} is your top market with ${snap.socials?.tiktokFollowers} followers`,
      })
    }

    if (snap.spotify?.topTracks && snap.spotify.topTracks.length > 0) {
      const track = snap.spotify.topTracks[0]
      recs.push({
        id: 'spotify_promo',
        title: `Promote "${track.name}"`,
        description: 'Create 15-30s clips and share across platforms',
        priority: 'high',
        reasoning: `Your most popular track`,
      })
    }

    if (hasIG) {
      recs.push({
        id: 'ig_reels',
        title: 'Instagram Reels series',
        description: 'Post 3-5 Reels per week with BTS content',
        priority: 'medium',
        targetPlatform: 'Instagram',
        reasoning: `${snap.socials?.igFollowers} followers engaged`,
      })
    }

    return recs
  }

  if (loading && !snapshot) {
    return (
      <Card className="bg-black/80 border-2 border-green-400/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-green-400" />
          <span className="ml-2 font-mono text-green-400">LOADING_DATA...</span>
        </CardContent>
      </Card>
    )
  }

  if (!snapshot && !loading) {
    return (
      <Card className="bg-black/80 border-2 border-green-400/50">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            NO_DATA_SYNCED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-300/70 font-mono text-sm mb-4">
            Connect your profile to pull in streaming & social data
          </p>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-green-400 text-black hover:bg-green-300 font-mono"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                SYNCING...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                SYNC_NOW
              </>
            )}
          </Button>
          {error && (
            <p className="text-red-400 font-mono text-xs mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono font-bold text-green-400">
          INTELLIGENCE_CENTER
        </h2>
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
        >
          {syncing ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              SYNCING...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-2" />
              REFRESH_DATA
            </>
          )}
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Monthly Listeners */}
        {snapshot.spotify && (
          <Card className="bg-black/80 border border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400/70 font-mono">SPOTIFY</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {snapshot.spotify.followers?.toLocaleString() || '—'}
              </p>
              <p className="text-xs text-green-400/50 font-mono">Followers</p>
            </CardContent>
          </Card>
        )}

        {/* Top Country */}
        {snapshot.fans?.topCountries && snapshot.fans.topCountries.length > 0 && (
          <Card className="bg-black/80 border border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400/70 font-mono">TOP_COUNTRY</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {snapshot.fans.topCountries[0]}
              </p>
              <p className="text-xs text-green-400/50 font-mono">Most fans</p>
            </CardContent>
          </Card>
        )}

        {/* Instagram */}
        {snapshot.socials?.igFollowers && (
          <Card className="bg-black/80 border border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Instagram className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400/70 font-mono">INSTAGRAM</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {snapshot.socials.igFollowers.toLocaleString()}
              </p>
              <p className="text-xs text-green-400/50 font-mono">Followers</p>
            </CardContent>
          </Card>
        )}

        {/* TikTok */}
        {snapshot.socials?.tiktokFollowers && (
          <Card className="bg-black/80 border border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400/70 font-mono">TIKTOK</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {snapshot.socials.tiktokFollowers.toLocaleString()}
              </p>
              <p className="text-xs text-green-400/50 font-mono">Followers</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Campaign Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-black/80 border-2 border-pink-500/50">
          <CardHeader>
            <CardTitle className="text-pink-500 font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              CAMPAIGN_IDEAS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-green-400/30 rounded p-4 hover:bg-green-400/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-green-400 font-mono font-bold text-sm">
                    {rec.title}
                  </h4>
                  <Badge
                    className={`font-mono text-xs ${
                      rec.priority === 'high'
                        ? 'bg-pink-500 text-black'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-green-400/20 text-green-400'
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-green-300/70 text-xs font-mono mb-2">
                  {rec.description}
                </p>
                <p className="text-green-400/50 text-xs font-mono">
                  → {rec.reasoning}
                </p>
                {rec.estimatedReach && (
                  <p className="text-pink-500/70 text-xs font-mono mt-1">
                    Est. reach: {rec.estimatedReach.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Tracks */}
      {snapshot.spotify?.topTracks && snapshot.spotify.topTracks.length > 0 && (
        <Card className="bg-black/80 border border-green-400/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-sm">
              TOP_TRACKS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {snapshot.spotify.topTracks.slice(0, 5).map((track, idx) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-green-400/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-400/50 font-mono text-sm w-6">
                      #{idx + 1}
                    </span>
                    <span className="text-green-400 font-mono text-sm">
                      {track.name}
                    </span>
                  </div>
                  <Badge className="bg-green-400/20 text-green-400 font-mono text-xs">
                    {track.popularity}/100
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <p className="text-green-400/50 text-xs font-mono text-center">
        Last synced: {new Date(snapshot.fetchedAt).toLocaleString()}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded p-3">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
