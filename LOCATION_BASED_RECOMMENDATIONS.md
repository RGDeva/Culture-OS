# 📍 Location-Based Bounty Recommendations - Complete

## ✅ **What's Been Implemented**

A comprehensive location-based recommendation system that suggests bounties/gigs based on:
- ✅ **User's current location** (GPS coordinates)
- ✅ **Distance from bounty** (calculated in real-time)
- ✅ **Role matching** (filter by your skills)
- ✅ **Remote work preference**
- ✅ **Recommendation scoring** (personalized ranking)

---

## 🎯 **Key Features**

### **1. Location Detection** ✅
- Browser geolocation API integration
- One-click location enable
- Privacy-friendly (requires user permission)
- Fallback for users without location

### **2. Distance Calculation** ✅
- Haversine formula for accurate distance
- Supports kilometers
- Real-time distance display
- Adjustable radius filter (5km - 500km)

### **3. Smart Recommendations** ✅
- **Role matching** - Prioritizes bounties for your skills
- **Distance scoring** - Closer bounties rank higher
- **Budget weighting** - Higher paying gigs score better
- **Recency bonus** - Newer bounties get priority
- **Remote OK bonus** - Remote work gets extra points

### **4. Advanced Filtering** ✅
- Filter by role (Artist, Producer, Engineer, etc.)
- Filter by maximum distance
- Remote-only toggle
- Combine multiple filters

---

## 📁 **New Files Created**

### **1. `/lib/location-utils.ts`** - Location Utilities
**Functions:**
```typescript
// Calculate distance between two coordinates
calculateDistance(coord1, coord2): number

// Get user's current GPS location
getCurrentLocation(): Promise<Coordinates | null>

// Geocode city/country to coordinates
geocodeLocation(city, country): Promise<Coordinates | null>

// Format distance for display
formatDistance(km): string // "2.5km away"

// Sort items by distance
sortByDistance(items, userLocation): T[]

// Filter items by max distance
filterByDistance(items, userLocation, maxKm): T[]
```

### **2. `/app/api/bounties/recommendations/route.ts`** - Recommendations API
**Endpoint:** `GET /api/bounties/recommendations`

**Query Parameters:**
- `lat` - User latitude
- `lng` - User longitude
- `role` - Filter by role (ARTIST, PRODUCER, etc.)
- `maxDistance` - Maximum distance in km
- `remoteOnly` - Show only remote bounties

**Response:**
```json
{
  "recommendations": [
    {
      ...bounty,
      "distance": 12.5,
      "recommendationScore": 145
    }
  ],
  "total": 15,
  "filters": {
    "role": "PRODUCER",
    "maxDistance": 100,
    "remoteOnly": false,
    "hasLocation": true
  }
}
```

### **3. `/components/bounties/BountyRecommendations.tsx`** - UI Component
**Features:**
- Location enable button
- Filter panel (role, distance, remote)
- Recommendation cards with distance
- Match score display
- "TOP_MATCH" badges for best recommendations
- Loading states
- Empty states

---

## 🧮 **Recommendation Algorithm**

### **Scoring System:**

```typescript
Base Score: 100 points

+ Role Match: +50 points (if role matches user's role)

+ Distance Bonus:
  - < 5km: +30 points
  - < 25km: +20 points
  - < 100km: +10 points
  - > 100km: -5 points per 10km (max -50)

+ Remote OK: +15 points

+ Budget Bonus: +0 to +30 points (based on budget amount)

+ Recency Bonus:
  - < 1 day old: +20 points
  - < 7 days old: +10 points
  - > 30 days old: -10 points

Final Score: Sum of all bonuses (minimum 0)
```

**Sorting:** Recommendations sorted by final score (highest first)

---

## 🗺️ **Location Data Structure**

### **Updated Bounty Type:**
```typescript
export interface Coordinates {
  lat: number
  lng: number
}

export interface Bounty {
  // ... existing fields
  locationCity?: string | null
  locationCountry?: string | null
  coordinates?: Coordinates | null  // NEW: For distance calculation
}
```

### **Mock Coordinates Added:**
```typescript
// New York
{ lat: 40.7128, lng: -74.0060 }

// Los Angeles  
{ lat: 34.0522, lng: -118.2437 }

// Atlanta
{ lat: 33.7490, lng: -84.3880 }
```

---

## 🎨 **User Interface**

### **Recommendation Card:**
```
┌─────────────────────────────────────────┐
│ [TOP_MATCH]                      145    │
│                                  MATCH  │
│ ADD_VOCALS_TO_MIDNIGHT_BEAT             │
│ Looking for a vocalist to add hooks...  │
│                                         │
│ [ARTIST] $150-$250 USDC 📍 2.5km away  │
│ REMOTE_OK  New York, USA                │
└─────────────────────────────────────────┘
```

### **Filter Panel:**
```
┌─────────────────────────────────────────┐
│ 📍 LOCATION_ENABLED                     │
│ Showing gigs near you (100km radius)    │
│                                [UPDATE] │
├─────────────────────────────────────────┤
│ [SHOW_FILTERS]                          │
│                                         │
│ FILTER_BY_ROLE                          │
│ [ALL] [ARTIST] [PRODUCER] [ENGINEER]   │
│                                         │
│ MAX_DISTANCE: 100km                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ 5km                              500km  │
│                                         │
│ ☑ REMOTE_ONLY                           │
└─────────────────────────────────────────┘
```

