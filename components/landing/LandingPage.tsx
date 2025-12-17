'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { 
  ArrowRight, 
  Folder, 
  ShoppingBag, 
  Users, 
  DollarSign,
  Zap,
  Play,
  TrendingUp,
  Scissors,
  Eye,
  Target,
  BarChart3,
  Sparkles,
  Music,
  Mic,
  Radio,
  Layers,
  Brain,
  ChevronRight,
  CheckCircle2,
  Upload,
  GitBranch,
  Rocket,
  Shield,
  Clock,
  FileAudio,
  Settings,
  Workflow,
  Briefcase
} from 'lucide-react'
import { UniversalSearch } from './UniversalSearch'

export function LandingPage() {
  const router = useRouter()
  const { login, authenticated } = usePrivy()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleInitiate = () => {
    if (authenticated) {
      router.push('/dashboard')
    } else {
      login()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg">NoCulture</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/vault" className="hover:text-white transition-colors">Vault</Link>
            <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/earn" className="hover:text-white transition-colors">Earn</Link>
            <Link href="/network" className="hover:text-white transition-colors">Network</Link>
          </div>
          <button
            onClick={handleInitiate}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
          >
            {authenticated ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-full text-green-400 text-sm mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Sparkles className="h-4 w-4" />
            <span>Vault + Workspace for Creative Teams</span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Find collaborators.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-green-400">Launch ideas.</span><br />
            Turn signal into revenue.
          </h1>

          {/* Subheadline */}
          <p className={`text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            NoCulture OS is the vault + workspace for creative teams—organize projects, commission work, and get paid with splits, contracts, and instant payouts.
          </p>

          {/* AI Search Bar */}
          <div className={`mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <UniversalSearch />
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleInitiate}
              className="group px-8 py-4 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-green-400/25 transition-all flex items-center gap-2"
            >
              Request Demo
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleInitiate}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-all"
            >
              Join Beta
            </button>
          </div>

          {/* Small text below CTAs */}
          <p className={`text-sm text-gray-500 mb-8 transition-all duration-1000 delay-450 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Audio Vault is in Beta. FL Studio sync is in Preview.
          </p>

          {/* Trust Indicators */}
          <div className={`flex items-center justify-center gap-8 text-sm text-gray-500 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>Email or wallet login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>Instant payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>Free to start</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Flow Strip */}
      <section className="relative z-10 px-6 py-16 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-sm text-green-400 font-mono mb-2">STEP 1</div>
              <h3 className="text-lg font-bold mb-2">Dump files + briefs</h3>
              <p className="text-sm text-gray-400">
                Upload stems, contracts, project files, and creative briefs
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GitBranch className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="text-sm text-cyan-400 font-mono mb-2">STEP 2</div>
              <h3 className="text-lg font-bold mb-2">Vault organizes + versions</h3>
              <p className="text-sm text-gray-400">
                Auto-organize by project, version timeline, and collaborators
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-sm text-purple-400 font-mono mb-2">STEP 3</div>
              <h3 className="text-lg font-bold mb-2">Launch + settle payouts</h3>
              <p className="text-sm text-gray-400">
                Commission work, run campaigns, and settle splits instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vault (Beta) Section */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-400/10 border border-green-400/20 rounded-full text-green-400 text-xs font-medium mb-6">
                <Folder className="h-3 w-3" />
                BETA
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Audio + Project Vault
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Your creative source of truth. Organize files, manage versions, and collaborate with your team—all in one place.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Drag/drop exports, stems, contracts, briefs</p>
                    <p className="text-sm text-gray-500">Upload any file type, organize automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Auto-organize by project + version timeline</p>
                    <p className="text-sm text-gray-500">Track every revision with automatic versioning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Invite collaborators, permissions, approvals</p>
                    <p className="text-sm text-gray-500">Control who sees and edits what</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Splits + agreements attached to the project</p>
                    <p className="text-sm text-gray-500">Revenue sharing built into every file</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Sell packs, stems, and deliverables with instant unlocks</p>
                    <p className="text-sm text-gray-500">Monetize your work with secure, instant payments</p>
                  </div>
                </div>
              </div>

              <Link
                href="/vault"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 rounded-xl text-green-400 font-medium transition-all"
              >
                Open Vault
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
                <div className="text-center">
                  <Folder className="h-24 w-24 text-green-400/50 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Vault interface preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAW Integrations Section */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5 bg-gradient-to-b from-transparent via-cyan-400/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-xs font-medium mb-6">
              <Settings className="h-3 w-3" />
              PREVIEW
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">DAW Integrations</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Sync your projects directly from your DAW. No more manual exports.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* FL Studio */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">FL Studio</h3>
              <p className="text-sm text-gray-400 mb-3">
                One-click sync from FL Studio to your Vault
              </p>
              <div className="inline-flex items-center gap-1 text-xs text-orange-400 font-mono">
                <Clock className="h-3 w-3" />
                Preview
              </div>
            </div>

            {/* Ableton */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl opacity-50">
              <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Ableton Live</h3>
              <p className="text-sm text-gray-400 mb-3">
                Coming soon
              </p>
              <div className="inline-flex items-center gap-1 text-xs text-gray-500 font-mono">
                Roadmap
              </div>
            </div>

            {/* Logic Pro */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl opacity-50">
              <div className="w-12 h-12 bg-purple-400/10 rounded-xl flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Logic Pro</h3>
              <p className="text-sm text-gray-400 mb-3">
                Coming soon
              </p>
              <div className="inline-flex items-center gap-1 text-xs text-gray-500 font-mono">
                Roadmap
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work + Earn Section */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Work + Earn</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Commission services, run campaigns, and get paid instantly—no middlemen, no delays.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Work (Bounties + Services) */}
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Work</h3>
              <p className="text-gray-400 mb-6">
                Post bounties, hire for services, and commission work. Set your terms, escrow payments, and release on delivery.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-300">Mixing, mastering, production services</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-300">Beat placements and challenges</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-300">Fast payouts for collaborators when work is approved</span>
                </div>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-cyan-400 font-medium hover:gap-3 transition-all"
              >
                Browse services
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Earn (Campaigns + Payouts) */}
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Earn</h3>
              <p className="text-gray-400 mb-6">
                Run content campaigns, pay creators per view or conversion, and settle payouts instantly. Performance-based rewards.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">UGC + clipping campaigns</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Pay per view or conversion</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Instant payouts, no gatekeepers</span>
                </div>
              </div>
              <Link
                href="/earn"
                className="inline-flex items-center gap-2 text-green-400 font-medium hover:gap-3 transition-all"
              >
                View campaigns
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Section (Reframed) */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One Product, Three Surfaces</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Vault, Work, and Earn work together as a unified system for creative teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Vault */}
            <Link href="/vault" className="group">
              <div className="h-full p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-green-400/30 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Folder className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Vault</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Manage files, stems, projects, collaborators, and splits. Your creative headquarters.
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <span>Open Vault</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Marketplace */}
            <Link href="/marketplace" className="group">
              <div className="h-full p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-cyan-400/30 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Marketplace</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Sell beats, services, packs, and access. Direct transactions, instant payouts.
                </p>
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                  <span>Browse Market</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Network */}
            <Link href="/network" className="group">
              <div className="h-full p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-400/30 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 bg-purple-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Network</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Discover creatives, studios, and opportunities. Find your next collaborator.
                </p>
                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                  <span>Explore Network</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Earn With NoCulture Section */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent via-green-400/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-400/10 border border-green-400/20 rounded-full text-green-400 text-xs font-medium mb-6">
                <DollarSign className="h-3 w-3" />
                EARN WITH NOCULTURE
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Turn content into income
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Artists post clipping bounties. Fans and creators submit clips. Earn based on views, conversions, and sales. Performance-based payouts, no gatekeepers.
              </p>

              {/* Earning Methods */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="p-2 bg-green-400/10 rounded-lg">
                    <Scissors className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Clipping Bounties</h4>
                    <p className="text-sm text-gray-400">Clip and share artist content. Earn per view or conversion.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="p-2 bg-cyan-400/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sales Commissions</h4>
                    <p className="text-sm text-gray-400">Earn commission on beat sales, services, and drops you promote.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="p-2 bg-purple-400/10 rounded-lg">
                    <Eye className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">View-Based Rewards</h4>
                    <p className="text-sm text-gray-400">Get paid for driving attention to releases and campaigns.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/earn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-green-400/25 transition-all"
              >
                Browse Campaigns
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-2">$2,450</div>
                  <div className="text-gray-400 text-sm">Example: Earned this month</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-400/10 rounded-lg flex items-center justify-center">
                        <Scissors className="h-4 w-4 text-green-400" />
                      </div>
                      <span className="text-sm">Clipping Bounties</span>
                    </div>
                    <span className="text-green-400 font-semibold">$1,200</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                        <Music className="h-4 w-4 text-cyan-400" />
                      </div>
                      <span className="text-sm">Beat Sales</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">$850</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-400/10 rounded-lg flex items-center justify-center">
                        <Mic className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-sm">Services</span>
                    </div>
                    <span className="text-purple-400 font-semibold">$400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-xs font-medium mb-4">
                <Zap className="h-3 w-3" />
                FEATURED CAMPAIGNS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Start Earning Today</h2>
            </div>
            <Link
              href="/earn"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
            >
              View All Campaigns
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Campaign Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Campaign 1: Joyner Lucas */}
            <Link href="/earn/campaign/sample-joyner-lucas-corleone" className="group">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-green-400/30 rounded-2xl overflow-hidden transition-all">
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-400/20 text-green-400 text-xs font-bold rounded">
                    OPEN
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-400/10 text-purple-400 text-xs rounded">CONTENT REWARDS</span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-green-400 transition-colors">Joyner Lucas — "Corleone" Clipping</h3>
                  <p className="text-sm text-gray-500 mb-3">Earn $2 per 1,000 views</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-green-400 font-semibold">$1,000 budget</span>
                    <span>TikTok, IG, YT</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Campaign 2: Beat Placement */}
            <Link href="/earn/campaign/sample-beat-placement-challenge" className="group">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-cyan-400/30 rounded-2xl overflow-hidden transition-all">
                <div className="h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 relative">
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-400/20 text-green-400 text-xs font-bold rounded">
                    OPEN
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 text-xs rounded">OPPORTUNITY</span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-cyan-400 transition-colors">Beat Placement Challenge</h3>
                  <p className="text-sm text-gray-500 mb-3">Top 3 win cash + feature</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-cyan-400 font-semibold">$2,500 in prizes</span>
                    <span>Leaderboard</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Campaign 3: Affiliate */}
            <Link href="/earn/campaign/sample-producer-pack-affiliate" className="group">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-orange-400/30 rounded-2xl overflow-hidden transition-all">
                <div className="h-32 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 relative">
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-400/20 text-green-400 text-xs font-bold rounded">
                    OPEN
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-orange-400/10 text-orange-400 text-xs rounded">AFFILIATE</span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-orange-400 transition-colors">Producer Pack — 15% Commission</h3>
                  <p className="text-sm text-gray-500 mb-3">Earn on every sale you drive</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-orange-400 font-semibold">15% per sale</span>
                    <span>All platforms</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/earn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
            >
              View All Campaigns
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem Section (Below the Fold) */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5 bg-gradient-to-b from-transparent via-purple-400/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-400/10 border border-purple-400/20 rounded-full text-purple-400 text-xs font-medium mb-6">
              <Layers className="h-3 w-3" />
              ECOSYSTEM
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Web3</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              NoCulture OS integrates with onchain tools and protocols to enable instant settlements, transparent splits, and programmable rights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Dreamster */}
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-12 h-12 bg-purple-400/10 rounded-xl flex items-center justify-center mb-6">
                <Radio className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Dreamster</h3>
              <p className="text-gray-400 mb-6">
                Launch music drops with built-in fan engagement, streaming rewards, and onchain collectibles. Integrated directly into your Vault.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Streaming + ownership in one</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Fan rewards & engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Onchain collectibles</span>
                </div>
              </div>
            </div>

            {/* WaveWarZ */}
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">WaveWarZ</h3>
              <p className="text-gray-400 mb-6">
                Competitive music battles where fans vote and creators earn. Prove demand before you drop, build hype, and reward your community.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-400" />
                  <span>Battle system with voting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-400" />
                  <span>Validate demand pre-release</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-400" />
                  <span>Community rewards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Web3 Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
              <Shield className="h-8 w-8 text-green-400 mb-3" />
              <h4 className="font-semibold mb-2">Instant Settlements</h4>
              <p className="text-sm text-gray-500">Payouts settle onchain in seconds, not weeks</p>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
              <GitBranch className="h-8 w-8 text-cyan-400 mb-3" />
              <h4 className="font-semibold mb-2">Smart Splits</h4>
              <p className="text-sm text-gray-500">Revenue sharing programmed into every file</p>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
              <Workflow className="h-8 w-8 text-purple-400 mb-3" />
              <h4 className="font-semibold mb-2">Transparent Rights</h4>
              <p className="text-sm text-gray-500">Onchain proof of ownership and licensing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Directory */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tools Directory</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A complete toolkit for every stage of your creative journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Creation */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <Layers className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold">Creation</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Vault (Projects & Files)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Collaboration Tools
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Version Control
                </li>
              </ul>
            </div>

            {/* Growth */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-400/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold">Growth</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  WaveWarZ Battles
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Clipping Campaigns
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Network Discovery
                </li>
              </ul>
            </div>

            {/* Monetization */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Monetization</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  Marketplace Sales
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  Dreamster Drops
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  Earnings Dashboard
                </li>
              </ul>
            </div>

            {/* Intelligence */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-400/10 rounded-lg">
                  <Brain className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="font-semibold">Intelligence</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  AI Recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  Analytics & Insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  Smart Matching
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-all"
            >
              View All Tools
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Not a beat store.<br />
            <span className="text-gray-500">An operating system.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Unlike Airbit or Traktrain, NoCulture OS is a complete infrastructure for creative economies—connecting people, projects, and payments in one unified system.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <div className="text-green-400 font-semibold mb-2">Beyond Transactions</div>
              <p className="text-sm text-gray-500">Manage entire projects, not just sales. Collaborate, version, and split—all in one place.</p>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold mb-2">Performance-Based Earning</div>
              <p className="text-sm text-gray-500">Earn through clipping bounties and commissions, not just direct sales.</p>
            </div>
            <div>
              <div className="text-purple-400 font-semibold mb-2">AI-Powered Discovery</div>
              <p className="text-sm text-gray-500">Find the right people and opportunities with intelligent search and matching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-purple-400/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join the operating system for modern music creation and monetization.
              </p>
              <button
                onClick={handleInitiate}
                className="group px-8 py-4 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-green-400/25 transition-all flex items-center gap-2 mx-auto"
              >
                INITIATE PROTOCOL
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-cyan-400 rounded-md flex items-center justify-center">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <span>© 2025 NoCulture Studios</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/network" className="hover:text-white transition-colors">Network</Link>
            <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <span className="text-xs">Instant unlocks powered by x402</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
