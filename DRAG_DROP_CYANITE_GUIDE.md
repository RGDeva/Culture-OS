# 🎵 Drag & Drop + Cyanite Integration Guide

## ✅ FIXED & ENHANCED

I've fixed the file upload to work anywhere on the page and fully integrated Cyanite AI analysis!

---

## 🎯 **What's Fixed**

### 1. **Global Drag & Drop** ✅
- Drop files **anywhere** on the vault page
- Visual overlay shows when dragging
- No need to find specific drop zone
- Works with sidebar, toolbar, project grid - everywhere!

### 2. **Cyanite AI Integration** ✅
- Automatically analyzes uploaded audio files
- Extracts real BPM, key, moods, genres
- Updates projects with AI-detected metadata
- Works with Cloudinary public URLs
- Skips analysis for mock/local URLs

---

## 🚀 **How It Works**

### Upload Flow with Cyanite
```
1. User drops files anywhere on page
   ↓
2. Global drop overlay appears
   ↓
3. Files sent to /api/vault/upload-direct
   ↓
4. Files grouped by name
   ↓
5. Each file uploaded to Cloudinary
   ↓
6. Projects & assets created
   ↓
7. Cyanite analysis triggered for primary audio
   ↓
8. [30-60 seconds later]
   ↓
9. Cyanite webhook receives results
   ↓
10. Project updated with:
    - Real BPM
    - Musical key
    - Moods (energetic, dark, chill, etc.)
    - Genres (trap, hip-hop, drill, etc.)
    - Energy, valence, danceability
```

---

## 🎨 **Visual Features**

### Global Drop Overlay
When you drag files over the page:
```
┌─────────────────────────────────────────┐
│                                         │
│         [Full-screen overlay]           │
│                                         │
│     ┌───────────────────────────┐      │
│     │      DROP FILES ANYWHERE   │      │
│     │                            │      │
│     │  We'll auto-group them     │      │
│     │      into projects         │      │
│     └───────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

### Upload Button
When not dragging:
```
┌─────────────────────────────────────────┐
│  [Upload Icon]                          │
│  CLICK TO BROWSE FILES                  │
│  Or drag & drop anywhere on this page   │
└─────────────────────────────────────────┘
```

---

## 🔧 **Cyanite Configuration**

### Required Environment Variables
Add to `.env.local`:
```env
CYANITE_API_BASE=https://api.cyanite.ai/graphql
CYANITE_INTEGRATION_ACCESS_TOKEN=your_token_here
CYANITE_WEBHOOK_SECRET=your_webhook_secret
```

### Check Configuration
Visit: http://localhost:3000/api/config/check

Should show:
```json
{
  "cyanite": {
    "configured": true,
    "apiBase": "✅ Set",
    "token": "✅ Set",
    "webhookSecret": "✅ Set"
  }
}
```

---

## 🎵 **Cyanite Features**

### What Cyanite Analyzes
- **BPM** - Accurate tempo detection (80-200 BPM)
- **Musical Key** - Key and mode (C maj, D min, etc.)
- **Moods** - Top 3 moods with confidence scores:
  - Energetic, Dark, Chill, Aggressive, Uplifting, Melancholic, etc.
- **Genres** - Top 3 genres with confidence scores:
  - Trap, Hip-Hop, R&B, Drill, Boom Bap, Lo-Fi, etc.
- **Energy** - 0-1 scale (how energetic)
- **Valence** - 0-1 scale (how positive/happy)
- **Danceability** - 0-1 scale (how danceable)

### Analysis Time
- **Typical:** 30-60 seconds per track
- **Depends on:** File length and Cyanite server load
- **Status:** Shows "ANALYZING..." during processing

---

## 🧪 **Testing**

### Test 1: Drag & Drop Anywhere
1. Go to http://localhost:3000/session-vault-v2
2. Drag an audio file from your desktop
3. Hover over **any part of the page**:
   - Sidebar ✅
   - Toolbar ✅
   - Project grid ✅
   - Empty space ✅
4. See full-screen overlay appear
5. Drop the file
6. Watch it upload and create project

### Test 2: Multiple Files
1. Select 10 audio files
2. Drag them over the page
3. Drop anywhere
4. Watch them auto-group into projects
5. See upload progress
6. Projects appear in grid

### Test 3: Cyanite Analysis (with Cloudinary)
1. Ensure Cloudinary is configured
2. Ensure Cyanite is configured
3. Upload an audio file
4. File uploads to Cloudinary (gets public URL)
5. Cyanite analysis triggered automatically
6. Check server logs:
   ```
   [VAULT_UPLOAD_DIRECT] Uploaded track.mp3 to Cloudinary
   [CYANITE] Analysis created: analysis_xyz for My Track
   ```
7. Wait 30-60 seconds
8. Cyanite webhook receives results
9. Project updated with real metadata

### Test 4: Without Cyanite (Fallback)
1. Don't configure Cyanite
2. Upload files
3. System uses fake/detected metadata
4. Projects still created successfully
5. No errors, just logs:
   ```
   [CYANITE] Token not configured, skipping analysis
   ```

---

## 📊 **Code Changes**

### Files Modified (3)

#### 1. `app/session-vault-v2/page.tsx`
**Changes:**
- Added drag handlers to root `<div>`
- Added global drop overlay
- Simplified upload button
- Removed duplicate drop zone

**Key Code:**
```tsx
<div 
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  {isDragging && (
    <div className="fixed inset-0 z-50 ...">
      DROP FILES ANYWHERE
    </div>
  )}
  {/* Rest of page */}
