'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function TestRecoupPage() {
  const privyHook = usePrivy()
  const { authenticated, user, login } = privyHook || {}
  const [snapshot, setSnapshot] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSnapshot = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recoup/snapshot?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setSnapshot(data.snapshot)
      } else {
        setError(data.error || 'Failed to fetch snapshot')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated && user?.id) {
      fetchSnapshot()
    }
  }, [authenticated, user?.id])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl mb-4">&gt; RECOUP_TEST_PAGE</h1>
          <p className="text-green-400/60 mb-6">Login to view your Recoupable snapshot</p>
          <Button
            onClick={() => login && login()}
            className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
          >
            LOGIN
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">&gt; RECOUP_DATA_TEST</h1>
            <p className="text-green-400/60">View your synced Recoupable snapshot</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchSnapshot}
              disabled={loading}
              className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono font-bold"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              REFRESH
            </Button>
            <Link href="/">
              <Button variant="outline" className="border-green-400 text-green-400 font-mono">
                <ArrowLeft className="mr-2 h-4 w-4" /> HOME
              </Button>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 border-2 border-red-400 bg-red-400/10 text-red-400 mb-6">
            {error}
            {error.includes('No data synced yet') && (
              <div className="mt-4">
                <Link href="/onboarding">
                  <Button className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold">
                    GO_TO_ONBOARDING
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 border-2 border-green-400/20">
            <div className="animate-pulse">LOADING_SNAPSHOT...</div>
          </div>
        )}

        {/* Snapshot Data */}
        {snapshot && !loading && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-xl mb-4">&gt; OVERVIEW</h2>
              <div className="space-y-2 text-sm">
                <div><span className="text-green-400/60">User ID:</span> {snapshot.userId}</div>
                <div><span className="text-green-400/60">Artist Account ID:</span> {snapshot.artistAccountId}</div>
                <div><span className="text-green-400/60">Fetched At:</span> {new Date(snapshot.fetchedAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Spotify */}
            {snapshot.spotify && (
              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl mb-4">&gt; SPOTIFY_DATA</h2>
                <div className="space-y-2 text-sm">
                  <div><span className="text-green-400/60">Artist Name:</span> {snapshot.spotify.artistName}</div>
                  <div><span className="text-green-400/60">Artist ID:</span> {snapshot.spotify.artistId}</div>
                  <div><span className="text-green-400/60">Followers:</span> {snapshot.spotify.followers?.toLocaleString()}</div>
                  {snapshot.spotify.topTracks && snapshot.spotify.topTracks.length > 0 && (
                    <div>
                      <div className="text-green-400/60 mb-2">Top Tracks:</div>
                      <ul className="space-y-1 ml-4">
                        {snapshot.spotify.topTracks.map((track: any) => (
                          <li key={track.id}>
                            {track.name} <span className="text-green-400/60">({track.popularity}/100)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Socials */}
            {snapshot.socials && (
              <div className="border-2 border-pink-400 p-6">
                <h2 className="text-xl mb-4 text-pink-400">&gt; SOCIAL_METRICS</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {snapshot.socials.igFollowers && (
                    <div>
                      <span className="text-pink-400/60">Instagram:</span> {snapshot.socials.igFollowers.toLocaleString()}
                    </div>
                  )}
                  {snapshot.socials.tiktokFollowers && (
                    <div>
                      <span className="text-pink-400/60">TikTok:</span> {snapshot.socials.tiktokFollowers.toLocaleString()}
                    </div>
                  )}
                  {snapshot.socials.xFollowers && (
                    <div>
                      <span className="text-pink-400/60">X (Twitter):</span> {snapshot.socials.xFollowers.toLocaleString()}
                    </div>
                  )}
                  {snapshot.socials.youtubeSubscribers && (
                    <div>
                      <span className="text-pink-400/60">YouTube:</span> {snapshot.socials.youtubeSubscribers.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fans */}
            {snapshot.fans && (
              <div className="border-2 border-cyan-400 p-6">
                <h2 className="text-xl mb-4 text-cyan-400">&gt; FAN_DATA</h2>
                <div className="space-y-2 text-sm">
                  <div><span className="text-cyan-400/60">Total Fans:</span> {snapshot.fans.totalFans?.toLocaleString()}</div>
                  {snapshot.fans.topCountries && snapshot.fans.topCountries.length > 0 && (
                    <div>
                      <div className="text-cyan-400/60 mb-2">Top Countries:</div>
                      <div className="flex flex-wrap gap-2">
                        {snapshot.fans.topCountries.map((country: string, i: number) => (
                          <span key={i} className="px-2 py-1 border border-cyan-400/30 text-cyan-400/80">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Segments */}
            {snapshot.segments && snapshot.segments.length > 0 && (
              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl mb-4">&gt; FAN_SEGMENTS</h2>
                <div className="space-y-3">
                  {snapshot.segments.map((segment: any, i: number) => (
                    <div key={i} className="p-3 border border-green-400/30">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{segment.segmentName}</span>
                        <span className="text-green-400/60">{segment.size} fans</span>
                      </div>
                      {segment.description && (
                        <div className="text-xs text-green-400/60 mt-1">{segment.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {snapshot.posts && snapshot.posts.length > 0 && (
              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl mb-4">&gt; RECENT_POSTS</h2>
                <div className="text-green-400/60 text-sm mb-2">
                  {snapshot.posts.length} posts tracked
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="border-2 border-green-400/30 p-6">
              <summary className="cursor-pointer font-bold text-cyan-400 mb-4">&gt; RAW_JSON_DATA</summary>
              <pre className="text-xs overflow-auto p-4 bg-black/50 border border-green-400/20">
                {JSON.stringify(snapshot, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
