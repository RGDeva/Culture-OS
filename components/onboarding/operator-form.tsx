"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { updateOperatorProfile } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import ImageUpload from "@/components/ui/image-upload"

interface OperatorFormData {
  serviceName: string
  servicesOffered: string[]
  website: string
  location: string
  logoUrl: string
  revenueModel: string
}

const serviceOptions = [
  "recording_studio",
  "mixing_mastering",
  "music_production",
  "live_sound",
  "equipment_rental",
  "music_education",
  "artist_management",
  "venue",
  "event_production"
]

const revenueModels = [
  "hourly_rate",
  "project_based",
  "subscription",
  "commission",
  "hybrid"
]

export function OperatorForm() {
  const [formData, setFormData] = useState<OperatorFormData>({
    serviceName: "",
    servicesOffered: [],
    website: "",
    location: "",
    logoUrl: "",
    revenueModel: ""
  })

  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = (service: string) => {
    setFormData((prev) => {
      const updatedServices = prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter((s) => s !== service)
        : [...prev.servicesOffered, service]
      return { ...prev, servicesOffered: updatedServices }
    })
  }

  const handleLogoUpload = async (url: string) => {
    setFormData((prev) => ({ ...prev, logoUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateOperatorProfile(useSearchParams().get('userId') as string, {
  service_name: formData.serviceName,
  services_offered: formData.servicesOffered,
  website: formData.website,
  location: formData.location,
  logo_url: formData.logoUrl,
  revenue_model: formData.revenueModel
})
      router.push('/operator_dashboard')
    } catch (error) {
      console.error('Error saving operator profile:', error)
    }
  }

  const isFormValid = formData.serviceName && formData.servicesOffered.length > 0

  return (
    <div className="min-h-screen bg-black text-green-400 relative">
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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-12">
          <Link href="/onboarding/operator" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK_TO_SYSTEM
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">OPERATOR_SETUP</h1>
          <div className="text-sm font-mono text-green-400/60">STEP_3/3</div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          {/* Service Name */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">STUDIO_SERVICE_NAME</h2>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleInputChange}
              placeholder="Enter your studio/service name"
              className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
            />
          </div>

          {/* Services Offered */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">SERVICES_OFFERED</h2>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map((service) => (
                <Button
                  key={service}
                  variant={formData.servicesOffered.includes(service) ? "default" : "outline"}
                  onClick={() => handleServiceChange(service)}
                  className="w-full justify-start"
                >
                  {service.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Website & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-green-400/80">WEBSITE</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-green-400/80">LOCATION</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">STUDIO_LOGO</h2>
            <ImageUpload onUpload={handleLogoUpload} />
          </div>

          {/* Revenue Model */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">REVENUE_MODEL</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {revenueModels.map((model) => (
                <Button
                  key={model}
                  variant={formData.revenueModel === model ? "default" : "outline"}
                  onClick={() => setFormData((prev) => ({ ...prev, revenueModel: model }))}
                  className="w-full justify-start"
                >
                  {model.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className={`w-full ${isFormValid ? "bg-green-400 hover:bg-green-500" : "bg-gray-600 cursor-not-allowed"}`}
            disabled={!isFormValid}
          >
            → DEPLOY_DASHBOARD
          </Button>
        </form>
      </div>
    </div>
  )
}
