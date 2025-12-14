# Profile Setup & Intelligence Flow Implementation

## Overview
Comprehensive profile setup and intelligence aggregation system for NoCulture OS, enabling users to complete their profiles, connect external platforms, and view aggregated metrics.

## ✅ Completed Implementation

### 1. **Profile Types & Data Model** (`types/profile.ts`)
Extended profile types with:
- `UserRole` type (ARTIST, PRODUCER, ENGINEER, STUDIO, MANAGER, OTHER)
- `ExternalLinks` interface for platform URLs
- `Capabilities` interface for marketplace/bounty features
- `ProfileMetrics` interface for analytics aggregation
- `EarningsSummary` interface for NoCulture OS earnings
- `profileCompletion` field (0-100%)

### 2. **Profile Storage** (`lib/profileStore.ts`)
Enhanced in-memory profile store with:
- `calculateProfileCompletion()` function:
  - +40% for basic identity + at least one role
  - +30% for at least 1 platform link
  - +20% for at least 1 social link
  - +10% for at least one capability enabled
- Updated `upsertProfile()` to handle partial updates
- Support for capabilities and highlight tracks
- Automatic Spotify artist ID extraction from URLs

### 3. **API Routes**

#### `/api/profile` (GET, POST, PUT)
- **GET**: Returns profile or default empty profile (never 404)
- **POST/PUT**: Creates or updates profile with completion calculation
- Extracts Spotify artist ID from URL automatically
- Returns updated profile with completion percentage

#### `/api/profile/metrics` (GET)
- Aggregates external platform metrics
- Returns `ProfileMetrics` with:
  - `platformsConnected` count
  - `monthlyListeners` (mock data for now)
  - `streamsLast30Days` (mock data for now)
  - `topTrackName` (mock data for now)
  - `socialFollowers` (mock data for now)
- **Never throws** - returns partial data on errors
- TODO: Integrate with Songstats/Recoupable when env vars available

#### `/api/earnings` (GET)
- Returns NoCulture OS earnings summary
- Mock data structure ready for real integration:
  - `totalEarned`
  - `thisMonth`
  - `pendingPayouts`
  - `breakdown` (marketplace assets, services, vault bounties)
- **Never throws** - returns zero earnings on errors
- TODO: Integrate with actual purchase/bounty tracking

### 4. **Profile Setup Page** (`/profile/setup`)
Comprehensive 4-step wizard:

#### **Step 1: Identity**
- Display name (required)
- Handle (optional)
- Roles (multi-select, required)
- Genres (up to 3)
- Location (city, country)

#### **Step 2: Platform Links**
- Spotify artist URL
- Apple Music URL
- SoundCloud URL
- YouTube URL

#### **Step 3: Social Links**
- Instagram URL
- TikTok URL
- X (Twitter) URL
- Website URL

#### **Step 4: Capabilities**
- Sells assets (beats/kits/samples)
- Offers services (mix/master/coaching)
- Posts bounties/open collabs
- Runs studio/offers sessions

**Features:**
- Progress indicator with step navigation
- Form validation
- Loads existing profile data for editing
- Saves to `/api/profile` endpoint
- Redirects to Intelligence Center on completion
- Terminal/neon aesthetic consistent with app

### 5. **Intelligence Center Updates** (`/`)
Enhanced homepage with profile integration:

#### **Profile Completion Gating**
- Fetches profile on authentication
- Shows completion percentage and progress bar
- Displays "FINISH_PROFILE" button if < 100%
- Routes to `/profile/setup` if completion < 60%
- Non-blocking - never hangs the UI

#### **Smart CTA Routing**
- Not logged in → Privy login
- Logged in + completion < 60% → `/profile/setup`
- Logged in + completion ≥ 60% → `/dashboard`

#### **Profile Display**
- Shows user's roles
- Displays completion percentage (color-coded)
- Progress bar visualization
- Quick access to profile setup

### 6. **Data Flow**

```
User Login (Privy)
    ↓
GET /api/profile?userId=xxx
    ↓
Profile exists?
    ├─ Yes → Check profileCompletion
    │   ├─ < 60% → Show setup prompt
    │   └─ ≥ 60% → Show intelligence dashboard
    └─ No → Return empty profile (completion: 0%)
        ↓
    Redirect to /profile/setup
        ↓
    User completes 4-step wizard
        ↓
    POST /api/profile (with all data)
        ↓
    Profile saved + completion calculated
        ↓
    Redirect to Intelligence Center
```

## 🎯 Profile Completion Scoring

| Component | Points | Criteria |
|-----------|--------|----------|
| **Identity** | 40% | Display name + at least 1 role |
| **Platform Links** | 30% | At least 1 music platform connected |
| **Social Links** | 20% | At least 1 social profile connected |
| **Capabilities** | 10% | At least 1 capability enabled |
| **Total** | 100% | |

## 🔧 Technical Details

### **In-Memory Storage**
- All profile data stored in `Map<userId, Profile>`
- No database required for demo/development
- Console warnings if external APIs unavailable
- Graceful fallbacks to mock data

### **Error Handling**
- 3-second timeout on profile fetches
- Never blocks UI on errors
- Returns partial/mock data instead of throwing
- Clear console logging for debugging

### **Styling**
- Consistent terminal/neon green aesthetic
- Monospace fonts throughout
- Border-based layouts
- Hover effects and transitions
- Color-coded completion states:
  - < 60%: Yellow (warning)
  - ≥ 60%: Green (good)
  - 100%: Green (complete)

## 📝 TODO / Future Enhancements

