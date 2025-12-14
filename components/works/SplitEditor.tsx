'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface SplitParty {
  id?: string
  userId?: string
  externalName?: string
  role: string
  walletAddress?: string
  pro?: string
  ipiCae?: string
  publishingEntity?: string
  user?: {
    id: string
    displayName: string
    email: string
  }
}

interface SplitShare {
  id?: string
  partyId?: string
  partyIndex?: number
  masterSharePct: number
  publishingSharePct: number
}

interface SplitEditorProps {
  workId: string
  splitSheet: any
  onSave: (data: { parties: SplitParty[]; shares: SplitShare[] }) => Promise<void>
  onLock: () => Promise<void>
}

export function SplitEditor({ workId, splitSheet, onSave, onLock }: SplitEditorProps) {
  const [parties, setParties] = useState<SplitParty[]>(splitSheet?.parties || [])
  const [shares, setShares] = useState<SplitShare[]>(
    splitSheet?.shares?.map((s: any) => ({
      partyId: s.partyId,
      masterSharePct: s.masterSharePct,
      publishingSharePct: s.publishingSharePct,
    })) || []
  )
  const [showAddParty, setShowAddParty] = useState(false)
  const [newParty, setNewParty] = useState<SplitParty>({
    role: 'PRODUCER',
    externalName: '',
  })

  const isLocked = splitSheet?.locked || false

  const addParty = () => {
    if (!newParty.externalName && !newParty.userId) {
      alert('Please enter a name or select a user')
      return
    }

    const party = { ...newParty, id: `temp_${Date.now()}` }
    setParties([...parties, party])
    setShares([...shares, { partyIndex: parties.length, masterSharePct: 0, publishingSharePct: 0 }])
    setNewParty({ role: 'PRODUCER', externalName: '' })
    setShowAddParty(false)
  }

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index))
    setShares(shares.filter((_, i) => i !== index))
  }

  const updateShare = (index: number, field: 'masterSharePct' | 'publishingSharePct', value: number) => {
    const newShares = [...shares]
    newShares[index] = { ...newShares[index], [field]: value }
    setShares(newShares)
  }

  const totalMaster = shares.reduce((sum, s) => sum + (s.masterSharePct || 0), 0)
  const totalPublishing = shares.reduce((sum, s) => sum + (s.publishingSharePct || 0), 0)

  const isValid = Math.abs(totalMaster - 100) < 0.01 && Math.abs(totalPublishing - 100) < 0.01

  const handleSave = async () => {
    if (!isValid) {
      alert('Master and Publishing shares must each total 100%')
      return
    }

    await onSave({
      parties: parties.map((p, index) => ({
        ...p,
        id: p.id?.startsWith('temp_') ? undefined : p.id,
      })),
      shares: shares.map((s, index) => ({
        ...s,
        partyIndex: index,
      })),
    })
  }

  const handleLock = async () => {
    if (!isValid) {
      alert('Cannot lock: shares must total 100%')
      return
    }

    if (confirm('Lock this split sheet? You will not be able to edit it after locking.')) {
      await onLock()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
          &gt; OWNERSHIP_&_PUBLISHING
        </h3>
        {isLocked && (
          <div className="flex items-center gap-2 px-3 py-1 border-2 dark:border-yellow-400 border-yellow-600 dark:bg-yellow-400/10 bg-yellow-600/10">
            <Lock className="h-4 w-4 dark:text-yellow-400 text-yellow-700" />
            <span className="text-xs font-mono dark:text-yellow-400 text-yellow-700">LOCKED</span>
          </div>
        )}
      </div>

      {/* Parties List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
            &gt; PARTIES
          </label>
          {!isLocked && (
            <Button
              onClick={() => setShowAddParty(true)}
              size="sm"
              className="font-mono text-xs dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 dark:border-green-400/50 border-green-600/50 border-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              ADD_PARTY
            </Button>
          )}
        </div>

        {/* Add Party Form */}
        {showAddParty && (
          <div className="mb-4 p-4 border-2 dark:border-cyan-400/50 border-cyan-600/50 dark:bg-cyan-400/5 bg-cyan-600/5">
            <h4 className="text-xs font-bold font-mono dark:text-cyan-400 text-cyan-700 mb-3">
              &gt; NEW_PARTY
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                  NAME
                </label>
                <input
                  type="text"
                  value={newParty.externalName}
                  onChange={(e) => setNewParty({ ...newParty, externalName: e.target.value })}
                  placeholder="Artist name"
                  className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                  ROLE
                </label>
                <select
                  value={newParty.role}
                  onChange={(e) => setNewParty({ ...newParty, role: e.target.value })}
                  className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                >
                  <option value="PRODUCER">PRODUCER</option>
                  <option value="ARTIST">ARTIST</option>
                  <option value="WRITER">WRITER</option>
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="LABEL">LABEL</option>
                  <option value="PUBLISHER">PUBLISHER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                  WALLET (optional)
                </label>
                <input
                  type="text"
                  value={newParty.walletAddress || ''}
                  onChange={(e) => setNewParty({ ...newParty, walletAddress: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                  PRO (optional)
                </label>
                <input
                  type="text"
                  value={newParty.pro || ''}
                  onChange={(e) => setNewParty({ ...newParty, pro: e.target.value })}
                  placeholder="BMI, ASCAP, etc."
                  className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                  IPI/CAE (optional)
                </label>
                <input
                  type="text"
                  value={newParty.ipiCae || ''}
                  onChange={(e) => setNewParty({ ...newParty, ipiCae: e.target.value })}
                  placeholder="123456789"
                  className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                  PUBLISHER (optional)
                </label>
                <input
                  type="text"
                  value={newParty.publishingEntity || ''}
                  onChange={(e) => setNewParty({ ...newParty, publishingEntity: e.target.value })}
                  placeholder="Publishing company"
                  className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={addParty}
                size="sm"
                className="font-mono dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white"
              >
                ADD
              </Button>
              <Button
                onClick={() => setShowAddParty(false)}
                size="sm"
                variant="outline"
                className="font-mono dark:border-green-400/50 border-green-600/50"
              >
                CANCEL
              </Button>
            </div>
          </div>
        )}

        {/* Split Matrix */}
        {parties.length > 0 && (
          <div className="border-2 dark:border-green-400/50 border-green-600/50 overflow-hidden">
            <table className="w-full">
              <thead className="dark:bg-green-400/10 bg-green-600/10">
                <tr className="text-xs font-mono dark:text-green-400 text-green-700">
                  <th className="px-3 py-2 text-left">NAME</th>
                  <th className="px-3 py-2 text-left">ROLE</th>
                  <th className="px-3 py-2 text-right">MASTER_%</th>
                  <th className="px-3 py-2 text-right">PUB_%</th>
                  {!isLocked && <th className="px-3 py-2 text-center">ACTION</th>}
                </tr>
              </thead>
              <tbody>
                {parties.map((party, index) => (
                  <tr
                    key={party.id || index}
                    className="border-t dark:border-green-400/20 border-green-600/20 hover:dark:bg-green-400/5 hover:bg-green-600/5"
                  >
                    <td className="px-3 py-2 text-sm font-mono dark:text-green-400 text-green-700">
                      {party.externalName || party.user?.displayName || party.user?.email}
                    </td>
                    <td className="px-3 py-2 text-xs font-mono dark:text-green-400/70 text-green-700/80">
                      {party.role}
                    </td>
                    <td className="px-3 py-2">
                      {isLocked ? (
                        <div className="text-right text-sm font-mono dark:text-green-400 text-green-700">
                          {shares[index]?.masterSharePct || 0}%
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={shares[index]?.masterSharePct || 0}
                          onChange={(e) => updateShare(index, 'masterSharePct', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm font-mono text-right border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isLocked ? (
                        <div className="text-right text-sm font-mono dark:text-green-400 text-green-700">
                          {shares[index]?.publishingSharePct || 0}%
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={shares[index]?.publishingSharePct || 0}
                          onChange={(e) => updateShare(index, 'publishingSharePct', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm font-mono text-right border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
                        />
                      )}
                    </td>
                    {!isLocked && (
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeParty(index)}
                          className="p-1 dark:text-red-400 text-red-600 hover:dark:bg-red-400/10 hover:bg-red-600/10 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 dark:border-green-400/50 border-green-600/50 dark:bg-green-400/10 bg-green-600/10">
                <tr className="text-xs font-mono font-bold dark:text-green-400 text-green-700">
                  <td colSpan={2} className="px-3 py-2 text-right">TOTAL:</td>
                  <td className="px-3 py-2 text-right">
                    <span className={Math.abs(totalMaster - 100) < 0.01 ? 'dark:text-green-400 text-green-700' : 'dark:text-red-400 text-red-600'}>
                      {totalMaster.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={Math.abs(totalPublishing - 100) < 0.01 ? 'dark:text-green-400 text-green-700' : 'dark:text-red-400 text-red-600'}>
                      {totalPublishing.toFixed(1)}%
                    </span>
                  </td>
                  {!isLocked && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {parties.length === 0 && (
          <div className="px-4 py-8 text-center border-2 dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
            <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
              No parties added yet. Click "ADD_PARTY" to begin.
            </p>
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {parties.length > 0 && !isLocked && (
        <div className="space-y-2">
          {Math.abs(totalMaster - 100) >= 0.01 && (
            <div className="flex items-center gap-2 px-3 py-2 border-2 dark:border-red-400/50 border-red-600/50 dark:bg-red-400/10 bg-red-600/10 text-xs font-mono dark:text-red-400 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Master shares must total 100% (currently {totalMaster.toFixed(1)}%)
            </div>
          )}
          {Math.abs(totalPublishing - 100) >= 0.01 && (
            <div className="flex items-center gap-2 px-3 py-2 border-2 dark:border-red-400/50 border-red-600/50 dark:bg-red-400/10 bg-red-600/10 text-xs font-mono dark:text-red-400 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Publishing shares must total 100% (currently {totalPublishing.toFixed(1)}%)
            </div>
          )}
          {isValid && (
            <div className="flex items-center gap-2 px-3 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-green-400/10 bg-green-600/10 text-xs font-mono dark:text-green-400 text-green-700">
              <CheckCircle className="h-4 w-4" />
              All shares are valid and total 100%
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!isLocked && parties.length > 0 && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="font-mono text-sm dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SAVE_SPLITS
          </Button>
          {isValid && (
            <Button
              onClick={handleLock}
              variant="outline"
              className="font-mono text-sm dark:border-yellow-400/50 border-yellow-600/50 dark:text-yellow-400 text-yellow-700 hover:dark:bg-yellow-400/10 hover:bg-yellow-600/10"
            >
              <Lock className="h-4 w-4 mr-1" />
              LOCK_SPLIT_SHEET
            </Button>
          )}
        </div>
      )}

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
