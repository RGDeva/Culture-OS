/**
 * Studio types for NoCulture OS
 */

export interface Studio {
  id: string
  name: string
  locationCity?: string
  locationState?: string
  locationCountry?: string
  latitude?: number
  longitude?: number
  description?: string
  services?: string[] // recording, mixing, mastering, podcast
  links?: {
    website?: string
    instagram?: string
    tiktok?: string
    x?: string
    youtube?: string
    booking?: string
  }
  teamMembers?: string[] // User IDs associated with this studio
  createdAt: string
  updatedAt: string
}

export interface StudioInput {
  name: string
  locationCity?: string
  locationState?: string
  locationCountry?: string
  description?: string
  services?: string[]
  links?: {
    website?: string
    instagram?: string
    tiktok?: string
    x?: string
    youtube?: string
    booking?: string
  }
}
