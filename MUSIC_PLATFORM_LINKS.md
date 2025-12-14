# Music Platform Links - Search & Connect Feature

## Overview
Comprehensive system for searching and connecting music platform profiles (Spotify, Apple Music, YouTube) without manual URL pasting. Users can search for their profiles and add them with one click.

---

## Features Implemented

### ✅ 1. Platform Search
- **Spotify Search** - Search for artists, tracks, albums, playlists
- **Apple Music Search** - Search for artists, albums, playlists
- **YouTube Search** - Search for channels and videos
- **Unified Search** - Search across all platforms simultaneously

### ✅ 2. Profile Link Management
- **Add Links** - Search and add with one click or paste URL
- **Display Links** - Show on profile pages with platform branding
- **Set Primary** - Mark favorite link per platform
- **Delete Links** - Remove unwanted links
- **Metadata** - Store followers, subscribers, monthly listeners

### ✅ 3. UI Components
- **AddProfileLinksModal** - Search interface with platform selection
- **ProfileLinksDisplay** - Display links on profile pages
- **Compact View** - Show links in profile cards
- **Full View** - Detailed view with stats and actions

---

## File Structure

```
types/
  profile-links.ts              # TypeScript interfaces

lib/
  musicPlatformSearch.ts        # Search utilities

app/api/
  music-search/
    spotify/route.ts            # Spotify API endpoint
    apple-music/route.ts        # Apple Music API endpoint
    youtube/route.ts            # YouTube API endpoint
  profile/
    links/route.ts              # Profile links CRUD API

components/profile/
  AddProfileLinksModal.tsx      # Add links modal with search
  ProfileLinksDisplay.tsx       # Display links component
```

---

## How It Works

### User Flow

```
1. User clicks "ADD_MUSIC_LINKS" on profile
   ↓
2. Modal opens with platform selection
   - Spotify
   - Apple Music
   - YouTube
   - SoundCloud
   ↓
3. User selects platform (e.g., Spotify)
   ↓
4. Two options:
   
   A. SEARCH:
      - Type artist name
      - Click "SEARCH"
      - Results show with:
        * Profile image
        * Name
        * Verified badge
        * Follower count
        * Type (artist/channel/etc)
      - Click "ADD" on desired result
      
   B. PASTE URL:
      - Paste full platform URL
      - Click "ADD_URL"
   ↓
5. Link saved to profile
   ↓
6. Link appears on profile page with:
   - Platform icon and color
   - Display name
   - Stats (followers, listeners)
   - External link button
   - Set primary / delete buttons (own profile)
```

### Data Flow

```
Search Request
    ↓
GET /api/music-search/{platform}?q=artist+name
    ↓
Platform API (Spotify/Apple/YouTube)
    ↓
Transform to PlatformSearchResult[]
    ↓
Return to UI
    ↓
User clicks "ADD"
    ↓
POST /api/profile/links
    ↓
Save ProfileLink to database
    ↓
Refresh profile links
    ↓
Display on profile
```

---

## API Endpoints

### Music Search APIs

**Spotify Search:**
```
GET /api/music-search/spotify?q={query}&type={artist|track|album}

Response:
{
  results: [
    {
      id: string
      platform: 'spotify'
      name: string
      artistName: string
      imageUrl: string
      url: string
      verified: boolean
      followers: number
      type: 'artist' | 'track' | 'album' | 'playlist'
    }
  ]
}
```

**YouTube Search:**
```
GET /api/music-search/youtube?q={query}&type={channel|video}

Response:
{
  results: [
    {
      id: string
      platform: 'youtube'
      name: string
      imageUrl: string
      url: string
      verified: boolean
      followers: number (subscribers)
      type: 'channel' | 'video'
    }
  ]
}
```

**Apple Music Search:**
```
GET /api/music-search/apple-music?q={query}&type={artists|songs|albums}

Response:
{
  results: [
    {
      id: string
      platform: 'apple_music'
      name: string
      imageUrl: string
      url: string
      verified: boolean
      type: 'artist' | 'album' | 'playlist'
    }
  ]
}
```

