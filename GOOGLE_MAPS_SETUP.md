# Google Maps API Setup

## API Key Configured

The Studio Map is now using Google Maps Extended Component Library with the provided API key:
- **Primary Key**: `AIzaSyAy6xjUsfb34ncystO3K6mqFa6oknUdtV0`
- **Backup Key**: `AIzaSyDRnmKf_K9u5ERGRcez0n5UHdq2vwws7fU`

The map is hardcoded with the primary key and uses the Extended Component Library which provides:
- Modern web components (`<gmp-map>`, `<gmpx-place-picker>`)
- Built-in place search and autocomplete
- Simplified API usage
- Better performance

## Custom Styling Applied

The map uses a dark theme matching your UI/UX:
- **Background**: Black (#0a0a0a)
- **Labels**: Matrix green (#00ff41)
- **Roads**: Dark gray (#1a1a1a) with green strokes
- **Water**: Dark green (#001a0a)
- **POI**: Dark green (#0d1f0d)

## Features

The Studio Map will:
- Show your current location
- Search for recording studios, music studios, and rehearsal spaces within 10km
- Display studios on a dark-themed map
- Show studio details: name, address, rating, photos
- Allow searching by location
- Filter by studio type (recording/rehearsal)
- Link to Google Maps for directions

## API Usage

The map uses:
- **Places API** - To search for studios
- **Maps JavaScript API** - To display the interactive map
- **Geocoding** - To get user location

Make sure your API key has sufficient quota for these services.
