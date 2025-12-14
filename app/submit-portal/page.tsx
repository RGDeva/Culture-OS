"use client"

import type React from "react"

import { useState } from "react"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, Upload, Calendar, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function SubmitPortal() {
  const [formData, setFormData] = useState({
    identity: "",
    soundLink: "",
    whyNoculture: "",
    additionalInfo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would integrate with Airtable/Discord webhook
    console.log("Submitting to NoCulture:", formData)
    alert("Signal transmitted to the collective. We will respond if your frequency aligns.")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">SUBMIT_PORTAL</h1>
          <div className="text-sm font-mono text-green-400/60">TRANSMISSION_READY</div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8 p-4 border border-red-500/50 bg-red-500/10 backdrop-blur-sm">
          <p className="text-red-400 font-mono text-sm">
            {">"} WARNING: Only authentic rebels need apply. Corporate algorithms will be rejected.
          </p>
        </div>

        {/* Tabs for different submission types */}
        <Tabs defaultValue="artist" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 border border-green-400/50">
            <TabsTrigger
              value="artist"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <Send className="mr-2 h-4 w-4" />
              ARTIST_SUBMIT
            </TabsTrigger>
            <TabsTrigger
              value="booking"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <Calendar className="mr-2 h-4 w-4" />
              BOOK_CONSULTATION
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              LIVE_CHAT
            </TabsTrigger>
          </TabsList>

          {/* Artist Submission Tab */}
          <TabsContent value="artist" className="mt-8">
            <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-2xl text-green-400">IDENTITY_VERIFICATION_PROTOCOL</CardTitle>
                <p className="text-green-400/80 font-mono text-sm">
                  Answer truthfully. The algorithm can detect deception.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Question 1 */}
                  <div className="space-y-3">
                    <label className="block text-green-400 font-mono text-lg">{">"} Who are you really?</label>
                    <p className="text-green-400/60 text-sm font-mono">
                      Strip away the persona. What drives your rebellion?
                    </p>
                    <Textarea
                      value={formData.identity}
                      onChange={(e) => handleInputChange("identity", e.target.value)}
                      placeholder="I am..."
                      className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-3">
                    <label className="block text-green-400 font-mono text-lg">{">"} Link your sound</label>
                    <p className="text-green-400/60 text-sm font-mono">
                      SoundCloud, Bandcamp, YouTube, or direct file. Show us your frequency.
                    </p>
                    <Input
                      type="url"
                      value={formData.soundLink}
                      onChange={(e) => handleInputChange("soundLink", e.target.value)}
                      placeholder="https://..."
                      className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono"
                      required
                    />
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-3">
                    <label className="block text-green-400 font-mono text-lg">{">"} Why NoCulture?</label>
                    <p className="text-green-400/60 text-sm font-mono">
                      What makes you think you belong in our collective?
                    </p>
                    <Textarea
                      value={formData.whyNoculture}
                      onChange={(e) => handleInputChange("whyNoculture", e.target.value)}
                      placeholder="Because..."
                      className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-3">
                    <label className="block text-green-400 font-mono text-lg">{">"} Additional transmission data</label>
                    <p className="text-green-400/60 text-sm font-mono">
                      Social links, collaborations, anything else we should decode.
                    </p>
                    <Textarea
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                      placeholder="Optional data..."
                      className="bg-black/40 border-green-400/50 text-green-400 placeholder:text-green-400/40 font-mono resize-none"
                      rows={3}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="block text-green-400 font-mono text-lg">{">"} Upload additional files</label>
                    <div className="border-2 border-dashed border-green-400/50 p-8 text-center hover:border-green-400 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-green-400/60" />
                      <p className="text-green-400/60 font-mono text-sm">Drag files here or click to upload</p>
                      <p className="text-green-400/40 font-mono text-xs mt-1">Audio, images, press kit, etc.</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-green-400 text-black hover:bg-green-300 font-mono text-lg py-6"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    TRANSMIT_TO_COLLECTIVE
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="mt-8">
            <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-2xl text-green-400">CONSULTATION_BOOKING</CardTitle>
                <p className="text-green-400/80 font-mono text-sm">
                  Schedule your artist development consultation. Web3 integration, launch strategy, and more.
                </p>
              </CardHeader>
              <CardContent>
                {/* Calendly Embed Placeholder */}
                <div className="min-h-[600px] bg-black/40 border border-green-400/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-green-400/60" />
                    <p className="text-green-400/80 font-mono text-lg mb-2">BOOKING_CALENDAR</p>
                    <p className="text-green-400/60 font-mono text-sm">
                      Integrate your Calendly or booking system here
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 bg-black/40 border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                    >
                      SCHEDULE_NOW
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="mt-8">
            <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-2xl text-green-400">LIVE_CHAT_SUPPORT</CardTitle>
                <p className="text-green-400/80 font-mono text-sm">
                  Connect with our team instantly. Chat widget is active on all pages.
                </p>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] bg-black/40 border border-green-400/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-green-400/60" />
                    <p className="text-green-400/80 font-mono text-lg mb-2">CHAT_WIDGET_ACTIVE</p>
                    <p className="text-green-400/60 font-mono text-sm mb-4">
                      Look for the chat bubble in the bottom right corner
                    </p>
                    <div className="space-y-2 text-green-400/60 font-mono text-sm">
                      <p>• Artist Development Questions</p>
                      <p>• Web3 Integration Support</p>
                      <p>• Launch Strategy Consultation</p>
                      <p>• Technical Support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-green-400/60 font-mono text-sm">
            Direct line: <span className="text-green-400">hello@noculture.app</span>
          </p>
          <p className="text-green-400/60 font-mono text-sm">
            Discord: <span className="text-green-400">NoCulture Collective</span>
          </p>
        </div>
      </div>
    </div>
  )
}
