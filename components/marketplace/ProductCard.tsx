"use client"

import { useState } from 'react'
import { Product } from '@/types/marketplace'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  onUnlock?: (productId: string) => void
  onPreview?: (product: Product) => void
  isProcessing?: boolean
  error?: string | null
  onSuccess?: () => void
  useX402?: boolean
}

export function ProductCard({ 
  product, 
  onUnlock, 
  onPreview,
  isProcessing = false,
  error = null,
  onSuccess,
  useX402 = false
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BEAT': return 'text-cyan-400'
      case 'KIT': return 'text-purple-400'
      case 'SERVICE': return 'text-yellow-400'
      case 'ACCESS': return 'text-green-400'
      default: return 'text-green-400'
    }
  }

  const getGradientBg = (type: string) => {
    switch (type) {
      case 'BEAT': return 'from-cyan-900/20 to-blue-900/20'
      case 'KIT': return 'from-purple-900/20 to-pink-900/20'
      case 'SERVICE': return 'from-yellow-900/20 to-orange-900/20'
      case 'ACCESS': return 'from-green-900/20 to-emerald-900/20'
      default: return 'from-green-900/20 to-emerald-900/20'
    }
  }

  return (
    <div
      className={`
        relative group
        border dark:border-green-500/30 border-green-600/40
        dark:bg-black/80 bg-white/90 backdrop-blur-sm
        rounded-lg overflow-hidden
        transition-all duration-300
        ${isHovered ? 'scale-105 dark:shadow-[0_0_30px_rgba(34,197,94,0.3)] shadow-[0_0_20px_rgba(22,163,74,0.2)] dark:border-green-500/60 border-green-600/60' : 'dark:shadow-[0_0_10px_rgba(0,0,0,0.1)] shadow-[0_0_5px_rgba(0,0,0,0.05)]'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Type Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`
          px-2 py-1 
          text-[10px] font-mono font-bold tracking-wider
          ${getTypeColor(product.type)}
          bg-black/80 border border-current/30
          rounded
        `}>
          {product.category === 'SERVICE' ? `SERVICE_TYPE: ${product.type}` : `ASSET_TYPE: ${product.type}`}
        </span>
      </div>

      {/* Cover Image or Gradient */}
      <div className={`relative h-48 bg-gradient-to-br ${getGradientBg(product.type)}`}>
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={product.title}
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-6xl font-mono font-bold opacity-20 ${getTypeColor(product.type)}`}>
              {product.type[0]}
            </span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-mono font-bold dark:text-green-400 text-green-700 truncate">
          &gt; {product.title}
        </h3>

        {/* Creator - TODO: Hook up to creator profile */}
        <a 
          href="#" 
          className="block text-sm dark:text-green-300/70 text-green-600 dark:hover:text-green-300 hover:text-green-700 transition-colors font-mono"
          onClick={(e) => e.preventDefault()}
        >
          BY: {product.creatorName}
        </a>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 border border-green-400/30 text-green-400/70 font-mono">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-sm dark:text-green-100/60 text-green-700/80 line-clamp-2 font-mono leading-relaxed">
          {product.description}
        </p>

        {/* Metadata (BPM, Key) */}
        {(product.bpm || product.key) && (
          <div className="text-xs text-green-400/60 font-mono">
            {product.bpm && `BPM: ${product.bpm}`}
            {product.bpm && product.key && ' | '}
            {product.key && `KEY: ${product.key}`}
          </div>
        )}

        {/* Delivery Info */}
        {product.deliveryType && (
          <div className="text-xs text-green-400/60 font-mono">
            DELIVERY: {product.deliveryType === 'INSTANT' ? 'INSTANT_DOWNLOAD' : `~${product.estDeliveryTimeDays} DAYS`}
          </div>
        )}

        {/* Social Proof */}
        {(product.rating || product.ordersCount) && (
          <div className="text-sm text-green-400/70 font-mono flex items-center gap-2">
            {product.rating && <span>★ {product.rating}</span>}
            {product.rating && product.ordersCount && <span>•</span>}
            {product.ordersCount && <span>{product.ordersCount} ORDERS</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold dark:text-green-400 text-green-700 font-mono">
            ${product.priceUSDC}
          </span>
          <span className="text-xs text-green-400/50 font-mono">USDC</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {product.previewUrl && onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(product)}
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 font-mono"
            >
              <Play className="w-4 h-4 mr-1" />
              PREVIEW
            </Button>
          )}
          
          <Button
            onClick={() => onUnlock?.(product.id)}
            disabled={isProcessing}
            className={`
              ${product.previewUrl ? 'flex-1' : 'w-full'}
              bg-green-500/20 border border-green-500/50 
              text-green-400 hover:bg-green-500/30 hover:border-green-500
              font-mono font-bold tracking-wider
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isProcessing ? (
              <>
                <span className="animate-pulse">PROCESSING...</span>
              </>
            ) : (
              '&gt; UNLOCK'
            )}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 p-2 border border-red-500/50 bg-red-500/10 rounded text-xs text-red-400 font-mono">
            PAYMENT_FAILED — TRY_AGAIN
          </div>
        )}
      </div>
    </div>
  )
}
