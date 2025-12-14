export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

// YouTube API search endpoint
// TODO: Add real YouTube Data API v3 integration

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'channel'
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      )
    }
    
    // TODO: Implement real YouTube API search
    // Use YouTube Data API v3: https://developers.google.com/youtube/v3/docs/search/list
    
    // Mock results
    const mockResults = [
      {
        id: `youtube_${Date.now()}_1`,
        platform: 'youtube',
        name: `${query} - Official Channel`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://youtube.com/@${query.replace(/\s/g, '')}`,
        verified: true,
        followers: Math.floor(Math.random() * 5000000),
        type: 'channel',
      },
      {
        id: `youtube_${Date.now()}_2`,
        platform: 'youtube',
        name: `${query} - Topic`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://youtube.com/channel/mock_${query.replace(/\s/g, '_')}`,
        verified: false,
        type: 'channel',
      },
    ]
    
    return NextResponse.json({ results: mockResults })
  } catch (error: any) {
    console.error('[YOUTUBE_SEARCH] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}

/*
TODO: Real YouTube API Integration

1. Set up YouTube Data API:
   - Go to https://console.cloud.google.com/
   - Enable YouTube Data API v3
   - Create API key
   - Add to .env.local:
     YOUTUBE_API_KEY=your_api_key

2. Search API Call:
   const searchYouTube = async (query: string, type: string) => {
     const response = await fetch(
       `https://www.googleapis.com/youtube/v3/search?` +
       `part=snippet&q=${encodeURIComponent(query)}&type=${type}&key=${process.env.YOUTUBE_API_KEY}&maxResults=10`
     )
     const data = await response.json()
     
     if (data.items) {
       return data.items.map(item => ({
         id: item.id.channelId || item.id.videoId,
         platform: 'youtube',
         name: item.snippet.title,
         artistName: item.snippet.channelTitle,
         imageUrl: item.snippet.thumbnails.medium.url,
         url: type === 'channel' 
           ? `https://youtube.com/channel/${item.id.channelId}`
           : `https://youtube.com/watch?v=${item.id.videoId}`,
         type: type,
       }))
     }
     
     return []
   }

3. Get channel statistics for subscriber count:
   const getChannelStats = async (channelId: string) => {
     const response = await fetch(
       `https://www.googleapis.com/youtube/v3/channels?` +
       `part=statistics&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`
     )
     const data = await response.json()
     return data.items[0]?.statistics.subscriberCount
   }
*/
