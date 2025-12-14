"use client"

import { useState, useEffect, useRef } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Product, CheckoutResponse, ProductType, ProductCategory } from "@/types/marketplace"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { UnlockSuccessModal } from "@/components/marketplace/UnlockSuccessModal"
import { PaymentModal } from "@/components/marketplace/PaymentModal"
import { ProductDetailModal } from "@/components/marketplace/ProductDetailModal"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Zkp2pTopUpButton } from "@/components/payments/Zkp2pTopUpButton"
import { TerminalText } from "@/components/ui/terminal-text"
import { ProductCardSkeleton } from "@/components/ui/loading-skeleton"

// Mock products for development (will be replaced with API call)
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'NEON_DREAMS_BEAT',
    description: 'Dark synthwave beat with heavy bass and atmospheric leads. Perfect for cyberpunk vibes.',
    type: 'BEAT',
    priceUSDC: 40,
    creatorName: 'XEN_PRODUCER',
    coverUrl: 'https://source.unsplash.com/random/400x400/?synthwave,neon',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'MIDNIGHT_VOCAL_KIT',
    description: 'Smooth R&B vocal samples with rich harmonies and professional processing.',
    type: 'KIT',
    priceUSDC: 60,
    creatorName: 'VOCAL_QUEEN',
    coverUrl: 'https://source.unsplash.com/random/400x400/?microphone,studio',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: 'MIXING_MASTERING_SERVICE',
    description: 'Professional mixing and mastering service. Get your tracks radio-ready.',
    type: 'SERVICE',
    priceUSDC: 150,
    creatorName: 'AUDIO_ENGINEER_PRO',
    coverUrl: 'https://source.unsplash.com/random/400x400/?audio,mixing'
  },
  {
    id: '4',
    title: 'EXCLUSIVE_DISCORD_ACCESS',
    description: 'Join our exclusive producer community with daily feedback sessions and networking.',
    type: 'ACCESS',
    priceUSDC: 25,
    creatorName: 'NOCLTURE_NETWORK',
    coverUrl: 'https://source.unsplash.com/random/400x400/?community,network'
  },
  {
    id: '5',
    title: 'TRAP_808_COLLECTION',
    description: 'Heavy-hitting 808 samples and bass presets for modern trap production.',
    type: 'KIT',
    priceUSDC: 35,
    creatorName: 'BASS_MASTER',
    coverUrl: 'https://source.unsplash.com/random/400x400/?bass,music',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '6',
    title: 'AMBIENT_SOUNDSCAPE_BEAT',
    description: 'Ethereal ambient beat with lush pads and organic textures.',
    type: 'BEAT',
    priceUSDC: 45,
    creatorName: 'ATMOSPHERE_CREATOR',
    coverUrl: 'https://source.unsplash.com/random/400x400/?ambient,space'
  }
]

