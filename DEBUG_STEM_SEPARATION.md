# 🔍 DEBUG STEM SEPARATION

## 🎯 **CURRENT STATUS:**

I've added comprehensive logging to help debug the issue. The API is working when tested directly with curl, but the frontend is showing an error.

---

## 🛠️ **DEBUGGING STEPS:**

### **Step 1: Open Browser Console**

1. Open your browser
2. Press **F12** (or Cmd+Option+I on Mac)
3. Go to **Console** tab
4. Click the **trash icon** to clear console
5. Keep console open

---

### **Step 2: Try Stem Separation Again**

1. Go to http://localhost:3000/vault
2. Click on any audio file
3. Click **STEM_SEPARATION** tab
4. Click **SEPARATE_STEMS** button

---

### **Step 3: Check Console Logs**

Look for these logs in the console:

**Expected Success Logs:**
```
✅ [STEM_SEPARATION] Starting separation...
✅ [STEM_SEPARATION] Asset ID: asset_123...
✅ [STEM_SEPARATION] Audio URL: https://...
✅ [STEM_SEPARATION] Request body: {...}
✅ [STEM_SEPARATION] Response status: 200
✅ [STEM_SEPARATION] Response ok: true
✅ [STEM_SEPARATION] Response data: { "success": true, ... }
✅ [STEM_SEPARATION] ✅ Separation started successfully!
✅ [STEM_SEPARATION] Separation ID: sep_...
✅ [STEM_SEPARATION] ✅ State updated, polling will begin...
```

**If You See Error Logs:**
```
❌ [STEM_SEPARATION] Response status: 500
❌ [STEM_SEPARATION] API returned error: {...}
❌ [STEM_SEPARATION] ❌ Error caught: ...
```

---

### **Step 4: Copy Console Output**

1. **Right-click** in the console
2. Click **"Save as..."** or copy all text
3. Send me the full console output

**OR** take a screenshot of:
- The console logs
- The error message
- The network tab (if possible)

---

## 🔧 **MANUAL API TEST:**

### **Test 1: Check API Directly**

Open a new terminal and run:

```bash
cd "/Users/rishig/Downloads/noculture-os (1)"

# Test with a real asset ID from your vault
curl -X POST http://localhost:3000/api/stems/separate \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "test123",
    "audioUrl": "https://example.com/test.mp3"
  }' | jq .
```

**Expected Output:**
```json
{
  "success": true,
  "separationId": "sep_1765309803905_c3z8ri96b",
  "status": "PENDING",
  "message": "Stem separation queued. This may take 2-5 minutes."
}
```

**If you see an error**, copy the full output and send it to me.

---

### **Test 2: Check Server Logs**

In the terminal where Next.js is running, look for:

```
[STEMS] Asset not found in DB, using filename: test
[STEMS] Creating project folder for stems...
[STEMS] Project folder: "test - Stems"
```

**OR** look for errors:

```
[STEMS] Error fetching asset: ...
[STEMS] Processing error: ...
```

---

## 🎯 **COMMON ISSUES & FIXES:**

### **Issue 1: Asset ID is undefined**

**Symptoms:**
```
[STEM_SEPARATION] Asset ID: undefined
```

**Fix:**
The asset ID is not being passed correctly. Check that:
1. You clicked on a file in the vault
2. The file has an ID
3. The modal opened correctly

---

### **Issue 2: Audio URL is undefined**

**Symptoms:**
```
[STEM_SEPARATION] Audio URL: undefined
```

**Fix:**
The audio URL is not being passed. This means:
1. The file doesn't have a `fileUrl` property
2. The asset data is incomplete

**To fix:**
- Re-upload the file
- Make sure file upload completed successfully

---

### **Issue 3: API Returns 500 Error**

**Symptoms:**
```
[STEM_SEPARATION] Response status: 500
[STEM_SEPARATION] Response data: { "error": "...", "message": "..." }
```

**Fix:**
Check the server logs for the actual error. Common causes:
- Database connection issue
- File not accessible
- Python worker not running

---

### **Issue 4: Network Error**

**Symptoms:**
```
[STEM_SEPARATION] ❌ Error caught: TypeError: Failed to fetch
```

**Fix:**
- Check if Next.js server is running
- Check if port 3000 is accessible
- Check browser network tab for blocked requests

---

## 🔍 **ADVANCED DEBUGGING:**

### **Check Network Tab:**

1. Open DevTools → **Network** tab
2. Clear network log
3. Click "SEPARATE_STEMS"
4. Look for request to `/api/stems/separate`
5. Click on the request
6. Check:
   - **Request Headers**
   - **Request Payload** (should have assetId and audioUrl)
   - **Response** (should have success: true)
   - **Status Code** (should be 200)

---

### **Check File Upload:**

1. Go to vault
2. Upload a new file
3. Check console for upload logs
4. Verify file appears in vault
5. Click file to open modal
6. Check that file has:
   - ID
   - Title
   - fileUrl
   - Status

---

## 📊 **WHAT TO SEND ME:**

Please provide:

1. **Console Logs:**
   - All `[STEM_SEPARATION]` logs
   - Any error messages
   - Full error stack trace

2. **Network Tab:**
   - Screenshot of `/api/stems/separate` request
   - Request payload
   - Response data

3. **Server Logs:**
   - Terminal output from Next.js server
   - Any `[STEMS]` logs
   - Any error messages

4. **Asset Data:**
   - What file did you upload?
   - Does it appear in vault?
   - Can you play it?
   - What's the file size?

---

## 🎯 **QUICK CHECKLIST:**

Before reporting the issue, verify:

- [ ] Next.js server is running (port 3000)
- [ ] Python worker is running (port 8001)
- [ ] File was uploaded successfully
- [ ] File appears in vault
- [ ] Can click file to open modal
- [ ] STEM_SEPARATION tab is visible
- [ ] Browser console is open
- [ ] Network tab is open

---

## 🔧 **EMERGENCY FIX:**

If nothing works, try this:

### **1. Restart Next.js Server:**

```bash
# In the terminal running Next.js, press Ctrl+C
# Then restart:
npm run dev
```

### **2. Clear Browser Cache:**

1. Open DevTools (F12)
2. Right-click the **Reload** button
3. Click **"Empty Cache and Hard Reload"**

### **3. Check Python Worker:**

```bash
# Check if Python worker is running
curl http://localhost:8001

# Should return:
# {"service":"NoCulture Enhanced Audio Analysis",...}
```

### **4. Test API Directly:**

```bash
# This should work:
curl -X POST http://localhost:3000/api/stems/separate \
  -H "Content-Type: application/json" \
  -d '{"assetId":"test","audioUrl":"http://example.com/test.mp3"}'

# Should return:
# {"success":true,"separationId":"sep_...","status":"PENDING",...}
```

---

## 📚 **NEXT STEPS:**

1. **Follow debugging steps above**
2. **Copy console output**
3. **Send me the logs**
4. **I'll identify the exact issue**
5. **We'll fix it together**

---

**I've added detailed logging to help us identify the exact issue. Please try again and send me the console output! 🔍**
