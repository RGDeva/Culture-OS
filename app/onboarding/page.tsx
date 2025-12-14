'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProfileRole = 'Artist' | 'Producer' | 'Engineer' | 'Studio' | 'Manager' | 'Label'

type ProfileData = {
  roles: ProfileRole[]
  spotifyArtistUrl: string
  appleMusicUrl: string
  soundcloudUrl: string
  audiusUrl: string
  instagramUrl: string
  tiktokUrl: string
  xUrl: string
  recoupableAccountId: string
}

export default function OnboardingPage() {
  const privyHook = usePrivy()
  const { ready, authenticated, user } = privyHook || {}
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    roles: [],
    spotifyArtistUrl: '',
    appleMusicUrl: '',
    soundcloudUrl: '',
    audiusUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    xUrl: '',
    recoupableAccountId: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [ready, authenticated, router])

  const toggleRole = (role: ProfileRole) => {
    setProfile(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!user?.id) return
    
    if (profile.roles.length === 0) {
      setError('Please select at least one role')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      // Save profile to API
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...profile
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Trigger data ingestion in background (fire-and-forget)
      setSyncing(true)
      
      // Ingest streaming data
      if (profile.spotifyArtistUrl || profile.appleMusicUrl || profile.soundcloudUrl) {
        fetch('/api/profile/ingest/streaming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            spotifyUrl: profile.spotifyArtistUrl,
            appleMusicUrl: profile.appleMusicUrl,
            soundcloudUrl: profile.soundcloudUrl
          })
        }).catch(err => console.warn('Streaming ingest failed:', err))
      }

      // Ingest Recoupable data
      if (profile.recoupableAccountId) {
        fetch('/api/profile/ingest/recoupable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            recoupableAccountId: profile.recoupableAccountId
          })
        }).catch(err => console.warn('Recoupable ingest failed:', err))
      }

      // Redirect to homepage
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      setIsSubmitting(false)
    }
  }

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-400 font-mono animate-pulse">INITIALIZING...</div>
      </div>
    )
  }

  const roles: ProfileRole[] = ['Artist', 'Producer', 'Engineer', 'Studio', 'Manager', 'Label']

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">&gt; PROFILE_SETUP</h1>
          <p className="text-green-400/60">Step {step} of 2</p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-green-400/20 mb-8">
          <div 
            className="h-full bg-green-400 transition-all duration-300" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Step 1: Roles */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-4">SELECT_YOUR_ROLES</h2>
              <p className="text-green-400/60 mb-6">Choose all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`p-4 border-2 transition-all uppercase font-bold ${
                      profile.roles.includes(role)
                        ? 'bg-green-400 text-black border-green-400'
                        : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                    }`}
                  >
                    {profile.roles.includes(role) && <CheckCircle className="inline mr-2 h-4 w-4" />}
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 border-2 border-red-400 bg-red-400/10 text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (profile.roles.length === 0) {
                    setError('Please select at least one role')
                  } else {
                    setError(null)
                    setStep(2)
                  }
                }}
                className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
              >
                NEXT <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Links */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-4">CONNECT_YOUR_PLATFORMS</h2>
              <p className="text-green-400/60 mb-6">Optional - Link your profiles for data ingestion</p>
              
              <div className="space-y-4">
                {/* Streaming */}
                <div>
                  <label className="block mb-2 text-sm">SPOTIFY_ARTIST_URL</label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    value={profile.spotifyArtistUrl}
                    onChange={(e) => updateField('spotifyArtistUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">APPLE_MUSIC_URL</label>
                  <input
                    type="url"
                    placeholder="https://music.apple.com/artist/..."
                    value={profile.appleMusicUrl}
                    onChange={(e) => updateField('appleMusicUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">SOUNDCLOUD_URL</label>
                  <input
                    type="url"
                    placeholder="https://soundcloud.com/..."
                    value={profile.soundcloudUrl}
                    onChange={(e) => updateField('soundcloudUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">AUDIUS_URL</label>
                  <input
                    type="url"
                    placeholder="https://audius.co/..."
                    value={profile.audiusUrl}
                    onChange={(e) => updateField('audiusUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                {/* Social */}
                <div className="border-t-2 border-green-400/20 pt-4 mt-6">
                  <label className="block mb-2 text-sm">INSTAGRAM_URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={profile.instagramUrl}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">TIKTOK_URL</label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@..."
                    value={profile.tiktokUrl}
                    onChange={(e) => updateField('tiktokUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">X_URL (Twitter)</label>
                  <input
                    type="url"
                    placeholder="https://x.com/..."
                    value={profile.xUrl}
                    onChange={(e) => updateField('xUrl', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>

                {/* Recoupable */}
                <div className="border-t-2 border-green-400/20 pt-4 mt-6">
                  <label className="block mb-2 text-sm">RECOUPABLE_ACCOUNT_ID</label>
                  <input
                    type="text"
                    placeholder="Your Recoupable account ID"
                    value={profile.recoupableAccountId}
                    onChange={(e) => updateField('recoupableAccountId', e.target.value)}
                    className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {syncing && (
              <div className="p-4 border-2 border-cyan-400 bg-cyan-400/10 text-cyan-400 flex items-center">
                <div className="animate-spin mr-3 h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                Syncing your data...
              </div>
            )}

            {error && (
              <div className="p-4 border-2 border-red-400 bg-red-400/10 text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
              >
                {isSubmitting ? 'SAVING...' : 'COMPLETE_SETUP'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
