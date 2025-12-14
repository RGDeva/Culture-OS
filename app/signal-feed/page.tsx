"use client"

import { useState, useEffect } from "react"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Radio, Zap, Music, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Signal {
  id: number
  type: "drop" | "quote" | "update" | "collab"
  artist: string
  content: string
  timestamp: string
  status: "live" | "archived"
}

export default function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [filter, setFilter] = useState<string>("all")

  // Simulate real-time feed
  useEffect(() => {
    const initialSignals: Signal[] = [
      {
        id: 1,
        type: "drop",
        artist: "RISHI_G",
        content: "New track 'Digital_Prophecy' just dropped on all platforms",
        timestamp: "2 min ago",
        status: "live",
      },
      {
        id: 2,
        type: "quote",
        artist: "NOCULTURE",
        content: "The algorithm doesn't understand rebellion. That's why we exist.",
        timestamp: "15 min ago",
        status: "live",
      },
      {
        id: 3,
        type: "update",
        artist: "SYSTEM",
        content: "Creator Mesh expanded with 12 new verified studios",
        timestamp: "1 hour ago",
        status: "live",
      },
      {
        id: 4,
        type: "collab",
        artist: "NULL_ENTITY_001",
        content: "Seeking vocalist for ambient chaos project. DM if you vibe.",
        timestamp: "3 hours ago",
        status: "live",
      },
      {
        id: 5,
        type: "drop",
        artist: "CIPHER_404",
        content: "Glitch pack available in Shop Terminal - 50% off for 24h",
        timestamp: "6 hours ago",
        status: "archived",
      },
    ]

    setSignals(initialSignals)

    // Simulate new signals
    const interval = setInterval(() => {
      const newSignal: Signal = {
        id: Date.now(),
        type: ["drop", "quote", "update", "collab"][Math.floor(Math.random() * 4)] as Signal["type"],
        artist: ["RISHI_G", "NOCULTURE", "SYSTEM", "NULL_ENTITY_001"][Math.floor(Math.random() * 4)],
        content: "New signal detected in the frequency...",
        timestamp: "now",
        status: "live",
      }

      setSignals((prev) => [newSignal, ...prev.slice(0, 9)])
    }, 30000) // New signal every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getSignalIcon = (type: string) => {
    switch (type) {
      case "drop":
        return <Music className="h-4 w-4" />
      case "quote":
        return <MessageSquare className="h-4 w-4" />
      case "update":
        return <TrendingUp className="h-4 w-4" />
      case "collab":
        return <Zap className="h-4 w-4" />
      default:
        return <Radio className="h-4 w-4" />
    }
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case "drop":
        return "bg-green-400 text-black"
      case "quote":
        return "bg-blue-400 text-black"
      case "update":
        return "bg-yellow-400 text-black"
      case "collab":
        return "bg-purple-400 text-black"
      default:
        return "bg-gray-400 text-black"
    }
  }

  const filteredSignals = filter === "all" ? signals : signals.filter((signal) => signal.type === filter)

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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">SIGNAL_FEED</h1>
          <div className="flex items-center gap-2 text-sm font-mono text-green-400/60">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>LIVE_BROADCAST</span>
          </div>
        </div>

        {/* Terminal Status */}
        <div className="mb-8 p-4 bg-black/60 border border-green-400/50 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">
            {">"} MONITORING {signals.length} signals across the network. Real-time updates enabled.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 flex gap-4 flex-wrap">
          {["all", "drop", "quote", "update", "collab"].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={`font-mono text-xs ${
                filter === filterType
                  ? "bg-green-400 text-black"
                  : "bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black"
              }`}
            >
              {filterType.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Signal Stream */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredSignals.map((signal) => (
            <Card
              key={signal.id}
              className={`bg-black/60 border-green-400/50 backdrop-blur-sm transition-all duration-300 ${
                signal.status === "live" ? "hover:border-green-400" : "opacity-60"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={`font-mono text-xs ${getSignalColor(signal.type)}`}>
                      <span className="flex items-center gap-1">
                        {getSignalIcon(signal.type)}
                        {signal.type.toUpperCase()}
                      </span>
                    </Badge>
                    <span className="font-mono font-bold text-green-400">{signal.artist}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400/60 font-mono text-xs">{signal.timestamp}</span>
                    {signal.status === "live" && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                  </div>
                </div>

                <p className="text-green-400/80 font-mono text-sm leading-relaxed">{signal.content}</p>

                {signal.type === "drop" && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                    >
                      LISTEN_NOW
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                    >
                      SHARE_SIGNAL
                    </Button>
                  </div>
                )}

                {signal.type === "collab" && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                    >
                      RESPOND_TO_COLLAB
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Broadcast Your Signal CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-green-400/10 border-green-400 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-mono text-2xl mb-4 text-green-400">BROADCAST_YOUR_SIGNAL</h3>
              <p className="text-green-400/80 font-mono mb-6">
                Join the network. Share your drops, quotes, and collaborations.
              </p>
              <Link href="/submit-portal">
                <Button size="lg" className="bg-green-400 text-black hover:bg-green-300 font-mono text-lg px-8 py-4">
                  JOIN_BROADCAST
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
