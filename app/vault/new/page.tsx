'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'

type OpenRole = {
  label: string
  role: string
  compensationType: 'flat fee' | 'rev share' | 'flat + points' | 'open to offers'
  budgetMin?: number
  budgetMax?: number
  description?: string
}

export default function NewVaultProjectPage() {
  const privyHook = usePrivy()
  const { authenticated, user, login } = privyHook || {}
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [stemsUrl, setStemsUrl] = useState('')
  const [openRoles, setOpenRoles] = useState<OpenRole[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [accessType, setAccessType] = useState<'FREE' | 'PAY_FOR_ACCESS' | 'FLAT_FEE'>('FREE')
  const [accessPrice, setAccessPrice] = useState<number>(0)
  
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl mb-4">&gt; CREATE_PROJECT</h1>
          <p className="text-green-400/60 mb-6">Login to create a new Vault project</p>
          <Button
            onClick={() => login && login()}
            className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
          >
            LOGIN
          </Button>
        </div>
      </div>
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addRole = () => {
    setOpenRoles([...openRoles, { 
      label: '', 
      role: 'ARTIST',
      compensationType: 'rev share',
      description: ''
    }])
  }

  const updateRole = (index: number, field: keyof OpenRole, value: string | number) => {
    const updated = [...openRoles]
    updated[index] = { ...updated[index], [field]: value }
    setOpenRoles(updated)
  }

  const removeRole = (index: number) => {
    setOpenRoles(openRoles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Project title is required')
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Filter out empty roles
      const validRoles = openRoles.filter(role => role.label.trim() !== '')

      const response = await fetch('/api/vault/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: title.trim(),
          tags: tags.length > 0 ? tags : undefined,
          previewUrl: previewUrl.trim() || undefined,
          stemsUrl: stemsUrl.trim() || undefined,
          openRoles: validRoles
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const data = await response.json()
      const projectId = data.project?.id
      console.log('[VAULT_NEW] Project created:', data)

      // Create bounties for each open role
      if (validRoles.length > 0 && projectId) {
        console.log('[VAULT_NEW] Creating bounties for', validRoles.length, 'roles')
        
        for (const role of validRoles) {
          try {
            // Map compensation type to budget type
            let budgetType: 'FLAT_FEE' | 'REV_SHARE' | 'FLAT_PLUS_POINTS' | 'OPEN_TO_OFFERS'
            switch (role.compensationType) {
              case 'flat fee':
                budgetType = 'FLAT_FEE'
                break
              case 'rev share':
                budgetType = 'REV_SHARE'
                break
              case 'flat + points':
                budgetType = 'FLAT_PLUS_POINTS'
                break
              case 'open to offers':
              default:
                budgetType = 'OPEN_TO_OFFERS'
                break
            }

            await fetch('/api/bounties', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId,
                creatorId: user.id,
                title: `${role.label} needed for ${title}`,
                description: role.description || `Looking for a ${role.label} to collaborate on ${title}. ${role.compensationType} compensation.`,
                role: role.role,
                genreTags: tags,
                budgetType,
                budgetMinUSDC: role.budgetMin || null,
                budgetMaxUSDC: role.budgetMax || null,
                remoteOk: true
              })
            })
            
            console.log('[VAULT_NEW] Created bounty for role:', role.label)
          } catch (bountyErr) {
            console.error('[VAULT_NEW] Failed to create bounty for role:', role.label, bountyErr)
            // Don't fail the whole operation if bounty creation fails
          }
        }
      }

      // Redirect to vault or network open collabs
      router.push('/vault')
    } catch (err) {
      console.error('[VAULT_NEW] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">&gt; CREATE_VAULT_PROJECT</h1>
            <p className="text-green-400/60">Upload your work and invite collaborators</p>
          </div>
          <Link href="/vault">
            <Button variant="outline" className="border-green-400 text-green-400 font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" /> CANCEL
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 text-sm font-bold">PROJECT_TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My New Track"
              className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none text-green-400"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2 text-sm font-bold">TAGS</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="trap, hip-hop, etc."
                className="flex-1 p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none text-green-400"
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-green-400/20 border-2 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-green-400/20 border border-green-400/50 text-green-400 flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview URL */}
          <div>
            <label className="block mb-2 text-sm font-bold">PREVIEW_URL</label>
            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://soundcloud.com/..."
              className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none text-green-400"
            />
            <p className="text-xs text-green-400/60 mt-1">Link to preview or demo (SoundCloud, YouTube, etc.)</p>
          </div>

          {/* Stems URL */}
          <div>
            <label className="block mb-2 text-sm font-bold">STEMS_URL</label>
            <input
              type="url"
              value={stemsUrl}
              onChange={(e) => setStemsUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none text-green-400"
            />
            <p className="text-xs text-green-400/60 mt-1">Link to stems, project files, or assets (Drive, Dropbox, etc.)</p>
          </div>

          {/* File Upload */}
          <div className="border-2 border-green-400/30 p-6">
            <FileUpload
              onFilesChange={setUploadedFiles}
              maxFiles={10}
              maxSizeMB={100}
              label="UPLOAD_PROJECT_FILES"
              description="Upload audio, video, images, or project files"
              acceptedTypes={['audio/*', 'video/*', 'image/*', 'application/pdf', '.zip', '.rar', '.wav', '.mp3', '.flac']}
            />
          </div>

          {/* Access Type & Pricing */}
          <div className="border-2 border-pink-400/30 p-6 bg-pink-400/5">
            <h3 className="text-lg font-bold text-pink-400 mb-4">&gt; ACCESS_&_PRICING</h3>
            
            {/* Access Type Selection */}
            <div className="mb-6">
              <label className="block mb-3 text-sm font-bold">ACCESS_TYPE</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAccessType('FREE')
                    setAccessPrice(0)
                  }}
                  className={`p-4 border-2 transition-all ${
                    accessType === 'FREE'
                      ? 'bg-green-400 text-black border-green-400'
                      : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                  }`}
                >
                  <div className="font-bold mb-1">FREE</div>
                  <div className="text-xs opacity-80">Open to everyone</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAccessType('PAY_FOR_ACCESS')}
                  className={`p-4 border-2 transition-all ${
                    accessType === 'PAY_FOR_ACCESS'
                      ? 'bg-green-400 text-black border-green-400'
                      : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                  }`}
                >
                  <div className="font-bold mb-1">PAY_FOR_ACCESS</div>
                  <div className="text-xs opacity-80">One-time unlock fee</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAccessType('FLAT_FEE')}
                  className={`p-4 border-2 transition-all ${
                    accessType === 'FLAT_FEE'
                      ? 'bg-green-400 text-black border-green-400'
                      : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                  }`}
                >
                  <div className="font-bold mb-1">FLAT_FEE</div>
                  <div className="text-xs opacity-80">Purchase project</div>
                </button>
              </div>
            </div>

            {/* Price Input */}
            {(accessType === 'PAY_FOR_ACCESS' || accessType === 'FLAT_FEE') && (
              <div>
                <label className="block mb-2 text-sm font-bold">
                  PRICE (USDC)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={accessPrice}
                  onChange={(e) => setAccessPrice(parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  className="w-full p-3 bg-black border-2 border-green-400/30 focus:border-green-400 outline-none text-green-400"
                />
                <p className="text-xs text-green-400/60 mt-1">
                  {accessType === 'PAY_FOR_ACCESS' 
                    ? 'Users pay once to unlock and access project files'
                    : 'Users purchase full rights to the project'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Open Roles */}
          <div className="border-t-2 border-green-400/20 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-sm font-bold">OPEN_ROLES</label>
                <p className="text-xs text-green-400/60">Collaborator positions you're looking to fill</p>
              </div>
              <Button
                type="button"
                onClick={addRole}
                className="bg-pink-400/20 border-2 border-pink-400/50 text-pink-400 hover:bg-pink-400 hover:text-black font-mono"
              >
                <Plus className="mr-2 h-4 w-4" /> ADD_ROLE
              </Button>
            </div>

            {openRoles.length === 0 ? (
              <div className="p-6 border-2 border-green-400/20 text-center text-green-400/60">
                No open roles yet. Click "ADD_ROLE" to invite collaborators.
              </div>
            ) : (
              <div className="space-y-4">
                {openRoles.map((role, index) => (
                  <div key={index} className="border-2 border-pink-400/30 p-4 space-y-3">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <label className="block text-xs mb-1 text-pink-400">ROLE_TITLE</label>
                        <input
                          type="text"
                          value={role.label}
                          onChange={(e) => updateRole(index, 'label', e.target.value)}
                          placeholder="Mix Engineer, Vocalist, etc."
                          className="w-full p-2 bg-black border border-pink-400/30 focus:border-pink-400 outline-none text-green-400 text-sm"
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs mb-1 text-pink-400">ROLE_TYPE</label>
                        <select
                          value={role.role}
                          onChange={(e) => updateRole(index, 'role', e.target.value)}
                          className="w-full p-2 bg-black border border-pink-400/30 focus:border-pink-400 outline-none text-green-400 text-sm"
                        >
                          <option value="ARTIST">Artist</option>
                          <option value="PRODUCER">Producer</option>
                          <option value="ENGINEER">Engineer</option>
                          <option value="SONGWRITER">Songwriter</option>
                          <option value="MUSICIAN">Musician</option>
                          <option value="STUDIO">Studio</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="mt-6 p-2 text-red-400 hover:bg-red-400/10 border border-red-400/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs mb-1 text-pink-400">DESCRIPTION (optional)</label>
                      <textarea
                        value={role.description || ''}
                        onChange={(e) => updateRole(index, 'description', e.target.value)}
                        placeholder="Describe what you're looking for..."
                        rows={2}
                        className="w-full p-2 bg-black border border-pink-400/30 focus:border-pink-400 outline-none text-green-400 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs mb-1 text-pink-400">COMPENSATION</label>
                        <select
                          value={role.compensationType}
                          onChange={(e) => updateRole(index, 'compensationType', e.target.value as any)}
                          className="w-full p-2 bg-black border border-pink-400/30 focus:border-pink-400 outline-none text-green-400 text-sm"
                        >
                          <option value="flat fee">Flat Fee</option>
                          <option value="rev share">Rev Share</option>
                          <option value="flat + points">Flat + Points</option>
                          <option value="open to offers">Open to Offers</option>
                        </select>
                      </div>

                      {(role.compensationType === 'flat fee' || role.compensationType === 'flat + points') && (
                        <>
                          <div>
                            <label className="block text-xs mb-1 text-pink-400">MIN_BUDGET ($)</label>
                            <input
                              type="number"
                              value={role.budgetMin || ''}
                              onChange={(e) => updateRole(index, 'budgetMin', parseFloat(e.target.value) || 0)}
                              placeholder="100"
                              className="w-full p-2 bg-black border border-pink-400/30 focus:border-pink-400 outline-none text-green-400 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1 text-pink-400">MAX_BUDGET ($)</label>
                            <input
                              type="number"
                              value={role.budgetMax || ''}
                              onChange={(e) => updateRole(index, 'budgetMax', parseFloat(e.target.value) || 0)}
                              placeholder="250"
                              className="w-full p-2 bg-black border border-pink-400/30 focus:border-pink-400 outline-none text-green-400 text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 border-2 border-red-400 bg-red-400/10 text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6">
            <Link href="/vault">
              <Button
                type="button"
                variant="outline"
                className="border-green-400 text-green-400 font-mono"
              >
                CANCEL
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              {isSubmitting ? 'CREATING...' : 'CREATE_PROJECT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
