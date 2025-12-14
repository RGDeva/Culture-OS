# 🔍 Cyanite Integration Status - Explained

## ❓ Why "ANALYZING..." Gets Stuck

### The Issue
The "ANALYZING..." badge stays stuck because **Cyanite requires a publicly accessible HTTP URL** to download and analyze audio files.

### Current Setup
```typescript
// In upload route:
const fileUrl = `/uploads/${userId}/${Date.now()}_${file.name}`
// This is a LOCAL path, not a public URL!
```

### What Cyanite Needs
```
✅ https://yourdomain.com/audio/track.mp3
✅ https://s3.amazonaws.com/bucket/track.mp3
✅ https://res.cloudinary.com/account/audio/track.mp3

❌ /uploads/user123/track.mp3 (local path)
❌ file:///path/to/track.mp3 (file system)
❌ blob:http://localhost:3000/... (browser blob)
```

---

## ✅ Solution Implemented

### 1. **Skip Cyanite for Mock URLs** ✅
```typescript
// Only trigger Cyanite if we have a real HTTP URL
const isRealUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://')
if (isRealUrl) {
  // Call Cyanite
} else {
  console.log('Skipping Cyanite (mock URL)')
}
```

### 2. **Client-Side Audio Parsing** ✅
```typescript
// Parse audio in browser using Web Audio API
const metadata = await parseAudioFile(file)
const bpm = await detectBPM(file)

// Update asset with parsed data
await fetch(`/api/vault/assets/${asset.id}/metadata`, {
  method: 'PATCH',
  body: JSON.stringify({
    duration: metadata.duration,
    sampleRate: metadata.sampleRate,
    bpm: bpm || metadata.bpm,
    key: metadata.key,
    genre: metadata.genre,
  })
})
```

### 3. **Auto-Complete Status** ✅
```typescript
// Mark as completed if we have client-side analysis
cyaniteStatus: bpm || key ? 'COMPLETED' : undefined
```

---

## 🎯 How It Works Now

### Upload Flow (Without Real Storage)
```
1. User uploads audio file
   ↓
2. Server creates asset with mock URL
   ↓
3. Cyanite skipped (no real URL)
   ↓
4. Client-side parsing extracts:
   - Duration
   - Sample rate
   - BPM (detected)
   - ID3 tags (title, artist, genre)
   ↓
5. Asset updated with parsed metadata
   ↓
6. Status changes to "COMPLETED"
   ↓
7. User sees BPM, duration, etc.
```

### Upload Flow (With Real Storage)
```
1. User uploads audio file
   ↓
2. Server uploads to S3/Cloudinary
   ↓
3. Get public URL: https://...
   ↓
4. Create asset with real URL
   ↓
5. Trigger Cyanite analysis
   ↓
6. Cyanite downloads & analyzes
   ↓
7. Webhook callback (30-60s later)
   ↓
8. Asset updated with AI analysis:
   - BPM (accurate)
   - Musical key
   - Moods (energetic, dark, etc.)
   - Genres (trap, hip-hop, etc.)
   - Energy, valence, danceability
   ↓
9. Status changes to "COMPLETED"
   ↓
10. User sees full AI analysis
```

---

## 🔧 What You Need for Full Cyanite

### 1. Cloud Storage Setup
Choose one:

#### Option A: AWS S3
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(file: File): Promise<string> {
  const key = `audio/${Date.now()}_${file.name}`
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  }))
  
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`
}
```

#### Option B: Cloudinary
```bash
npm install cloudinary
```

```typescript
// lib/storage.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'audio' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(buffer)
  })
}
```

### 2. Update Upload Route
```typescript
// app/api/vault/upload/route.ts
import { uploadToS3 } from '@/lib/storage' // or uploadToCloudinary

export async function POST(request: NextRequest) {
  // ... validation ...
  
  // Upload to cloud storage
  const fileUrl = await uploadToS3(file) // Real URL!
  
  // Create asset
  const asset = createAsset({
    // ...
    fileUrl, // Now a real HTTP URL
  })
  
  // Trigger Cyanite (will work now!)
  createCyaniteTrackAnalysis(fileUrl, asset.id, title)
}
```

### 3. Configure Webhook
```
1. Go to: https://cyanite.ai/dashboard
2. Navigate to your integration
3. Set webhook URL: https://yourdomain.com/api/webhooks/cyanite
4. Subscribe to events:
   - analysis.completed
   - analysis.failed
5. Save configuration
```

### 4. Deploy to Production
```bash
# Your app needs to be publicly accessible
# Use Vercel, Netlify, or your own server

# Example with Vercel:
vercel deploy

# Your webhook URL will be:
# https://your-app.vercel.app/api/webhooks/cyanite
```

