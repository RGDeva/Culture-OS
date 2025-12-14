'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

export interface Split {
  id: string
  userId?: string
  name: string
  email: string
  role: 'producer' | 'artist' | 'writer' | 'engineer' | 'other'
  masterShare: number // 0-100
  publishingShare: number // 0-100
}

interface SplitsEditorProps {
  projectId: string
  projectTitle: string
  splits: Split[]
  onSave: (splits: Split[]) => void
  onGenerateContract?: () => void
}

export function SplitsEditor({
  projectId,
  projectTitle,
  splits: initialSplits,
  onSave,
  onGenerateContract,
}: SplitsEditorProps) {
  const [splits, setSplits] = useState<Split[]>(initialSplits)
  const [hasChanges, setHasChanges] = useState(false)

  const addSplit = () => {
    const newSplit: Split = {
      id: `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      email: '',
      role: 'producer',
      masterShare: 0,
      publishingShare: 0,
    }
    setSplits([...splits, newSplit])
    setHasChanges(true)
  }

  const removeSplit = (id: string) => {
    setSplits(splits.filter(s => s.id !== id))
    setHasChanges(true)
  }

  const updateSplit = (id: string, field: keyof Split, value: any) => {
    setSplits(splits.map(s => s.id === id ? { ...s, [field]: value } : s))
    setHasChanges(true)
  }

  const totalMasterShare = splits.reduce((sum, s) => sum + (s.masterShare || 0), 0)
  const totalPublishingShare = splits.reduce((sum, s) => sum + (s.publishingShare || 0), 0)

  const isValid = totalMasterShare === 100 && totalPublishingShare === 100

  const handleSave = () => {
    if (!isValid) return
    onSave(splits)
    setHasChanges(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
            &gt; SPLITS_&_CREDITS
          </h3>
          <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
            Project: {projectTitle}
          </p>
        </div>
        <Button
          onClick={addSplit}
          size="sm"
          className="font-mono text-xs dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 dark:border-green-400/50 border-green-600/50 border-2 hover:dark:bg-green-400/20 hover:bg-green-600/20"
        >
          <Plus className="h-3 w-3 mr-1" />
          ADD_SPLIT
        </Button>
      </div>

      {/* Splits Table */}
      <div className="border-2 dark:border-green-400/50 border-green-600/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="dark:bg-green-400/10 bg-green-600/10">
              <tr className="text-xs font-mono dark:text-green-400 text-green-700">
                <th className="px-3 py-2 text-left">NAME</th>
                <th className="px-3 py-2 text-left">EMAIL</th>
                <th className="px-3 py-2 text-left">ROLE</th>
                <th className="px-3 py-2 text-right">MASTER_%</th>
                <th className="px-3 py-2 text-right">PUB_%</th>
                <th className="px-3 py-2 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {splits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm font-mono dark:text-green-400/60 text-green-700/70">
                    No splits added yet. Click "ADD_SPLIT" to begin.
                  </td>
                </tr>
              ) : (
                splits.map((split) => (
                  <tr
                    key={split.id}
                    className="border-t dark:border-green-400/20 border-green-600/20 hover:dark:bg-green-400/5 hover:bg-green-600/5"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={split.name}
                        onChange={(e) => updateSplit(split.id, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-2 py-1 text-xs font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="email"
                        value={split.email}
                        onChange={(e) => updateSplit(split.id, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-2 py-1 text-xs font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={split.role}
                        onChange={(e) => updateSplit(split.id, 'role', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                      >
                        <option value="producer">Producer</option>
                        <option value="artist">Artist</option>
                        <option value="writer">Writer</option>
                        <option value="engineer">Engineer</option>
                        <option value="other">Other</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={split.masterShare}
                        onChange={(e) => updateSplit(split.id, 'masterShare', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs font-mono text-right border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={split.publishingShare}
                        onChange={(e) => updateSplit(split.id, 'publishingShare', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs font-mono text-right border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeSplit(split.id)}
                        className="p-1 dark:text-red-400 text-red-600 hover:dark:bg-red-400/10 hover:bg-red-600/10 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {splits.length > 0 && (
              <tfoot className="border-t-2 dark:border-green-400/50 border-green-600/50 dark:bg-green-400/10 bg-green-600/10">
                <tr className="text-xs font-mono font-bold dark:text-green-400 text-green-700">
                  <td colSpan={3} className="px-3 py-2 text-right">TOTAL:</td>
                  <td className="px-3 py-2 text-right">
                    <span className={totalMasterShare === 100 ? 'dark:text-green-400 text-green-700' : 'dark:text-red-400 text-red-600'}>
                      {totalMasterShare.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={totalPublishingShare === 100 ? 'dark:text-green-400 text-green-700' : 'dark:text-red-400 text-red-600'}>
                      {totalPublishingShare.toFixed(1)}%
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Validation Messages */}
      {splits.length > 0 && (
        <div className="space-y-2">
          {totalMasterShare !== 100 && (
            <div className="flex items-center gap-2 px-3 py-2 border-2 dark:border-red-400/50 border-red-600/50 dark:bg-red-400/10 bg-red-600/10 text-xs font-mono dark:text-red-400 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Master shares must total 100% (currently {totalMasterShare.toFixed(1)}%)
            </div>
          )}
          {totalPublishingShare !== 100 && (
            <div className="flex items-center gap-2 px-3 py-2 border-2 dark:border-red-400/50 border-red-600/50 dark:bg-red-400/10 bg-red-600/10 text-xs font-mono dark:text-red-400 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Publishing shares must total 100% (currently {totalPublishingShare.toFixed(1)}%)
            </div>
          )}
          {isValid && (
            <div className="flex items-center gap-2 px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-green-400/10 bg-green-600/10 text-xs font-mono dark:text-green-400 text-green-700">
              <CheckCircle className="h-4 w-4" />
              All splits are valid and total 100%
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!isValid || !hasChanges}
          className="font-mono text-sm dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          SAVE_SPLITS
        </Button>
        {onGenerateContract && isValid && splits.length > 0 && (
          <Button
            onClick={onGenerateContract}
            variant="outline"
            className="font-mono text-sm dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 hover:dark:bg-cyan-400/10 hover:bg-cyan-600/10"
          >
            GENERATE_CONTRACT
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
        <p className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
          <strong>Master Share:</strong> Percentage of recording revenue (sales, streams, sync)<br/>
          <strong>Publishing Share:</strong> Percentage of composition revenue (performance, mechanical)
        </p>
      </div>
    </div>
  )
}
