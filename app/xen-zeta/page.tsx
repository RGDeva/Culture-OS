"use client"

import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function OncyberSpace() {
  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      <MatrixBackground />

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-green-400 hover:text-black hover:bg-green-400 font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK_TO_SYSTEM
            </Button>
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">XEN_&_ZETA</h1>
          <Button
            variant="outline"
            className="bg-black/60 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            FULLSCREEN
          </Button>
        </div>

        {/* Embedded Oncyber Space */}
        <div className="w-full h-[80vh] border-2 border-green-400/50 bg-black/20 backdrop-blur-sm">
          <iframe
            width="100%"
            height="100%"
            src="https://oncyber.io/spaces/0iDrQ6Y9V6E8ajq6l5gG?coords=-13.03x2.85x-19.91x-0.00"
            className="w-full h-full"
            title="NoCulture Virtual Space"
          />
        </div>

        {/* Space Info */}
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-mono font-bold mb-4">VIRTUAL_DIMENSION_SPACE</h2>
          <p className="text-green-400/80 font-mono text-sm leading-relaxed mb-6">
            Enter the Xen & Zeta dimension where digital entities converge. Experience NoCulture in immersive 3D
            environments, interact with other consciousness, and discover hidden portals in the metaverse.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-black/40 border border-green-400/30 p-4">
              <div className="text-green-400 font-bold mb-2">CURRENT_DIMENSION</div>
              <div className="text-green-400/80">XEN_PROTOCOL</div>
            </div>
            <div className="bg-black/40 border border-green-400/30 p-4">
              <div className="text-green-400 font-bold mb-2">VISITORS_ONLINE</div>
              <div className="text-green-400/80">42 ENTITIES</div>
            </div>
            <div className="bg-black/40 border border-green-400/30 p-4">
              <div className="text-green-400 font-bold mb-2">NEXT_EVENT</div>
              <div className="text-green-400/80">LIVE_PERFORMANCE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