---

## 📊 Current vs Full Integration

### Current (Client-Side Parsing)
| Feature | Status | Source |
|---------|--------|--------|
| Duration | ✅ | Web Audio API |
| Sample Rate | ✅ | Web Audio API |
| BPM | ✅ | Peak detection algorithm |
| Musical Key | ⚠️ | ID3 tags (if present) |
| Moods | ❌ | Not available |
| Genres | ⚠️ | ID3 tags (if present) |
| Energy | ❌ | Not available |
| Valence | ❌ | Not available |
| Danceability | ❌ | Not available |

### Full Cyanite Integration
| Feature | Status | Source |
|---------|--------|--------|
| Duration | ✅ | Cyanite AI |
| Sample Rate | ✅ | Cyanite AI |
| BPM | ✅ | Cyanite AI (accurate) |
| Musical Key | ✅ | Cyanite AI |
| Moods | ✅ | Cyanite AI (10+ options) |
| Genres | ✅ | Cyanite AI (12+ options) |
| Energy | ✅ | Cyanite AI (0-1 scale) |
| Valence | ✅ | Cyanite AI (0-1 scale) |
| Danceability | ✅ | Cyanite AI (0-1 scale) |

---

## 🎯 Quick Start Options

### Option 1: Use Client-Side Parsing (Current)
**Pros:**
- ✅ Works immediately
- ✅ No storage costs
- ✅ Fast (< 1 second)
- ✅ Privacy (files stay local)

**Cons:**
- ❌ Limited analysis
- ❌ No moods/genres (unless in ID3)
- ❌ BPM less accurate
- ❌ No energy/valence metrics

**Best for:** Development, testing, demos

### Option 2: Add Cloud Storage + Cyanite
**Pros:**
- ✅ Full AI analysis
- ✅ Accurate BPM/key
- ✅ Moods & genres
- ✅ Energy metrics
- ✅ Professional quality

**Cons:**
- ❌ Requires cloud storage setup
- ❌ Storage costs ($)
- ❌ Cyanite API costs ($)
- ❌ 30-60s analysis time

**Best for:** Production, professional use

---

## 🔨 Implementation Checklist

### For Client-Side Only (Current)
- [x] Audio parser library
- [x] BPM detection
- [x] Metadata extraction
- [x] Update API endpoint
- [x] Skip Cyanite for mock URLs
- [x] Auto-complete status

### For Full Cyanite
- [ ] Choose cloud storage (S3/Cloudinary)
- [ ] Set up storage credentials
- [ ] Implement upload function
- [ ] Update upload route
- [ ] Test with real URLs
- [ ] Configure Cyanite webhook
- [ ] Deploy to production
- [ ] Test end-to-end

---

## 🐛 Troubleshooting

### "ANALYZING..." Still Stuck?
1. Check server logs for "Skipping Cyanite" message
2. Verify client-side parsing runs (check console)
3. Refresh page after upload
4. Check if metadata API was called

### Client-Side Parsing Not Working?
1. Check browser console for errors
2. Verify Web Audio API support
3. Check file format (MP3, WAV supported)
4. Try smaller file (< 10MB)

### Want to Test Real Cyanite?
1. Upload file to public URL (e.g., Dropbox public link)
2. Manually call Cyanite API with that URL
3. Check Cyanite dashboard for analysis status
4. Verify webhook receives callback

---

## 📚 Resources

### Documentation
- Cyanite API: https://api-docs.cyanite.ai
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- AWS S3: https://aws.amazon.com/s3/
- Cloudinary: https://cloudinary.com/documentation

### Code Examples
- `lib/audioParser.ts` - Client-side parsing
- `app/api/vault/upload/route.ts` - Upload with Cyanite check
- `app/api/webhooks/cyanite/route.ts` - Webhook handler
- `app/api/vault/assets/[id]/metadata/route.ts` - Metadata update

---

## 🎉 Summary

**Current Status:**
- ✅ Cyanite integration code is complete
- ✅ Webhook handler is ready
- ✅ Client-side parsing works as fallback
- ⏳ Waiting for cloud storage to enable Cyanite

**What Works Now:**
- ✅ Upload audio files
- ✅ Extract duration, sample rate
- ✅ Detect BPM (basic algorithm)
- ✅ Parse ID3 tags
- ✅ No more stuck "ANALYZING..." badge

**What Needs Cloud Storage:**
- ⏳ Full Cyanite AI analysis
- ⏳ Accurate BPM/key detection
- ⏳ Mood & genre classification
- ⏳ Energy/valence/danceability metrics

**The "ANALYZING..." issue is now fixed! Files will show metadata from client-side parsing instead of getting stuck.** ✅
