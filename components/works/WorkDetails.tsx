'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Save, X, ExternalLink } from 'lucide-react'

interface WorkDetailsProps {
  work: any
  onUpdate: (updates: any) => Promise<void>
}

export function WorkDetails({ work, onUpdate }: WorkDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: work.title,
    status: work.status,
    isrc: work.isrc || '',
    iswc: work.iswc || '',
    releaseDate: work.releaseDate ? new Date(work.releaseDate).toISOString().split('T')[0] : '',
    label: work.label || '',
    distributor: work.distributor || '',
    spotifyUrl: work.spotifyUrl || '',
    appleMusicUrl: work.appleMusicUrl || '',
  })

  const handleSave = async () => {
    await onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      title: work.title,
      status: work.status,
      isrc: work.isrc || '',
      iswc: work.iswc || '',
      releaseDate: work.releaseDate ? new Date(work.releaseDate).toISOString().split('T')[0] : '',
      label: work.label || '',
      distributor: work.distributor || '',
      spotifyUrl: work.spotifyUrl || '',
      appleMusicUrl: work.appleMusicUrl || '',
    })
    setIsEditing(false)
  }

  const vaultAssetIds = JSON.parse(work.vaultAssetIds || '[]')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-2xl font-bold font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
            />
          ) : (
            <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
              &gt; {work.title}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                size="sm"
                className="font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                SAVE
              </Button>
              <Button
                onClick={handleCancel}
                size="sm"
                variant="outline"
                className="font-mono dark:border-red-400/50 border-red-600/50 dark:text-red-400 text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                CANCEL
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
              className="font-mono dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              EDIT
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-bold font-mono dark:text-green-400 text-green-700 mb-2">
          &gt; STATUS
        </label>
        {isEditing ? (
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
          >
            <option value="IDEA">IDEA</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RELEASED">RELEASED</option>
            <option value="CATALOGED">CATALOGED</option>
          </select>
        ) : (
          <div className="px-3 py-2 font-mono text-sm border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5 dark:text-green-400 text-green-700">
            {work.status}
          </div>
        )}
      </div>

      {/* Owner */}
      <div>
        <label className="block text-xs font-bold font-mono dark:text-green-400 text-green-700 mb-2">
          &gt; OWNER
        </label>
        <div className="px-3 py-2 font-mono text-sm border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5 dark:text-green-400 text-green-700">
          {work.owner?.displayName || work.owner?.email || 'Unknown'}
        </div>
      </div>

      {/* Linked Vault Assets */}
      {vaultAssetIds.length > 0 && (
        <div>
          <label className="block text-xs font-bold font-mono dark:text-green-400 text-green-700 mb-2">
            &gt; LINKED_VAULT_ASSETS
          </label>
          <div className="space-y-1">
            {vaultAssetIds.map((assetId: string) => (
              <div
                key={assetId}
                className="px-3 py-2 font-mono text-xs border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5 dark:text-green-400/70 text-green-700/80"
              >
                {assetId}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Release Metadata */}
      <div className="border-t-2 dark:border-green-400/30 border-green-600/30 pt-6">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-4">
          &gt; RELEASE_METADATA
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* ISRC */}
          <div>
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              ISRC
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.isrc}
                onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                placeholder="US-XXX-XX-XXXXX"
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                {work.isrc || '—'}
              </div>
            )}
          </div>

          {/* ISWC */}
          <div>
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              ISWC
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.iswc}
                onChange={(e) => setFormData({ ...formData, iswc: e.target.value })}
                placeholder="T-XXX.XXX.XXX-X"
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                {work.iswc || '—'}
              </div>
            )}
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              RELEASE_DATE
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                {work.releaseDate ? new Date(work.releaseDate).toLocaleDateString() : '—'}
              </div>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              LABEL
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Label name"
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                {work.label || '—'}
              </div>
            )}
          </div>

          {/* Distributor */}
          <div className="col-span-2">
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              DISTRIBUTOR
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.distributor}
                onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
                placeholder="DistroKid, TuneCore, etc."
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                {work.distributor || '—'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DSP Links */}
      <div className="border-t-2 dark:border-green-400/30 border-green-600/30 pt-6">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-4">
          &gt; DSP_LINKS
        </h3>
        <div className="space-y-3">
          {/* Spotify */}
          <div>
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              SPOTIFY
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.spotifyUrl}
                onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                placeholder="https://open.spotify.com/track/..."
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : work.spotifyUrl ? (
              <a
                href={work.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-sm font-mono dark:text-cyan-400 text-cyan-700 hover:underline"
              >
                {work.spotifyUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                —
              </div>
            )}
          </div>

          {/* Apple Music */}
          <div>
            <label className="block text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
              APPLE_MUSIC
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.appleMusicUrl}
                onChange={(e) => setFormData({ ...formData, appleMusicUrl: e.target.value })}
                placeholder="https://music.apple.com/..."
                className="w-full px-2 py-1 text-sm font-mono border dark:border-green-400/30 border-green-600/30 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none"
              />
            ) : work.appleMusicUrl ? (
              <a
                href={work.appleMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-sm font-mono dark:text-cyan-400 text-cyan-700 hover:underline"
              >
                {work.appleMusicUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <div className="px-2 py-1 text-sm font-mono dark:text-green-400/70 text-green-700/80">
                —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
