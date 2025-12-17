'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Target, Eye, ShoppingCart, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreateCampaignWizardProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

interface ViewTier {
  views: number
  payoutCents: number
}

export function CreateCampaignWizard({ userId, onClose, onSuccess }: CreateCampaignWizardProps) {
  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)

  // Form state
  const [type, setType] = useState<'VIEW' | 'CONVERSION'>('VIEW')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetCents, setBudgetCents] = useState(10000) // $100 default
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  
  // VIEW bounty specific
  const [viewTiers, setViewTiers] = useState<ViewTier[]>([
    { views: 1000, payoutCents: 500 },
    { views: 10000, payoutCents: 2000 },
  ])
  
  // CONVERSION bounty specific
  const [commissionPercent, setCommissionPercent] = useState(10)
  const [commissionCents, setCommissionCents] = useState(0)
  const [usePercentage, setUsePercentage] = useState(true)

  // Load user's assets and listings
  const [assets, setAssets] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    loadUserContent()
  }, [userId])

  const loadUserContent = async () => {
    try {
      // Load vault assets
      const assetsRes = await fetch(`/api/vault/assets?ownerId=${userId}`)
      if (assetsRes.ok) {
        const data = await assetsRes.json()
        setAssets(data.assets || [])
      }

      // Load marketplace listings
      const listingsRes = await fetch(`/api/marketplace/listings?userId=${userId}`)
      if (listingsRes.ok) {
        const data = await listingsRes.json()
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error('[WIZARD] Error loading content:', error)
    }
  }

  const addViewTier = () => {
    setViewTiers([...viewTiers, { views: 0, payoutCents: 0 }])
  }

  const removeViewTier = (index: number) => {
    setViewTiers(viewTiers.filter((_, i) => i !== index))
  }

  const updateViewTier = (index: number, field: 'views' | 'payoutCents', value: number) => {
    const updated = [...viewTiers]
    updated[index][field] = value
    setViewTiers(updated)
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleCreate = async () => {
    try {
      setCreating(true)

      // Build rules JSON
      const rulesJson = type === 'VIEW' 
        ? { tiers: viewTiers.sort((a, b) => a.views - b.views) }
        : { 
            commissionPercent: usePercentage ? commissionPercent : null,
            commissionCents: usePercentage ? null : commissionCents,
          }

      // Build asset links
      const assetLinks = []
      if (selectedAssetId) {
        assetLinks.push({ assetId: selectedAssetId })
      }
      if (selectedListingId) {
        assetLinks.push({ listingId: selectedListingId })
      }

      const response = await fetch('/api/bounties/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: userId,
          type,
          title,
          description,
          budgetCents,
          rulesJson,
          assetLinks: assetLinks.length > 0 ? assetLinks : undefined,
          status: 'DRAFT', // Creator can activate later
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('[CREATE_CAMPAIGN] Error:', error)
      alert('Failed to create campaign')
    } finally {
      setCreating(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return type !== null
      case 2:
        return true // Asset selection is optional
      case 3:
        if (type === 'VIEW') {
          return viewTiers.length > 0 && viewTiers.every(t => t.views > 0 && t.payoutCents > 0)
        } else {
          return (usePercentage && commissionPercent > 0) || (!usePercentage && commissionCents > 0)
        }
      case 4:
        return title.trim().length > 0 && budgetCents > 0
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="w-full max-w-2xl border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
              &gt; CREATE_BOUNTY_CAMPAIGN
            </h2>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
              Step {step} of 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 hover:opacity-70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex-1 h-1 ${
                s <= step
                  ? 'dark:bg-green-400 bg-green-600'
                  : 'dark:bg-green-400/20 bg-green-600/20'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
                SELECT_BOUNTY_TYPE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setType('VIEW')}
                  className={`p-6 border-2 text-left transition-all ${
                    type === 'VIEW'
                      ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                      : 'dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400/50 hover:border-green-600/50'
                  }`}
                >
                  <Eye className="h-8 w-8 dark:text-green-400 text-green-700 mb-3" />
                  <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                    VIEW_BOUNTY
                  </div>
                  <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80">
                    Pay fans based on views they generate on social media posts promoting your music
                  </p>
                  <div className="mt-4 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                    • Set view milestones<br />
                    • Automatic tracking<br />
                    • Tiered payouts
                  </div>
                </button>

                <button
                  onClick={() => setType('CONVERSION')}
                  className={`p-6 border-2 text-left transition-all ${
                    type === 'CONVERSION'
                      ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                      : 'dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400/50 hover:border-green-600/50'
                  }`}
                >
                  <ShoppingCart className="h-8 w-8 dark:text-green-400 text-green-700 mb-3" />
                  <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                    CONVERSION_BOUNTY
                  </div>
                  <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80">
                    Pay commission when fans drive sales to your beats or services
                  </p>
                  <div className="mt-4 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                    • Unique referral links<br />
                    • Track conversions<br />
                    • % or fixed commission
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Attach Target */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-2">
                ATTACH_TARGET (Optional)
              </h3>
              <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80 mb-6">
                Link this bounty to a specific asset or listing
              </p>

              {/* Vault Assets */}
              <div className="mb-6">
                <h4 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                  VAULT_ASSETS
                </h4>
                {assets.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {assets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}
                        className={`w-full p-3 border text-left transition-all ${
                          selectedAssetId === asset.id
                            ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                            : 'dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400/50 hover:border-green-600/50'
                        }`}
                      >
                        <div className="font-mono text-sm dark:text-green-400 text-green-700">
                          {asset.title}
                        </div>
                        <div className="font-mono text-xs dark:text-green-400/60 text-green-700/70">
                          {asset.assetType}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                    No vault assets found
                  </p>
                )}
              </div>

              {/* Marketplace Listings */}
              {type === 'CONVERSION' && (
                <div>
                  <h4 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                    MARKETPLACE_LISTINGS
                  </h4>
                  {listings.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {listings.map(listing => (
                        <button
                          key={listing.id}
                          onClick={() => setSelectedListingId(listing.id === selectedListingId ? null : listing.id)}
                          className={`w-full p-3 border text-left transition-all ${
                            selectedListingId === listing.id
                              ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                              : 'dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400/50 hover:border-green-600/50'
                          }`}
                        >
                          <div className="font-mono text-sm dark:text-green-400 text-green-700">
                            {listing.title}
                          </div>
                          <div className="font-mono text-xs dark:text-green-400/60 text-green-700/70">
                            ${(listing.price || 0).toFixed(2)} • {listing.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                      No marketplace listings found
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Budget & Payout Rules */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-6">
                BUDGET_&_PAYOUT_RULES
              </h3>

              {type === 'VIEW' ? (
                <div>
                  <h4 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                    VIEW_MILESTONES
                  </h4>
                  <div className="space-y-3 mb-4">
                    {viewTiers.map((tier, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                            VIEWS
                          </label>
                          <input
                            type="number"
                            value={tier.views}
                            onChange={(e) => updateViewTier(index, 'views', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                            placeholder="1000"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                            PAYOUT ($)
                          </label>
                          <input
                            type="number"
                            value={(tier.payoutCents / 100).toFixed(2)}
                            onChange={(e) => updateViewTier(index, 'payoutCents', Math.round(parseFloat(e.target.value) * 100) || 0)}
                            step="0.01"
                            className="w-full px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                            placeholder="5.00"
                          />
                        </div>
                        <button
                          onClick={() => removeViewTier(index)}
                          className="mt-5 p-2 dark:text-red-400 text-red-600 hover:opacity-70"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addViewTier}
                    variant="outline"
                    size="sm"
                    className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    ADD_TIER
                  </Button>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                    COMMISSION_STRUCTURE
                  </h4>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setUsePercentage(true)}
                      className={`flex-1 p-3 border text-center font-mono text-sm ${
                        usePercentage
                          ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                          : 'dark:border-green-400/30 border-green-600/40 dark:text-green-400/60 text-green-700/70'
                      }`}
                    >
                      PERCENTAGE
                    </button>
                    <button
                      onClick={() => setUsePercentage(false)}
                      className={`flex-1 p-3 border text-center font-mono text-sm ${
                        !usePercentage
                          ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                          : 'dark:border-green-400/30 border-green-600/40 dark:text-green-400/60 text-green-700/70'
                      }`}
                    >
                      FIXED_AMOUNT
                    </button>
                  </div>
                  {usePercentage ? (
                    <div>
                      <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                        COMMISSION_PERCENTAGE
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={commissionPercent}
                          onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="flex-1 px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                        />
                        <span className="font-mono dark:text-green-400 text-green-700">%</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                        COMMISSION_PER_SALE ($)
                      </label>
                      <input
                        type="number"
                        value={(commissionCents / 100).toFixed(2)}
                        onChange={(e) => setCommissionCents(Math.round(parseFloat(e.target.value) * 100) || 0)}
                        step="0.01"
                        className="w-full px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Campaign Details */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-6">
                CAMPAIGN_DETAILS
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                    TITLE *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                    placeholder="My Bounty Campaign"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                    placeholder="Describe your bounty campaign..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
                    TOTAL_BUDGET ($) *
                  </label>
                  <input
                    type="number"
                    value={(budgetCents / 100).toFixed(2)}
                    onChange={(e) => setBudgetCents(Math.round(parseFloat(e.target.value) * 100) || 0)}
                    step="0.01"
                    min="1"
                    className="w-full px-3 py-2 border dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
                    required
                  />
                  <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                    Maximum amount you're willing to spend on this campaign
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              BACK
            </Button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
            >
              NEXT
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canProceed() || creating}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
            >
              {creating ? 'CREATING...' : 'CREATE_CAMPAIGN'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
