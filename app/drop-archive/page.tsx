"use client"

import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, ExternalLink, TrendingUp } from "lucide-react"
import Link from "next/link"

const releases = [
  {
    id: 1,
    title: "VOID_TRANSMISSION_001",
    artist: "CIPHER_404",
    coverArt: "/images/bxrst-logo.webp",
    releaseDate: "2025.01.15",
    type: "EP",
    tracks: 4,
    lore: "Intercepted signals from the digital underground. Each track is a fragment of corrupted data, reconstructed into sonic rebellion.",
    streamingLinks: ["Spotify", "Apple Music", "Bandcamp"],
    web3Data: {
      bondingCurve: "$0.42",
      holders: 127,
      volume: "2.3 ETH",
    },
  },
  {
    id: 2,
    title: "SYSTEM_BREACH",
    artist: "NULL_ENTITY",
    coverArt: "/placeholder.svg?height=400&width=400",
    releaseDate: "2024.12.08",
    type: "Single",
    tracks: 1,
    lore: "A sonic virus designed to crash the mainstream. Warning: May cause existential glitches.",
    streamingLinks: ["SoundCloud", "Audius"],
    web3Data: {
      bondingCurve: "$1.23",
      holders: 89,
      volume: "1.7 ETH",
    },
  },
  {
    id: 3,
    title: "GHOST_IN_THE_SHELL",
    artist: "GHOST_PROTOCOL",
    coverArt: "/placeholder.svg?height=400&width=400",
    releaseDate: "2024.11.22",
    type: "Album",
    tracks: 12,
    lore: "Phantom frequencies from parallel dimensions. Each listen reveals new layers of hidden meaning.",
    streamingLinks: ["Spotify", "YouTube Music"],
    web3Data: {
      bondingCurve: "$2.15",
      holders: 203,
      volume: "4.1 ETH",
    },
  },
]

export default function DropArchive() {
  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      <MatrixBackground />

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <Button variant="ghost" className="text-green-400 hover:text-black hover:bg-green-400 font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK_TO_SYSTEM
            </Button>
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">DROP_ARCHIVE</h1>
          <div className="text-sm font-mono text-green-400/60">{releases.length} RELEASES_INDEXED</div>
        </div>

        {/* Releases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {releases.map((release) => (
            <Card
              key={release.id}
              className="bg-black/60 border-green-400/50 hover:border-green-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <CardContent className="p-0">
                {/* Cover Art */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={release.coverArt || "/placeholder.svg"}
                    alt={release.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="ghost" size="lg" className="text-green-400">
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>

                  {/* Release Type Badge */}
                  <Badge className="absolute top-4 left-4 bg-green-400 text-black font-mono">{release.type}</Badge>
                </div>

                {/* Release Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-mono font-bold mb-1">{release.title}</h3>
                    <p className="text-green-400/80 font-mono text-sm">by {release.artist}</p>
                    <p className="text-green-400/60 font-mono text-xs">
                      {release.releaseDate} • {release.tracks} tracks
                    </p>
                  </div>

                  {/* Lore */}
                  <p className="text-green-300/80 text-sm italic leading-relaxed">{release.lore}</p>

                  {/* Streaming Links */}
                  <div className="flex gap-2 flex-wrap">
                    {release.streamingLinks.map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                      >
                        {platform} <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    ))}
                  </div>

                  {/* Web3 Metadata Toggle */}
                  <details className="group/details">
                    <summary className="cursor-pointer text-green-400/80 font-mono text-sm hover:text-green-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      WEB3_METADATA
                    </summary>
                    <div className="mt-3 p-3 bg-black/40 border border-green-400/30 space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span>Bonding Curve:</span>
                        <span className="text-green-300">{release.web3Data.bondingCurve}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span>Holders:</span>
                        <span className="text-green-300">{release.web3Data.holders}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span>Volume:</span>
                        <span className="text-green-300">{release.web3Data.volume}</span>
                      </div>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Release CTA */}
        <div className="mt-16 text-center">
          <Link href="/submit-portal">
            <Button
              variant="outline"
              size="lg"
              className="bg-black/60 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono px-8 py-4"
            >
              SUBMIT_YOUR_DROP
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