### **External API Integration**
- [ ] Integrate Songstats API for real streaming metrics
- [ ] Integrate Recoupable API for fan insights
- [ ] Add Spotify API for artist verification
- [ ] Add Apple Music API integration
- [ ] Add SoundCloud API integration

### **Vault Integration**
- [ ] Upload highlight tracks during profile setup
- [ ] Link highlight tracks to profile
- [ ] Display audio preview players
- [ ] Connect vault projects to profile

### **Earnings Integration**
- [ ] Track actual marketplace purchases
- [ ] Track vault bounty payments
- [ ] Track service bookings
- [ ] Generate real earnings reports

### **Profile Features**
- [ ] Profile photo upload
- [ ] Bio/description field
- [ ] Timezone selection
- [ ] Price range configuration for services
- [ ] Portfolio/work samples section

### **Intelligence Dashboard**
- [ ] Real-time metrics updates
- [ ] Campaign recommendations based on data
- [ ] Trend analysis and insights
- [ ] Comparative analytics (vs. similar artists)
- [ ] Growth tracking over time

### **Network Integration**
- [ ] Show profile in /network directory
- [ ] Filter by capabilities
- [ ] Search by genres/roles
- [ ] Connection/follow system

## 🚀 Testing Guide

### **1. Test Profile Setup Flow**
```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000
# 1. Click "INITIATE_PROTOCOL" or "INTELLIGENCE_CENTER"
# 2. Login with Privy
# 3. Should redirect to /profile/setup (if new user)
# 4. Complete all 4 steps:
#    - Add name and role
#    - Add platform links
#    - Add social links
#    - Enable capabilities
# 5. Click "SAVE_PROFILE"
# 6. Should redirect to / with completion bar
```

### **2. Test Profile Completion Gating**
```bash
# With incomplete profile (< 60%):
# - Homepage shows yellow completion percentage
# - "FINISH_PROFILE" button visible
# - Clicking CTA redirects to /profile/setup

# With complete profile (≥ 60%):
# - Homepage shows green completion percentage
# - "FINISH_PROFILE" button still visible if < 100%
# - Clicking CTA redirects to /dashboard
```

### **3. Test API Endpoints**
```bash
# Get profile
curl http://localhost:3000/api/profile?userId=test-user-123

# Create/update profile
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "displayName": "Test Artist",
    "roles": ["ARTIST"],
    "spotifyUrl": "https://open.spotify.com/artist/abc123"
  }'

# Get metrics
curl http://localhost:3000/api/profile/metrics?userId=test-user-123

# Get earnings
curl http://localhost:3000/api/earnings?userId=test-user-123
```

### **4. Test Profile Editing**
```bash
# Navigate to /profile/setup while logged in
# - Should load existing profile data
# - Can modify any field
# - Saves update profile completion
# - Redirects back to homepage
```

## 📊 Expected Console Output

```
[PROFILE] Upserted profile: { userId: 'xxx', profileId: 'profile_xxx', completion: 40 }
[PROFILE_API] Profile saved: { userId: 'xxx', completion: 70 }
[METRICS_API] Generated metrics for user: { userId: 'xxx', platformsConnected: 2 }
[EARNINGS_API] Generated earnings for user: xxx
[HOME] Profile fetch timeout, continuing without profile (if timeout occurs)
```

## 🎨 UI Components

### **Profile Completion Bar**
- Horizontal progress bar
- Green fill based on percentage
- Animated transitions
- Shows exact percentage

### **Step Wizard**
- 4 steps with icons
- Active/completed/pending states
- Navigation between steps
- Form validation per step

### **Capability Toggles**
- Checkbox-based selection
- Descriptive labels
- Hover effects
- Terminal-style borders

## 🔐 Security Notes

- No sensitive data stored (only public profile info)
- User ID from Privy authentication
- No password/token storage
- In-memory storage (ephemeral)
- Ready for database migration

## 📦 Files Modified/Created

### **Created:**
- `/app/profile/setup/page.tsx` - Profile setup wizard
- `/app/api/profile/metrics/route.ts` - Metrics aggregation API
- `/app/api/earnings/route.ts` - Earnings summary API
- `/data/tools.json` - Tools directory data (170+ tools)
- `PROFILE_INTELLIGENCE_IMPLEMENTATION.md` - This document

### **Modified:**
- `/types/profile.ts` - Extended with new interfaces
- `/lib/profileStore.ts` - Added completion calculation
- `/app/api/profile/route.ts` - Updated to handle new fields
- `/app/page.tsx` - Added profile completion gating
- `/app/vault/page.tsx` - Fixed JSX syntax error

### **Existing (Unchanged):**
- `/app/vault/*` - Vault functionality intact
- `/app/marketplace/*` - Marketplace functionality intact
- `/app/network/*` - Network functionality intact
- Privy configuration - No changes to auth
- x402 checkout - No changes to payments

## ✅ Success Criteria Met

- ✅ Profile types and storage implemented
- ✅ Profile API with completion scoring
- ✅ Metrics and earnings API routes
- ✅ 4-step profile setup wizard
- ✅ Profile completion gating on homepage
- ✅ Smart CTA routing based on completion
- ✅ Mock data fallbacks (no crashes)
- ✅ Terminal aesthetic maintained
- ✅ Non-blocking UI (timeouts handled)
- ✅ Existing features unchanged

## 🎉 Ready for Demo!

The profile setup and intelligence flow is now fully functional and ready for testing. Users can:
1. Complete their profile through an intuitive wizard
2. See their completion percentage on the homepage
3. Be guided to complete their profile if < 60%
4. View aggregated metrics (mock data for now)
5. Access all existing features without disruption

Next steps: Integrate real external APIs when credentials are available!
