"use client"

import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Star, CreditCard } from "lucide-react"
import Link from "next/link"

const studios = [
  {
    id: 1,
    name: "NOCULTURE_MAIN_STUDIO",
    location: "Los Angeles, CA",
    hourlyRate: "$150",
    features: ["SSL Console", "Vintage Synths", "Isolation Booth", "Live Room"],
    verified: true,
    rating: 4.9,
    availability: "Available Today",
  },
  {
    id: 2,
    name: "VOID_CHAMBER_EAST",
    location: "New York, NY",
    hourlyRate: "$120",
    features: ["Pro Tools HDX", "Analog Gear", "Vocal Booth", "Mixing Suite"],
    verified: true,
    rating: 4.8,
    availability: "Next Week",
  },
  {
    id: 3,
    name: "FREQUENCY_LAB",
    location: "Atlanta, GA",
    hourlyRate: "$100",
    features: ["Logic Pro X", "MIDI Controllers", "Sound Treatment", "Producer Suite"],
    verified: false,
    rating: 4.6,
    availability: "Available Now",
  },
]

const packages = [
  {
    name: "SINGLE_SESSION",
    duration: "4 hours",
    price: "$600",
    includes: ["Studio Time", "Engineer", "Basic Mix"],
    popular: false,
  },
  {
    name: "FULL_DAY_INTENSIVE",
    duration: "8 hours",
    price: "$1,000",
    includes: ["Studio Time", "Engineer", "Mix & Master", "Lunch"],
    popular: true,
  },
  {
    name: "WEEKLY_BLOCK",
    duration: "40 hours",
    price: "$4,500",
    includes: ["Priority Booking", "Dedicated Engineer", "Mix & Master", "Project Management"],
    popular: false,
  },
]

export default function BookStudio() {
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">BOOK_STUDIO</h1>
          <div className="text-sm font-mono text-green-400/60">REAL_TIME_BOOKING</div>
        </div>

        {/* System Status */}
        <div className="mb-8 p-4 bg-black/60 border border-green-400/50 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">
            {">"} Professional studio network. Real-time availability. Instant booking confirmation.
          </p>
        </div>

        {/* Booking Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold mb-6 text-green-400">BOOKING_PACKAGES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`bg-black/60 backdrop-blur-sm transition-all duration-300 ${
                  pkg.popular ? "border-green-400 scale-105" : "border-green-400/50 hover:border-green-400"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-mono text-lg text-green-400">{pkg.name}</CardTitle>
                    {pkg.popular && <Badge className="bg-green-400 text-black font-mono text-xs">POPULAR</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-green-400/80 font-mono text-sm">
                    <Clock className="h-4 w-4" />
                    {pkg.duration}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-green-300 mb-4">{pkg.price}</div>
                  <div className="space-y-2 mb-6">
                    {pkg.includes.map((item) => (
                      <div key={item} className="text-green-400/80 font-mono text-sm flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="lg"
                    className={`w-full font-mono ${
                      pkg.popular
                        ? "bg-green-400 text-black hover:bg-green-300"
                        : "bg-black/40 border border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    BOOK_NOW
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Studios */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold mb-6 text-green-400">AVAILABLE_STUDIOS</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {studios.map((studio) => (
              <Card
                key={studio.id}
                className="bg-black/60 border-green-400/50 hover:border-green-400 transition-all duration-300 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-mono font-bold mb-1 flex items-center gap-2">
                        {studio.name}
                        {studio.verified && (
                          <Badge className="bg-green-400 text-black font-mono text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            VERIFIED
                          </Badge>
                        )}
                      </h3>
                      <p className="text-green-400/80 font-mono text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {studio.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-300 font-mono font-bold">{studio.hourlyRate}/hr</div>
                      <div className="text-green-400/60 font-mono text-xs">★ {studio.rating}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge
                      className={`font-mono text-xs ${
                        studio.availability === "Available Today" || studio.availability === "Available Now"
                          ? "bg-green-400 text-black"
                          : "bg-yellow-400 text-black"
                      }`}
                    >
                      {studio.availability}
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <p className="text-green-400/80 font-mono text-sm mb-2">EQUIPMENT:</p>
                    <div className="flex gap-1 flex-wrap">
                      {studio.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="bg-black/20 border-green-400/30 text-green-400/80 font-mono text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs flex-1"
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      BOOK_SESSION
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                    >
                      VIEW_DETAILS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* GoHighLevel Calendar Embed */}
        <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-mono text-2xl text-green-400">INSTANT_BOOKING_SYSTEM</CardTitle>
            <p className="text-green-400/80 font-mono text-sm">
              Select your preferred time slot. Payment processed securely via integrated system.
            </p>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px] bg-black/40 border border-green-400/30 rounded flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-green-400/60" />
                <p className="text-green-400/80 font-mono text-lg mb-2">GOHIGHLEVEL_CALENDAR</p>
                <p className="text-green-400/60 font-mono text-sm mb-4">
                  Integrated booking system with payment processing
                </p>
                <div className="space-y-2 text-green-400/60 font-mono text-sm">
                  <p>• Real-time availability</p>
                  <p>• Instant confirmation</p>
                  <p>• Automated follow-up</p>
                  <p>• Payment integration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <div className="mt-8 text-center">
          <Card className="bg-green-400/10 border-green-400 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-mono text-xl mb-4 text-green-400 flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                SECURE_PAYMENT_OPTIONS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-green-400/80 font-mono text-sm">
                <div>• Credit Card</div>
                <div>• PayPal</div>
                <div>• Bank Transfer</div>
                <div>• Crypto (BTC/ETH)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
