# Studio Map Debugging Guide

## Current Status
The app is running and the network page loads successfully, but the map is stuck on "LOADING_STUDIOS..."

## How to Debug

### 1. Open Browser Console
1. Navigate to: http://localhost:3000/network?tab=map
2. Open Developer Tools (F12 or Cmd+Option+I on Mac)
3. Go to the **Console** tab
4. Look for messages starting with `[STUDIO_MAP]`

### 2. Expected Console Messages

If everything works correctly, you should see:
```
[STUDIO_MAP] Waiting for scripts to load...
[STUDIO_MAP] Scripts loaded, initializing map...
[STUDIO_MAP] Waiting for custom elements...
[STUDIO_MAP] Custom elements defined
[STUDIO_MAP] Waiting for map.innerMap...
[STUDIO_MAP] Map initialized, applying styles...
[STUDIO_MAP] Searching for studios in Massachusetts...
[STUDIO_MAP] Creating PlacesService...
[STUDIO_MAP] Searching with request: {...}
[STUDIO_MAP] Search status: OK
[STUDIO_MAP] Results count: X
[STUDIO_MAP] Found studios: X
[STUDIO_MAP] Initialization complete
```

### 3. Common Issues & Solutions

#### Issue: Scripts never load
**Console shows**: `[STUDIO_MAP] Waiting for scripts to load...` (stuck here)
**Solution**: 
- Check if Google Maps Extended Component Library script is blocked
- Check network tab for failed script loads
- Verify internet connection

#### Issue: Custom elements not defined
**Console shows**: Stuck at "Waiting for custom elements..."
**Solution**:
- The Google Maps Extended Components may not be loading
- Try refreshing the page
- Check if script loaded successfully in Network tab

#### Issue: map.innerMap never initializes
**Console shows**: `[STUDIO_MAP] map.innerMap never initialized`
**Solution**:
- The gmp-map component may not be rendering
- Check if the map container is visible (not display:none)
- Try increasing the wait timeout in the code

#### Issue: Places API error
**Console shows**: `[STUDIO_MAP] Search failed with status: REQUEST_DENIED`
**Solution**:
- API key may be invalid or restricted
- Places API may not be enabled for this key
- Check Google Cloud Console for API restrictions

#### Issue: No studios found
**Console shows**: `[STUDIO_MAP] Found studios: 0`
**Solution**:
- This is normal if there are no studios in the search area
- Try searching for a different location using the search bar
- The search might be working but just no results in Massachusetts

### 4. API Key Information

Current API Key: `AIzaSyAy6xjUsfb34ncystO3K6mqFa6oknUdtV0`

This key needs:
- **Maps JavaScript API** enabled
- **Places API** enabled
- **Proper domain restrictions** (or no restrictions for localhost)

### 5. Manual Testing Steps

1. **Test if map renders**:
   - Look for the map container on the page
   - Should see a dark background map (even if loading)

2. **Test if scripts load**:
   - Open Network tab in DevTools
   - Look for: `extended-component-library/0.6.11/index.min.js`
   - Should return 200 status

3. **Test API key**:
   - Open this URL in browser:
   ```
   https://maps.googleapis.com/maps/api/js?key=AIzaSyAy6xjUsfb34ncystO3K6mqFa6oknUdtV0
   ```
   - Should load without errors

### 6. Quick Fixes to Try

1. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear browser cache**: DevTools > Network > Disable cache
3. **Try different browser**: Test in Chrome/Firefox/Safari
4. **Check console for errors**: Look for red error messages
5. **Toggle to Creators map**: Click "CREATORS" button to see if that map works

### 7. Component Location

File: `/components/map/StudioMap.tsx`

The component now has extensive logging. Every step of initialization logs to console with `[STUDIO_MAP]` prefix.

### 8. Alternative: Use Creators Map

If Studios map doesn't work, you can still use the Creators map:
1. Go to Network page > Map tab
2. Click "CREATORS" button
3. This shows registered creators instead of Google Places studios
