"use client"

import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Lock, Unlock, Check } from "lucide-react"
import Link from "next/link"

const guides = [
  {
    id: 1,
    title: "DROP_BLUEPRINT_2025",
    description: "Complete guide to releasing music independently in the digital age",
    format: "PDF + Templates",
    pages: 47,
    price: "$97",
    popular: true,
    locked: true,
    preview: "Learn the exact system used by NoCulture artists to launch successful releases",
    includes: [
      "Release Timeline Template",
      "Marketing Checklist",
      "Distribution Strategy",
      "Social Media Kit",
      "Revenue Optimization",
    ],
  },
  {
    id: 2,
    title: "STUDIO_MONETIZATION_SYSTEM",
    description: "Turn your home studio into a profitable business",
    format: "Video Course + PDFs",
    pages: 32,
    price: "$147",
    popular: false,
    locked: true,
    preview: "From bedroom producer to professional studio owner - complete business blueprint",
    includes: [
      "Equipment ROI Calculator",
      "Client Acquisition System",
      "Pricing Strategy Guide",
      "Legal Templates",
      "Scaling Framework",
    ],
  },
  {
    id: 3,
    title: "WEB3_ARTIST_PLAYBOOK",
    description: "Navigate the decentralized music economy",
    format: "Interactive Guide",
    pages: 28,
    price: "$67",
    popular: false,
    locked: true,
    preview: "Understanding NFTs, streaming tokens, and fan monetization in Web3",
    includes: [
      "Platform Comparison",
      "Smart Contract Basics",
      "Fan Token Strategy",
      "Revenue Streams Map",
      "Case Studies",
    ],
  },
  {
    id: 4,
    title: "COLLABORATION_PROTOCOLS",
    description: "Build and manage creative partnerships",
    format: "PDF + Contracts",
    pages: 23,
    price: "$47",
    popular: false,
    locked: false,
    preview: "Legal frameworks and best practices for artist collaborations",
    includes: [
      "Collaboration Agreements",
      "Revenue Split Calculator",
      "Communication Templates",
      "Conflict Resolution",
      "Partnership Scaling",
    ],
  },
  {
    id: 5,
    title: "CREATIVE_SYSTEMS_VAULT",
    description: "Productivity and workflow optimization for creators",
    format: "Notion Templates",
    pages: 15,
    price: "$37",
    popular: false,
    locked: false,
    preview: "Streamline your creative process with proven systems and templates",
    includes: ["Project Management", "Idea Capture System", "Goal Tracking", "Time Blocking", "Creative Rituals"],
  },
  {
    id: 6,
    title: "MASTER_BUNDLE_ACCESS",
    description: "Complete access to all guides + future releases",
    format: "All Formats",
    pages: 200,
    price: "$297",
    popular: true,
    locked: true,
    preview: "Everything you need to build a sustainable creative career",
    includes: ["All Current Guides", "Future Releases", "Private Community", "Monthly Q&A Calls", "Direct Support"],
  },
]

interface Guide {
  id: number
  title: string
  description: string
  format: string
  pages: number
  price: string
  popular: boolean
  locked: boolean
  preview: string
  includes: string[]
}

export default function UnlockGuide() {
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">UNLOCK_GUIDE</h1>
          <div className="text-sm font-mono text-green-400/60">{guides.length} GUIDES_AVAILABLE</div>
        </div>

        {/* Vault Status */}
        <div className="mb-8 p-4 bg-black/60 border border-green-400/50 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">
            {">"} Educational vault containing systems, templates, and blueprints for creative entrepreneurs.
          </p>
        </div>

        {/* Featured Bundle */}
        <div className="mb-12">
          <Card className="bg-green-400/10 border-green-400 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-2xl text-green-400">FEATURED_BUNDLE</CardTitle>
                <Badge className="bg-green-400 text-black font-mono">BEST_VALUE</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-mono font-bold mb-2 text-green-400">COMPLETE_CREATOR_SYSTEM</h3>
                  <p className="text-green-300 mb-4">Everything you need to build a sustainable creative career</p>
                  <ul className="space-y-2 mb-6">
                    {["All Current Guides", "Future Releases", "Private Community", "Monthly Q&A Calls", "Direct Support"].map((item) => (
                      <li key={item} className="flex items-center text-green-300">
                        <Check className="h-4 w-4 mr-2 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-green-400 hover:bg-green-500 text-black font-mono font-bold py-6 text-lg">
                    UNLOCK_ALL_GUIDES - $297
                  </Button>
                </div>
                <div className="relative h-64 bg-black/50 border border-green-400/30 rounded-lg flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  <div className="relative z-10 text-center p-6">
                    <Lock className="h-12 w-12 mx-auto text-green-400 mb-4" />
                    <p className="text-green-300 text-sm">PREVIEW_CONTENT_LOCKED</p>
                    <p className="text-green-400/60 text-xs mt-2">Unlock full access to view all content</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide: Guide) => (
            <Card key={guide.id} className="bg-black/60 border-green-400/30 hover:border-green-400/60 transition-colors">
              <CardHeader>
                <CardTitle className="font-mono text-green-400">{guide.title}</CardTitle>
                <div className="flex items-center justify-between text-sm text-green-300/80">
                  <span>{guide.pages} PAGES</span>
                  <span className="font-mono">{guide.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-green-300 text-sm mb-4">{guide.preview}</p>
                <Button variant="outline" className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10 hover:text-green-300">
                  {guide.locked ? (
                    <Lock className="h-4 w-4 mr-2" />
                  ) : (
                    <Unlock className="h-4 w-4 mr-2" />
                  )}
                  {guide.locked ? 'LOCKED' : 'VIEW_GUIDE'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
