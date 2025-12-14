"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { createUserProfile } from "@/lib/supabase"

interface Role {
  id: string
  title: string
  description: string
  icon: string
  benefits: string[]
  hoverText: string
}

const roles: Role[] = [
  {
    id: "artist",
    title: "ARTIST",
    description: "Create, release, and monetize your sound",
    icon: "🎵",
    benefits: [
      "Studio Access",
      "Distribution Support",
      "Revenue Optimization"
    ],
    hoverText: "Enter creative mode"
  },
  {
    id: "listener",
    title: "LISTENER",
    description: "Discover underground frequencies and support creators",
    icon: "🎧",
    benefits: [
      "Early Access",
      "Exclusive Content",
      "Direct Artist Connection"
    ],
    hoverText: "Enter discovery mode"
  },
  {
    id: "operator",
    title: "OPERATOR",
    description: "Provide services, tools, and infrastructure",
    icon: "⚙️",
    benefits: [
      "Creator Network",
      "Revenue Share",
      "Verified Listings"
    ],
    hoverText: "Enter service mode"
  }
]

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    // Store role in Supabase
    createUserProfile(useSearchParams().get('userId') as string, role)
      .then(() => router.push(`/onboarding/${role}`))
      .catch((error) => console.error('Error creating profile:', error))
  }

  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      {/* Matrix Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-green-400/20 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Floating Text */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        animate={{
          y: ["-100%", "100%"],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="text-green-400/30 text-2xl font-mono">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="absolute top-0 left-0 w-full text-center">
              {roles[i % 3].hoverText}
            </p>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-12">
          <Link href="/auth" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK_TO_SYSTEM
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">SELECT_ROLE</h1>
          <div className="text-sm font-mono text-green-400/60">STEP_2/3</div>
        </div>

        {/* Role Selection Grid */}
        <div className="space-y-8 w-full max-w-2xl">
          <div className="text-center text-green-400/80 mb-8">
            <p className="text-xl font-mono">CHOOSE_YOUR_ROLE</p>
            <p className="text-sm mt-2">Select your role in the NoCulture ecosystem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleRoleSelect(role.id)}
                onHoverStart={() => setHoveredRole(role.id)}
                onHoverEnd={() => setHoveredRole(null)}
                className={`p-6 rounded-lg border border-green-400/50 cursor-pointer transition-all duration-300 hover:border-green-400 hover:bg-black/80 relative overflow-hidden`}
              >
                {/* Hover Overlay */}
                {hoveredRole === role.id && (
                  <motion.div
                    className="absolute inset-0 bg-black/80 text-green-400/80 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xl font-mono">{role.hoverText}</p>
                  </motion.div>
                )}

                <div className="flex flex-col items-center space-y-4">
                  <div className="text-4xl">{role.icon}</div>
                  <h3 className="text-xl font-mono font-bold">{role.title}</h3>
                  <p className="text-green-400/80 text-center">{role.description}</p>
                  <div className="space-y-2">
                    {role.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="text-sm text-green-400/60"
                      >
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
