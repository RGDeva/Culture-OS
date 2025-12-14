"use client"

import { useState } from "react"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Star, Filter, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Creator {
  id: number
  name: string
  location: string
  service: string
  tags: string[]
  verified: boolean
  rating: number
  price: string
  description: string
  contact: string
}

export default function CreatorMesh() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showMap, setShowMap] = useState(false)

  const creators: Creator[] = [
    {
      id: 1,
      name: "VOID_STUDIOS_LA",
      location: "Los Angeles, CA",
      service: "Recording Studio",
      tags: ["Studio", "Mixing", "Mastering"],
      verified: true,
      rating: 4.9,
      price: "$150/hr",
      description: "Professional recording studio specializing in experimental and electronic music",
      contact: "book@voidstudios.com",
    },
    {
      id: 2,
      name: "CIPHER_BEATS",
      location: "Atlanta, GA",
      service: "Beat Production",
      tags: ["Beats", "Production", "Trap"],
      verified: true,
      rating: 4.7,
      price: "$200-500",
      description: "Custom beat production for hip-hop, trap, and experimental genres",
      contact: "cipher@beatmaker.com",
    },
    {
      id: 3,
      name: "ECHO_CHAMBER_NYC",
      location: "New York, NY",
      service: "Mixing & Mastering",
      tags: ["Mixing", "Mastering", "Post"],
      verified: false,
      rating: 4.5,
      price: "$75/song",
      description: "Boutique mixing and mastering for independent artists",
      contact: "info@echochamber.nyc",
    },
    {
      id: 4,
      name: "SIREN_VOCALS",
      location: "Nashville, TN",
      service: "Vocalist",
      tags: ["Vocals", "Songwriting", "Hooks"],
      verified: true,
      rating: 4.8,
      price: "$300/song",
      description: "Professional vocalist and songwriter for all genres",
      contact: "bookings@sirenvocals.com",
    },
    {
      id: 5,
      name: "GLITCH_FACTORY",
      location: "Berlin, DE",
      service: "Sound Design",
      tags: ["Sound Design", "Synthesis", "Experimental"],
      verified: true,
      rating: 4.9,
      price: "$100-300",
      description: "Custom sound design and synthesis for electronic music",
      contact: "hello@glitchfactory.de",
    },
    {
      id: 6,
      name: "BASS_FOUNDRY",
      location: "London, UK",
      service: "Studio & Production",
      tags: ["Studio", "Production", "Bass Music"],
      verified: false,
      rating: 4.6,
      price: "$120/hr",
      description: "Specialized in bass-heavy electronic music production",
      contact: "studio@bassfoundry.uk",
    },
  ]

  const serviceTypes = ["all", "Studio", "Beats", "Mixing", "Vocals", "Sound Design", "Production"]

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.service.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = selectedFilter === "all" || creator.tags.includes(selectedFilter)

    return matchesSearch && matchesFilter
  })

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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">CREATOR_MESH</h1>
          <div className="text-sm font-mono text-green-400/60">{filteredCreators.length} NODES_ACTIVE</div>
        </div>

        {/* Network Status */}
        <div className="mb-8 p-4 bg-black/60 border border-green-400/50 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">
            {">"} Decentralized creator network. {creators.filter((c) => c.verified).length} verified nodes,{" "}
            {creators.length} total connections.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search creators, locations, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {showMap ? "HIDE_MAP" : "SHOW_MAP"}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="h-4 w-4 text-green-400/60" />
            {serviceTypes.map((service) => (
              <Button
                key={service}
                variant={selectedFilter === service ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(service)}
                className={`font-mono text-xs ${
                  selectedFilter === service
                    ? "bg-green-400 text-black"
                    : "bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black"
                }`}
              >
                {service.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        {showMap && (
          <Card className="mb-8 bg-black/60 border-green-400/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-64 bg-black/40 border border-green-400/30 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-green-400/60" />
                  <p className="text-green-400/80 font-mono">GLOBAL_CREATOR_MAP</p>
                  <p className="text-green-400/60 font-mono text-sm">Interactive map integration ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Creator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCreators.map((creator) => (
            <Card
              key={creator.id}
              className="bg-black/60 border-green-400/50 hover:border-green-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-mono font-bold mb-1 flex items-center gap-2">
                      {creator.name}
                      {creator.verified && (
                        <Badge className="bg-green-400 text-black font-mono text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          VERIFIED
                        </Badge>
                      )}
                    </h3>
                    <p className="text-green-400/80 font-mono text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {creator.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-300 font-mono font-bold">{creator.price}</div>
                    <div className="text-green-400/60 font-mono text-xs">★ {creator.rating}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <Badge className="bg-black/40 border border-green-400/50 text-green-400 font-mono text-xs mb-2">
                    {creator.service}
                  </Badge>
                  <div className="flex gap-1 flex-wrap">
                    {creator.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-black/20 border-green-400/30 text-green-400/80 font-mono text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-green-400/80 text-sm mb-6 leading-relaxed">{creator.description}</p>

                <div className="flex gap-2">
                  <Link href="/book-studio">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs flex-1"
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      BOOK_NOW
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Network CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-green-400/10 border-green-400 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-mono text-2xl mb-4 text-green-400">JOIN_THE_MESH</h3>
              <p className="text-green-400/80 font-mono mb-6">
                Offer your services to the network. Get verified. Earn revenue share.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/submit-portal">
                  <Button size="lg" className="bg-green-400 text-black hover:bg-green-300 font-mono px-8 py-4">
                    APPLY_FOR_LISTING
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black/60 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono px-8 py-4"
                >
                  VERIFIED_UPGRADE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
