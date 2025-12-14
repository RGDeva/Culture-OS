"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic2, Music2, Upload, Settings, Headphones, Disc, FileAudio, FileMusic } from "lucide-react"
import Link from "next/link"

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState("tracks")
  const router = useRouter()

  const tabs = [
    { id: "tracks", label: "MY_TRACKS", icon: <Music2 className="h-4 w-4 mr-2" /> },
    { id: "recordings", label: "RECORDINGS", icon: <Mic2 className="h-4 w-4 mr-2" /> },
    { id: "collaborations", label: "COLLABORATIONS", icon: <Headphones className="h-4 w-4 mr-2" /> },
    { id: "releases", label: "RELEASES", icon: <Disc className="h-4 w-4 mr-2" /> },
  ]

  const dummyTracks = [
    { id: 1, name: "Midnight Echoes", type: "track", bpm: 120, key: "A Minor", duration: "3:45", status: "draft" },
    { id: 2, name: "Neon Dreams", type: "track", bpm: 128, key: "F# Minor", duration: "4:12", status: "published" },
    { id: 3, name: "Cosmic Waves", type: "track", bpm: 110, key: "C# Minor", duration: "3:22", status: "draft" },
  ]

  return (
    <div className="min-h-screen bg-black text-green-400 relative p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK_TO_DASHBOARD
        </Link>
        <h1 className="text-3xl md:text-5xl font-mono font-bold">STUDIO</h1>
        <Button className="bg-green-400 text-black hover:bg-green-300 font-mono">
          <Upload className="h-4 w-4 mr-2" />
          UPLOAD_NEW
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-green-400/20 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${activeTab === tab.id
                ? 'border-green-400 text-green-400'
                : 'border-transparent text-green-400/70 hover:text-green-400 hover:border-green-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "tracks" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-mono">MY_TRACKS</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  SORT
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  FILTER
                </Button>
              </div>
            </div>

            {/* Tracks List */}
            <div className="bg-black/30 border border-green-400/20 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-green-400/10 text-green-400/70 text-xs font-mono">
                <div className="col-span-5">TITLE</div>
                <div className="col-span-2">BPM</div>
                <div className="col-span-2">KEY</div>
                <div className="col-span-2">DURATION</div>
                <div className="col-span-1"></div>
              </div>
              {dummyTracks.map((track) => (
                <div key={track.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-green-400/5 border-b border-green-400/5 last:border-0">
                  <div className="col-span-5 flex items-center">
                    <FileMusic className="h-5 w-5 mr-3 text-green-400/70" />
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-xs text-green-400/50">{track.status.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm">{track.bpm} BPM</div>
                  <div className="col-span-2 text-sm">{track.key}</div>
                  <div className="col-span-2 text-sm">{track.duration}</div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-green-400 hover:bg-green-400/10">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "recordings" && (
          <div className="text-center py-16">
            <Mic2 className="h-12 w-12 mx-auto text-green-400/50 mb-4" />
            <h3 className="text-xl font-mono mb-2">NO_RECORDINGS_YET</h3>
            <p className="text-green-400/70 mb-6">Start recording your next hit directly in the browser</p>
            <Button className="bg-green-400 text-black hover:bg-green-300 font-mono">
              <Mic2 className="h-4 w-4 mr-2" />
              NEW_RECORDING
            </Button>
          </div>
        )}

        {activeTab === "collaborations" && (
          <div className="text-center py-16">
            <Headphones className="h-12 w-12 mx-auto text-green-400/50 mb-4" />
            <h3 className="text-xl font-mono mb-2">NO_ACTIVE_COLLABORATIONS</h3>
            <p className="text-green-400/70 mb-6">Start collaborating with other creators on the network</p>
            <Button variant="outline" className="font-mono">
              FIND_COLLABORATORS
            </Button>
          </div>
        )}

        {activeTab === "releases" && (
          <div className="text-center py-16">
            <Disc className="h-12 w-12 mx-auto text-green-400/50 mb-4" />
            <h3 className="text-xl font-mono mb-2">NO_RELEASES_YET</h3>
            <p className="text-green-400/70 mb-6">Publish your tracks to make them available to the world</p>
            <Button className="bg-green-400 text-black hover:bg-green-300 font-mono">
              CREATE_RELEASE
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
