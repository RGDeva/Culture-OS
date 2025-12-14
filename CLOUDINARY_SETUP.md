# ☁️ Cloudinary Setup Guide

## 🎯 Quick Setup

### 1. Add to `.env.local`

Open `/Users/rishig/Downloads/noculture-os (1)/.env.local` and add:

```env
# Cloudinary Configuration (for audio file storage)
CLOUDINARY_CLOUD_NAME=dqgjrfmdn
CLOUDINARY_API_KEY=344188422859123
CLOUDINARY_API_SECRET=myFhjm2rVCLz_LSRvgVDpJA9Mbo

# Existing Cyanite config (keep these)
CYANITE_API_BASE=https://api.cyanite.ai/graphql
CYANITE_INTEGRATION_ACCESS_TOKEN=your_token
CYANITE_WEBHOOK_SECRET=your_secret
```

### 2. Restart Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Verify Configuration

Visit: http://localhost:3000/api/config/check

You should see:
```json
{
  "cloudinary": {
    "configured": true,
    "cloudName": "✅ Set",
    "apiKey": "✅ Set",
    "apiSecret": "✅ Set"
  },
  "status": {
    "cloudinaryReady": true,
    "fullIntegrationReady": true
  }
}
```

---

## ✅ What Happens After Setup

### Upload Flow (With Cloudinary)
```
1. User uploads audio file
   ↓
2. File uploaded to Cloudinary
   ↓
3. Get public URL: https://res.cloudinary.com/dqgjrfmdn/...
   ↓
4. Create asset with real URL
   ↓
5. Trigger Cyanite AI analysis
   ↓
6. Cyanite downloads & analyzes (30-60s)
   ↓
7. Webhook callback with results
   ↓
8. Asset updated with:
   - BPM (accurate)
   - Musical key
   - Moods (energetic, dark, etc.)
   - Genres (trap, hip-hop, etc.)
   - Energy, valence, danceability
   ↓
9. Status: "COMPLETED" ✅
```

---

## 🎵 Features Enabled

### With Cloudinary Only
- ✅ Public URLs for files
- ✅ Automatic duration extraction
- ✅ File management (upload/delete)
- ✅ 25GB free storage
- ✅ 25GB free bandwidth/month

### With Cloudinary + Cyanite
- ✅ All above features
- ✅ AI-powered BPM detection
- ✅ Musical key detection
- ✅ Mood classification (10+ moods)
- ✅ Genre classification (12+ genres)
- ✅ Energy/valence/danceability metrics
- ✅ Smart filters in Vault

---

## 📊 Cloudinary Dashboard

**Access:** https://cloudinary.com/console

**What you'll see:**
- Uploaded audio files in `noculture/audio/{userId}/` folders
- File sizes, durations, formats
- Bandwidth usage
- Storage usage

**File naming:**
```
noculture/audio/user_123/1733194567890_my_beat.mp3
                 ↑        ↑                ↑
              user ID   timestamp      original name
```

---

## 🔧 Configuration Details

### Your Credentials
```
Cloud Name: dqgjrfmdn
API Key:    344188422859123
API Secret: myFhjm2rVCLz_LSRvgVDpJA9Mbo
Key Name:   Root
```

### Free Tier Limits
- **Storage:** 25GB
- **Bandwidth:** 25GB/month
- **Transformations:** 25,000/month
- **Video Processing:** 500 credits/month

### File Organization
```
Cloudinary Root
└── noculture/
    └── audio/
        ├── user_abc123/
        │   ├── 1733194567890_trap_beat.mp3
        │   └── 1733194568901_drill_beat.mp3
        └── user_def456/
            └── 1733194569012_boom_bap.mp3
```

---

## 🧪 Testing

### 1. Check Configuration
```bash
curl http://localhost:3000/api/config/check
```

### 2. Upload Test File
1. Go to http://localhost:3000/vault
2. Drag & drop an audio file
3. Check server logs:
   ```
   [VAULT_UPLOAD] Uploading to Cloudinary...
   [CLOUDINARY] Upload successful: https://res.cloudinary.com/...
   [VAULT_UPLOAD] Cloudinary upload successful
   [VAULT_UPLOAD] Cyanite analysis started: analysis_xyz
   ```

### 3. Verify in Cloudinary
1. Go to https://cloudinary.com/console/media_library
2. Navigate to `noculture/audio/`
3. See your uploaded file

### 4. Wait for Cyanite
- Analysis takes 30-60 seconds
- Watch for webhook callback in logs
- Asset status changes to "COMPLETED"
- See BPM, key, moods, genres

---

## 🐛 Troubleshooting

### "Cloudinary not configured"
- Check `.env.local` has all 3 variables
- Restart server after adding variables
- Visit `/api/config/check` to verify

### Upload fails
- Check Cloudinary credentials are correct
- Verify you haven't exceeded free tier limits
- Check server logs for error details

### Cyanite not triggering
- Ensure Cloudinary upload succeeded first
- Check Cyanite credentials in `.env.local`
- Verify webhook URL is set in Cyanite dashboard

### Files not appearing
- Check Cloudinary dashboard media library
- Look in `noculture/audio/{userId}/` folder
- Verify upload completed (check logs)

---

## 💰 Cost Estimates

### Free Tier (Current)
- **Cost:** $0/month
- **Storage:** 25GB
- **Bandwidth:** 25GB/month
- **Good for:** ~500-1000 audio files

### If You Exceed Free Tier
- **Storage:** $0.02/GB/month
- **Bandwidth:** $0.05/GB
- **Example:** 100GB storage + 100GB bandwidth = ~$7/month

### Cyanite Costs
- **Free tier:** 100 analyses/month
- **Paid:** Contact Cyanite for pricing
- **Typical:** $0.01-0.05 per analysis

---

## 🎯 Next Steps

1. **Add credentials to `.env.local`** (see section 1)
2. **Restart server**
3. **Upload test file**
4. **Check Cloudinary dashboard**
5. **Wait for Cyanite analysis**
6. **See full AI metadata!**

---

## 📚 Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Cyanite Docs:** https://api-docs.cyanite.ai
- **Support:** Check server logs for detailed errors

---

## ✅ Summary

**What you need to do:**
1. Copy the 3 Cloudinary variables to `.env.local`
2. Restart the server
3. Upload a file to test

**What will happen:**
- Files upload to Cloudinary (public URLs)
- Cyanite AI analyzes them (30-60s)
- Full metadata appears in Vault
- No more stuck "ANALYZING..." badges!

**Ready to go!** 🚀
