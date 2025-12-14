'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CompensationType } from '@/types/bounty'

interface CreateBountyModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
  userId: string
  onSuccess?: () => void
}

export function CreateBountyModal({ isOpen, onClose, projectId, userId, onSuccess }: CreateBountyModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    roleNeeded: '',
    description: '',
    deliverables: '',
    budgetAmount: '',
    compensationType: 'FLAT_FEE' as CompensationType,
    deadline: '',
    remoteOk: true,
    locationCity: '',
    locationCountry: '',
    genreTags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const bountyData = {
        ...formData,
        projectId,
        postedByUserId: userId,
        budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : undefined,
        genreTags: formData.genreTags ? formData.genreTags.split(',').map(t => t.trim()) : [],
      }

      const res = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bountyData),
      })

      if (res.ok) {
        onSuccess?.()
        onClose()
        // Reset form
        setFormData({
          roleNeeded: '',
          description: '',
          deliverables: '',
          budgetAmount: '',
          compensationType: 'FLAT_FEE',
          deadline: '',
          remoteOk: true,
          locationCity: '',
          locationCountry: '',
          genreTags: '',
        })
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create bounty'}`)
      }
    } catch (error) {
      console.error('Error creating bounty:', error)
      alert('Failed to create bounty')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 dark:border-green-400 border-gray-400 dark:bg-black bg-white p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-green-400 text-gray-900 font-mono">
            &gt; CREATE_BOUNTY
          </h2>
          <button
            onClick={onClose}
            className="dark:text-green-400 text-gray-700 hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Needed */}
          <div>
            <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
              ROLE_NEEDED *
            </label>
            <input
              type="text"
              required
              value={formData.roleNeeded}
              onChange={(e) => setFormData({ ...formData, roleNeeded: e.target.value })}
              placeholder="e.g., Hook writer, Mix engineer, Cover art"
              className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
              DESCRIPTION *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you need help with..."
              rows={4}
              className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
              DELIVERABLES
            </label>
            <textarea
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              placeholder="What should the collaborator deliver?"
              rows={3}
              className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
            />
          </div>

          {/* Budget and Compensation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
                BUDGET (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                placeholder="100.00"
                className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
                COMPENSATION_TYPE *
              </label>
              <select
                required
                value={formData.compensationType}
                onChange={(e) => setFormData({ ...formData, compensationType: e.target.value as CompensationType })}
                className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="FLAT_FEE">FLAT_FEE</option>
                <option value="REV_SHARE">REV_SHARE</option>
                <option value="HYBRID">HYBRID</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
              DEADLINE
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Genre Tags */}
          <div>
            <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
              GENRE_TAGS (comma-separated)
            </label>
            <input
              type="text"
              value={formData.genreTags}
              onChange={(e) => setFormData({ ...formData, genreTags: e.target.value })}
              placeholder="trap, hyperpop, r&b"
              className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
            />
          </div>

          {/* Remote OK */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="remoteOk"
              checked={formData.remoteOk}
              onChange={(e) => setFormData({ ...formData, remoteOk: e.target.checked })}
              className="w-5 h-5 dark:border-green-400 border-gray-400"
            />
            <label htmlFor="remoteOk" className="dark:text-green-400 text-gray-700 font-mono">
              REMOTE_OK
            </label>
          </div>

          {/* Location (if not remote) */}
          {!formData.remoteOk && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
                  CITY
                </label>
                <input
                  type="text"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  placeholder="Los Angeles"
                  className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
                  COUNTRY
                </label>
                <input
                  type="text"
                  value={formData.locationCountry}
                  onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                  placeholder="USA"
                  className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              {loading ? 'CREATING...' : 'CREATE_BOUNTY'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
