'use client'

import { useState, useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  Music2, 
  Users, 
  MapPin, 
  Link as LinkIcon,
  Edit2,
  ExternalLink,
  Plus,
  X,
  ShoppingBag,
  DollarSign,
  Eye,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/profile'

export default function ProfileViewPage() {
  const { user, authenticated } = usePrivy()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [showMusoSearch, setShowMusoSearch] = useState(false)
  const [musoSearchQuery, setMusoSearchQuery] = useState('')
  const [musoSearchResults, setMusoSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [servicesForSale, setServicesForSale] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  // Get userId from URL params or use current user
  const viewingUserId = searchParams?.get('userId') || user?.id

  useEffect(() => {
    if (authenticated && viewingUserId) {
      loadProfile()
      loadServicesForSale()
      setIsOwnProfile(viewingUserId === user?.id)
    }
  }, [authenticated, viewingUserId, user?.id])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profile?userId=${viewingUserId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadServicesForSale = async () => {
    try {
      setLoadingServices(true)
      // Fetch marketplace listings
      const listingsRes = await fetch(`/api/marketplace/listings?userId=${viewingUserId}`).catch(() => null)
      // Fetch vault assets for sale
      const vaultRes = await fetch(`/api/vault/assets?ownerId=${viewingUserId}&status=FOR_SALE`).catch(() => null)
      
      let services: any[] = []
      
      if (listingsRes && listingsRes.ok) {
        const data = await listingsRes.json()
        if (data.listings) {
          services = [...services, ...data.listings.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type || 'BEAT',
            price: item.price || 0,
            views: item.views || 0,
            sales: item.sales || 0,
            description: item.description,
            imageUrl: item.imageUrl
          }))]
        }
      }
      
      if (vaultRes && vaultRes.ok) {
        const data = await vaultRes.json()
        if (data.assets) {
          services = [...services, ...data.assets.map((asset: any) => ({
            id: asset.id,
            title: asset.title,
            type: asset.assetType || 'BEAT',
            price: asset.price || 0,
            views: asset.plays || 0,
            sales: 0,
            description: asset.description,
            imageUrl: asset.coverArt
          }))]
        }
      }
      
      setServicesForSale(services)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoadingServices(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return

    setUploading(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user?.id || '')

      // Upload to API
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        // Update profile with new image
        await fetch(`/api/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            profileImage: imageUrl,
          }),
        })
        // Reload profile
        loadProfile()
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleMusoSearch = async () => {
    if (!musoSearchQuery.trim()) return
    
    setSearching(true)
    try {
      // TODO: Implement real Muso AI API search
      // For now, mock results
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMusoSearchResults([
        {
          id: '1',
          title: musoSearchQuery,
          artist: 'Various Artists',
          role: 'Producer',
          verified: true,
        },
        {
          id: '2',
          title: `${musoSearchQuery} (Remix)`,
          artist: 'Another Artist',
          role: 'Co-Writer',
          verified: false,
        },
      ])
    } catch (error) {
      console.error('Muso search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddMusoCredit = async (credit: any) => {
    try {
      await fetch(`/api/profile/muso-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          credit,
        }),
      })
      loadProfile()
      setShowMusoSearch(false)
      setMusoSearchQuery('')
      setMusoSearchResults([])
    } catch (error) {
      console.error('Error adding Muso credit:', error)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-mono dark:text-green-400 text-green-700 mb-4">
            LOGIN_REQUIRED
          </h1>
          <Button onClick={() => router.push('/')}>
            GO_HOME
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center">
        <div className="text-xl font-mono dark:text-green-400 text-green-700 animate-pulse">
          LOADING_PROFILE...
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-mono dark:text-green-400 text-green-700 mb-4">
            PROFILE_NOT_FOUND
          </h1>
          <Button onClick={() => router.push('/')}>
            GO_HOME
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black bg-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="dark:border-green-400 border-green-600 dark:text-green-400 text-green-700 font-mono"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK
          </Button>
          {isOwnProfile && (
            <Button
              onClick={() => router.push('/profile/setup')}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
            >
              <Edit2 className="mr-2 h-4 w-4" /> EDIT_PROFILE
            </Button>
          )}
        </div>

        {/* Profile Header */}
        <div className="border-2 dark:border-green-400/30 border-green-600/40 p-8 dark:bg-black/50 bg-white/80 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 border-2 dark:border-green-400 border-green-600 overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full dark:bg-green-400/10 bg-green-600/10 flex items-center justify-center">
                    <Users className="h-16 w-16 dark:text-green-400/50 text-green-700/50" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-500"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                {profile.displayName}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                  @{profile.username || profile.displayName.toLowerCase().replace(/\s+/g, '_')}
                </span>
                <span className="px-3 py-1 text-xs font-mono dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border dark:border-green-400/30 border-green-600/40">
                  {profile.primaryRole}
                </span>
              </div>
              {profile.bio && (
                <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-4">
                  {profile.bio}
                </p>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm font-mono dark:text-green-400/60 text-green-700/60">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="mb-4">
                <div className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                  {profile.xp || 0}
                </div>
                <div className="text-xs font-mono dark:text-green-400/60 text-green-700/60">
                  XP
                </div>
              </div>
              <div className="mb-4">
                <div className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
                  {profile.profileCompletion}%
                </div>
                <div className="text-xs font-mono dark:text-green-400/60 text-green-700/60">
                  COMPLETE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80 mb-6">
          <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
            &gt; CONNECTED_PLATFORMS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.spotifyUrl && (
              <a
                href={profile.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30 hover:dark:border-green-400 hover:border-green-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Music2 className="h-5 w-5 dark:text-green-400 text-green-700" />
                  <span className="text-sm font-mono dark:text-green-400 text-green-700">Spotify</span>
                </div>
                <ExternalLink className="h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              </a>
            )}
            {profile.appleMusicUrl && (
              <a
                href={profile.appleMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30 hover:dark:border-green-400 hover:border-green-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Music2 className="h-5 w-5 dark:text-green-400 text-green-700" />
                  <span className="text-sm font-mono dark:text-green-400 text-green-700">Apple Music</span>
                </div>
                <ExternalLink className="h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              </a>
            )}
            {profile.soundcloudUrl && (
              <a
                href={profile.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30 hover:dark:border-green-400 hover:border-green-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Music2 className="h-5 w-5 dark:text-green-400 text-green-700" />
                  <span className="text-sm font-mono dark:text-green-400 text-green-700">SoundCloud</span>
                </div>
                <ExternalLink className="h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              </a>
            )}
          </div>
        </div>

        {/* Services For Sale */}
        <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 dark:text-green-400 text-green-700" />
              <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                &gt; SERVICES_FOR_SALE
              </h3>
            </div>
            {isOwnProfile && (
              <Button
                onClick={() => router.push('/marketplace/upload')}
                size="sm"
                className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
              >
                <Plus className="h-4 w-4 mr-2" />
                ADD_LISTING
              </Button>
            )}
          </div>

          {loadingServices ? (
            <div className="text-center py-8 text-sm font-mono dark:text-green-400/50 text-green-700/60 animate-pulse">
              LOADING_SERVICES...
            </div>
          ) : servicesForSale.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicesForSale.map((service) => (
                <div
                  key={service.id}
                  className="p-4 border dark:border-green-400/20 border-green-600/30 hover:dark:border-green-400 hover:border-green-600 transition-all cursor-pointer"
                  onClick={() => router.push(`/marketplace/play/${service.id}`)}
                >
                  <div className="flex items-start gap-3">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-16 h-16 object-cover border dark:border-green-400/30 border-green-600/40"
                      />
                    ) : (
                      <div className="w-16 h-16 border dark:border-green-400/30 border-green-600/40 dark:bg-green-400/5 bg-green-600/5 flex items-center justify-center">
                        <Package className="h-8 w-8 dark:text-green-400/50 text-green-700/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                          {service.title}
                        </span>
                        <span className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                          {service.type}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {service.views}
                          </span>
                          {service.sales > 0 && (
                            <span>{service.sales} sales</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-lg font-mono font-bold dark:text-yellow-400 text-yellow-600">
                          <DollarSign className="h-4 w-4" />
                          {service.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm font-mono dark:text-green-400/50 text-green-700/60">
              {isOwnProfile ? 'No services listed yet. Start selling your beats and services.' : 'No services available for sale.'}
            </div>
          )}
        </div>

        {/* Muso AI Credits */}
        <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
              &gt; MUSO_AI_CREDITS
            </h3>
            {isOwnProfile && (
              <Button
                onClick={() => setShowMusoSearch(true)}
                size="sm"
                className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
              >
                <Plus className="h-4 w-4 mr-2" />
                ADD_CREDIT
              </Button>
            )}
          </div>

          {profile.musoCredits && profile.musoCredits.length > 0 ? (
            <div className="space-y-3">
              {profile.musoCredits.map((credit: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 border dark:border-green-400/20 border-green-600/30"
                >
                  <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                    {credit.title}
                  </div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mt-1">
                    {credit.artist} • {credit.role}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm font-mono dark:text-green-400/50 text-green-700/60">
              No Muso AI credits added yet
            </div>
          )}
        </div>

        {/* Muso Search Modal */}
        {showMusoSearch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
            <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
                  &gt; SEARCH_MUSO_AI
                </h3>
                <button
                  onClick={() => {
                    setShowMusoSearch(false)
                    setMusoSearchQuery('')
                    setMusoSearchResults([])
                  }}
                  className="dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={musoSearchQuery}
                  onChange={(e) => setMusoSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMusoSearch()}
                  placeholder="Search for your credits..."
                  className="flex-1 px-4 py-2 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
                <Button
                  onClick={handleMusoSearch}
                  disabled={searching || !musoSearchQuery.trim()}
                  className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
                >
                  {searching ? 'SEARCHING...' : 'SEARCH'}
                </Button>
              </div>

              {musoSearchResults.length > 0 && (
                <div className="space-y-2">
                  {musoSearchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleAddMusoCredit(result)}
                      className="w-full p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-colors text-left"
                    >
                      <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                        {result.title}
                      </div>
                      <div className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mt-1">
                        {result.artist} • {result.role}
                        {result.verified && (
                          <span className="ml-2 px-2 py-0.5 dark:bg-cyan-400/20 bg-cyan-600/20 dark:text-cyan-400 text-cyan-700 border dark:border-cyan-400/30 border-cyan-600/40">
                            VERIFIED
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
