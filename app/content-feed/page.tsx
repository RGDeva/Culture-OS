"use client"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Music, Video, User, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function ContentFeed() {
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
          <h1 className="text-4xl md:text-6xl font-mono font-bold">CONTENT_FEED</h1>
          <div className="text-sm font-mono text-green-400/60">STREAMING_LIVE</div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="music" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/60 border border-green-400/50">
            <TabsTrigger
              value="music"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <Music className="mr-2 h-4 w-4" />
              TRACKS
            </TabsTrigger>
            <TabsTrigger
              value="artist"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <User className="mr-2 h-4 w-4" />
              ARTIST
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <Video className="mr-2 h-4 w-4" />
              VIDEOS
            </TabsTrigger>
            <TabsTrigger
              value="beats"
              className="font-mono data-[state=active]:bg-green-400 data-[state=active]:text-black"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              BEATS
            </TabsTrigger>
          </TabsList>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Spotify Embeds */}
              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">TRACK_001</h3>
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: "12px" }}
                    src="https://open.spotify.com/embed/track/3RSVFiEraB4U2o1GLmETlU?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">TRACK_002</h3>
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: "12px" }}
                    src="https://open.spotify.com/embed/track/27CffGFRC0V6l46oqeQj5A?utm_source=generator"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </CardContent>
              </Card>

              {/* New Spotify Embeds */}
              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">TRACK_003</h3>
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: "12px" }}
                    src="https://open.spotify.com/embed/track/2crdT6BzifnShWGb799gRP?utm_source=generator"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">TRACK_004</h3>
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: "12px" }}
                    src="https://open.spotify.com/embed/track/4yNMBUxX9vHhPBiJhKqzj4?utm_source=generator"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm lg:col-span-2">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">TRACK_005</h3>
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: "12px" }}
                    src="https://open.spotify.com/embed/track/4wJNhBu18GIT5ry5hDPLre?utm_source=generator"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Artist Profile Tab */}
          <TabsContent value="artist" className="space-y-8 mt-8">
            <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-mono text-2xl mb-4 text-green-400">NOCULTURE_ARTIST_PROFILE</h3>
                <iframe
                  data-testid="embed-iframe"
                  style={{ borderRadius: "12px" }}
                  src="https://open.spotify.com/embed/artist/5bbYjnY6zinhAm6l3rOKPj?utm_source=generator"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </CardContent>
            </Card>

            {/* Artist Development CTA */}
            <Card className="bg-green-400/10 border-green-400 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <h3 className="font-mono text-2xl mb-4 text-green-400">WANT_TO_BE_FEATURED?</h3>
                <p className="text-green-400/80 font-mono mb-6">
                  Join our artist development program. Web3 integration, launch strategy, and full support.
                </p>
                <Link href="/submit-portal">
                  <Button size="lg" className="bg-green-400 text-black hover:bg-green-300 font-mono text-lg px-8 py-4">
                    BOOK_CONSULTATION
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* YouTube Embed 1 */}
              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">FEATURED_VIDEO_001</h3>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/gkIAdHAivGQ?si=f1qYaVVBbtnlivM1"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* YouTube Embed 2 */}
              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">FEATURED_VIDEO_002</h3>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/L6bnsNfRauY?si=UgNGkNrCTuhum4rt"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Video Placeholders */}
              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">BEHIND_SCENES_001</h3>
                  <div className="aspect-video bg-black/40 border border-green-400/30 flex items-center justify-center">
                    <Play className="h-12 w-12 text-green-400/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-mono text-xl mb-4 text-green-400">LIVE_SESSION_002</h3>
                  <div className="aspect-video bg-black/40 border border-green-400/30 flex items-center justify-center">
                    <Play className="h-12 w-12 text-green-400/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Beats Tab */}
          <TabsContent value="beats" className="space-y-8 mt-8">
            <Card className="bg-black/60 border-green-400/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-mono text-2xl mb-4 text-green-400">TRAKTRAIN_BEAT_STORE</h3>
                <iframe
                  src="https://traktrain.com/widget/194335"
                  width="100%"
                  height="790"
                  frameBorder="0"
                  className="rounded-lg"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
