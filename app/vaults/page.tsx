"use client"

import { VaultsTerminal } from "@/components/vaults-terminal"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VaultsPage() {
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">VAULTS</h1>
          <div className="text-sm font-mono text-green-400/60">PROTOCOL_LAYER</div>
        </div>

        {/* Vaults Terminal */}
        <VaultsTerminal />
      </div>
    </div>
  )
}
