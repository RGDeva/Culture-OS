"use client"

import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, ShoppingCart } from "lucide-react"
import Link from "next/link"

const merchItems = [
  {
    id: 1,
    title: "Layer_004_GlyphTee",
    price: "$35.00",
    image: "/placeholder.svg?height=400&width=400",
    url: "https://www.noculture.app/product-details/product/686181da8e0f545fc1e55bf2",
    status: "IN_STOCK",
  },
  {
    id: 2,
    title: "Void_Transmission_Hoodie",
    price: "$65.00",
    image: "/placeholder.svg?height=400&width=400",
    url: "https://www.noculture.app/product-details/product/68618643b0cafaedde440c0c",
    status: "LIMITED",
  },
  {
    id: 3,
    title: "Digital_Rebel_Cap",
    price: "$25.00",
    image: "/placeholder.svg?height=400&width=400",
    url: "https://www.noculture.app/product-details/product/686178718e0f540673e54b2e",
    status: "IN_STOCK",
  },
  {
    id: 4,
    title: "Chaos_Grid_Poster",
    price: "$15.00",
    image: "/placeholder.svg?height=400&width=400",
    url: "https://www.noculture.app/product-details/product/686174798e0f54bb4ce54380",
    status: "IN_STOCK",
  },
  {
    id: 5,
    title: "System_Breach_Sticker_Pack",
    price: "$8.00",
    image: "/placeholder.svg?height=400&width=400",
    url: "https://www.noculture.app/product-details/product/686176f58e0f54beffe548a6",
    status: "IN_STOCK",
  },
  {
    id: 6,
    title: "NoCulture_OS_USB_Drive",
    price: "$45.00",
    image: "/placeholder.svg?height=400&width=400",
    url: "https://www.noculture.app/product-details/product/68617d77b0cafabf2443fd74",
    status: "EXCLUSIVE",
  },
]

export default function MerchTerminal() {
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">MERCH_TERMINAL</h1>
          <div className="text-sm font-mono text-green-400/60">{merchItems.length} ITEMS_LOADED</div>
        </div>

        {/* Terminal Header */}
        <div className="mb-8 p-4 bg-black/60 border border-green-400/50 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">
            {">"} Physical manifestations of digital rebellion. Wear the resistance.
          </p>
        </div>

        {/* Merch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchItems.map((item) => (
            <Card
              key={item.id}
              className="bg-black/60 border-green-400/50 hover:border-green-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Status Badge */}
                  <Badge
                    className={`absolute top-4 left-4 font-mono text-xs ${
                      item.status === "LIMITED"
                        ? "bg-red-500 text-white"
                        : item.status === "EXCLUSIVE"
                          ? "bg-purple-500 text-white"
                          : "bg-green-400 text-black"
                    }`}
                  >
                    {item.status}
                  </Badge>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="ghost" size="lg" className="text-green-400">
                      <ShoppingCart className="h-8 w-8" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-mono font-bold mb-2">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-green-300">{item.price}</span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                      >
                        BUY_NOW <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beat Shop Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-mono font-bold mb-8 text-center">BEAT_SHOP</h2>
          <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-mono text-xl mb-4 text-green-400">TRAKTRAIN_MARKETPLACE</h3>
              <iframe
                src="https://traktrain.com/widget/194335"
                width="100%"
                height="790"
                frameBorder="0"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <p className="text-green-400/80 font-mono text-sm mb-4">Custom orders and bulk purchases available</p>
          <Link href="/submit-portal">
            <Button
              variant="outline"
              size="lg"
              className="bg-black/60 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono px-8 py-4"
            >
              CONTACT_FOR_CUSTOM
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
