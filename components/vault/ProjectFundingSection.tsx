'use client'

import { FundingMode } from '@/types/project'

interface ProjectFundingSectionProps {
  fundingMode: FundingMode
  targetBudgetUsd?: number
  ownershipNotes?: string
  splitNotes?: string
  onFundingModeChange: (mode: FundingMode) => void
  onTargetBudgetChange: (budget: number | undefined) => void
  onOwnershipNotesChange: (notes: string) => void
  onSplitNotesChange: (notes: string) => void
}

export function ProjectFundingSection({
  fundingMode,
  targetBudgetUsd,
  ownershipNotes,
  splitNotes,
  onFundingModeChange,
  onTargetBudgetChange,
  onOwnershipNotesChange,
  onSplitNotesChange,
}: ProjectFundingSectionProps) {
  const FUNDING_MODES: { value: FundingMode; label: string; description: string }[] = [
    {
      value: 'SELF_FUNDED',
      label: 'Self-Funded',
      description: 'I\'m covering all costs myself',
    },
    {
      value: 'LOOKING_FOR_STUDIO_PARTNER',
      label: 'Looking for Studio Partner',
      description: 'Seeking studio to provide resources/space',
    },
    {
      value: 'LOOKING_FOR_BACKERS',
      label: 'Looking for Backers',
      description: 'Open to investors or crowdfunding',
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-mono text-green-400 dark:text-green-400 light:text-gray-900">
        &gt; FUNDING_&_OWNERSHIP
      </h3>

      {/* Funding Mode */}
      <div>
        <label className="block text-sm mb-3 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
          FUNDING_MODE
        </label>
        <div className="space-y-3">
          {FUNDING_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                fundingMode === mode.value
                  ? 'border-green-400 dark:border-green-400 light:border-green-600 bg-green-400/10 dark:bg-green-400/10 light:bg-green-50'
                  : 'border-green-400/30 dark:border-green-400/30 light:border-gray-300 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600'
              }`}
            >
              <input
                type="radio"
                name="fundingMode"
                value={mode.value}
                checked={fundingMode === mode.value}
                onChange={(e) => onFundingModeChange(e.target.value as FundingMode)}
                className="mt-1 h-4 w-4 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-600 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600"
              />
              <div className="flex-1">
                <div className="font-mono text-sm text-green-400 dark:text-green-400 light:text-gray-900 font-bold">
                  {mode.label}
                </div>
                <div className="text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono mt-1">
                  {mode.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Target Budget */}
      {fundingMode !== 'SELF_FUNDED' && (
        <div>
          <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
            TARGET_BUDGET_USD (optional)
          </label>
          <input
            type="number"
            value={targetBudgetUsd || ''}
            onChange={(e) => onTargetBudgetChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none"
          />
          <p className="text-xs text-green-400/50 dark:text-green-400/50 light:text-gray-500 font-mono mt-1">
            // How much funding are you seeking?
          </p>
        </div>
      )}

      {/* Ownership Notes */}
      <div>
        <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
          OWNERSHIP_NOTES (optional)
        </label>
        <textarea
          value={ownershipNotes || ''}
          onChange={(e) => onOwnershipNotesChange(e.target.value)}
          placeholder="Describe ownership structure, rights, etc..."
          rows={3}
          className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none resize-none"
        />
      </div>

      {/* Split Notes */}
      <div>
        <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
          SPLIT_NOTES (optional)
        </label>
        <textarea
          value={splitNotes || ''}
          onChange={(e) => onSplitNotesChange(e.target.value)}
          placeholder="How will revenue/royalties be split?"
          rows={3}
          className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none resize-none"
        />
      </div>
    </div>
  )
}
