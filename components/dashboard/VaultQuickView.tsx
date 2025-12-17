'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Folder, 
  Music, 
  Image as ImageIcon, 
  File, 
  Play, 
  Share2, 
  ExternalLink,
  Upload,
  Eye,
  MoreVertical,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VaultQuickViewProps {
  userId: string
}

interface VaultAsset {
  id: string
  title: string
  assetType: string
  coverArt?: string
  audioUrl?: string
  fileSize?: number
  plays?: number
  status?: string
  price?: number
  createdAt: string
}

export function VaultQuickView({ userId }: VaultQuickViewProps) {
  const router = useRouter()
  const [assets, setAssets] = useState<VaultAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null)
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    fetchVaultAssets()
  }, [userId])

  const fetchVaultAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vault/assets?ownerId=${userId}&limit=6`)
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || [])
      }
    } catch (error) {
      console.error('[VAULT_QUICK_VIEW] Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'AUDIO':
      case 'BEAT':
      case 'TRACK':
        return <Music className="h-5 w-5" />
      case 'IMAGE':
      case 'ARTWORK':
        return <ImageIcon className="h-5 w-5" />
      case 'FOLDER':
        return <Folder className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getShareUrl = (asset: VaultAsset) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/marketplace/play/${asset.id}`
  }

  const handleShare = (asset: VaultAsset, platform: string) => {
    const shareUrl = getShareUrl(asset)
    const text = `Check out "${asset.title}" on NoCulture OS`
    
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

  const handleQuickPlay = (asset: VaultAsset) => {
    setSelectedAsset(asset)
    // Could open a modal or inline player here
    router.push(`/vault?assetId=${asset.id}`)
  }

  if (loading) {
    return (
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <div className="animate-pulse space-y-4">
          <div className="h-6 dark:bg-green-400/20 bg-green-600/20 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 dark:bg-green-400/10 bg-green-600/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <Folder className="h-5 w-5 dark:text-green-400 text-green-700" />
          <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
            &gt; VAULT_QUICK_ACCESS
          </h2>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 dark:text-green-400 text-green-700" />
          ) : (
            <ChevronUp className="h-4 w-4 dark:text-green-400 text-green-700" />
          )}
        </button>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/vault/upload')}
              size="sm"
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              UPLOAD
            </Button>
            <Button
              onClick={() => router.push('/vault')}
              variant="outline"
              size="sm"
              className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
            >
              VIEW_ALL
            </Button>
          </div>
        )}
      </div>

      {/* Assets Grid */}
      {!isCollapsed && assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="relative group border dark:border-green-400/20 border-green-600/30 p-3 hover:dark:border-green-400 hover:border-green-600 transition-all cursor-pointer"
            >
              {/* Asset Preview */}
              <div 
                onClick={() => handleQuickPlay(asset)}
                className="mb-3"
              >
                {asset.coverArt ? (
                  <div className="relative w-full aspect-square mb-2">
                    <img
                      src={asset.coverArt}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square mb-2 dark:bg-green-400/10 bg-green-600/10 flex items-center justify-center border dark:border-green-400/30 border-green-600/40">
                    {getAssetIcon(asset.assetType)}
                  </div>
                )}
                
                {/* Title */}
                <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold truncate mb-1">
                  {asset.title}
                </div>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs font-mono dark:text-green-400/60 text-green-700/70">
                  <span>{formatFileSize(asset.fileSize)}</span>
                  {asset.plays !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {asset.plays}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push(`/vault?assetId=${asset.id}`)}
                  className="flex-1 px-2 py-1 text-xs font-mono dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 hover:dark:bg-green-400/30 hover:bg-green-600/30 transition-colors"
                >
                  VIEW
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(showShareMenu === asset.id ? null : asset.id)}
                    className="px-2 py-1 text-xs font-mono dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 hover:dark:bg-green-400/30 hover:bg-green-600/30 transition-colors"
                  >
                    <Share2 className="h-3 w-3" />
                  </button>
                  
                  {/* Share Menu */}
                  {showShareMenu === asset.id && (
                    <div className="absolute right-0 top-full mt-1 z-10 dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 p-2 min-w-[160px]">
                      <button
                        onClick={() => handleShare(asset, 'copy')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                      >
                        <Copy className="h-3 w-3" />
                        COPY_LINK
                      </button>
                      <button
                        onClick={() => handleShare(asset, 'twitter')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                      >
                        <Twitter className="h-3 w-3" />
                        TWITTER
                      </button>
                      <button
                        onClick={() => handleShare(asset, 'facebook')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                      >
                        <Facebook className="h-3 w-3" />
                        FACEBOOK
                      </button>
                      <button
                        onClick={() => handleShare(asset, 'linkedin')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
                      >
                        <Linkedin className="h-3 w-3" />
                        LINKEDIN
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              {asset.status === 'FOR_SALE' && asset.price && (
                <div className="absolute top-2 right-2 px-2 py-1 text-xs font-mono dark:bg-yellow-400/90 bg-yellow-600/90 dark:text-black text-white">
                  ${asset.price.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !isCollapsed ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 dark:text-green-400/30 text-green-700/40 mx-auto mb-4" />
          <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70 mb-4">
            Your vault is empty. Upload your first asset to get started.
          </p>
          <Button
            onClick={() => router.push('/vault/upload')}
            className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
          >
            <Upload className="h-4 w-4 mr-2" />
            UPLOAD_ASSET
          </Button>
        </div>
      ) : null}

      {/* View All Link */}
      {!isCollapsed && assets.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/vault')}
            className="text-xs font-mono dark:text-green-400/70 text-green-700/80 hover:dark:text-green-400 hover:text-green-700 flex items-center gap-1 mx-auto"
          >
            VIEW_ALL_ASSETS
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
