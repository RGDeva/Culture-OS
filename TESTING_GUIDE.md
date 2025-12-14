# 🧪 NoCulture OS Testing Guide

## 🚀 Dev Server Running

**URL:** http://localhost:3001

The app is now running and ready to test! All Recoupable ingestion has been wired up.

---

## 🎯 What to Test

### **1. Homepage - New Control Surface**
✅ Visit http://localhost:3001
- Should see 5 new tiles:
  - **CORE_MODULES:** VAULT, MARKETPLACE, NETWORK
  - **FINANCE_LAYER:** EARNINGS / VAULTS
  - **TOOLS:** TOOLS DIRECTORY
- Click each tile to verify navigation

### **2. Profile Onboarding Flow**
✅ **Route:** http://localhost:3001/onboarding

**Test flow:**
1. Click "LOGIN" (use Privy - email or wallet)
2. **Step 1/2:** Select at least one role (Artist, Producer, etc.)
3. Click "NEXT"
4. **Step 2/2:** Add platform links:
   - **For real Recoupable data, use:**
     - Recoupable Account ID: `09a73efd-b43c-4a53-8a41-ec16ea632bd9` (default test account)
     - Spotify Artist URL: Any real artist URL (e.g., `https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x`)
   - Other platforms optional
5. Click "COMPLETE_SETUP"
6. Watch for "Syncing your data..." message
7. Redirected to homepage

**What happens behind the scenes:**
- Profile saved to in-memory store
- Spotify artist ID extracted from URL
- Background API call to `/api/profile/ingest/recoupable`
- Recoupable API fetches:
  - Social metrics (Instagram, TikTok, X followers)
  - Fan segments
  - Posts
  - Spotify data (artist name, followers, top tracks)
- Campaign recommendations generated
- Data stored in snapshot cache

### **3. View Recoupable Data**
✅ **Test page:** http://localhost:3001/test-recoup

**What you'll see:**
- Overview (User ID, Artist Account ID, Fetch time)
- **Spotify Data** (if URL provided):
  - Artist name, followers
  - Top 5 tracks with popularity scores
- **Social Metrics:**
  - Instagram, TikTok, X, YouTube followers
- **Fan Data:**
  - Total fans
  - Top countries
- **Fan Segments:**
  - Segment names, sizes, descriptions
- **Recent Posts:** Count
- **Raw JSON:** Full snapshot data

**Refresh button** fetches latest snapshot from cache.

### **4. Network Page**
✅ **Route:** http://localhost:3001/network

**3 tabs to test:**

#### **Tab 1: DIRECTORY**
- Search creators by name
- Filter by role (dropdown)
- View profile cards with:
  - Name, roles, bio
  - Location (if set)
  - "OPEN_TO_COLLABS" badge
  - MESSAGE/CONNECT buttons

#### **Tab 2: MAP_VIEW**
- Interactive map showing creators with location data
- Click markers to view profiles
- Shows count of creators with location
- Empty state if no location data

#### **Tab 3: OPEN_COLLABS**
- Lists Vault projects with open roles
- Shows:
  - Project title, tags
  - Open roles with compensation type
  - APPLY and VIEW_DETAILS buttons
- "POST_PROJECT" button → `/vault/new`
- Empty state if no projects

### **5. Create Vault Project**
✅ **Route:** http://localhost:3001/vault/new

**Test flow:**
1. Fill required field: **Title** (e.g., "My New Track")
2. Add tags (e.g., "trap", "hip-hop")
3. Add preview URL (SoundCloud, YouTube, etc.)
4. Add stems URL (Google Drive, Dropbox, etc.)
5. Add open roles:
   - Click "ADD_ROLE"
   - Enter role name (e.g., "Mix Engineer")
   - Select compensation type (Flat Fee / Points / Both)
6. Click "CREATE_PROJECT"
7. Redirected to `/vault`
8. Project appears in "YOUR_PROJECTS" section

**Verify:**
- Go to `/network` → OPEN_COLLABS tab
- Your project should appear there!

### **6. Vault Page**
✅ **Route:** http://localhost:3001/vault

**What to test:**
- "CREATE_NEW_PROJECT" button (pink)
- "YOUR_PROJECTS" section shows created projects
- Each project card shows:
  - Title, tags
  - "X OPEN_ROLES" badge (if roles added)
  - PREVIEW button (if URL provided)
  - STEMS button (if URL provided)
- Files section below (existing functionality)

### **7. Earnings Page**
✅ **Route:** http://localhost:3001/earnings

**What to see:**
- Stats grid (Total Earnings, Pending Payouts, Growth)
- "RECOUPABLE_DATA" section with "CONNECT_RECOUPABLE" button
- Payout history (empty state)
- "COMING_SOON" features list

### **8. Tools Directory**
✅ **Route:** http://localhost:3001/tools

**What to test:**
- Category filter buttons (All, Streaming, Analytics, etc.)
- Tool cards showing:
  - Recoupable (ACTIVE) - "CONNECT" button
  - Other tools (COMING_SOON)
- "How to Integrate" guide at bottom
- Documentation links (where available)

---

## 🔬 API Testing