### Profile Links API

**Get Links:**
```
GET /api/profile/links?userId={userId}

Response:
{
  links: ProfileLink[]
}
```

**Add Link:**
```
POST /api/profile/links
Body:
{
  userId: string
  platform: MusicPlatform
  platformId: string
  url: string
  displayName: string
  imageUrl?: string
  verified?: boolean
  isPrimary?: boolean
  metadata?: {
    followers?: number
    monthlyListeners?: number
    subscribers?: number
  }
}

Response:
{
  link: ProfileLink
}
```

**Delete Link:**
```
DELETE /api/profile/links?userId={userId}&linkId={linkId}

Response:
{
  success: boolean
}
```

**Update Link:**
```
PATCH /api/profile/links
Body:
{
  userId: string
  linkId: string
  updates: Partial<ProfileLink>
}

Response:
{
  link: ProfileLink
}
```

---

## Integration Guide

### 1. Add to Profile Page

```tsx
import { ProfileLinksDisplay } from '@/components/profile/ProfileLinksDisplay'

// In your profile page component
<ProfileLinksDisplay
  userId={user.id}
  isOwnProfile={isOwnProfile}
  compact={false}
/>
```

### 2. Add to Profile Cards

```tsx
import { ProfileLinksDisplay } from '@/components/profile/ProfileLinksDisplay'

// In profile card component
<ProfileLinksDisplay
  userId={profile.userId}
  isOwnProfile={false}
  compact={true}
/>
```

### 3. Add to Network Page

```tsx
// In ProfileDetailModal or similar
<ProfileLinksDisplay
  userId={selectedProfile.userId}
  isOwnProfile={false}
/>
```

---

## Real API Integration

### Current Status: Mock Data
All search endpoints currently return mock data for development.

### Production Setup Required:

#### 1. Spotify API
```bash
# Get credentials
1. Go to https://developer.spotify.com/dashboard
2. Create app
3. Get Client ID + Client Secret
4. Add to .env.local:
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
```

**Implementation in `app/api/music-search/spotify/route.ts`:**
- Get access token via Client Credentials flow
- Call `https://api.spotify.com/v1/search`
- Transform response to `PlatformSearchResult[]`
- Cache token for 1 hour

#### 2. YouTube API
```bash
# Get API key
1. Go to https://console.cloud.google.com/
2. Enable YouTube Data API v3
3. Create API key
4. Add to .env.local:
   YOUTUBE_API_KEY=your_api_key
```

**Implementation in `app/api/music-search/youtube/route.ts`:**
- Call `https://www.googleapis.com/youtube/v3/search`
- Get channel statistics for subscriber count
- Transform to `PlatformSearchResult[]`

#### 3. Apple Music API
```bash
# Get credentials
1. Enroll in Apple Developer Program
2. Create MusicKit identifier
3. Generate JWT token
4. Add to .env.local:
   APPLE_MUSIC_TEAM_ID=your_team_id
   APPLE_MUSIC_KEY_ID=your_key_id
   APPLE_MUSIC_PRIVATE_KEY=your_private_key
```

**Implementation in `app/api/music-search/apple-music/route.ts`:**
- Generate JWT token for auth
- Call `https://api.music.apple.com/v1/catalog/us/search`
- Transform to `PlatformSearchResult[]`

---

## UI Examples

### Add Links Modal
```
┌─────────────────────────────────────────────┐
│ > ADD_MUSIC_LINKS                      [X]  │
├─────────────────────────────────────────────┤
│ SELECT_PLATFORM:                            │
│                                             │
│ ┌──────────────┐ ┌──────────────┐         │
│ │ 🎵 Spotify   │ │ 🎵 Apple     │         │
│ └──────────────┘ └──────────────┘         │
│ ┌──────────────┐ ┌──────────────┐         │
│ │ 📺 YouTube   │ │ 🎵 SoundCloud│         │
│ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────┘
```

