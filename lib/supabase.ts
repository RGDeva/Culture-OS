import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a safe Supabase client that won't crash if credentials are missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
}

export interface User {
  id: string
  email: string
  wallet_address: string
  role: string
  metadata: any
}

export interface ArtistProfile {
  id: string
  user_id: string
  artist_type: string
  genres: string[]
  soundcloud: string
  spotify: string
}

export interface ListenerProfile {
  id: string
  user_id: string
  preferred_genres: string[]
  support_preferences: string[]
}

export interface OperatorProfile {
  id: string
  user_id: string
  service_name: string
  services_offered: string[]
  website: string
  location: string
  logo_url: string
  revenue_model: string
}

export async function createUserProfile(userId: string, role: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        role: role,
        created_at: new Date().toISOString(),
      },
    ])

  if (error) throw error
  return data
}

export async function updateArtistProfile(userId: string, data: Partial<ArtistProfile>) {
  const { error } = await supabase
    .from('artist_profiles')
    .upsert({
      user_id: userId,
      ...data,
    })

  if (error) throw error
}

export async function updateListenerProfile(userId: string, data: Partial<ListenerProfile>) {
  const { error } = await supabase
    .from('listener_profiles')
    .upsert({
      user_id: userId,
      ...data,
    })

  if (error) throw error
}

export async function updateOperatorProfile(userId: string, data: Partial<OperatorProfile>) {
  const { error } = await supabase
    .from('operator_profiles')
    .upsert({
      user_id: userId,
      ...data,
    })

  if (error) throw error
}
