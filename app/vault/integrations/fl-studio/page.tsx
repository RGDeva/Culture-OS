'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Check, Download, RefreshCw, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'

export default function FLStudioIntegrationPage() {
  const router = useRouter()
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    lastImport?: string
    deviceName?: string
  } | null>(null)

  useEffect(() => {
    fetchConnectionStatus()
  }, [])

  async function fetchConnectionStatus() {
    try {
      const res = await fetch('/api/bridge/status')
      if (res.ok) {
        const data = await res.json()
        setConnectionStatus(data)
        if (data.deviceToken) {
          setDeviceToken(data.deviceToken)
        }
      }
    } catch (error) {
      console.error('Failed to fetch connection status:', error)
    }
  }

  async function generateToken() {
    setLoading(true)
    try {
      const res = await fetch('/api/bridge/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: 'FL Studio Bridge' })
      })
      
      if (res.ok) {
        const data = await res.json()
        setDeviceToken(data.deviceToken)
        await fetchConnectionStatus()
      } else {
        alert('Failed to generate token. Please try again.')
      }
    } catch (error) {
      alert('Error generating token')
    } finally {
      setLoading(false)
    }
  }

  function copyToken() {
    if (deviceToken) {
      navigator.clipboard.writeText(deviceToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4 border-green-400 text-green-400 hover:bg-green-400/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-400">FL Studio Bridge</h1>
              <p className="text-gray-400 text-sm">Auto-import exports from FL Studio to Vault</p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-400/10 border border-orange-400/20 rounded text-orange-400 text-xs mt-4">
            <AlertCircle className="h-3 w-3" />
            BETA - Local folder watch via NoCulture Bridge
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`p-6 border-2 rounded-xl mb-8 ${
            connectionStatus.connected 
              ? 'border-green-400/30 bg-green-400/5' 
              : 'border-gray-600 bg-gray-900/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {connectionStatus.connected ? (
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {connectionStatus.connected ? 'Connected' : 'Not Connected'}
                  </h3>
                  {connectionStatus.deviceName && (
                    <p className="text-sm text-gray-400">{connectionStatus.deviceName}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={fetchConnectionStatus}
                variant="outline"
                size="sm"
                className="border-green-400/30 text-green-400"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {connectionStatus.lastImport && (
              <div className="text-sm text-gray-400">
                Last import: {new Date(connectionStatus.lastImport).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        <div className="space-y-8">
          {/* Step 1: Download Bridge */}
          <div className="border-2 border-green-400/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-green-400">Download NoCulture Bridge</h3>
                <p className="text-gray-400 mb-4">
                  The Bridge is a lightweight local app that watches your FL Studio export folder and automatically uploads new files to your Vault.
                </p>
                <Link
                  href="/bridge/README.md"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Bridge
                </Link>
              </div>
            </div>
          </div>

          {/* Step 2: Generate Token */}
          <div className="border-2 border-cyan-400/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-cyan-400">Generate Device Token</h3>
                <p className="text-gray-400 mb-4">
                  Create a secure token that allows the Bridge to upload files to your Vault.
                </p>
                
                {!deviceToken ? (
                  <Button
                    onClick={generateToken}
                    disabled={loading}
                    className="bg-cyan-400 text-black font-bold hover:bg-cyan-300"
                  >
                    {loading ? 'Generating...' : 'Generate Token'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-black border border-cyan-400/30 rounded font-mono text-sm break-all">
                      {deviceToken}
                    </div>
                    <Button
                      onClick={copyToken}
                      variant="outline"
                      className="border-cyan-400/30 text-cyan-400"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Token
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Configure Bridge */}
          <div className="border-2 border-purple-400/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-purple-400">Configure Export Folder</h3>
                <p className="text-gray-400 mb-4">
                  Set up the Bridge to watch your FL Studio export folder.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-black border border-purple-400/30 rounded">
                    <p className="text-sm text-gray-400 mb-2">Run these commands in your terminal:</p>
                    <code className="block text-xs text-green-400 space-y-1">
                      <div># Initialize Bridge</div>
                      <div>noculture-bridge init</div>
                      <div className="mt-2"># Start watching folder</div>
                      <div>noculture-bridge start --watch "C:\NoCulture\Exports" --projectId YOUR_PROJECT_ID</div>
                    </code>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p className="mb-2">The Bridge will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Watch for new .wav, .mp3, .flp files</li>
                      <li>Wait for file write to complete (debounced)</li>
                      <li>Extract audio metadata with ffprobe</li>
                      <li>Create a new Version in your Vault</li>
                      <li>Upload files securely</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Export from FL Studio */}
          <div className="border-2 border-yellow-400/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400 font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">Export from FL Studio</h3>
                <p className="text-gray-400 mb-4">
                  Export your tracks to the watched folder and they'll automatically appear in your Vault.
                </p>
                
                <div className="p-4 bg-black border border-yellow-400/30 rounded text-sm text-gray-400">
                  <p className="mb-2">In FL Studio:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>File → Export → Wave file</li>
                    <li>Choose your watched export folder</li>
                    <li>Click Export</li>
                    <li>Check your Vault for the new Version!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 p-6 bg-orange-400/5 border border-orange-400/20 rounded-xl">
          <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Notes
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• The Bridge runs locally on your computer - no cloud processing</li>
            <li>• Keep the Bridge running while working in FL Studio</li>
            <li>• Token can be revoked anytime from your account settings</li>
            <li>• Large files may take a few moments to upload</li>
            <li>• Bridge is currently Windows/Mac only (Linux support coming)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
