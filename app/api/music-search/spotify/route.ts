export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

// Spotify API search endpoint
// TODO: Add real Spotify API integration with OAuth token management

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'artist'
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      )
    }
    
    // TODO: Implement real Spotify API search
    // 1. Get Spotify access token (client credentials flow)
    // 2. Call Spotify search API: https://api.spotify.com/v1/search
    // 3. Transform results to PlatformSearchResult format
    
    // For now, return mock results
    const mockResults = [
      {
        id: `spotify_${Date.now()}_1`,
        platform: 'spotify',
        name: `${query} (Artist)`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://open.spotify.com/artist/mock_${query.replace(/\s/g, '_')}`,
        verified: true,
        followers: Math.floor(Math.random() * 1000000),
        type: type,
      },
      {
        id: `spotify_${Date.now()}_2`,
        platform: 'spotify',
        name: `${query} - Best Of`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://open.spotify.com/playlist/mock_${query.replace(/\s/g, '_')}`,
        verified: false,
        type: 'playlist',
      },
    ]
    
    return NextResponse.json({ results: mockResults })
  } catch (error: any) {
    console.error('[SPOTIFY_SEARCH] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}

/* 
TODO: Real Spotify API Integration

1. Set up Spotify App:
   - Go to https://developer.spotify.com/dashboard
   - Create app and get Client ID + Client Secret
   - Add to .env.local:
     SPOTIFY_CLIENT_ID=your_client_id
     SPOTIFY_CLIENT_SECRET=your_client_secret

2. Get Access Token (Client Credentials):
   const getSpotifyToken = async () => {
     const response = await fetch('https://accounts.spotify.com/api/token', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': 'Basic ' + Buffer.from(
           process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
         ).toString('base64'),
       },
       body: 'grant_type=client_credentials',
     })
     const data = await response.json()
     return data.access_token
   }

3. Search API Call:
   const searchSpotify = async (query: string, type: string, token: string) => {
     const response = await fetch(
       `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=10`,
       {
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       }
     )
     const data = await response.json()
     
     // Transform artists
     if (type === 'artist' && data.artists) {
       return data.artists.items.map(artist => ({
         id: artist.id,
         platform: 'spotify',
         name: artist.name,
         artistName: artist.name,
         imageUrl: artist.images[0]?.url,
         url: artist.external_urls.spotify,
         verified: artist.verified,
         followers: artist.followers.total,
         type: 'artist',
       }))
     }
     
     return []
   }

4. Cache token in memory/Redis for 1 hour
*/
