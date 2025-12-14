'use client'

import { useState } from 'react'
import { CreativeAsset, AssetContributor, UserRole } from '@/types/vault'
import { Button } from '@/components/ui/button'
import { X, Plus, Trash2, Users, Percent } from 'lucide-react'

interface Split {
  id: string
  userId?: string
  userName: string
  email?: string
  role: UserRole
  splitPercent: number
  accepted: boolean
}

interface ContractSplitModalProps {
  asset: CreativeAsset
  isOpen: boolean
  onClose: () => void
  onSave: (splits: Split[]) => void
}

const ROLE_OPTIONS: UserRole[] = [
  'PRODUCER',
  'ARTIST',
  'ENGINEER',
  'STUDIO',
  'MANAGER',
  'OTHER',
]

export function ContractSplitModal({ asset, isOpen, onClose, onSave }: ContractSplitModalProps) {
  const [splits, setSplits] = useState<Split[]>([
    {
      id: 'split_1',
      userName: 'You (Owner)',
      role: asset.ownerRoles[0] || 'PRODUCER',
      splitPercent: 100,
      accepted: true,
    },
  ])

  if (!isOpen) return null

  const addSplit = () => {
    const newSplit: Split = {
      id: `split_${Date.now()}`,
      userName: '',
      role: 'PRODUCER',
      splitPercent: 0,
      accepted: false,
    }
    setSplits([...splits, newSplit])
  }

  const removeSplit = (id: string) => {
    if (splits.length <= 1) return // Keep at least one split
    setSplits(splits.filter(split => split.id !== id))
  }

  const updateSplit = (id: string, updates: Partial<Split>) => {
    setSplits(splits.map(split =>
      split.id === id ? { ...split, ...updates } : split
    ))
  }

  const totalPercent = splits.reduce((sum, split) => sum + split.splitPercent, 0)
  const isValid = totalPercent === 100 && splits.every(s => s.userName.trim())

  const distributeSplitsEvenly = () => {
    const evenSplit = Math.floor(100 / splits.length)
    const remainder = 100 - (evenSplit * splits.length)
    
    setSplits(splits.map((split, idx) => ({
      ...split,
      splitPercent: idx === 0 ? evenSplit + remainder : evenSplit,
    })))
  }

  const handleSave = () => {
    if (!isValid) return
    onSave(splits)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 dark:bg-black bg-white border-b-2 dark:border-green-400/30 border-green-600/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; CONTRACT_SPLITS
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
          {/* Info Box */}
          <div className="mb-6 p-4 border-2 dark:border-cyan-400/30 border-cyan-600/40 dark:bg-cyan-400/5 bg-cyan-50">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 dark:text-cyan-400 text-cyan-700 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold font-mono dark:text-cyan-400 text-cyan-700 mb-1">
                  REVENUE_SPLIT_INFO
                </h3>
                <p className="text-xs font-mono dark:text-cyan-400/70 text-cyan-700/70">
                  Define how revenue from this asset will be split between contributors.
                  All splits must total 100%. Contributors will receive payment invitations.
                </p>
              </div>
            </div>
          </div>

          {/* Total Percent Indicator */}
          <div className="mb-4 p-3 border-2 dark:border-green-400/30 border-green-600/40">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                TOTAL_SPLIT:
              </span>
              <span className={`text-lg font-bold font-mono ${
                totalPercent === 100
                  ? 'dark:text-green-400 text-green-700'
                  : totalPercent > 100
                  ? 'dark:text-red-400 text-red-600'
                  : 'dark:text-yellow-400 text-yellow-600'
              }`}>
                {totalPercent}%
              </span>
            </div>
            {totalPercent !== 100 && (
              <p className="text-xs font-mono dark:text-red-400/70 text-red-700/70 mt-1">
                {totalPercent > 100 ? 'Total exceeds 100%' : 'Total must equal 100%'}
              </p>
            )}
          </div>

          {/* Splits List */}
          <div className="space-y-3 mb-4">
            {splits.map((split, idx) => (
              <div
                key={split.id}
                className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-1 block">
                          NAME:
                        </label>
                        <input
                          type="text"
                          value={split.userName}
                          onChange={(e) => updateSplit(split.id, { userName: e.target.value })}
                          disabled={idx === 0}
                          placeholder="Contributor name"
                          className="w-full px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none disabled:opacity-50 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-1 block">
                          EMAIL:
                        </label>
                        <input
                          type="email"
                          value={split.email || ''}
                          onChange={(e) => updateSplit(split.id, { email: e.target.value })}
                          disabled={idx === 0}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none disabled:opacity-50 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                        />
                      </div>
                    </div>

                    {/* Role & Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-1 block">
                          ROLE:
                        </label>
                        <select
                          value={split.role}
                          onChange={(e) => updateSplit(split.id, { role: e.target.value as UserRole })}
                          className="w-full px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                        >
                          {ROLE_OPTIONS.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-1 block">
                          SPLIT_%:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={split.splitPercent}
                            onChange={(e) => updateSplit(split.id, { splitPercent: parseFloat(e.target.value) || 0 })}
                            className="flex-1 px-3 py-2 text-sm font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                          />
                          <Percent className="h-4 w-4 dark:text-green-400/50 text-green-700/50" />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    {split.accepted ? (
                      <div className="text-xs font-mono dark:text-green-400 text-green-700">
                        ✓ ACCEPTED
                      </div>
                    ) : (
                      <div className="text-xs font-mono dark:text-yellow-400 text-yellow-600">
                        ⏳ PENDING_ACCEPTANCE
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {idx > 0 && (
                    <button
                      onClick={() => removeSplit(split.id)}
                      className="p-2 dark:text-red-400 text-red-600 hover:opacity-70"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Contributor Button */}
          <button
            onClick={addSplit}
            className="w-full py-3 mb-4 border-2 border-dashed dark:border-green-400/30 border-green-600/40 dark:text-green-400/70 text-green-700/70 hover:dark:border-green-400 hover:border-green-600 hover:dark:text-green-400 hover:text-green-700 font-mono text-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            ADD_CONTRIBUTOR
          </button>

          {/* Distribute Evenly Button */}
          <button
            onClick={distributeSplitsEvenly}
            className="w-full py-2 mb-6 border-2 dark:border-cyan-400/30 border-cyan-600/40 dark:text-cyan-400 text-cyan-700 hover:dark:bg-cyan-400/10 hover:bg-cyan-600/10 font-mono text-sm transition-all"
          >
            DISTRIBUTE_EVENLY
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SAVE_SPLITS
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
            >
              CANCEL
            </Button>
          </div>

          {/* Warning */}
          {!isValid && (
            <p className="mt-3 text-xs font-mono dark:text-red-400/70 text-red-700/70 text-center">
              Please ensure all fields are filled and total split equals 100%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
