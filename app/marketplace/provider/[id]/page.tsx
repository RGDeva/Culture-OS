'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Music,
  Video,
  Award,
  CheckCircle,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingWizard } from '@/components/marketplace/BookingWizard'

export default function ProviderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingWizard, setShowBookingWizard] = useState(false)

  useEffect(() => {
    fetchProvider()
  }, [params.id])

  const fetchProvider = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call
      // const response = await fetch(`/api/users/${params.id}`)
      // const data = await response.json()
      
      // Mock data for now
      const mockProvider = {
        id: params.id,
        displayName: 'DJ Premier Jr.',
        handle: '@djpremier',
        avatar: null,
        bio: 'Grammy-nominated producer specializing in boom-bap and trap. 15+ years experience. Credits include major label artists.',
        roles: ['producer', 'engineer', 'studio'],
        location: 'Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
        hourlyRate: 150,
        dayRate: 1000,
        servicesOffered: ['PRODUCTION', 'MIXING', 'MASTERING', 'STUDIO_RENTAL'],
        rating: 4.8,
        reviewCount: 127,
        verified: true,
        portfolioAssets: [],
        connectedPlatforms: {
          spotify: 'spotify:artist:123',
          apple: 'apple:artist:456',
          soundcloud: 'djpremier',
        },
        availabilityCalendar: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' },
        ],
        stats: {
          totalBookings: 340,
          completedProjects: 320,
          responseTime: '< 2 hours',
          repeatClients: 85,
        },
        reviews: [
          {
            id: '1',
            reviewer: { displayName: 'Travis Scott', avatar: null },
            rating: 5,
            comment: 'Incredible work ethic and sound quality. Delivered exactly what I needed.',
            createdAt: '2024-11-15',
          },
          {
            id: '2',
            reviewer: { displayName: 'Lil Baby', avatar: null },
            rating: 5,
            comment: 'Best engineer in LA. Period.',
            createdAt: '2024-10-22',
          },
        ],
      }
      
      setProvider(mockProvider)
    } catch (error) {
      console.error('Failed to fetch provider:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-mono dark:text-green-400 text-green-700">LOADING_PROVIDER...</p>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono dark:text-red-400 text-red-700 text-xl mb-4">PROVIDER_NOT_FOUND</p>
          <Button onClick={() => router.push('/marketplace')}>
            BACK_TO_MARKETPLACE
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black bg-white">
      {/* Hero Section */}
      <div className="border-b dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-4 dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 flex items-center justify-center">
                {provider.avatar ? (
                  <img src={provider.avatar} alt={provider.displayName} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-4xl font-mono dark:text-green-400 text-green-700">
                    {provider.displayName[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                      {provider.displayName}
                    </h1>
                    {provider.verified && (
                      <CheckCircle className="h-6 w-6 dark:text-green-400 text-green-600" />
                    )}
                  </div>
                  <p className="font-mono dark:text-green-400/60 text-green-700/70">
                    {provider.handle}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowBookingWizard(true)}
                    className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    BOOK_ME
                  </Button>
                  <Button
                    variant="outline"
                    className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    MESSAGE
                  </Button>
                </div>
              </div>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 dark:text-yellow-400 text-yellow-600 fill-current" />
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {provider.rating}
                  </span>
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    ({provider.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 dark:text-green-400 text-green-700" />
                  <span className="font-mono dark:text-green-400 text-green-700">
                    {provider.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 dark:text-green-400 text-green-700" />
                  <span className="font-mono dark:text-green-400 text-green-700">
                    ${provider.hourlyRate}/hr • ${provider.dayRate}/day
                  </span>
                </div>
              </div>

              {/* Roles */}
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.roles.map((role: string) => (
                  <span
                    key={role}
                    className="px-3 py-1 border dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-sm uppercase"
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="font-mono dark:text-green-400/80 text-green-700/80 leading-relaxed">
                {provider.bio}
              </p>

              {/* Connected Platforms */}
              {provider.connectedPlatforms && (
                <div className="flex gap-3 mt-4">
                  {provider.connectedPlatforms.spotify && (
                    <a
                      href={`https://open.spotify.com/artist/${provider.connectedPlatforms.spotify.split(':')[2]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 border dark:border-green-400/30 border-green-600/30 dark:text-green-400/70 text-green-700/70 hover:dark:border-green-400 hover:border-green-600 font-mono text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Spotify
                    </a>
                  )}
                  {provider.connectedPlatforms.soundcloud && (
                    <a
                      href={`https://soundcloud.com/${provider.connectedPlatforms.soundcloud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 border dark:border-green-400/30 border-green-600/30 dark:text-green-400/70 text-green-700/70 hover:dark:border-green-400 hover:border-green-600 font-mono text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      SoundCloud
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Services & Availability */}
          <div className="lg:col-span-1 space-y-6">
            {/* Services Offered */}
            <div className="border dark:border-green-400/20 border-green-600/20 p-6">
              <h2 className="font-mono dark:text-green-400 text-green-700 font-bold mb-4 flex items-center gap-2">
                <Music className="h-5 w-5" />
                &gt; SERVICES_OFFERED
              </h2>
              <div className="space-y-2">
                {provider.servicesOffered.map((service: string) => (
                  <div
                    key={service}
                    className="flex items-center gap-2 font-mono dark:text-green-400/80 text-green-700/80 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {service.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="border dark:border-green-400/20 border-green-600/20 p-6">
              <h2 className="font-mono dark:text-green-400 text-green-700 font-bold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                &gt; STATS
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    Total Bookings:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {provider.stats.totalBookings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    Completed:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {provider.stats.completedProjects}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    Response Time:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {provider.stats.responseTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                    Repeat Clients:
                  </span>
                  <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                    {provider.stats.repeatClients}%
                  </span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="border dark:border-green-400/20 border-green-600/20 p-6">
              <h2 className="font-mono dark:text-green-400 text-green-700 font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                &gt; AVAILABILITY
              </h2>
              <div className="space-y-2">
                {provider.availabilityCalendar.map((slot: any) => (
                  <div
                    key={slot.day}
                    className="flex justify-between font-mono dark:text-green-400/80 text-green-700/80 text-sm"
                  >
                    <span>{slot.day}:</span>
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Portfolio & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio */}
            <div className="border dark:border-green-400/20 border-green-600/20 p-6">
              <h2 className="font-mono dark:text-green-400 text-green-700 font-bold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                &gt; PORTFOLIO
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.portfolioAssets.length === 0 ? (
                  <p className="font-mono dark:text-green-400/60 text-green-700/70 text-sm col-span-2">
                    No portfolio items yet
                  </p>
                ) : (
                  provider.portfolioAssets.map((asset: any) => (
                    <div
                      key={asset.id}
                      className="border dark:border-green-400/20 border-green-600/20 p-4 hover:dark:border-green-400 hover:border-green-600 cursor-pointer transition-all"
                    >
                      <h3 className="font-mono dark:text-green-400 text-green-700 font-bold mb-2">
                        {asset.title}
                      </h3>
                      <p className="font-mono dark:text-green-400/60 text-green-700/70 text-sm">
                        {asset.type}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="border dark:border-green-400/20 border-green-600/20 p-6">
              <h2 className="font-mono dark:text-green-400 text-green-700 font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                &gt; REVIEWS ({provider.reviewCount})
              </h2>
              <div className="space-y-4">
                {provider.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="border-b dark:border-green-400/10 border-green-600/10 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border dark:border-green-400/50 border-green-600/50 dark:bg-green-400/10 bg-green-600/10 flex items-center justify-center">
                          <span className="font-mono dark:text-green-400 text-green-700">
                            {review.reviewer.displayName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-mono dark:text-green-400 text-green-700 font-bold">
                            {review.reviewer.displayName}
                          </p>
                          <p className="font-mono dark:text-green-400/60 text-green-700/70 text-xs">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'dark:text-yellow-400 text-yellow-600 fill-current'
                                : 'dark:text-green-400/20 text-green-700/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-mono dark:text-green-400/80 text-green-700/80 text-sm">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {showBookingWizard && (
        <BookingWizard
          provider={provider}
          onClose={() => setShowBookingWizard(false)}
          onComplete={(booking) => {
            console.log('Booking created:', booking)
            setShowBookingWizard(false)
            router.push(`/bookings/${booking.id}`)
          }}
        />
      )}
    </div>
  )
}
