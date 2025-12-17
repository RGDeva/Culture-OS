'use client'

import { useEffect, useState } from 'react'
import { Music, DollarSign, TrendingUp, Wallet, ShoppingBag, Package, Eye, ExternalLink, Settings, Share2, Copy, Twitter, Facebook, Linkedin, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface EnhancedStorefrontProps {
  userId: string
}

interface ListedService {
  id: string
  title: string
  type: 'BEAT' | 'PACK' | 'SERVICE' | 'STEM'
  price: number
  views: number
  sales: number
  revenue: number
  status: 'ACTIVE' | 'DRAFT' | 'SOLD_OUT'
}

interface PlatformSales {
  platform: string
  sales: number
  revenue: number
  icon?: string
}

export function EnhancedStorefront({ userId }: EnhancedStorefrontProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listedServices, setListedServices] = useState<ListedService[]>([])
  const [platformSales, setPlatformSales] = useState<PlatformSales[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    fetchStorefrontData()
  }, [userId])

  const getShareUrl = (serviceId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/marketplace/play/${serviceId}`
  }

  const handleShare = (service: ListedService, platform: string) => {
    const shareUrl = getShareUrl(service.id)
    const text = `Check out "${service.title}" on NoCulture OS - $${service.price.toFixed(2)}`
    
    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        setShowShareMenu(null)
        return
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
      setShowShareMenu(null)
    }
  }

  const fetchStorefrontData = async () => {
    try {
      setLoading(true)

      // Fetch marketplace listings
      const listingsRes = await fetch(`/api/marketplace/listings?userId=${userId}`).catch(() => null)
      
      // Fetch vault assets (beats/stems for sale)
      const vaultRes = await fetch(`/api/vault/assets?ownerId=${userId}&status=FOR_SALE`).catch(() => null)
      
      // Fetch balances
      const balancesRes = await fetch(`/api/balances/me?userId=${userId}`).catch(() => null)
      
      // Fetch works/catalog
      const worksRes = await fetch(`/api/works?userId=${userId}`).catch(() => null)

      let listings: ListedService[] = []
      let totalRev = 0
      let totalSalesCount = 0
      let platforms: PlatformSales[] = []

      // Process marketplace listings
      if (listingsRes && listingsRes.ok) {
        const data = await listingsRes.json()
        if (data.listings) {
          listings = data.listings.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type || 'BEAT',
            price: item.price || 0,
            views: item.views || 0,
            sales: item.sales || 0,
            revenue: (item.sales || 0) * (item.price || 0),
            status: item.status || 'ACTIVE'
          }))
        }
      }

      // Process vault assets
      if (vaultRes && vaultRes.ok) {
        const data = await vaultRes.json()
        if (data.assets) {
          const vaultListings = data.assets.map((asset: any) => ({
            id: asset.id,
            title: asset.title,
            type: asset.assetType || 'BEAT',
            price: asset.price || 0,
            views: asset.plays || 0,
            sales: 0,
            revenue: 0,
            status: 'ACTIVE' as const
          }))
          listings = [...listings, ...vaultListings]
        }
      }

      // Process works for platform sales
      if (worksRes && worksRes.ok) {
        const data = await worksRes.json()
        if (data.works) {
          const platformMap = new Map<string, { sales: number; revenue: number }>()
          
          data.works.forEach((work: any) => {
            if (work.earnings) {
              work.earnings.forEach((earning: any) => {
                const platform = earning.platform || 'NoCulture OS'
                const current = platformMap.get(platform) || { sales: 0, revenue: 0 }
                platformMap.set(platform, {
                  sales: current.sales + 1,
                  revenue: current.revenue + (earning.amountCents || 0)
                })
              })
            }
          })

          platforms = Array.from(platformMap.entries()).map(([platform, data]) => ({
            platform,
            sales: data.sales,
            revenue: data.revenue / 100
          }))
        }
      }

      // Calculate totals
      totalRev = listings.reduce((sum, item) => sum + item.revenue, 0)
      totalRev += platforms.reduce((sum, p) => sum + p.revenue, 0)
      totalSalesCount = listings.reduce((sum, item) => sum + item.sales, 0)
      totalSalesCount += platforms.reduce((sum, p) => sum + p.sales, 0)

      // Process balances
      if (balancesRes && balancesRes.ok) {
        const data = await balancesRes.json()
        const usdBalance = data.balances?.USD || { availableCents: 0, pendingCents: 0 }
        setAvailableBalance(usdBalance.availableCents / 100)
        setPendingBalance(usdBalance.pendingCents / 100)
      }

      setListedServices(listings)
      setPlatformSales(platforms)
      setTotalRevenue(totalRev)
      setTotalSales(totalSalesCount)
    } catch (error) {
      console.error('[ENHANCED_STOREFRONT] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <div className="animate-pulse space-y-4">
          <div className="h-6 dark:bg-green-400/20 bg-green-600/20 rounded w-1/2"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 dark:bg-green-400/10 bg-green-600/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
      {/* Header with Customize Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <ShoppingBag className="h-5 w-5 dark:text-green-400 text-green-700" />
          <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
            &gt; MY_STOREFRONT
          </h2>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 dark:text-green-400 text-green-700" />
          ) : (
            <ChevronUp className="h-4 w-4 dark:text-green-400 text-green-700" />
          )}
        </button>
        {!isCollapsed && (
          <Button
            onClick={() => router.push('/profile/storefront')}
            variant="outline"
            size="sm"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            CUSTOMIZE
          </Button>
        )}
      </div>

      {/* Platform Sales & Earnings Grid */}
      {!isCollapsed && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Sales */}
        <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
          <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
            TOTAL_SALES
          </div>
          <div className="text-2xl font-mono font-bold dark:text-green-400 text-green-700">
            {totalSales}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
          <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
            REVENUE
          </div>
          <div className="text-2xl font-mono font-bold dark:text-yellow-400 text-yellow-600">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>

        {/* Available Balance */}
        <div className="p-4 border dark:border-cyan-400/50 border-cyan-600/50 dark:bg-cyan-400/10 bg-cyan-600/10">
          <div className="text-xs font-mono dark:text-cyan-400/70 text-cyan-700/80 mb-1">
            AVAILABLE
          </div>
          <div className="text-2xl font-mono font-bold dark:text-cyan-400 text-cyan-700">
            ${availableBalance.toFixed(2)}
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-4 border dark:border-yellow-400/50 border-yellow-600/50 dark:bg-yellow-400/10 bg-yellow-600/10">
          <div className="text-xs font-mono dark:text-yellow-400/70 text-yellow-700/80 mb-1">
            PENDING
          </div>
          <div className="text-2xl font-mono font-bold dark:text-yellow-400 text-yellow-700">
            ${pendingBalance.toFixed(2)}
          </div>
        </div>
      </div>
      )}

      {/* Platform Sales Breakdown */}
      {!isCollapsed && platformSales.length > 0 && (
        <div className="mb-6 p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
          <div className="text-xs font-mono font-bold dark:text-green-400 text-green-700 mb-3">
            PLATFORM_SALES
          </div>
          <div className="space-y-2">
            {platformSales.map((platform, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <span className="dark:text-green-400/70 text-green-700/80">{platform.platform}</span>
                <div className="flex items-center gap-4">
                  <span className="dark:text-green-400 text-green-700">{platform.sales} sales</span>
                  <span className="dark:text-yellow-400 text-yellow-600 font-bold">
                    ${platform.revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listed Services/Beats */}
      {!isCollapsed && (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono font-bold dark:text-green-400 text-green-700">
            LISTED_ITEMS ({listedServices.length})
          </div>
          <Button
            onClick={() => router.push('/marketplace/upload')}
            size="sm"
            className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-xs"
          >
            + ADD_LISTING
          </Button>
        </div>
        
        {listedServices.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {listedServices.slice(0, 5).map((service) => (
              <div
                key={service.id}
                className="relative p-3 border dark:border-green-400/20 border-green-600/30 dark:bg-black/30 bg-white/50 hover:dark:border-green-400/40 hover:border-green-600/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/marketplace/play/${service.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-3 w-3 dark:text-green-400/70 text-green-700/70" />
                      <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                        {service.title}
                      </span>
                      <span className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                        {service.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {service.views}
                      </span>
                      <span>{service.sales} sales</span>
                      <span className="dark:text-yellow-400 text-yellow-600">${service.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-mono font-bold dark:text-green-400 text-green-700">
                      ${service.price.toFixed(2)}
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowShareMenu(showShareMenu === service.id ? null : service.id)
                        }}
                        className="p-1 hover:dark:bg-green-400/20 hover:bg-green-600/20 transition-colors"
                      >
                        <Share2 className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                      </button>
                      {showShareMenu === service.id && (
                        <div className="absolute right-0 top-full mt-1 z-10 dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-2 min-w-[160px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(service, 'copy')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                          >
                            <Copy className="h-3 w-3" />
                            COPY_LINK
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(service, 'twitter')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                          >
                            <Twitter className="h-3 w-3" />
                            TWITTER
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(service, 'facebook')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                          >
                            <Facebook className="h-3 w-3" />
                            FACEBOOK
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(service, 'linkedin')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                          >
                            <Linkedin className="h-3 w-3" />
                            LINKEDIN
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5 text-center">
            <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80 mb-3">
              No items listed yet. Start selling your beats and services.
            </p>
            <Button
              onClick={() => router.push('/marketplace/upload')}
              size="sm"
              className="font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white"
            >
              CREATE_FIRST_LISTING
            </Button>
          </div>
        )}
      </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={() => router.push('/marketplace')}
          variant="outline"
          className="font-mono text-xs dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
        >
          <ShoppingBag className="h-3 w-3 mr-1" />
          MARKETPLACE
        </Button>
        <Button
          onClick={() => router.push('/earnings')}
          variant="outline"
          className="font-mono text-xs dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          EARNINGS
        </Button>
        <Button
          onClick={() => router.push(`/profile/view?userId=${userId}`)}
          variant="outline"
          className="font-mono text-xs dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          VIEW_STORE
        </Button>
      </div>
      )}
    </div>
  )
}
