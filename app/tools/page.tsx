'use client'

import { usePrivy } from '@privy-io/react-auth'
import { ArrowLeft, Link as LinkIcon, CheckCircle, Clock, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import toolsData from '@/data/tools.json'

type Tool = {
  name: string
  pricing: string
  description: string
  category: string
  status: 'active' | 'coming_soon'
  tags: string
}

const tools: Tool[] = toolsData as Tool[]

export default function ToolsPage() {
  const privyHook = usePrivy()
  const { authenticated, login } = privyHook || {}
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPricing, setSelectedPricing] = useState<string>('all')

  const categories = ['all', 'ai', 'analytics', 'distribution', 'royalties', 'licensing', 'metadata', 'marketing', 'collaboration', 'production', 'booking', 'streaming', 'blockchain', 'api']
  const pricingOptions = ['all', 'free', 'freemium', 'paid', 'subscription', 'enterprise']

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    const matchesPricing = selectedPricing === 'all' || tool.pricing === selectedPricing
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesPricing && matchesSearch
  })

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <LinkIcon className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl mb-4">&gt; TOOLS_DIRECTORY</h1>
          <p className="text-green-400/60 mb-6">Login to connect and manage your integrations</p>
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

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">&gt; TOOLS_DIRECTORY</h1>
            <p className="text-green-400/60">Connect platforms and integrate your data</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-green-400 text-green-400 font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" /> HOME
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
            <input
              type="text"
              placeholder="SEARCH_TOOLS (name, description, tags)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="text-xs text-green-400/60 mb-2">CATEGORY</div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs border-2 uppercase font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-green-400 text-black border-green-400'
                    : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Filter */}
        <div className="mb-6">
          <div className="text-xs text-green-400/60 mb-2">PRICING</div>
          <div className="flex flex-wrap gap-2">
            {pricingOptions.map((pricing) => (
              <button
                key={pricing}
                onClick={() => setSelectedPricing(pricing)}
                className={`px-3 py-1 text-xs font-mono border-2 transition-colors ${
                  selectedPricing === pricing
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'bg-black text-cyan-400 border-cyan-400/30 hover:border-cyan-400'
                }`}
              >
                {pricing.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm">
          <span className="text-green-400/60">SHOWING </span>
          <span className="text-green-400 font-bold">{filteredTools.length}</span>
          <span className="text-green-400/60"> / {tools.length} TOOLS</span>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <div
              key={tool.name}
              className="border-2 border-green-400/30 p-6 hover:border-green-400 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{tool.name}</h3>
                {tool.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-400" />
                )}
              </div>

              <p className="text-green-400/60 text-sm mb-4">{tool.description}</p>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs px-2 py-1 border border-green-400/30 text-green-400/60 uppercase">
                  {tool.category}
                </span>
                <span className={`text-xs px-2 py-1 font-bold uppercase ${
                  tool.pricing === 'free' ? 'bg-green-400/20 text-green-400 border border-green-400/50' :
                  tool.pricing === 'freemium' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50' :
                  tool.pricing === 'paid' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50' :
                  tool.pricing === 'subscription' ? 'bg-pink-400/20 text-pink-400 border border-pink-400/50' :
                  tool.pricing === 'enterprise' ? 'bg-purple-400/20 text-purple-400 border border-purple-400/50' :
                  'bg-gray-400/20 text-gray-400 border border-gray-400/50'
                }`}>
                  {tool.pricing}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {tool.status === 'active' ? (
                  <Link href="/onboarding">
                    <Button
                      size="sm"
                      className="bg-green-400 text-black hover:bg-green-300 font-mono text-xs"
                    >
                      CONNECT
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs text-yellow-400 px-2 py-1 border border-yellow-400/50">COMING_SOON</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Guide */}
        <div className="mt-12 border-2 border-cyan-400/30 p-6 bg-cyan-400/5">
          <h2 className="text-xl mb-4 text-cyan-400">&gt; HOW_TO_INTEGRATE</h2>
          <ol className="space-y-3 text-green-400/80 text-sm">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-3 font-bold">1.</span>
              <span>Click CONNECT on any active tool above</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-3 font-bold">2.</span>
              <span>Complete the onboarding flow and add your platform URLs/IDs</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-3 font-bold">3.</span>
              <span>Data will sync automatically in the background</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-3 font-bold">4.</span>
              <span>View your integrated data in Earnings, Network, and Dashboard</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