---

## 🧪 **Testing Guide**

### **Test 1: Enable Location**
```bash
# Visit recommendations page
http://localhost:3000/network?tab=recommendations

# Click "ENABLE" button
# Browser will ask for location permission
# Allow location access

# Expected:
✅ Location detected
✅ Bounties sorted by distance
✅ Distance shown on each card
✅ Closest bounties at top
```

### **Test 2: Filter by Role**
```bash
# After enabling location
# Click "SHOW_FILTERS"
# Click "PRODUCER" role

# Expected:
✅ Only producer bounties shown
✅ Still sorted by distance
✅ Match scores updated
```

### **Test 3: Adjust Distance**
```bash
# Move distance slider to 25km

# Expected:
✅ Only bounties within 25km shown
✅ Remote bounties still included
✅ Count updates
```

### **Test 4: Remote Only**
```bash
# Check "REMOTE_ONLY" checkbox

# Expected:
✅ Only remote bounties shown
✅ Distance filter ignored
✅ No location required
```

### **Test 5: API Direct Testing**
```bash
# Test recommendations API
curl "http://localhost:3000/api/bounties/recommendations?lat=40.7128&lng=-74.0060&role=ARTIST&maxDistance=50"

# Expected response:
{
  "recommendations": [
    {
      "id": "bounty_1",
      "title": "ADD_VOCALS_TO_MIDNIGHT_BEAT",
      "distance": 0,
      "recommendationScore": 195,
      ...
    }
  ],
  "total": 3,
  "filters": {
    "role": "ARTIST",
    "maxDistance": 50,
    "remoteOnly": false,
    "hasLocation": true
  }
}
```

---

## 🚀 **Integration Guide**

### **Add to Network Page:**
```tsx
import { BountyRecommendations } from '@/components/bounties/BountyRecommendations'

// In your network page
<BountyRecommendations
  userId={user?.id}
  userRole={profile?.roles[0]}
  onBountyClick={(bounty) => {
    // Handle bounty click
    setSelectedBounty(bounty)
    setShowDetailModal(true)
  }}
/>
```

### **Add as Separate Page:**
```tsx
// /app/gigs/page.tsx
export default function GigsPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <BountyRecommendations />
    </div>
  )
}
```

---

## 📊 **Distance Examples**

| Location | Distance from NYC | Display |
|----------|-------------------|---------|
| Same location | 0 km | "0m away" |
| Brooklyn | 8 km | "8km away" |
| Philadelphia | 130 km | "130km away" |
| Boston | 306 km | "306km away" |
| Los Angeles | 3,944 km | "3944km away" |

---

## 🌍 **Geocoding Support**

### **Currently Supported Cities:**
- New York, USA
- Los Angeles, USA
- Chicago, USA
- Miami, USA
- Atlanta, USA
- London, UK
- Paris, France
- Berlin, Germany
- Tokyo, Japan
- Toronto, Canada
- Sydney, Australia

### **Add More Cities:**
```typescript
// In lib/location-utils.ts
const cityCoordinates: Record<string, Coordinates> = {
  'your city,country': { lat: XX.XXXX, lng: YY.YYYY }
}
```

---

## 🎯 **Use Cases**

### **1. Local Studio Sessions**
```
User in LA → Sees LA studio bounties first
Distance: 5km → Score: +30
Role match: STUDIO → Score: +50
Total: High priority
```

### **2. Remote Collaboration**
```
User anywhere → Sees all remote bounties
Remote OK: +15 points
No distance penalty
Budget: High → Extra points
```

### **3. Regional Opportunities**
```
User in Atlanta → Sees Southeast US bounties
Distance: 50km → Score: +10
Role match: ENGINEER → Score: +50
Recent post: +20
Total: Good match
```

---

## 🔧 **Configuration**

### **Distance Ranges:**
```typescript
// Adjust in component
const [maxDistance, setMaxDistance] = useState<number>(100)

// Range: 5km - 500km
// Step: 5km
```

### **Recommendation Count:**
```typescript
// In API route
recommendations.slice(0, 20) // Top 20 recommendations
```

### **Score Weights:**
```typescript
// Adjust in /app/api/bounties/recommendations/route.ts
const ROLE_MATCH_BONUS = 50
const DISTANCE_CLOSE_BONUS = 30
const REMOTE_BONUS = 15
const BUDGET_MULTIPLIER = 0.1
```

---

## ✅ **Success Criteria - ALL MET**

- ✅ Location detection via GPS
- ✅ Distance calculation (Haversine formula)
- ✅ Filter by role
- ✅ Filter by distance
- ✅ Remote-only filter
- ✅ Recommendation scoring algorithm
- ✅ Sort by relevance
- ✅ Beautiful UI with terminal aesthetic
- ✅ Loading states
- ✅ Empty states
- ✅ API routes
- ✅ Mock data with coordinates
- ✅ Full documentation

---

## 🎉 **Ready to Use!**

The location-based recommendation system is fully functional:

```bash
# Start dev server
npm run dev

# Visit recommendations
http://localhost:3000/network?tab=recommendations

# Or test API directly
curl "http://localhost:3000/api/bounties/recommendations?lat=40.7128&lng=-74.0060"
```

**All location-based features are operational!** 📍🚀
