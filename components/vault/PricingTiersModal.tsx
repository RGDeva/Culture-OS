'use client'

import { useState } from 'react'
import { CreativeAsset, LicenseType, Currency } from '@/types/vault'
import { Button } from '@/components/ui/button'
import { X, DollarSign, Check } from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  price: number
  currency: Currency
  licenseType: LicenseType
  features: string[]
  distributionLimit?: number
  streamingLimit?: string
  commercialUse: boolean
  exclusive: boolean
}

interface PricingTiersModalProps {
  asset: CreativeAsset
  isOpen: boolean
  onClose: () => void
  onSave: (tiers: PricingTier[]) => void
}

const DEFAULT_TIERS: Omit<PricingTier, 'id'>[] = [
  {
    name: 'Basic Lease',
    price: 29.99,
    currency: 'USD',
    licenseType: 'LEASE',
    features: [
      'MP3 & WAV files',
      'Non-exclusive rights',
      'Up to 10,000 streams',
      'Up to 2,000 sales',
      'Producer tag included',
    ],
    distributionLimit: 2000,
    streamingLimit: '10,000',
    commercialUse: true,
    exclusive: false,
  },
  {
    name: 'Premium Lease',
    price: 59.99,
    currency: 'USD',
    licenseType: 'LEASE',
    features: [
      'MP3, WAV & Trackout stems',
      'Non-exclusive rights',
      'Up to 100,000 streams',
      'Up to 5,000 sales',
      'No producer tag',
      'Priority support',
    ],
    distributionLimit: 5000,
    streamingLimit: '100,000',
    commercialUse: true,
    exclusive: false,
  },
  {
    name: 'Unlimited Lease',
    price: 149.99,
    currency: 'USD',
    licenseType: 'LEASE',
    features: [
      'MP3, WAV & Trackout stems',
      'Non-exclusive rights',
      'Unlimited streams',
      'Unlimited sales',
      'No producer tag',
      'Music video rights',
      'Live performance rights',
    ],
    distributionLimit: undefined,
    streamingLimit: 'Unlimited',
    commercialUse: true,
    exclusive: false,
  },
  {
    name: 'Exclusive Rights',
    price: 499.99,
    currency: 'USD',
    licenseType: 'EXCLUSIVE',
    features: [
      'MP3, WAV & Trackout stems',
      'Exclusive ownership',
      'Unlimited streams & sales',
      'No producer tag',
      'Full commercial use',
      'Music video rights',
      'Live performance rights',
      'Beat removed from store',
      'Copyright transfer',
    ],
    distributionLimit: undefined,
    streamingLimit: 'Unlimited',
    commercialUse: true,
    exclusive: true,
  },
]

export function PricingTiersModal({ asset, isOpen, onClose, onSave }: PricingTiersModalProps) {
  const [tiers, setTiers] = useState<PricingTier[]>(
    DEFAULT_TIERS.map((tier, idx) => ({
      ...tier,
      id: `tier_${idx}`,
    }))
  )
  const [editingTier, setEditingTier] = useState<string | null>(null)

  if (!isOpen) return null

  const updateTier = (id: string, updates: Partial<PricingTier>) => {
    setTiers(tiers.map(tier => 
      tier.id === id ? { ...tier, ...updates } : tier
    ))
  }

  const addCustomTier = () => {
    const newTier: PricingTier = {
      id: `tier_${Date.now()}`,
      name: 'Custom Tier',
      price: 99.99,
      currency: 'USD',
      licenseType: 'LEASE',
      features: ['Custom license terms'],
      commercialUse: true,
      exclusive: false,
    }
    setTiers([...tiers, newTier])
    setEditingTier(newTier.id)
  }

  const removeTier = (id: string) => {
    setTiers(tiers.filter(tier => tier.id !== id))
  }

  const handleSave = () => {
    onSave(tiers)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 dark:bg-black bg-white border-b-2 dark:border-green-400/30 border-green-600/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; SET_PRICING_TIERS
            </h2>
            <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
              {asset.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 dark:text-green-400 text-green-700 hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`border-2 p-4 transition-all ${
                  tier.exclusive
                    ? 'dark:border-yellow-400 border-yellow-600 dark:bg-yellow-400/5 bg-yellow-50'
                    : 'dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80'
                }`}
              >
                {/* Tier Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingTier === tier.id ? (
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                        className="text-lg font-bold font-mono dark:text-green-400 text-green-700 dark:bg-black bg-white border-2 dark:border-green-400/50 border-green-600/50 px-2 py-1 w-full focus:outline-none"
                      />
                    ) : (
                      <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                        {tier.name}
                      </h3>
                    )}
                    {tier.exclusive && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-mono dark:bg-yellow-400 dark:text-black bg-yellow-600 text-white">
                        EXCLUSIVE
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeTier(tier.id)}
                    className="p-1 dark:text-red-400 text-red-600 hover:opacity-70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 dark:text-green-400/70 text-green-700/70" />
                    {editingTier === tier.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => updateTier(tier.id, { price: parseFloat(e.target.value) })}
                        className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 dark:bg-black bg-white border-2 dark:border-green-400/50 border-green-600/50 px-2 py-1 w-32 focus:outline-none"
                      />
                    ) : (
                      <span className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                        ${tier.price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                      {tier.currency}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 dark:text-green-400 text-green-700 mt-0.5 flex-shrink-0" />
                      <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditingTier(editingTier === tier.id ? null : tier.id)}
                  className="mt-4 w-full py-2 text-xs font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors"
                >
                  {editingTier === tier.id ? 'DONE_EDITING' : 'EDIT_TIER'}
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Tier */}
          <button
            onClick={addCustomTier}
            className="w-full py-3 mb-4 border-2 border-dashed dark:border-green-400/30 border-green-600/40 dark:text-green-400/70 text-green-700/70 hover:dark:border-green-400 hover:border-green-600 hover:dark:text-green-400 hover:text-green-700 font-mono text-sm transition-all"
          >
            + ADD_CUSTOM_TIER
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
            >
              SAVE_PRICING
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
