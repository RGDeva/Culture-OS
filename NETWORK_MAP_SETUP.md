# Network Page - Studio Map Integration

## Overview
The Studio Map is now integrated into the Network page with a toggle to switch between Studios and Creators.

## How to Access

1. **Navigate to Network Page**: http://localhost:3000/network
2. **Click on "MAP" tab** (third tab in the navigation)
3. **Toggle between views**:
   - **STUDIOS** (default): Shows recording studios from Google Places
   - **CREATORS**: Shows registered creators from your platform

## Features

### Studios View
- **Default Location**: Massachusetts (Boston area)
- **Search**: Use the place picker to find studios anywhere in the world
- **Filters**: All / Recording / Rehearsal
- **Studio Details**:
  - Photos
  - Ratings (Google reviews)
  - Address
  - Direct link to Google Maps
- **Interactive Map**:
  - Green markers for studios
  - Click markers to select studio
  - Custom dark theme with matrix green styling
  - Recenter button to return to your location

### Creators View
- Shows all registered creators on the platform
- Click markers to view creator profiles
- Filter by location, role, genre, XP tier

## Navigation Structure

```
Network Page
├── People Tab (default)
├── Bounties Tab
└── Map Tab
    ├── STUDIOS Button (shows StudioMap)
    └── CREATORS Button (shows CreatorMap)
```

## Technical Details

- **Component**: `/components/map/StudioMap.tsx`
- **Page**: `/app/network/page.tsx`
- **Default View**: Studios (starts in Massachusetts)
- **API**: Google Maps Extended Component Library
- **API Key**: Hardcoded in component
- **Search Radius**: 15km

## Toggle Implementation

The map view is controlled by state:
```typescript
const [mapView, setMapView] = useState<'creators' | 'studios'>('studios')
```

Users can switch between:
- **Studios**: Full-screen map with Google Places studios
- **Creators**: Bordered map with platform creators

## URL Access

- Direct link to map tab: http://localhost:3000/network?tab=map
- Will default to Studios view
