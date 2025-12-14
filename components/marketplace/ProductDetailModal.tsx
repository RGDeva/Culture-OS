'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, User, ShoppingCart, Play, Pause, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product } from '@/types/marketplace'
import Link from 'next/link'

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
  onPurchase: (product: Product) => void
}

export function ProductDetailModal({ product, onClose, onPurchase }: ProductDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [creatorProducts, setCreatorProducts] = useState<Product[]>([])
  const [loadingCreator, setLoadingCreator] = useState(false)

  useEffect(() => {
    // Load other products from this creator
    const fetchCreatorProducts = async () => {
      setLoadingCreator(true)
      try {
        const response = await fetch(`/api/products?creatorId=${product.creatorId}`)
        const data = await response.json()
        setCreatorProducts(data.products?.filter((p: Product) => p.id !== product.id).slice(0, 3) || [])
      } catch (error) {
        console.error('[PRODUCT_DETAIL] Error fetching creator products:', error)
      } finally {
        setLoadingCreator(false)
      }
    }

    if (product.creatorId) {
      fetchCreatorProducts()
    }

    // Cleanup audio on unmount
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
  }, [product.creatorId, product.id])

  const togglePreview = () => {
    if (!product.previewUrl) return

    if (isPlaying && audio) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (!audio) {
        const newAudio = new Audio(product.previewUrl)
        newAudio.addEventListener('ended', () => setIsPlaying(false))
        setAudio(newAudio)
        newAudio.play()
      } else {
        audio.play()
      }
      setIsPlaying(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-2 border-green-400 font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/80 border border-green-400 hover:bg-green-400 hover:text-black transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Cover */}
        <div className="relative h-64 bg-gradient-to-b from-green-400/20 to-black">
          {product.coverUrl && (
            <img
              src={product.coverUrl}
              alt={product.title}
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-green-400 text-black text-xs font-bold mb-2">
                  {product.type}
                </div>
                <h2 className="text-3xl font-bold text-green-400 mb-2">{product.title}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <Link 
                    href={`/profile/${product.creatorId}`}
                    className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {product.creatorName}
                  </Link>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-green-400 text-green-400" />
                      <span className="text-green-400">{product.rating}</span>
                    </div>
                  )}
                  {product.ordersCount && (
                    <span className="text-green-400/70">{product.ordersCount} sales</span>
                  )}
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">${product.priceUSDC}</div>
                <div className="text-xs text-green-400/70">USDC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview Player */}
          {product.previewUrl && (
            <div className="border-2 border-green-400/30 p-4 bg-green-400/5">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePreview}
                  className="bg-green-400 text-black hover:bg-green-300"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-bold">PREVIEW_AVAILABLE</p>
                  <p className="text-xs text-green-400/60">Click to {isPlaying ? 'pause' : 'play'} preview</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-green-400 mb-2">&gt; DESCRIPTION</h3>
            <p className="text-green-400/80 leading-relaxed">{product.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.category && (
              <div className="border border-green-400/30 p-3">
                <p className="text-xs text-green-400/60 mb-1">CATEGORY</p>
                <p className="text-sm text-green-400 font-bold">{product.category}</p>
              </div>
            )}
            {product.bpm && (
              <div className="border border-green-400/30 p-3">
                <p className="text-xs text-green-400/60 mb-1">BPM</p>
                <p className="text-sm text-green-400 font-bold">{product.bpm}</p>
              </div>
            )}
            {product.key && (
              <div className="border border-green-400/30 p-3">
                <p className="text-xs text-green-400/60 mb-1">KEY</p>
                <p className="text-sm text-green-400 font-bold">{product.key}</p>
              </div>
            )}
            {product.deliveryType && (
              <div className="border border-green-400/30 p-3">
                <p className="text-xs text-green-400/60 mb-1">DELIVERY</p>
                <p className="text-sm text-green-400 font-bold">{product.deliveryType}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-green-400/70 mb-2">TAGS</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-400/10 border border-green-400/30 text-green-400 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* More from Creator */}
          {creatorProducts.length > 0 && (
            <div className="border-t-2 border-green-400/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-400">&gt; MORE_FROM_{product.creatorName}</h3>
                <Link
                  href={`/profile/${product.creatorId}`}
                  className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  View Profile <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creatorProducts.map((p) => (
                  <div
                    key={p.id}
                    className="border border-green-400/30 hover:border-green-400 transition-all cursor-pointer group"
                  >
                    {p.coverUrl && (
                      <img
                        src={p.coverUrl}
                        alt={p.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="text-sm font-bold text-green-400 truncate group-hover:text-green-300">
                        {p.title}
                      </p>
                      <p className="text-xs text-green-400/60">${p.priceUSDC} USDC</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <div className="border-t-2 border-green-400/20 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-green-400/70 mb-1">TOTAL PRICE</p>
                <p className="text-2xl font-bold text-green-400">${product.priceUSDC} USDC</p>
              </div>
              <Button
                onClick={() => onPurchase(product)}
                className="bg-green-400 text-black hover:bg-green-300 font-bold text-lg px-8 py-6"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                PURCHASE_NOW
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
