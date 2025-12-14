# Studio Map Features

## Overview
The Studio Map uses Google Maps Extended Component Library to display recording studios, music studios, and rehearsal spaces near you.

## Features Implemented

### 1. **Google Maps Integration**
- Uses Extended Component Library (modern web components)
- API Key: `AIzaSyAy6xjUsfb34ncystO3K6mqFa6oknUdtV0`
- Custom dark theme matching your UI/UX aesthetic

### 2. **Place Search**
- Built-in place picker with autocomplete
- Search for any location worldwide
- Automatically finds studios near searched location
- 10km radius search

### 3. **Studio Discovery**
- Auto-detects user location
- Searches for:
  - Recording studios
  - Music studios
  - Rehearsal spaces
- Shows studio markers on map (green circles)

### 4. **Studio Details**
- Name and address
- Google ratings (star rating)
- Photos (if available)
- Direct link to Google Maps for directions

### 5. **Filters**
- **ALL**: Show all studios
- **RECORDING**: Filter to recording studios only
- **REHEARSAL**: Filter to rehearsal spaces only

### 6. **Interactive Sidebar**
- List of all nearby studios
- Click to center map on studio
- Scroll through results
- Visual selection highlight

### 7. **Map Controls**
- Recenter button (cyan) - returns to your location
- Place picker search bar (top)
- Zoom controls
- Click markers to select studio

### 8. **Custom Styling**
```javascript
{
  backgroundColor: '#0a0a0a',      // Black background
  labels: '#00ff41',               // Matrix green labels
  roads: '#1a1a1a',                // Dark gray roads
  roadStrokes: '#00ff41',          // Green road outlines
  water: '#001a0a',                // Dark green water
  poi: '#0d1f0d'                   // Dark green POIs
}
```

## Usage

1. Navigate to `/map`
2. Allow location access when prompted
3. Map loads with studios near you
4. Use search bar to find studios in other locations
5. Click studio cards or markers to view details
6. Click "VIEW_ON_GOOGLE_MAPS" for directions

## Toggle Between Maps

- **Studio Map** (default): Shows recording studios from Google Places
- **Creator Map**: Shows registered creators from your platform
- Toggle button in top-right corner

## Technical Details

- **Component**: `/components/map/StudioMap.tsx`
- **Page**: `/app/map/page.tsx`
- **Library**: Google Maps Extended Component Library v0.6.11
- **APIs Used**: Places API, Maps JavaScript API
- **Search Radius**: 10km (10,000 meters)
- **Keywords**: "recording studio music studio rehearsal space"
