'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Mail, Users, Trash2, Check, X, Clock, AlertCircle } from 'lucide-react'

interface Collaborator {
  id: string
  userId: string
  role: string
  splitPercentage: number
  canEdit: boolean
  invitedAt: string
}

interface Invitation {
  id: string
  email: string
  role: string
  splitPercentage: number
  status: string
  expiresAt: string
  createdAt: string
}

interface CollaboratorManagerProps {
  projectId: string
}

export function CollaboratorManager({ projectId }: CollaboratorManagerProps) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  
  // Invite form state
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('COLLABORATOR')
  const [splitPercentage, setSplitPercentage] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCollaborators()
  }, [projectId])

  async function fetchCollaborators() {
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators/invite`)
      if (res.ok) {
        const data = await res.json()
        setCollaborators(data.collaborators || [])
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to fetch collaborators:', error)
    }
  }

  async function sendInvitation() {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          splitPercentage,
          message: message || undefined
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Invitation sent to ${email}!\n\nInvitation link: ${data.invitation.invitationUrl}`)
        setShowInviteModal(false)
        setEmail('')
        setMessage('')
        setSplitPercentage(0)
        await fetchCollaborators()
      } else {
        const error = await res.json()
        alert(`Failed to send invitation: ${error.error}`)
      }
    } catch (error) {
      alert('Error sending invitation')
    } finally {
      setLoading(false)
    }
  }

  const totalSplit = collaborators.reduce((sum, c) => sum + (c.splitPercentage || 0), 0) + 
                     invitations.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + (i.splitPercentage || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-green-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Collaborators</h2>
            <p className="text-sm text-gray-400">Manage project access and contract splits</p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors inline-flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite Collaborator
        </button>
      </div>

      {/* Contract Split Summary */}
      {totalSplit > 0 && (
        <div className="p-4 bg-purple-400/10 border border-purple-400/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Total Contract Split Allocated:</span>
            <span className={`text-lg font-bold ${totalSplit > 100 ? 'text-red-400' : 'text-green-400'}`}>
              {totalSplit}%
            </span>
          </div>
          {totalSplit > 100 && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Warning: Total split exceeds 100%
            </p>
          )}
        </div>
      )}

      {/* Active Collaborators */}
      <div className="border border-green-400/30 rounded-lg overflow-hidden">
        <div className="bg-green-400/10 px-4 py-3 border-b border-green-400/30">
          <h3 className="font-bold text-green-400">Active Collaborators ({collaborators.length})</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {collaborators.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No collaborators yet. Invite someone to get started!
            </div>
          ) : (
            collaborators.map((collab) => (
              <div key={collab.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{collab.userId}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-400 rounded text-xs">
                            {collab.role}
                          </span>
                          {collab.splitPercentage > 0 && (
                            <span className="text-purple-400">{collab.splitPercentage}% split</span>
                          )}
                          <span>•</span>
                          <span>Joined {new Date(collab.invitedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {collab.canEdit && (
                      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded">Can Edit</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="border border-yellow-400/30 rounded-lg overflow-hidden">
          <div className="bg-yellow-400/10 px-4 py-3 border-b border-yellow-400/30">
            <h3 className="font-bold text-yellow-400">Pending Invitations ({invitations.length})</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {invitations.map((invite) => (
              <div key={invite.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{invite.email}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-400 rounded text-xs">
                            {invite.role}
                          </span>
                          {invite.splitPercentage > 0 && (
                            <span className="text-purple-400">{invite.splitPercentage}% split</span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {invite.status === 'PENDING' && <Clock className="h-3 w-3" />}
                            {invite.status === 'ACCEPTED' && <Check className="h-3 w-3 text-green-400" />}
                            {invite.status === 'DECLINED' && <X className="h-3 w-3 text-red-400" />}
                            {invite.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-green-400 max-w-lg w-full p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-400">Invite Collaborator</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-green-400 focus:outline-none"
                >
                  <option value="VIEWER">Viewer (Read-only)</option>
                  <option value="COLLABORATOR">Collaborator (Can edit)</option>
                  <option value="ADMIN">Admin (Full access)</option>
                </select>
              </div>

              {/* Contract Split */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Split (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={splitPercentage}
                  onChange={(e) => setSplitPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-green-400 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Remaining: {100 - totalSplit - splitPercentage}%
                </p>
              </div>

              {/* Personal Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note to your invitation..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-green-400 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={sendInvitation}
                  disabled={loading || !email}
                  className="flex-1 px-6 py-3 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-6 py-3 border border-gray-700 text-gray-300 rounded hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
