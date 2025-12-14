'use client'

import React, { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check, DollarSign, FileText, Tag, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VaultAsset } from '@/types/vault'

interface PrepareForSaleWizardProps {
  asset: VaultAsset
  isOpen: boolean
  onClose: () => void
  onComplete: (listingData: ListingData) => Promise<void>
}

interface ListingData {
  title: string
  description: string
  price: number
  licenseType: 'EXCLUSIVE' | 'NON_EXCLUSIVE' | 'LEASE'
  tags: string[]
  includeStems: boolean
  includeProjectFile: boolean
  allowCommercialUse: boolean
  allowDistribution: boolean
}

type Step = 'details' | 'pricing' | 'licensing' | 'review'

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'licensing', label: 'Licensing', icon: Settings },
  { id: 'review', label: 'Review', icon: Check },
]

export function PrepareForSaleWizard({ asset, isOpen, onClose, onComplete }: PrepareForSaleWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  
  const [listingData, setListingData] = useState<ListingData>({
    title: asset.title,
    description: asset.description || '',
    price: 0,
    licenseType: 'NON_EXCLUSIVE',
    tags: asset.tags || [],
    includeStems: false,
    includeProjectFile: false,
    allowCommercialUse: true,
    allowDistribution: false,
  })

  if (!isOpen) return null

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onComplete(listingData)
      onClose()
    } catch (error) {
      console.error('Failed to create listing:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateListingData = (updates: Partial<ListingData>) => {
    setListingData(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-3xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b dark:border-green-400/30 border-green-600/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
              &gt; PREPARE_FOR_SALE
            </h2>
            <button
              onClick={onClose}
              className="dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = idx < currentStepIndex
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isActive
                          ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                          : isCompleted
                          ? 'dark:border-green-400 border-green-600 dark:bg-green-400 bg-green-600'
                          : 'dark:border-green-400/30 border-green-600/40'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 dark:text-black text-white" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isActive ? 'dark:text-green-400 text-green-700' : 'dark:text-green-400/50 text-green-700/60'}`} />
                      )}
                    </div>
                    <span className={`text-xs font-mono ${isActive ? 'dark:text-green-400 text-green-700' : 'dark:text-green-400/50 text-green-700/60'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'dark:bg-green-400 bg-green-600' : 'dark:bg-green-400/30 bg-green-600/40'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-2">
                  LISTING_TITLE
                </label>
                <input
                  type="text"
                  value={listingData.title}
                  onChange={(e) => updateListingData({ title: e.target.value })}
                  className="w-full px-4 py-3 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                  placeholder="Enter a catchy title..."
                />
              </div>

              <div>
                <label className="block text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  value={listingData.description}
                  onChange={(e) => updateListingData({ description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600 resize-none"
                  placeholder="Describe your asset... (BPM, key, mood, genre, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-2">
                  TAGS (comma separated)
                </label>
                <input
                  type="text"
                  value={listingData.tags.join(', ')}
                  onChange={(e) => updateListingData({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-4 py-3 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                  placeholder="trap, dark, 140bpm, minor"
                />
              </div>
            </div>
          )}

          {currentStep === 'pricing' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-2">
                  PRICE (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono dark:text-green-400/50 text-green-700/60">
                    $
                  </span>
                  <input
                    type="number"
                    value={listingData.price}
                    onChange={(e) => updateListingData({ price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-3xl dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-2 text-xs font-mono dark:text-green-400/50 text-green-700/60">
                  // Suggested price range: $25 - $150 for beats
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-3">
                  LICENSE_TYPE
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'NON_EXCLUSIVE', label: 'Non-Exclusive', desc: 'Can be sold to multiple buyers' },
                    { value: 'EXCLUSIVE', label: 'Exclusive', desc: 'One-time sale, full rights transfer' },
                    { value: 'LEASE', label: 'Lease', desc: 'Time-limited usage rights' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateListingData({ licenseType: option.value as any })}
                      className={`w-full p-4 border-2 text-left transition-colors ${
                        listingData.licenseType === option.value
                          ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10'
                          : 'dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400/50 hover:border-green-600/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                            {option.label}
                          </div>
                          <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                            {option.desc}
                          </div>
                        </div>
                        {listingData.licenseType === option.value && (
                          <Check className="h-5 w-5 dark:text-green-400 text-green-700" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'licensing' && (
            <div className="space-y-6">
              <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-4">
                WHAT'S_INCLUDED:
              </div>

              <label className="flex items-start gap-3 p-4 border-2 dark:border-green-400/30 border-green-600/40 cursor-pointer hover:dark:border-green-400/50 hover:border-green-600/60 transition-colors">
                <input
                  type="checkbox"
                  checked={listingData.includeStems}
                  onChange={(e) => updateListingData({ includeStems: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                    Include Stems
                  </div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                    Provide individual track stems for mixing
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 dark:border-green-400/30 border-green-600/40 cursor-pointer hover:dark:border-green-400/50 hover:border-green-600/60 transition-colors">
                <input
                  type="checkbox"
                  checked={listingData.includeProjectFile}
                  onChange={(e) => updateListingData({ includeProjectFile: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                    Include Project File
                  </div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                    Provide DAW project file (FL Studio, Ableton, etc.)
                  </div>
                </div>
              </label>

              <div className="border-t dark:border-green-400/20 border-green-600/30 pt-6 mt-6">
                <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-4">
                  USAGE_RIGHTS:
                </div>

                <label className="flex items-start gap-3 p-4 border-2 dark:border-green-400/30 border-green-600/40 cursor-pointer hover:dark:border-green-400/50 hover:border-green-600/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={listingData.allowCommercialUse}
                    onChange={(e) => updateListingData({ allowCommercialUse: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                      Allow Commercial Use
                    </div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                      Buyer can use for commercial releases
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 dark:border-green-400/30 border-green-600/40 cursor-pointer hover:dark:border-green-400/50 hover:border-green-600/60 transition-colors mt-3">
                  <input
                    type="checkbox"
                    checked={listingData.allowDistribution}
                    onChange={(e) => updateListingData({ allowDistribution: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-mono text-sm dark:text-green-400 text-green-700 font-bold">
                      Allow Distribution
                    </div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
                      Buyer can distribute to streaming platforms
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6">
                <h3 className="font-mono text-lg dark:text-green-400 text-green-700 font-bold mb-4">
                  {listingData.title}
                </h3>
                <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-4">
                  {listingData.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {listingData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4">
                  <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60 mb-1">
                    PRICE
                  </div>
                  <div className="text-2xl font-mono dark:text-green-400 text-green-700 font-bold">
                    ${listingData.price.toFixed(2)}
                  </div>
                </div>
                <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4">
                  <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60 mb-1">
                    LICENSE
                  </div>
                  <div className="text-lg font-mono dark:text-green-400 text-green-700 font-bold">
                    {listingData.licenseType.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4">
                <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60 mb-3">
                  INCLUDED:
                </div>
                <div className="space-y-2 text-sm font-mono dark:text-green-400 text-green-700">
                  <div className="flex items-center gap-2">
                    {listingData.includeStems ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 dark:text-red-400 text-red-700" />}
                    Stems
                  </div>
                  <div className="flex items-center gap-2">
                    {listingData.includeProjectFile ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 dark:text-red-400 text-red-700" />}
                    Project File
                  </div>
                  <div className="flex items-center gap-2">
                    {listingData.allowCommercialUse ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 dark:text-red-400 text-red-700" />}
                    Commercial Use
                  </div>
                  <div className="flex items-center gap-2">
                    {listingData.allowDistribution ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 dark:text-red-400 text-red-700" />}
                    Distribution Rights
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-green-400/30 border-green-600/40 flex items-center justify-between">
          <Button
            onClick={handleBack}
            disabled={isFirstStep || submitting}
            variant="outline"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-500 font-mono"
            >
              {submitting ? 'CREATING...' : 'CREATE_LISTING'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-500 font-mono"
            >
              NEXT
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