### Search Results
```
┌─────────────────────────────────────────────┐
│ SEARCH_SPOTIFY:                             │
│ [🔍 Search for artist...] [SEARCH]         │
│                                             │
│ RESULTS:                                    │
│ ┌─────────────────────────────────────────┐│
│ │ [IMG] Drake ✓                           ││
│ │       ARTIST • 125M followers           ││
│ │                          [🔗] [ADD]     ││
│ └─────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────┐│
│ │ [IMG] Drake - Top Tracks                ││
│ │       PLAYLIST • 2.5M followers         ││
│ │                          [🔗] [ADD]     ││
│ └─────────────────────────────────────────┘│
│                                             │
│ OR_PASTE_URL:                               │
│ [🔗 Paste Spotify URL...] [ADD_URL]        │
└─────────────────────────────────────────────┘
```

### Profile Links Display
```
┌─────────────────────────────────────────────┐
│ > MUSIC_LINKS                      [+ ADD]  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │█ [IMG] Drake                            ││
│ │█       Spotify • 125M followers         ││
│ │█                    [🔗] [⭐] [🗑️]      ││
│ └─────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────┐│
│ │█ [IMG] Drake - Official Channel         ││
│ │█       YouTube • 50M subscribers        ││
│ │█                    [🔗] [☆] [🗑️]      ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## Platform Configuration

```typescript
PLATFORM_CONFIG = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',      // Green
    searchEnabled: true,
  },
  apple_music: {
    name: 'Apple Music',
    color: '#FA243C',      // Red
    searchEnabled: true,
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',      // Red
    searchEnabled: true,
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',      // Orange
    searchEnabled: false,  // Manual URL only
  },
  tidal: {
    name: 'Tidal',
    color: '#000000',      // Black
    searchEnabled: false,  // Manual URL only
  },
}
```

---

## Benefits

### For Users
✅ **No manual URL hunting** - Search and add in one click
✅ **Verified profiles** - See verified badges
✅ **Stats display** - Show follower/subscriber counts
✅ **Multiple platforms** - Connect all music profiles
✅ **Primary links** - Mark favorite profiles

### For Platform
✅ **Rich profiles** - More complete user profiles
✅ **Discovery** - Users can find each other's music
✅ **Credibility** - Verified platform links add trust
✅ **Engagement** - Drive traffic to user music
✅ **Network effects** - Connect creators across platforms

---

## Next Steps

### Immediate
1. ✅ Add to profile setup flow
2. ✅ Add to profile page
3. ✅ Add to network profile cards
4. ⏳ Integrate real Spotify API
5. ⏳ Integrate real YouTube API
6. ⏳ Integrate real Apple Music API

### Future Enhancements
- [ ] Auto-sync follower counts daily
- [ ] Show recent releases from platforms
- [ ] Embed Spotify player for tracks
- [ ] Show YouTube videos inline
- [ ] Platform verification badges
- [ ] Link analytics (clicks, views)
- [ ] Bulk import from CSV
- [ ] Social sharing of profile links

---

## Testing

### Manual Testing
```
1. Go to profile page
2. Click "ADD_MUSIC_LINKS"
3. Select Spotify
4. Search for "Drake"
5. Click "ADD" on first result
6. Verify link appears on profile
7. Click external link icon
8. Verify opens Spotify in new tab
9. Click star icon to set as primary
10. Click delete icon to remove
```

### API Testing
```bash
# Test Spotify search
curl http://localhost:3000/api/music-search/spotify?q=drake&type=artist

# Test YouTube search
curl http://localhost:3000/api/music-search/youtube?q=drake&type=channel

# Test add link
curl -X POST http://localhost:3000/api/profile/links \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "platform": "spotify",
    "url": "https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4",
    "displayName": "Drake"
  }'

# Test get links
curl http://localhost:3000/api/profile/links?userId=user_123
```

---

## Summary

✅ **Complete search & connect system**
✅ **No manual URL pasting required**
✅ **Support for Spotify, Apple Music, YouTube**
✅ **Rich profile display with stats**
✅ **Primary link marking**
✅ **Compact and full view modes**
✅ **Ready for real API integration**

Users can now easily search for and connect their music platform profiles, making their NoCulture OS profiles more complete and discoverable!