### **Recoupable Ingestion Endpoint**
```bash
# Test with curl (replace USER_ID with actual Privy user ID)
curl -X POST http://localhost:3001/api/profile/ingest/recoupable \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "recoupableAccountId": "09a73efd-b43c-4a53-8a41-ec16ea632bd9"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Recoupable data synced successfully",
  "status": "completed",
  "accountId": "09a73efd-b43c-4a53-8a41-ec16ea632bd9",
  "summary": {
    "spotifyArtist": "Artist Name",
    "spotifyFollowers": 12345,
    "igFollowers": 5000,
    "tiktokFollowers": 8000,
    "fanSegments": 3,
    "posts": 10,
    "recommendations": 5
  }
}
```

### **Profile API**
```bash
# Create profile with Spotify + Recoupable
curl -X POST http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "roles": ["Artist", "Producer"],
    "spotifyArtistUrl": "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x",
    "instagramUrl": "https://instagram.com/username",
    "recoupableAccountId": "09a73efd-b43c-4a53-8a41-ec16ea632bd9"
  }'
```

### **Vault Projects API**
```bash
# Create project
curl -X POST http://localhost:3001/api/vault/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Test Track",
    "tags": ["trap", "hip-hop"],
    "previewUrl": "https://soundcloud.com/...",
    "openRoles": [
      {
        "label": "Vocalist",
        "compensationType": "points"
      }
    ]
  }'

# Get user's projects
curl http://localhost:3001/api/vault/projects?userId=YOUR_USER_ID
```

### **Get Recoup Snapshot**
```bash
# Fetch synced data
curl http://localhost:3001/api/recoup/snapshot?userId=YOUR_USER_ID
```

---

## 📊 Expected Console Logs

When you complete onboarding with Recoupable, you should see:

```
[PROFILE_API] Profile saved: { userId: '...', roles: [...], ... }
[PROFILE_API] Extracted Spotify artist ID: 5K4W6rqBFWDnAN6FQUkS6x
[RECOUPABLE_INGEST] Starting ingestion for user: ...
[RECOUPABLE_INGEST] Recoupable Account ID: 09a73efd-b43c-4a53-8a41-ec16ea632bd9
[RECOUP] Starting sync for user: ...
[RECOUP] Using artistAccountId: 09a73efd-b43c-4a53-8a41-ec16ea632bd9
[RECOUP] Spotify artist ID: 5K4W6rqBFWDnAN6FQUkS6x
[RECOUP] Fetching: https://api.recoupable.com/api/artist-socials?artistAccountId=...
[RECOUP] Fetching: https://api.recoupable.com/api/artist-segments?artistAccountId=...
[RECOUP] Fetching: https://api.recoupable.com/api/spotify/artist/...
... (more API calls)
[RECOUP] Sync complete, snapshot stored for user: ...
[RECOUPABLE_INGEST] Sync complete!
[RECOUPABLE_INGEST] - Fetched social data
[RECOUPABLE_INGEST] - 3 fan segments
[RECOUPABLE_INGEST] - 10 posts
[RECOUPABLE_INGEST] - 5 campaign recommendations
[RECOUPABLE_INGEST] - Spotify: Artist Name
```

---

## ✅ Success Criteria

### **Profile Onboarding**
- ✅ Can complete 2-step flow without errors
- ✅ Profile saved to in-memory store
- ✅ Spotify artist ID extracted correctly
- ✅ Recoupable ingestion triggered (check console)
- ✅ Redirected to homepage

### **Recoupable Integration**
- ✅ API calls to Recoupable endpoints (check console)
- ✅ Snapshot stored in cache
- ✅ Data visible on `/test-recoup` page
- ✅ Spotify data includes artist name, followers, top tracks
- ✅ Social metrics populated (if available from API)
- ✅ Fan segments listed
- ✅ Campaign recommendations generated

### **Network Page**
- ✅ Directory tab shows mock users (or real profiles if created)
- ✅ Role filter works
- ✅ Map tab loads without errors (even if empty)
- ✅ Open Collabs tab shows created projects

### **Vault Projects**
- ✅ Can create project with open roles
- ✅ Project appears in `/vault`
- ✅ Project appears in `/network` Open Collabs tab
- ✅ Tags and compensation types display correctly

### **Navigation**
- ✅ All homepage tiles navigate correctly
- ✅ Back buttons work
- ✅ Login gates show on protected pages
- ✅ No 404 errors

---

## 🐛 Known Limitations

### **Recoupable API**
- ⚠️ API may not be fully public yet
- ⚠️ Some endpoints may return empty data
- ⚠️ Default test account ID may or may not have data
- ✅ All errors are handled gracefully with timeouts
- ✅ App works even if API is down

### **In-Memory Storage**
- ⚠️ Data resets on server restart
- ⚠️ Not shared across browser sessions
- ✅ Easy to migrate to real database later

### **Songstats API**
- ⏸️ Not implemented (as requested)
- ✅ Stub endpoint logs TODO
- ⏸️ Can be added in Phase 2

---

## 🎉 Quick Test Checklist

**5-minute smoke test:**
1. ✅ Visit http://localhost:3001
2. ✅ Click VAULT tile
3. ✅ Login with Privy
4. ✅ Complete onboarding (add Recoupable ID + Spotify URL)
5. ✅ Visit http://localhost:3001/test-recoup
6. ✅ See synced Recoupable data
7. ✅ Go to /vault/new
8. ✅ Create project with 1 open role
9. ✅ Go to /network → Open Collabs tab
10. ✅ See your project listed

---

## 🚀 Ready to Test!

Open the browser preview and start testing. Check the browser console and terminal for detailed logs.

**Pro tip:** Use browser DevTools Network tab to see API calls in real-time.

**Status:** ✅ **ALL SYSTEMS GO**
