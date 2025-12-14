import { Studio } from '@/types/project'

/**
 * Mock studio data for development
 * In production, this would come from an API/database
 */
export const MOCK_STUDIOS: Studio[] = [
  {
    id: 'studio-1',
    name: 'Sunset Sound Studios',
    location: 'Los Angeles, CA',
    verified: true,
  },
  {
    id: 'studio-2',
    name: 'Electric Lady Studios',
    location: 'New York, NY',
    verified: true,
  },
  {
    id: 'studio-3',
    name: 'Abbey Road Studios',
    location: 'London, UK',
    verified: true,
  },
  {
    id: 'studio-4',
    name: 'Patchwerk Recording Studios',
    location: 'Atlanta, GA',
    verified: true,
  },
  {
    id: 'studio-5',
    name: 'The Hit Factory',
    location: 'Miami, FL',
    verified: false,
  },
  {
    id: 'studio-6',
    name: 'Blackbird Studio',
    location: 'Nashville, TN',
    verified: true,
  },
  {
    id: 'studio-7',
    name: 'Capitol Studios',
    location: 'Los Angeles, CA',
    verified: true,
  },
  {
    id: 'studio-8',
    name: 'Sonic Ranch',
    location: 'Tornillo, TX',
    verified: false,
  },
  {
    id: 'studio-9',
    name: 'Red Bull Studios',
    location: 'Los Angeles, CA',
    verified: true,
  },
  {
    id: 'studio-10',
    name: 'Jungle City Studios',
    location: 'New York, NY',
    verified: false,
  },
]

/**
 * Get studio by ID
 */
export function getStudioById(id: string): Studio | undefined {
  return MOCK_STUDIOS.find((studio) => studio.id === id)
}

/**
 * Get all verified studios
 */
export function getVerifiedStudios(): Studio[] {
  return MOCK_STUDIOS.filter((studio) => studio.verified)
}

/**
 * Search studios by name or location
 */
export function searchStudios(query: string): Studio[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_STUDIOS.filter(
    (studio) =>
      studio.name.toLowerCase().includes(lowerQuery) ||
      studio.location?.toLowerCase().includes(lowerQuery)
  )
}
