'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, DollarSign, Tag, FileText, Download, Radio, AlertCircle, CheckCircle } from 'lucide-react'
import { Project } from '@/types/sessionVault'

interface MarketplaceListingModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onList: (listing: MarketplaceListing) => Promise<void>
}

export interface MarketplaceListing {
  projectId: string
  price: number
  priceType: 'LEASE' | 'EXCLUSIVE' | 'FREE'
  description: string
  tags: string[]
  allowDownload: boolean
  allowStreaming: boolean
  leaseTerms?: {
    maxStreams?: number
    maxSales?: number
    distributionRights: boolean
    performanceRights: boolean
    broadcastRights: boolean
  }
}

export function MarketplaceListingModal({
  isOpen,
  onClose,
  project,
  onList,
}: MarketplaceListingModalProps) {
  const [priceType, setPriceType] = useState<'LEASE' | 'EXCLUSIVE' | 'FREE'>('LEASE')
  const [price, setPrice] = useState(29.99)
  const [description, setDescription] = useState(project.notes || '')
  const [tags, setTags] = useState<string[]>(project.tags || [])
  const [newTag, setNewTag] = useState('')
  const [allowDownload, setAllowDownload] = useState(false)
  const [allowStreaming, setAllowStreaming] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Lease terms
  const [maxStreams, setMaxStreams] = useState<number | undefined>(100000)
  const [maxSales, setMaxSales] = useState<number | undefined>(2000)
  const [distributionRights, setDistributionRights] = useState(true)
  const [performanceRights, setPerformanceRights] = useState(true)
  const [broadcastRights, setBroadcastRights] = useState(false)

  if (!isOpen) return null

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)

    // Validation
    if (priceType !== 'FREE' && price <= 0) {
      setError('Price must be greater than 0')
      return
    }

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (tags.length === 0) {
      setError('Add at least one tag')
      return
    }

    setIsSubmitting(true)

    try {
      const listing: MarketplaceListing = {
        projectId: project.id,
        price: priceType === 'FREE' ? 0 : price,
        priceType,
        description: description.trim(),
        tags,
        allowDownload,
        allowStreaming,
      }

      if (priceType === 'LEASE') {
        listing.leaseTerms = {
          maxStreams,
          maxSales,
          distributionRights,
          performanceRights,
          broadcastRights,
        }
      }

      await onList(listing)
      setSuccess(true)
      
      // Close after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to list on marketplace')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 dark:bg-black bg-white border-b-2 dark:border-green-400/50 border-green-600/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
              &gt; LIST_ON_MARKETPLACE
            </h2>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
              {project.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 border-2 dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 text-sm font-mono dark:text-green-400 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Successfully listed on marketplace! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 border-2 dark:border-red-400 border-red-600 dark:bg-red-400/10 bg-red-600/10 text-sm font-mono dark:text-red-400 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Price Type */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
              &gt; LISTING_TYPE
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPriceType('LEASE')}
                className={`px-4 py-3 border-2 font-mono text-sm transition-all ${
                  priceType === 'LEASE'
                    ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                    : 'dark:border-green-400/30 border-green-600/30 dark:text-green-400/60 text-green-700/70 hover:dark:border-green-400/50 hover:border-green-600/50'
                }`}
              >
                LEASE
              </button>
              <button
                onClick={() => setPriceType('EXCLUSIVE')}
                className={`px-4 py-3 border-2 font-mono text-sm transition-all ${
                  priceType === 'EXCLUSIVE'
                    ? 'dark:border-yellow-400 border-yellow-600 dark:bg-yellow-400/10 bg-yellow-600/10 dark:text-yellow-400 text-yellow-700'
                    : 'dark:border-green-400/30 border-green-600/30 dark:text-green-400/60 text-green-700/70 hover:dark:border-green-400/50 hover:border-green-600/50'
                }`}
              >
                EXCLUSIVE
              </button>
              <button
                onClick={() => setPriceType('FREE')}
                className={`px-4 py-3 border-2 font-mono text-sm transition-all ${
                  priceType === 'FREE'
                    ? 'dark:border-cyan-400 border-cyan-600 dark:bg-cyan-400/10 bg-cyan-600/10 dark:text-cyan-400 text-cyan-700'
                    : 'dark:border-green-400/30 border-green-600/30 dark:text-green-400/60 text-green-700/70 hover:dark:border-green-400/50 hover:border-green-600/50'
                }`}
              >
                FREE
              </button>
            </div>
          </div>

          {/* Price */}
          {priceType !== 'FREE' && (
            <div>
              <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                &gt; PRICE (USD)
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 dark:text-green-400 text-green-700" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 text-lg font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
              </div>
              {priceType === 'LEASE' && (
                <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                  Suggested: $29.99 - $49.99
                </p>
              )}
              {priceType === 'EXCLUSIVE' && (
                <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                  Suggested: $199 - $999+
                </p>
              )}
            </div>
          )}

          {/* Lease Terms */}
          {priceType === 'LEASE' && (
            <div className="border-2 dark:border-cyan-400/50 border-cyan-600/50 p-4 space-y-3">
              <h3 className="text-sm font-bold font-mono dark:text-cyan-400 text-cyan-700">
                &gt; LEASE_TERMS
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                    MAX_STREAMS
                  </label>
                  <input
                    type="number"
                    value={maxStreams || ''}
                    onChange={(e) => setMaxStreams(parseInt(e.target.value) || undefined)}
                    placeholder="Unlimited"
                    className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                    MAX_SALES
                  </label>
                  <input
                    type="number"
                    value={maxSales || ''}
                    onChange={(e) => setMaxSales(parseInt(e.target.value) || undefined)}
                    placeholder="Unlimited"
                    className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-mono dark:text-green-400 text-green-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={distributionRights}
                    onChange={(e) => setDistributionRights(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Distribution Rights (Spotify, Apple Music, etc.)
                </label>
                <label className="flex items-center gap-2 text-xs font-mono dark:text-green-400 text-green-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={performanceRights}
                    onChange={(e) => setPerformanceRights(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Performance Rights (Live shows, radio)
                </label>
                <label className="flex items-center gap-2 text-xs font-mono dark:text-green-400 text-green-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastRights}
                    onChange={(e) => setBroadcastRights(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Broadcast Rights (TV, film, commercials)
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your beat... (genre, mood, BPM, key, etc.)"
              rows={4}
              className="w-full px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; TAGS
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
              />
              <Button
                onClick={addTag}
                size="sm"
                className="font-mono dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 dark:border-green-400/50 border-green-600/50 border-2"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-mono border dark:border-green-400/50 border-green-600/50 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:dark:text-red-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
              &gt; PERMISSIONS
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm font-mono dark:text-green-400 text-green-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowStreaming}
                  onChange={(e) => setAllowStreaming(e.target.checked)}
                  className="w-4 h-4"
                />
                <Radio className="h-4 w-4" />
                Allow streaming preview
              </label>
              <label className="flex items-center gap-3 text-sm font-mono dark:text-green-400 text-green-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4"
                />
                <Download className="h-4 w-4" />
                Allow download after purchase
              </label>
            </div>
          </div>

          {/* Project Info */}
          <div className="border dark:border-green-400/30 border-green-600/30 p-4 dark:bg-green-400/5 bg-green-600/5">
            <h3 className="text-xs font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              PROJECT_INFO
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono dark:text-green-400/70 text-green-700/80">
              {project.bpm && <div>BPM: {project.bpm}</div>}
              {project.key && <div>Key: {project.key}</div>}
              {project.genre && <div>Genre: {project.genre}</div>}
              {project.mood && <div>Mood: {project.mood}</div>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 dark:bg-black bg-white border-t-2 dark:border-green-400/50 border-green-600/50 px-6 py-4 flex items-center justify-between">
          <Button
            onClick={onClose}
            variant="outline"
            className="font-mono dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || success}
            className="font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'LISTING...' : 'LIST_ON_MARKETPLACE'}
          </Button>
        </div>
      </div>
    </div>
  )
}
