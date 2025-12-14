"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react"
import Link from "next/link"
import { Product } from "@/types/marketplace"

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const { user, login } = usePrivy()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const checkAccessAndLoadProduct = async () => {
      if (!user) {
        login()
        return
      }

      try {
        // Check if user has purchased this product
        const accessResponse = await fetch(
          `/api/x402/checkout?userId=${user.id || user.email}&productId=${productId}`
        )
        const accessData = await accessResponse.json()

        if (!accessData.purchased) {
          router.push('/marketplace')
          return
        }

        setHasAccess(true)

        // Fetch product details
        const productsResponse = await fetch('/api/products')
        const products = await productsResponse.json()
        const foundProduct = products.find((p: Product) => p.id === productId)

        if (!foundProduct) {
          throw new Error('Product not found')
        }

        setProduct(foundProduct)
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAccessAndLoadProduct()
  }, [user, productId, router, login])

  useEffect(() => {
    if (product?.previewUrl && audioRef.current) {
      const audio = audioRef.current
      
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
      const handleLoadedMetadata = () => setDuration(audio.duration)
      const handleEnded = () => setIsPlaying(false)

      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('ended', handleEnded)

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [product])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    
    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto" />
          <p className="font-mono">LOADING...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-mono text-red-400">ACCESS_DENIED</p>
          <Button onClick={() => router.push('/marketplace')} className="font-mono">
            RETURN_TO_MARKETPLACE
          </Button>
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

      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Link
          href="/marketplace"
          className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-8 font-mono"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK_TO_MARKETPLACE
        </Link>

        {/* Player Card */}
        <div className="border-2 border-green-500/50 bg-black/80 backdrop-blur-sm rounded-lg p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
          {/* Cover Art */}
          <div className="aspect-square max-w-md mx-auto mb-8 rounded-lg overflow-hidden border border-green-500/30">
            {product.coverUrl ? (
              <img
                src={product.coverUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-900/20 to-emerald-900/20 flex items-center justify-center">
                <span className="text-8xl font-mono font-bold text-green-400/20">
                  {product.type[0]}
                </span>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">
              {product.title}
            </h1>
            <p className="text-lg text-green-300/70 font-mono">
              BY: {product.creatorName}
            </p>
            <p className="text-sm text-green-400/50 font-mono mt-2">
              {product.description}
            </p>
          </div>

          {/* Audio Player */}
          {product.previewUrl && (
            <>
              <audio
                ref={audioRef}
                src={product.previewUrl}
                preload="metadata"
              />

              {/* Progress Bar */}
              <div className="mb-6">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-green-500/20 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400 
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                />
                <div className="flex justify-between text-xs text-green-400/70 font-mono mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-green-400 hover:text-green-300">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-green-500/20 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400 
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-green-500 text-black flex items-center justify-center hover:bg-green-400 transition-all hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  )}
                </button>

                <div className="w-32" /> {/* Spacer for symmetry */}
              </div>
            </>
          )}

          {!product.previewUrl && (
            <div className="text-center py-8 border border-green-500/30 rounded bg-green-500/5">
              <p className="text-green-400/70 font-mono">
                NO_PREVIEW_AVAILABLE
              </p>
              <p className="text-sm text-green-400/50 font-mono mt-2">
                {product.type === 'SERVICE' 
                  ? 'The creator will contact you soon.'
                  : 'Download files from your email.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
