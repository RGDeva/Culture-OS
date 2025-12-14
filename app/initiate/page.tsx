"use client"

import type React from "react"

import { useState } from "react"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, User, Headphones, Brain, ArrowRight } from "lucide-react"
import Link from "next/link"

type UserRole = "artist" | "listener" | "operator" | null

export default function InitiateProtocol() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  })

  const roles = [
    {
      id: "artist",
      icon: User,
      title: "ARTIST",
      description: "Create, release, and monetize your sound",
      benefits: ["Studio Access", "Distribution Support", "Revenue Optimization"],
    },
    {
      id: "listener",
      icon: Headphones,
      title: "LISTENER",
      description: "Discover underground frequencies and support creators",
      benefits: ["Early Access", "Exclusive Content", "Direct Artist Connection"],
    },
    {
      id: "operator",
      icon: Brain,
      title: "OPERATOR",
      description: "Provide services, tools, and infrastructure",
      benefits: ["Creator Network", "Revenue Share", "Verified Listings"],
    },
  ]

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role as UserRole)
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Push to GoHighLevel CRM
    console.log("Submitting to GHL:", formData)
    setStep(3)
  }

  const getUpsellContent = () => {
    switch (selectedRole) {
      case "artist":
        return {
          title: "ARTIST_DEVELOPMENT_PACKAGE",
          offers: [
            { name: "Studio Session", price: "$150/hr", link: "/book-studio" },
            { name: "Launch Blueprint", price: "$97", link: "/unlock-guide" },
            { name: "Full Development", price: "Custom", link: "/submit-portal" },
          ],
        }
      case "listener":
        return {
          title: "LISTENER_ACCESS_VAULT",
          offers: [
            { name: "Early Access Pass", price: "$29/mo", link: "/submit-portal" },
            { name: "Exclusive Content", price: "$97", link: "/unlock-guide" },
            { name: "Artist Meetups", price: "Free", link: "/live-mode" },
          ],
        }
      case "operator":
        return {
          title: "OPERATOR_NETWORK_ACCESS",
          offers: [
            { name: "Verified Listing", price: "$197", link: "/creator-mesh" },
            { name: "Revenue Share Setup", price: "Free", link: "/submit-portal" },
            { name: "Partnership Program", price: "Custom", link: "/submit-portal" },
          ],
        }
      default:
        return { title: "", offers: [] }
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">INITIATE_PROTOCOL</h1>
          <div className="text-sm font-mono text-green-400/60">STEP_{step}/3</div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-mono font-bold mb-4">SELECT_YOUR_ROLE</h2>
                <p className="text-green-400/80 font-mono">Choose your path in the NoCulture ecosystem</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {roles.map((role) => {
                  const IconComponent = role.icon
                  return (
                    <Card
                      key={role.id}
                      className="bg-black/60 border-green-400/50 hover:border-green-400 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                      onClick={() => handleRoleSelect(role.id)}
                    >
                      <CardContent className="p-8 text-center">
                        <IconComponent className="h-16 w-16 mx-auto mb-4 text-green-400 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-mono font-bold mb-2">{role.title}</h3>
                        <p className="text-green-400/80 text-sm mb-6">{role.description}</p>
                        <div className="space-y-2">
                          {role.benefits.map((benefit) => (
                            <div key={benefit} className="text-green-300 font-mono text-xs">
                              {">"} {benefit}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Data Capture */}
          {step === 2 && (
            <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-2xl text-green-400">
                  {selectedRole?.toUpperCase()}_REGISTRATION
                </CardTitle>
                <p className="text-green-400/80 font-mono text-sm">Initialize your profile in the system</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-green-400 font-mono text-sm mb-2">NAME</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-400 font-mono text-sm mb-2">EMAIL</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono"
                      required
                    />
                  </div>

                  <div className="bg-black/40 border border-green-400/30 p-4">
                    <p className="text-green-400/80 font-mono text-sm">
                      Selected Role: <span className="text-green-400 font-bold">{selectedRole?.toUpperCase()}</span>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-green-400 text-black hover:bg-green-300 font-mono text-lg py-6"
                  >
                    INITIALIZE_PROFILE <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Upsell */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-mono font-bold mb-4 text-green-400">PROTOCOL_INITIALIZED</h2>
                <p className="text-green-400/80 font-mono">Welcome to the NoCulture OS, {formData.name}</p>
              </div>

              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-mono text-xl text-green-400">{getUpsellContent().title}</CardTitle>
                  <p className="text-green-400/80 font-mono text-sm">Accelerate your journey with these tools</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getUpsellContent().offers.map((offer) => (
                      <div key={offer.name} className="bg-black/40 border border-green-400/30 p-6 text-center">
                        <h3 className="font-mono font-bold text-green-400 mb-2">{offer.name}</h3>
                        <p className="text-2xl font-mono font-bold text-green-300 mb-4">{offer.price}</p>
                        <Link href={offer.link}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                          >
                            ACCESS_NOW
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Link href="/artist-index">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-black/60 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono px-8 py-4"
                  >
                    EXPLORE_SYSTEM
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
