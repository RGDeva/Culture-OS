'use client'

import { Eye, EyeOff, Globe, Users } from 'lucide-react'
import { ProjectVisibility, AccessType } from '@/types/project'

interface ProjectVisibilitySectionProps {
  visibility: ProjectVisibility
  accessType: AccessType
  priceUsd?: number
  onVisibilityChange: (visibility: ProjectVisibility) => void
  onAccessTypeChange: (accessType: AccessType) => void
  onPriceChange: (price: number | undefined) => void
}

export function ProjectVisibilitySection({
  visibility,
  accessType,
  priceUsd,
  onVisibilityChange,
  onAccessTypeChange,
  onPriceChange,
}: ProjectVisibilitySectionProps) {
  const VISIBILITY_OPTIONS: { value: ProjectVisibility; label: string; description: string; icon: any }[] = [
    {
      value: 'PRIVATE',
      label: 'Private',
      description: 'Only you and invited collaborators can see this',
      icon: EyeOff,
    },
    {
      value: 'NETWORK',
      label: 'Network',
      description: 'Discoverable by verified NoCulture users',
      icon: Users,
    },
    {
      value: 'PUBLIC',
      label: 'Public',
      description: 'Anyone with the link can view',
      icon: Globe,
    },
  ]

  const ACCESS_TYPES: { value: AccessType; label: string; description: string }[] = [
    {
      value: 'FREE',
      label: 'Free',
      description: 'Anyone can listen and download for free',
    },
    {
      value: 'PAY_FOR_ACCESS',
      label: 'Pay for Access',
      description: 'Users pay to unlock preview and download',
    },
    {
      value: 'FLAT_FEE',
      label: 'Flat Fee',
      description: 'One-time payment for full access',
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-mono text-green-400 dark:text-green-400 light:text-gray-900">
        &gt; VISIBILITY_&_ACCESS
      </h3>

      {/* Visibility */}
      <div>
        <label className="block text-sm mb-3 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
          PROJECT_VISIBILITY
        </label>
        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                  visibility === option.value
                    ? 'border-green-400 dark:border-green-400 light:border-green-600 bg-green-400/10 dark:bg-green-400/10 light:bg-green-50'
                    : 'border-green-400/30 dark:border-green-400/30 light:border-gray-300 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={visibility === option.value}
                  onChange={(e) => onVisibilityChange(e.target.value as ProjectVisibility)}
                  className="mt-1 h-4 w-4 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-600 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600"
                />
                <Icon className="h-5 w-5 text-green-400 dark:text-green-400 light:text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-mono text-sm text-green-400 dark:text-green-400 light:text-gray-900 font-bold">
                    {option.label}
                  </div>
                  <div className="text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono mt-1">
                    {option.description}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Access Type */}
      <div>
        <label className="block text-sm mb-3 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
          ACCESS_TYPE
        </label>
        <div className="space-y-3">
          {ACCESS_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                accessType === type.value
                  ? 'border-green-400 dark:border-green-400 light:border-green-600 bg-green-400/10 dark:bg-green-400/10 light:bg-green-50'
                  : 'border-green-400/30 dark:border-green-400/30 light:border-gray-300 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600'
              }`}
            >
              <input
                type="radio"
                name="accessType"
                value={type.value}
                checked={accessType === type.value}
                onChange={(e) => onAccessTypeChange(e.target.value as AccessType)}
                className="mt-1 h-4 w-4 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-600 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600"
              />
              <div className="flex-1">
                <div className="font-mono text-sm text-green-400 dark:text-green-400 light:text-gray-900 font-bold">
                  {type.label}
                </div>
                <div className="text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono mt-1">
                  {type.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Input */}
      {(accessType === 'PAY_FOR_ACCESS' || accessType === 'FLAT_FEE') && (
        <div>
          <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
            PRICE_USD
          </label>
          <input
            type="number"
            value={priceUsd || ''}
            onChange={(e) => onPriceChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none"
          />
          <p className="text-xs text-green-400/50 dark:text-green-400/50 light:text-gray-500 font-mono mt-1">
            // {accessType === 'PAY_FOR_ACCESS' ? 'Price to unlock preview and download' : 'One-time access fee'}
          </p>
        </div>
      )}
    </div>
  )
}
