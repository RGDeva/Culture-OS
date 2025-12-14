'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Music, Link as LinkIcon, Briefcase, Check, Search } from 'lucide-react'
import Link from 'next/link'
import { UserRole, Capabilities } from '@/types/profile'
import { PlatformConnector } from '@/components/profile/PlatformConnector'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'ARTIST', label: 'Artist' },
  { value: 'PRODUCER', label: 'Producer' },
  { value: 'ENGINEER', label: 'Engineer' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'MODEL', label: 'Model' },
  { value: 'VISUAL_MEDIA', label: 'Visual Media' },
  { value: 'INFLUENCER', label: 'Influencer' },
  { value: 'OTHER', label: 'Other' }
]

const GENRES = [
  'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical',
  'Country', 'Latin', 'Indie', 'Alternative', 'Metal', 'Reggae', 'Blues'
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, authenticated, ready } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [locationCity, setLocationCity] = useState('')
  const [locationState, setLocationState] = useState('')
  const [locationCountry, setLocationCountry] = useState('')
  const [bio, setBio] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  
  // Studio association
  const [studioAssociation, setStudioAssociation] = useState('')
  const [studioSuggestion, setStudioSuggestion] = useState('')
  
  // Platform links
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [appleMusicUrl, setAppleMusicUrl] = useState('')
  const [soundcloudUrl, setSoundcloudUrl] = useState('')
  const [audiomackUrl, setAudiomackUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  
  // Social links
  const [instagramUrl, setInstagramUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [xUrl, setXUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  
  // Capabilities
  const [capabilities, setCapabilities] = useState<Capabilities>({
    sellsAssets: false,
    sellsServices: false,
    postsBounties: false,
    offersStudioSessions: false
  })

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [ready, authenticated, router])

  useEffect(() => {
    // Load existing profile if available
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profile?userId=${user?.id}`)
      if (response.ok) {
        const profile = await response.json()
        if (profile.displayName) {
          setDisplayName(profile.displayName)
          setSelectedRoles(profile.roles || [])
          setSelectedGenres(profile.genres || [])
          setLocationCity(profile.locationCity || '')
          setLocationCountry(profile.locationCountry || '')
          setSpotifyUrl(profile.spotifyUrl || '')
          setAppleMusicUrl(profile.appleMusicUrl || '')
          setSoundcloudUrl(profile.soundcloudUrl || '')
          setYoutubeUrl(profile.youtubeUrl || '')
          setInstagramUrl(profile.instagramUrl || '')
          setTiktokUrl(profile.tiktokUrl || '')
          setXUrl(profile.xUrl || '')
          setWebsiteUrl(profile.websiteUrl || '')
          setCapabilities(profile.capabilities || capabilities)
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const handleSave = async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    if (selectedRoles.length === 0) {
      setError('Please select at least one role')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          displayName,
          handle,
          roles: selectedRoles,
          genres: selectedGenres,
          locationCity,
          locationState,
          locationCountry,
          bio,
          lookingFor,
          studioAssociation,
          studioSuggestion,
          spotifyUrl,
          appleMusicUrl,
          soundcloudUrl,
          audiomackUrl,
          youtubeUrl,
          instagramUrl,
          tiktokUrl,
          xUrl,
          websiteUrl,
          capabilities
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      const data = await response.json()
      console.log('[PROFILE_SETUP] Profile saved:', data.profile)

      // Redirect to intelligence center
      router.push('/')
    } catch (err) {
      console.error('[PROFILE_SETUP] Error:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="animate-pulse">LOADING...</div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'IDENTITY', icon: User },
    { number: 2, title: 'PLATFORMS', icon: Music },
    { number: 3, title: 'CONNECT', icon: Search },
    { number: 4, title: 'SOCIAL', icon: LinkIcon },
    { number: 5, title: 'CAPABILITIES', icon: Briefcase }
  ]

  return (
    <div className="min-h-screen font-mono p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-green-400 text-gray-900">&gt; PROFILE_SETUP</h1>
            <p className="dark:text-green-400/60 text-gray-600">Complete your profile to unlock full intelligence</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" /> SKIP
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 transition-all ${
                    isActive
                      ? 'bg-green-400 text-black border-green-400'
                      : isCompleted
                      ? 'dark:bg-green-400/20 bg-green-100 dark:text-green-400 text-green-700 border-green-400'
                      : 'dark:bg-black bg-white dark:text-green-400/50 text-gray-400 dark:border-green-400/30 border-gray-300'
                  }`}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-xs font-bold">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-green-400' : 'bg-green-400/20'}`} />
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-red-400 bg-red-400/10 text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <div className="border-2 border-green-400/30 p-6 mb-6">
            <h2 className="text-xl mb-6">&gt; IDENTITY</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-green-400/70">DISPLAY_NAME *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your artist/producer name"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">HANDLE (optional)</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">ROLES * (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(role => (
                    <button
                      key={role.value}
                      onClick={() => toggleRole(role.value)}
                      className={`px-4 py-2 border-2 text-sm transition-all ${
                        selectedRoles.includes(role.value)
                          ? 'bg-green-400 text-black border-green-400'
                          : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                      }`}>
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">GENRES (select up to 3)</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      disabled={selectedGenres.length >= 3 && !selectedGenres.includes(genre)}
                      className={`px-3 py-1 border text-xs transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-cyan-400 text-black border-cyan-400'
                          : 'bg-black text-cyan-400 border-cyan-400/30 hover:border-cyan-400 disabled:opacity-30'
                      }`}>
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">CITY</label>
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">STATE</label>
                  <input
                    type="text"
                    value={locationState}
                    onChange={(e) => setLocationState(e.target.value)}
                    placeholder="CA"
                    className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">COUNTRY</label>
                  <input
                    type="text"
                    value={locationCountry}
                    onChange={(e) => setLocationCountry(e.target.value)}
                    placeholder="USA"
                    className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">BIO</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">WHAT_I'M_LOOKING_FOR</label>
                <textarea
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="Collaborators, opportunities, etc..."
                  rows={2}
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">STUDIO_ASSOCIATION</label>
                <select
                  value={studioAssociation}
                  onChange={(e) => setStudioAssociation(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a studio or Independent</option>
                  <option value="independent">Independent</option>
                  <option value="suggest">Suggest a new studio</option>
                </select>
              </div>

              {studioAssociation === 'suggest' && (
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">SUGGEST_STUDIO_NAME</label>
                  <input
                    type="text"
                    value={studioSuggestion}
                    onChange={(e) => setStudioSuggestion(e.target.value)}
                    placeholder="Studio name"
                    className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!displayName || selectedRoles.length === 0}
                className="bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold">
                NEXT_STEP →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Platform Links */}
        {currentStep === 2 && (
          <div className="border-2 border-green-400/30 p-6 mb-6">
            <h2 className="text-xl mb-6">&gt; PLATFORM_LINKS</h2>
            <p className="text-sm text-green-400/60 mb-6">
              Connect your music platforms to enable analytics and intelligence
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-green-400/70">SPOTIFY_ARTIST_URL</label>
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">APPLE_MUSIC_URL</label>
                <input
                  type="url"
                  value={appleMusicUrl}
                  onChange={(e) => setAppleMusicUrl(e.target.value)}
                  placeholder="https://music.apple.com/artist/..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">SOUNDCLOUD_URL</label>
                <input
                  type="url"
                  value={soundcloudUrl}
                  onChange={(e) => setSoundcloudUrl(e.target.value)}
                  placeholder="https://soundcloud.com/..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">AUDIOMACK_URL</label>
                <input
                  type="url"
                  value={audiomackUrl}
                  onChange={(e) => setAudiomackUrl(e.target.value)}
                  placeholder="https://audiomack.com/..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">YOUTUBE_URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono">
                ← BACK
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold">
                NEXT_STEP →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Connect & Import */}
        {currentStep === 3 && (
          <div className="mb-6">
            <PlatformConnector />
            
            <div className="mt-6 flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono">
                ← BACK
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold">
                NEXT_STEP →
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Social Links */}
        {currentStep === 4 && (
          <div className="border-2 border-green-400/30 p-6 mb-6">
            <h2 className="text-xl mb-6">&gt; SOCIAL_LINKS</h2>
            <p className="text-sm text-green-400/60 mb-6">
              Connect your social profiles to expand your network reach
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-green-400/70">INSTAGRAM_URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">TIKTOK_URL</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">X_URL (Twitter)</label>
                <input
                  type="url"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">WEBSITE_URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="outline"
                className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono">
                ← BACK
              </Button>
              <Button
                onClick={() => setCurrentStep(5)}
                className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold">
                NEXT_STEP →
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Capabilities */}
        {currentStep === 5 && (
          <div className="border-2 border-green-400/30 p-6 mb-6">
            <h2 className="text-xl mb-6">&gt; CAPABILITIES</h2>
            <p className="text-sm text-green-400/60 mb-6">
              Tell us what you offer on NoCulture OS
            </p>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border-2 border-green-400/30 hover:border-green-400 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={capabilities.sellsAssets}
                  onChange={(e) => setCapabilities({ ...capabilities, sellsAssets: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">I sell beats / kits / samples</div>
                  <div className="text-xs text-green-400/60">List your assets in the Marketplace</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-green-400/30 hover:border-green-400 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={capabilities.sellsServices}
                  onChange={(e) => setCapabilities({ ...capabilities, sellsServices: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">I offer services (mix/master, coaching, etc.)</div>
                  <div className="text-xs text-green-400/60">Provide professional services</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-green-400/30 hover:border-green-400 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={capabilities.postsBounties}
                  onChange={(e) => setCapabilities({ ...capabilities, postsBounties: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">I post bounties / open collabs</div>
                  <div className="text-xs text-green-400/60">Collaborate with other creators</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-green-400/30 hover:border-green-400 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={capabilities.offersStudioSessions}
                  onChange={(e) => setCapabilities({ ...capabilities, offersStudioSessions: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">I run a studio / offer studio sessions</div>
                  <div className="text-xs text-green-400/60">Rent out your studio space</div>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                onClick={() => setCurrentStep(4)}
                variant="outline"
                className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono">
                ← BACK
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold">
                {loading ? 'SAVING...' : 'COMPLETE_SETUP ✓'}
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="border-2 border-cyan-400/30 p-6 bg-cyan-400/5">
          <h3 className="text-cyan-400 mb-2">&gt; WHY_COMPLETE_YOUR_PROFILE?</h3>
          <ul className="space-y-2 text-sm text-green-400/80">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>Unlock intelligence insights from your music platforms</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>Get discovered by other creators in the network</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>Access personalized campaign recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>Track your NoCulture OS earnings in one place</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