</div>
```

#### 2. `lib/cyanite.ts`
**Changes:**
- Added `isCyaniteConfigured()` check
- Updated GraphQL mutation for Cyanite API v6
- Added `getCyaniteAnalysisResult()` for retrieving results
- Skip analysis for non-HTTP URLs
- Better error handling

**Key Functions:**
```typescript
// Check if Cyanite is configured
export function isCyaniteConfigured(): boolean

// Create analysis request
export async function createCyaniteTrackAnalysis(
  audioUrl: string,
  trackId: string,
  title?: string
): Promise<string | null>

// Get analysis results
export async function getCyaniteAnalysisResult(
  analysisId: string
): Promise<CyaniteAnalysisResult | null>
```

#### 3. `app/api/vault/upload-direct/route.ts`
**Changes:**
- Import Cyanite functions
- Trigger analysis for primary audio files
- Check if Cloudinary URL (HTTP/HTTPS)
- Log analysis ID

**Key Code:**
```typescript
// After creating asset
if (assetInfo.isPrimary && 
    AUDIO_EXTENSIONS.includes(assetInfo.extension) &&
    isCyaniteConfigured() &&
    fileUrl.startsWith('http')) {
  const analysisId = await createCyaniteTrackAnalysis(
    fileUrl,
    asset.id,
    project.title
  )
}
```

---

## 🎯 **User Experience**

### Before
- ❌ Had to find specific drop zone
- ❌ Confusing where to drop files
- ❌ Cyanite not integrated
- ❌ Fake metadata only

### After
- ✅ Drop files **anywhere** on page
- ✅ Clear visual feedback
- ✅ Cyanite fully integrated
- ✅ Real AI-detected metadata
- ✅ Fallback to fake data if Cyanite not configured

---

## 🔍 **Troubleshooting**

### Files Won't Upload
**Check:**
1. Are you signed in?
2. Is the file an audio file?
3. Check browser console for errors
4. Check server logs

### Cyanite Not Working
**Check:**
1. Is Cloudinary configured? (Cyanite needs public URLs)
2. Is Cyanite token in `.env.local`?
3. Visit `/api/config/check` to verify
4. Check server logs for Cyanite errors
5. Ensure webhook URL is set in Cyanite dashboard

### Analysis Stuck
**Possible causes:**
1. Cyanite server is slow (wait longer)
2. Webhook not configured (results won't come back)
3. Invalid audio file format
4. Cloudinary URL not accessible

**Check logs:**
```
[CYANITE] Analysis created: xyz  ← Should see this
[CYANITE_WEBHOOK] Received callback  ← Should see this later
```

---

## 📚 **API Endpoints**

### Upload Endpoint
```
POST /api/vault/upload-direct
```

**Body (FormData):**
- `userId` - User ID
- `roleContext` - PRODUCER | ARTIST | ENGINEER | STUDIO
- `files` - Multiple files

**Response:**
```json
{
  "success": true,
  "projects": [...],
  "message": "Created 3 projects from 10 files"
}
```

### Config Check
```
GET /api/config/check
```

**Response:**
```json
{
  "cloudinary": {
    "configured": true,
    "cloudName": "✅ Set",
    "apiKey": "✅ Set",
    "apiSecret": "✅ Set"
  },
  "cyanite": {
    "configured": true,
    "apiBase": "✅ Set",
    "token": "✅ Set"
  }
}
```

---

## ✅ **Summary**

### What's Working
- ✅ **Global drag & drop** - Drop files anywhere
- ✅ **Visual feedback** - Full-screen overlay
- ✅ **Cyanite integration** - Real AI analysis
- ✅ **Auto-grouping** - Smart file organization
- ✅ **Cloudinary upload** - Public URLs
- ✅ **Fallback mode** - Works without Cyanite

### What You Need
1. **Cloudinary configured** - For public URLs
2. **Cyanite configured** - For AI analysis (optional)
3. **Audio files** - To upload and test

### Quick Test
1. Go to http://localhost:3000/session-vault-v2
2. Drag an audio file from desktop
3. Drop it **anywhere** on the page
4. Watch it upload and create project
5. If Cyanite configured, wait 30-60s for AI analysis

**It just works!** 🎵✨🚀

---

## 🎉 **Final Notes**

**The vault now has:**
- ✅ Drag & drop anywhere on page
- ✅ Full Cyanite AI integration
- ✅ Real BPM, key, moods, genres
- ✅ Finder-like organization
- ✅ Comments & collaboration
- ✅ Activity tracking
- ✅ Bulk operations

**Access:** http://localhost:3000/session-vault-v2

**Server is running!** ✅