export default function MarketplacePage() {
  const { user, login } = usePrivy()
  const { toast } = useToast()
  
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingProductId, setProcessingProductId] = useState<string | null>(null)
  const [productErrors, setProductErrors] = useState<Record<string, string>>({})
  const [successResponse, setSuccessResponse] = useState<CheckoutResponse | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentPreview, setCurrentPreview] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Filter state
  const [activeTab, setActiveTab] = useState<'products' | 'bounties'>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ProductType | 'ALL'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest')
  const [showFilters, setShowFilters] = useState(true)
  const [bounties, setBounties] = useState<any[]>([])

  // Fetch products with filters
  const fetchProducts = async () => {
    setLoading(false) // Set to false immediately for fast load
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedType !== 'ALL') params.set('type', selectedType)
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory)
      if (sortBy) params.set('sort', sortBy)
      
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.products || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace')
      console.error('Error fetching products:', err)
      // Fallback to mock data if API fails
      setProducts(mockProducts)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProducts()
    
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])
  
  // Debounced search and filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 400) // 400ms debounce
    
    return () => clearTimeout(timer)
  }, [searchQuery, selectedType, selectedCategory, sortBy])

  // Handle unlock/purchase - show payment modal
  const handleUnlock = async (productId: string) => {
    // Gate: require Privy login
    if (!user) {
      login()
      return
    }

    // Find the product
    const product = products.find(p => p.id === productId)
    if (!product) {
      toast({
        title: 'ERROR',
        description: 'Product not found',
        variant: 'destructive'
      })
      return
    }

    // Show payment modal with options (card, wallet)
    setSelectedProduct(product)
    setShowPaymentModal(true)
  }

  // Handle successful payment from modal
  const handlePaymentSuccess = (data: CheckoutResponse) => {
    setSuccessResponse(data)
    setShowSuccessModal(true)
    
    toast({
      title: 'PAYMENT_CONFIRMED',
      description: 'Access granted',
      className: 'bg-green-500/20 border-green-500/50 text-green-400'
    })
  }

  // Handle preview
  const handlePreview = (product: Product) => {
    if (!product.previewUrl) return

    // If same track, toggle play/pause
    if (currentPreview === product.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
      return
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Create new audio element
    const audio = new Audio(product.previewUrl)
    audioRef.current = audio
    setCurrentPreview(product.id)

    audio.play()
    audio.addEventListener('ended', () => {
      setCurrentPreview(null)
    })
  }

  // Show skeleton on initial load only
  const showSkeleton = loading && products.length === 0

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <p className="text-xl font-mono text-red-400">ERROR_LOADING_MARKETPLACE</p>
            <p className="text-sm font-mono text-red-300/70">{error}</p>
            <Button
              onClick={fetchProducts}
              className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 font-mono"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              RETRY
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-xl font-mono">NO_ASSETS_AVAILABLE_YET</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400">
      {/* Chaos Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-green-400/20 animate-pulse"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-mono font-bold text-green-400">
                &gt; <TerminalText text="NOCULTURE_MARKETPLACE" speed={40} cursor={false} />
              </h1>
              <p className="text-lg text-green-300/70 font-mono">
                <TerminalText text="Curated beats, kits, and services from the network." speed={25} startDelay={800} cursor={false} />
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <Zkp2pTopUpButton />
              
              <Button
                onClick={() => window.location.href = '/marketplace/upload'}
                className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500 font-mono font-bold"
              >
                + UPLOAD_PRODUCT
              </Button>
            </div>
          </div>
          
          <div className="h-px bg-green-500/30" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b-2 border-green-400/30">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-mono font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            PRODUCTS
          </button>
          <button
            onClick={() => setActiveTab('bounties')}
            className={`px-6 py-3 font-mono font-bold transition-all ${
              activeTab === 'bounties'
                ? 'bg-green-400 text-black'
                : 'bg-black text-green-400 hover:bg-green-400/10'
            }`}
          >
            BOUNTIES
          </button>
        </div>

        {/* Filters */}
        <div className="border-2 border-green-400/30 bg-black/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-mono font-bold text-green-400 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              &gt; FILTERS
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-green-400 hover:text-green-300 font-mono"
            >
              {showFilters ? 'HIDE' : 'SHOW'}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH_ASSETS_AND_SERVICES"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70 font-mono">TYPE</label>
                  <div className="flex flex-wrap gap-2">
                    {(['ALL', 'BEAT', 'KIT', 'SERVICE', 'ACCESS'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                          selectedType === type
                            ? 'bg-green-400 text-black border-green-400'
                            : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70 font-mono">CATEGORY</label>
                  <div className="flex gap-2">
                    {(['ALL', 'ASSET', 'SERVICE'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                          selectedCategory === cat
                            ? 'bg-green-400 text-black border-green-400'
                            : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70 font-mono">SORT_BY</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-black border-2 border-green-400/50 text-green-400 font-mono px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="newest">NEWEST</option>
                    <option value="price_low">PRICE_LOW → HIGH</option>
                    <option value="price_high">PRICE_HIGH → LOW</option>
                    <option value="popular">MOST_PURCHASED</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-green-400/60 font-mono">
                SHOWING {products.length} RESULTS
              </div>
            </div>
          )}
        </div>

        {/* Content - Products or Bounties */}
        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {showSkeleton ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowDetailModal(true)
                  }}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={product}
                    onUnlock={handleUnlock}
                    onPreview={handlePreview}
                    isProcessing={processingProductId === product.id}
                    error={productErrors[product.id]}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-12 border-2 border-green-400/30 dark:border-green-400/30 light:border-green-600/30">
              <h3 className="text-xl font-mono text-green-400 dark:text-green-400 light:text-green-600 mb-2">VIEW_BOUNTIES</h3>
              <p className="text-green-400/60 dark:text-green-400/60 light:text-green-600/60 font-mono mb-4">Browse and apply to open collaborations</p>
              <a 
                href="/network?tab=bounties" 
                className="inline-block px-6 py-3 bg-green-400 dark:bg-green-400 light:bg-green-600 text-black font-mono hover:bg-green-300 transition-all border-2 border-green-400 dark:border-green-400 light:border-green-600"
              >
                &gt; GO_TO_BOUNTIES
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && showDetailModal && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedProduct(null)
          }}
          onPurchase={(product) => {
            setShowDetailModal(false)
            setSelectedProduct(product)
            setShowPaymentModal(true)
          }}
        />
      )}

      {/* Payment Modal - Card or Wallet */}
      {selectedProduct && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Success Modal */}
      <UnlockSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        response={successResponse}
      />
    </div>
  )
}
