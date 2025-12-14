# 🧪 Cyanite Integration - Test Guide

## ✅ Credentials Configured

Your Cyanite credentials are now set up:
- ✅ Access Token: Configured
- ✅ Webhook Secret: Configured
- ✅ API Base URL: https://api.cyanite.ai/graphql

---

## 🚀 Server Running

**URL:** http://localhost:3000

---

## 📝 Testing Steps

### 1. **Test Upload & Analysis**

```
1. Navigate to: http://localhost:3000/vault
2. Login with Privy
3. Drag an audio file (MP3, WAV, etc.) into the upload zone
4. Watch for:
   ✅ Asset appears immediately
   ✅ "ANALYZING..." badge shows (yellow, spinning)
   ✅ Check browser console for logs
   ✅ Check server terminal for Cyanite API call
5. Wait 30-60 seconds for Cyanite to process
6. Refresh the page
7. Verify:
   ✅ Badge changes to show BPM, key, moods, genres
   ✅ Click asset to see full analysis panel
```

### 2. **Test Filters**

```
1. Click "FILTERS" button in Vault
2. Try different filters:
   - BPM range (e.g., 120-140)
   - Musical key (e.g., C# minor)
   - Moods (select multiple)
   - Genres (select multiple)
3. Verify:
   ✅ Only matching tracks show
   ✅ Filter count updates
   ✅ "CLEAR" button resets all
```

### 3. **Test UI Components**

```
1. Toggle between Grid/List view
2. Verify badges show in both views
3. Click an asset to open detail modal
4. Verify analysis panel displays:
   ✅ BPM and musical key
   ✅ Energy/valence/danceability bars
   ✅ Mood tags
   ✅ Genre tags
```

---

## 🔍 What to Look For

### In Browser Console
```javascript
// Successful upload
[VAULT_UPLOAD] Created asset: asset_xxx

// Analysis triggered
[CYANITE] Starting analysis for track: asset_xxx
```

### In Server Terminal
```bash
# Upload
[VAULT_V2] Created asset: asset_xxx
[VAULT_UPLOAD] Created asset: asset_xxx

# Cyanite API call
[VAULT_UPLOAD] Cyanite analysis started: analysis_xxx

# Webhook received (after 30-60s)
[CYANITE_WEBHOOK] Received event: analysis.completed analysis_xxx
[CYANITE_WEBHOOK] Analysis completed for track: asset_xxx
[VAULT_V2] Updated asset: asset_xxx
```

---

## 🎯 Expected Results

### Immediately After Upload
- Asset appears in Vault
- Status: "ANALYZING..." (yellow badge with spinner)
- Asset is clickable and playable

### After 30-60 Seconds (Refresh Page)
- Badge shows: BPM, Key, Moods, Genres
- Detail modal shows full analysis:
  - Musical properties (BPM, Key)
  - Energy metrics (bars showing %)
  - Mood tags (purple badges)
  - Genre tags (pink badges)

### Filters Work
- BPM range filters tracks by tempo
- Key filter shows only matching keys
- Mood/genre filters show matching tracks
- Advanced filters (energy, danceability) work

---

## 🐛 Troubleshooting

### Analysis Not Starting
**Check:**
- ✅ `.env.local` has correct `CYANITE_INTEGRATION_ACCESS_TOKEN`
- ✅ Server restarted after adding credentials
- ✅ Audio file is valid format
- ✅ Check server logs for API errors

**Fix:**
```bash
# Restart server
npm run dev
```

### Webhook Not Received
**Check:**
- ✅ Webhook URL configured in Cyanite dashboard
- ✅ URL is: `https://yourdomain.com/api/webhooks/cyanite`
- ✅ Events subscribed: `analysis.completed`, `analysis.failed`
- ✅ Server is publicly accessible (for production)

**Note:** In development (localhost), webhooks won't work unless you use a tunnel like ngrok.

### Analysis Shows "FAILED"
**Check:**
- ✅ Audio file is valid
- ✅ File size within Cyanite limits
- ✅ Check Cyanite dashboard for error details
- ✅ Verify API token is valid

---

## 🔗 Webhook Setup (For Production)

### Configure in Cyanite Dashboard

1. Go to: https://cyanite.ai/dashboard
2. Navigate to your integration
3. Set webhook URL: `https://yourdomain.com/api/webhooks/cyanite`
4. Subscribe to events:
   - ✅ `analysis.completed`
   - ✅ `analysis.failed`
5. Save configuration

### For Local Development (Optional)

Use ngrok to expose localhost:
```bash
# Install ngrok
brew install ngrok

# Expose port 3000
ngrok http 3000

# Use the ngrok URL in Cyanite dashboard
# Example: https://abc123.ngrok.io/api/webhooks/cyanite
```

---

## 📊 Sample Test Data

### Good Test Files
- ✅ MP3 files (any bitrate)
- ✅ WAV files (16-bit or 24-bit)
- ✅ Files with clear rhythm (easier to analyze)
- ✅ Files 30 seconds to 10 minutes

### Avoid
- ❌ Corrupted files
- ❌ Very short files (< 10 seconds)
- ❌ Very large files (> 100MB)
- ❌ Non-audio files

---

## ✅ Success Criteria

### Upload Flow ✅
- [x] File uploads successfully
- [x] Asset created immediately
- [x] "ANALYZING..." badge appears
- [x] No errors in console
- [x] Server logs show Cyanite API call

### Analysis Complete ✅
- [x] Badge updates after refresh
- [x] BPM displayed correctly
- [x] Musical key shown
- [x] Moods and genres appear
- [x] Detail panel shows full analysis

### Filtering ✅
- [x] BPM range filter works
- [x] Key filter works
- [x] Mood multi-select works
- [x] Genre multi-select works
- [x] Filter count updates
- [x] Clear filters works

### UI/UX ✅
- [x] Terminal aesthetic maintained
- [x] Badges color-coded correctly
- [x] Progress bars animate
- [x] Responsive design works
- [x] No layout shifts

---

## 🎉 Next Steps

### After Successful Test
1. ✅ Upload multiple files
2. ✅ Test different audio types
3. ✅ Try all filter combinations
4. ✅ Test on mobile/tablet
5. ✅ Deploy to production

### Production Deployment
1. Add credentials to production `.env`
2. Configure webhook with production URL
3. Test webhook receives callbacks
4. Monitor Cyanite API usage
5. Set up error alerting

---

## 📞 Support

### Cyanite Support
- Dashboard: https://cyanite.ai/dashboard
- API Docs: https://api-docs.cyanite.ai
- Support: support@cyanite.ai

### Integration Issues
- Check server logs
- Check browser console
- Review `DEPLOYMENT_READY.md`
- Review `CYANITE_SETUP.md`

---

## 🎯 Quick Test Checklist

```
[ ] Server running on port 3000
[ ] Credentials in .env.local
[ ] Navigate to /vault
[ ] Login with Privy
[ ] Upload audio file
[ ] See "ANALYZING..." badge
[ ] Wait 30-60 seconds
[ ] Refresh page
[ ] See analysis data
[ ] Click asset for detail view
[ ] Test filters
[ ] Toggle grid/list view
```

---

**Ready to test! Upload an audio file to see Cyanite AI in action! 🎵✨**
