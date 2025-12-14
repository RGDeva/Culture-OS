"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

const PRODUCT_TYPES = ['BEAT', 'KIT', 'SERVICE', 'ACCESS'] as const

export default function UploadPage() {
  const router = useRouter()
  const { user, login } = usePrivy()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'BEAT' as typeof PRODUCT_TYPES[number],
    priceUSDC: '',
    coverUrl: '',
    previewUrl: ''
  })
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      login()
      return
    }

    if (!formData.title || !formData.description || !formData.priceUSDC) {
      toast({
        title: 'VALIDATION_ERROR',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priceUSDC: parseFloat(formData.priceUSDC),
          creatorName: (typeof user.email === 'string' ? user.email.split('@')[0] : (user.email?.address ? String(user.email.address).split('@')[0] : null)) || 'ANONYMOUS'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[UPLOAD] Server error:', errorData)
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      console.log('[UPLOAD] Success:', result)

      toast({
        title: 'UPLOAD_SUCCESS',
        description: 'Your product has been listed on the marketplace',
        className: 'bg-green-500/20 border-green-500/50 text-green-400'
      })

      router.push('/marketplace')
    } catch (error: any) {
      console.error('[UPLOAD] Error details:', {
        message: error.message,
        error: error,
        stack: error.stack
      })
      toast({
        title: 'UPLOAD_FAILED',
        description: error.message || 'Failed to upload product. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
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

      <div className="relative container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-4 font-mono"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK_TO_MARKETPLACE
          </Link>
          <h1 className="text-4xl font-mono font-bold text-green-400">
            &gt; UPLOAD_PRODUCT
          </h1>
          <p className="text-green-300/70 font-mono mt-2">
            List your beats, kits, or services on the marketplace
          </p>
          <div className="h-px bg-green-500/30 mt-4" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-green-400">
              PRODUCT_TITLE *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., NEON_DREAMS_BEAT"
              className="bg-black/50 border-green-500/30 text-green-100 font-mono focus:border-green-500"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-green-400">
              DESCRIPTION *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product..."
              className="bg-black/50 border-green-500/30 text-green-100 font-mono focus:border-green-500 min-h-[100px]"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-green-400">
              PRODUCT_TYPE *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`
                    px-4 py-2 rounded font-mono text-sm transition-all
                    ${formData.type === type
                      ? 'bg-green-500/30 border-2 border-green-500 text-green-400'
                      : 'bg-black/50 border border-green-500/30 text-green-400/70 hover:border-green-500/50'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-green-400">
              PRICE_USDC *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-mono">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.priceUSDC}
                onChange={(e) => setFormData(prev => ({ ...prev, priceUSDC: e.target.value }))}
                placeholder="0.00"
                className="bg-black/50 border-green-500/30 text-green-100 font-mono focus:border-green-500 pl-8"
                required
              />
            </div>
          </div>

          {/* Cover URL */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-green-400">
              COVER_IMAGE_URL
            </label>
            <Input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
              placeholder="https://example.com/cover.jpg"
              className="bg-black/50 border-green-500/30 text-green-100 font-mono focus:border-green-500"
            />
            <p className="text-xs text-green-400/50 font-mono">
              Optional: Direct URL to cover image
            </p>
          </div>

          {/* Preview URL */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-green-400">
              PREVIEW_AUDIO_URL
            </label>
            <Input
              type="url"
              value={formData.previewUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
              placeholder="https://example.com/preview.mp3"
              className="bg-black/50 border-green-500/30 text-green-100 font-mono focus:border-green-500"
            />
            <p className="text-xs text-green-400/50 font-mono">
              Optional: Direct URL to audio preview (MP3)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/marketplace')}
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 font-mono"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500 font-mono font-bold"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  UPLOADING...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  UPLOAD_PRODUCT
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 border border-green-500/30 bg-green-500/5 rounded">
          <p className="text-sm text-green-300 font-mono leading-relaxed">
            <span className="text-green-400 font-bold">NOTE:</span> After uploading, your product will be listed on the marketplace. 
            Buyers will pay in USDC and gain instant access to your content.
          </p>
        </div>
      </div>
    </div>
  )
}
