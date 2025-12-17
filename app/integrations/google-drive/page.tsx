'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, FolderOpen, Play, Zap, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface DriveIntegration {
  connected: boolean
  email?: string
  folderId?: string
  folderName?: string
  continuousSync?: boolean
  lastSyncAt?: string
  status?: string
}

export default function GoogleDriveIntegrationPage() {
  const [integration, setIntegration] = useState<DriveIntegration | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [folders, setFolders] = useState<any[]>([])

  useEffect(() => {
    fetchIntegrationStatus()
  }, [])

  async function fetchIntegrationStatus() {
    try {
      const projectId = 'demo-project-1'
      const res = await fetch(`/api/integrations/google-drive/status?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setIntegration({
          connected: data.connected,
          email: data.email,
          folderId: data.syncConfig?.folderId,
          folderName: data.syncConfig?.folderName,
          continuousSync: data.syncConfig?.enabled || false,
          lastSyncAt: data.syncConfig?.lastSyncAt,
          status: data.status
        })
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error)
    }
  }

  async function connectDrive() {
    console.log('Connect Drive button clicked')
    setLoading(true)
    try {
      console.log('Fetching auth URL...')
      const res = await fetch('/api/integrations/google-drive/auth')
      console.log('Response status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Auth data:', data)
        
        if (data.authUrl) {
          console.log('Redirecting to:', data.authUrl)
          window.location.href = data.authUrl
        } else {
          console.error('No authUrl in response')
          alert('No auth URL returned from server')
          setLoading(false)
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Auth error:', errorData)
        alert(`Failed to start OAuth flow: ${errorData.error}`)
        setLoading(false)
      }
    } catch (error) {
      console.error('OAuth error:', error)
      alert(`Failed to start OAuth flow: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  async function loadFolders() {
    try {
      const res = await fetch('/api/integrations/google-drive/folders')
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
        setShowFolderPicker(true)
      }
    } catch (error) {
      alert('Failed to load folders')
    }
  }

  async function selectFolder(folderId: string, folderName: string) {
    setLoading(true)
    try {
      // For demo, using a default project ID - in production, let user select project
      const projectId = 'demo-project-1'
      
      const res = await fetch('/api/integrations/google-drive/select-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, folderName, projectId })
      })
      
      if (res.ok) {
        setShowFolderPicker(false)
        await fetchIntegrationStatus()
        alert('Folder selected! You can now run an import.')
      } else {
        const data = await res.json()
        alert(`Failed to select folder: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Failed to select folder')
    } finally {
      setLoading(false)
    }
  }

  async function runImport() {
    setSyncing(true)
    try {
      const projectId = 'demo-project-1'
      
      const res = await fetch('/api/integrations/google-drive/import-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      
      if (res.ok) {
        const data = await res.json()
        alert(`Import started! Job ID: ${data.jobId}\n\nFiles are being imported in the background. Check back in a moment.`)
        await fetchIntegrationStatus()
      } else {
        const data = await res.json()
        alert(`Failed to start import: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Error starting import')
    } finally {
      setSyncing(false)
    }
  }

  async function toggleContinuousSync() {
    try {
      const res = await fetch('/api/integrations/google-drive/toggle-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !integration?.continuousSync })
      })
      
      if (res.ok) {
        await fetchIntegrationStatus()
      }
    } catch (error) {
      alert('Failed to toggle sync')
    }
  }

  async function disconnect() {
    if (!confirm('Disconnect Google Drive? This will not delete imported files.')) return
    
    try {
      const res = await fetch('/api/integrations/google-drive/disconnect', {
        method: 'POST'
      })
      
      if (res.ok) {
        setIntegration(null)
      }
    } catch (error) {
      alert('Failed to disconnect')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/vault"
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 rounded transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-400">Google Drive Sync</h1>
              <p className="text-gray-400 text-sm">Import files from Google Drive to your Vault</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {integration?.connected ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="p-6 border-2 border-green-400/30 bg-green-400/5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="font-bold text-lg">Connected</h3>
                    <p className="text-sm text-gray-400">{integration.email}</p>
                  </div>
                </div>
                <button
                  onClick={fetchIntegrationStatus}
                  className="px-3 py-2 border border-green-400/30 text-green-400 rounded hover:bg-green-400/10 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              
              {integration.lastSyncAt && (
                <div className="text-sm text-gray-400">
                  Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Selected Folder */}
            {integration.folderId ? (
              <div className="p-6 border-2 border-cyan-400/30 rounded-xl">
                <h3 className="font-bold text-cyan-400 mb-3">Selected Folder</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-cyan-400" />
                    <span>{integration.folderName || 'Unnamed Folder'}</span>
                  </div>
                  <button
                    onClick={loadFolders}
                    className="px-3 py-2 border border-cyan-400/30 text-cyan-400 rounded hover:bg-cyan-400/10 transition-colors text-sm"
                  >
                    Change Folder
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-yellow-400/30 bg-yellow-400/5 rounded-xl">
                <h3 className="font-bold text-yellow-400 mb-3">Select a Folder</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Choose a Google Drive folder to sync with your Vault
                </p>
                <button
                  onClick={loadFolders}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-bold hover:bg-yellow-300 rounded transition-colors"
                >
                  <FolderOpen className="h-4 w-4" />
                  Select Folder
                </button>
              </div>
            )}

            {/* Sync Controls */}
            {integration.folderId && (
              <div className="p-6 border-2 border-purple-400/30 rounded-xl">
                <h3 className="font-bold text-purple-400 mb-4">Sync Controls</h3>
                
                <div className="space-y-4">
                  {/* Continuous Sync Toggle */}
                  <div className="flex items-center justify-between p-4 bg-black border border-purple-400/30 rounded">
                    <div>
                      <p className="font-medium">Continuous Sync</p>
                      <p className="text-sm text-gray-400">Automatically sync changes from Drive</p>
                    </div>
                    <button
                      onClick={toggleContinuousSync}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        integration.continuousSync ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integration.continuousSync ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </div>

                  {/* Manual Import Button */}
                  <button
                    onClick={runImport}
                    disabled={syncing}
                    className="w-full px-6 py-3 bg-purple-400 text-black font-bold hover:bg-purple-300 rounded transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run Import Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Disconnect */}
            <div className="p-6 border-2 border-red-400/30 rounded-xl">
              <h3 className="font-bold text-red-400 mb-3">Disconnect</h3>
              <p className="text-gray-400 text-sm mb-4">
                Remove Google Drive integration. Imported files will remain in your Vault.
              </p>
              <button
                onClick={disconnect}
                className="px-4 py-2 border border-red-400/30 text-red-400 hover:bg-red-400/10 rounded transition-colors"
              >
                Disconnect Google Drive
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connect Card */}
            <div className="p-8 border-2 border-green-400/30 rounded-xl text-center">
              <FolderOpen className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Connect Google Drive</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Sync audio files, stems, and project files from your Google Drive directly to your Vault.
              </p>
              <button
                onClick={connectDrive}
                disabled={loading}
                className="px-8 py-4 bg-green-400 text-black font-bold hover:bg-green-300 rounded transition-colors text-lg disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Google Drive'}
              </button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-green-400/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-400 mb-2" />
                <h4 className="font-bold mb-1">Secure OAuth</h4>
                <p className="text-sm text-gray-400">Industry-standard authentication</p>
              </div>
              <div className="p-4 border border-cyan-400/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 mb-2" />
                <h4 className="font-bold mb-1">Selective Sync</h4>
                <p className="text-sm text-gray-400">Choose specific folders to sync</p>
              </div>
              <div className="p-4 border border-purple-400/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-purple-400 mb-2" />
                <h4 className="font-bold mb-1">Auto-Dedup</h4>
                <p className="text-sm text-gray-400">No duplicate imports</p>
              </div>
              <div className="p-4 border border-yellow-400/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-yellow-400 mb-2" />
                <h4 className="font-bold mb-1">Metadata Extraction</h4>
                <p className="text-sm text-gray-400">Audio info auto-detected</p>
              </div>
            </div>
          </div>
        )}

        {/* Folder Picker Modal */}
        {showFolderPicker && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-cyan-400 max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-cyan-400">Select Folder</h2>
                <button
                  onClick={() => setShowFolderPicker(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => selectFolder(folder.id, folder.name)}
                    disabled={loading}
                    className="w-full p-4 border border-cyan-400/30 rounded hover:bg-cyan-400/10 transition-colors text-left flex items-center gap-3"
                  >
                    <FolderOpen className="h-5 w-5 text-cyan-400" />
                    <span>{folder.name}</span>
                  </button>
                ))}
                
                {folders.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No folders found. Create a folder in Google Drive first.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drive Agent (Experimental) */}
        <div className="mt-8 p-6 bg-purple-400/5 border border-purple-400/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-purple-400" />
            <h3 className="font-bold text-purple-400">Drive Agent (Experimental)</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Advanced users can use the Drive Agent CLI to search and selectively import files using natural language queries. The agent runs locally and uses MCP (Model Context Protocol) for intelligent file selection.
          </p>
          <div className="p-4 bg-black border border-purple-400/30 rounded text-sm font-mono text-gray-400">
            <div># Install Drive Agent</div>
            <div>npm install -g @noculture/drive-agent</div>
            <div className="mt-2"># Authenticate</div>
            <div>drive-agent auth</div>
            <div className="mt-2"># Search and import</div>
            <div>drive-agent search "audio files from last week"</div>
            <div>drive-agent import --fileIds abc123,def456 --projectId YOUR_PROJECT_ID</div>
          </div>
          <a
            href="/docs/drive-agent"
            className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 text-sm"
          >
            Learn more about Drive Agent
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Important Notes */}
        <div className="mt-8 p-6 bg-orange-400/5 border border-orange-400/20 rounded-xl">
          <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Notes
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Only files in the selected folder will be synced</li>
            <li>• Supported formats: .wav, .mp3, .flac, .aiff, .m4a, .flp, .pdf, .txt</li>
            <li>• Large files may take time to import</li>
            <li>• Tokens are encrypted and stored securely</li>
            <li>• You can revoke access anytime from Google account settings</li>
            <li>• Continuous sync checks for changes every 5 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
