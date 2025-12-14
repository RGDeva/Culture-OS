"use client"

import { useState } from "react"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, ExternalLink, Clock, Zap } from "lucide-react"
import Link from "next/link"

const artists = [
  {
    id: 1,
    name: "RISHI_G",
    codename: "S33R",
    image: "/images/rishi-cigar.jpeg",
    bio: "Glitch Prophet from the digital underground",
    quote: "Reality is just unoptimized code waiting to be hacked",
    audio: "/audio/rishi-track.mp3",
    links: ["Spotify", "SoundCloud", "Bandcamp"],
    status: "ACTIVE",
    genre: "Experimental Bass",
  },
  {
    id: 2,
    name: "NOCULTURE",
    codename: "ARCHITECT",
    image: "/images/noculture-duo.jpeg",
    bio: "The collective consciousness, digital anarchist duo",
    quote: "We are the signal in the noise, the chaos in the code",
    audio: "/audio/noculture-track.mp3",
    links: ["Spotify", "YouTube", "Audius"],
    status: "ACTIVE",
    genre: "Dark Electronic",
  },
  {
    id: 3,
    name: "NULL_ENTITY_001",
    codename: "LOADING...",
    image: "/images/dystopian-angel.jpeg",
    bio: "Phantom frequencies from beyond the veil",
    quote: "In the silence between beats, we find truth",
    audio: "/audio/null-track.mp3",
    links: ["Coming Soon"],
    status: "LOADING",
    genre: "Ambient Chaos",
  },
  {
    id: 4,
    name: "NULL_ENTITY_002",
    codename: "MEDITATING_VOID",
    image: "/images/tv-head-cosmic.jpeg",
    bio: "Cosmic transmissions from the digital monastery",
    quote: "Consciousness uploading... please wait",
    audio: "/audio/void-track.mp3",
    links: ["Initializing"],
    status: "LOADING",
    genre: "Psychedelic Glitch",
  },
]

export default function ArtistIndex() {
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-400 text-black"
      case "LOADING":
        return "bg-yellow-400 text-black animate-pulse"
      default:
        return "bg-gray-400 text-black"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Zap className="h-3 w-3" />
      case "LOADING":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">ARTIST_INDEX</h1>
          <div className="text-sm font-mono text-green-400/60">
            {artists.filter((a) => a.status === "ACTIVE").length}/{artists.length} ENTITIES_ACTIVE
          </div>
        </div>

        {/* System Status */}
        <div className="mb-8 p-4 bg-black/60 border border-green-400/50 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">
            {">"} COLLECTIVE_STATUS: {artists.filter((a) => a.status === "ACTIVE").length} active entities,{" "}
            {artists.filter((a) => a.status === "LOADING").length} loading...
          </p>
        </div>

        {/* Artist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {artists.map((artist) => (
            <Card
              key={artist.id}
              className={`bg-black/60 border-green-400/50 hover:border-green-400 transition-all duration-300 cursor-pointer group backdrop-blur-sm ${
                artist.status === "LOADING" ? "opacity-75" : ""
              }`}
              onClick={() => setSelectedArtist(selectedArtist === artist.id ? null : artist.id)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={artist.image || "/placeholder.svg"}
                    alt={artist.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      artist.status === "LOADING" ? "grayscale group-hover:grayscale-0" : "group-hover:scale-110"
                    }`}
                  />

                  {/* Status Badge */}
                  <Badge className={`absolute top-4 left-4 font-mono text-xs ${getStatusColor(artist.status)}`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(artist.status)}
                      {artist.status}
                    </span>
                  </Badge>

                  {/* Genre Badge */}
                  <Badge className="absolute top-4 right-4 bg-black/80 text-green-400 font-mono text-xs">
                    {artist.genre}
                  </Badge>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {artist.status === "ACTIVE" ? (
                      <Button variant="ghost" size="sm" className="text-green-400">
                        <Play className="h-6 w-6" />
                      </Button>
                    ) : (
                      <div className="text-green-400/60 font-mono text-sm">INITIALIZING...</div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-mono font-bold mb-1">{artist.name}</h3>
                    <p className="text-green-400/80 font-mono text-sm">CODENAME: {artist.codename}</p>
                  </div>

                  <p className="text-green-400/80 text-sm mb-3">{artist.bio}</p>

                  {selectedArtist === artist.id && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <blockquote className="text-green-300 italic border-l-2 border-green-400 pl-4 text-sm">
                        "{artist.quote}"
                      </blockquote>

                      {artist.status === "ACTIVE" ? (
                        <>
                          <div className="flex gap-2 flex-wrap">
                            {artist.links.map((link) => (
                              <Button
                                key={link}
                                variant="outline"
                                size="sm"
                                className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                              >
                                {link} <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            ))}
                          </div>

                          <audio controls className="w-full">
                            <source src={artist.audio} type="audio/mpeg" />
                          </audio>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2 flex-wrap">
                            {artist.links.map((link) => (
                              <Button
                                key={link}
                                variant="outline"
                                size="sm"
                                disabled
                                className="bg-black/40 border-green-400/30 text-green-400/50 font-mono text-xs cursor-not-allowed"
                              >
                                {link}
                              </Button>
                            ))}
                          </div>

                          <div className="bg-black/40 border border-green-400/30 p-3 rounded">
                            <div className="flex items-center gap-2 text-green-400/60 font-mono text-xs">
                              <Clock className="h-3 w-3 animate-spin" />
                              <span>ENTITY_LOADING... ESTIMATED_TIME: SOON™</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-mono font-bold text-green-400 mb-2">
                {artists.filter((a) => a.status === "ACTIVE").length}
              </div>
              <div className="text-green-400/80 font-mono text-sm">ACTIVE_ENTITIES</div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-mono font-bold text-yellow-400 mb-2">
                {artists.filter((a) => a.status === "LOADING").length}
              </div>
              <div className="text-green-400/80 font-mono text-sm">LOADING_ENTITIES</div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-mono font-bold text-green-400 mb-2">∞</div>
              <div className="text-green-400/80 font-mono text-sm">POTENTIAL_ENTITIES</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Artist CTA */}
        <div className="mt-16 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-mono font-bold mb-2 text-green-400">READY_TO_JOIN_THE_COLLECTIVE?</h2>
            <p className="text-green-400/80 font-mono text-sm">Submit your signal. Become part of the resistance.</p>
          </div>
          <Link href="/submit-portal">
            <Button
              variant="outline"
              size="lg"
              className="bg-black/60 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono px-8 py-4"
            >
              TRANSMIT_YOUR_FREQUENCY
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
