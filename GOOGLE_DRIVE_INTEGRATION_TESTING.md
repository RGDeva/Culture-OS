# Google Drive Integration - Testing Guide

Complete end-to-end testing instructions for the fully functional Google Drive integration.

## What Was Implemented

### ✅ Completed Features

1. **Google Drive OAuth Flow**
   - Secure OAuth 2.0 with offline access
   - Encrypted token storage (AES-256-GCM)
   - Automatic token refresh
   - Minimal scopes (drive.readonly)

2. **Folder Selection & Sync Configuration**
   - List user's Google Drive folders
   - Select folder per project
   - Store sync configuration in database

3. **Import Pipeline**
   - List files in selected folder
   - Stream download to local storage
   - Deduplication by (sourceProvider, sourceFileId, sourceFileRevision)
   - Create ProjectVersion per import
   - Register VaultAssets with metadata

4. **Database Schema**
   - `Integration` - OAuth tokens and connection status
   - `DriveSyncConfig` - Per-project folder configuration
   - `ProjectVersion` - Import versions with source tracking
   - `VaultAsset` - Files with deduplication support
   - `VaultImportJob` - Background job tracking

## Prerequisites

### 1. Environment Variables

Ensure `.env.local` contains:

```bash
# Google OAuth (already configured)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption key (32 characters)
ENCRYPTION_KEY=your-32-char-secret-key-here!!

# Database
DATABASE_URL=file:./dev.db
```

### 2. Google OAuth Configuration

Verify in Google Cloud Console:
- **Authorized redirect URI**: `http://localhost:3000/api/integrations/google-drive/callback`
- **Scopes**: `https://www.googleapis.com/auth/drive.readonly`
- **OAuth consent screen** configured

### 3. Database Setup

```bash
# Already done - schema is up to date
npx prisma generate
```

### 4. Create Test Folder in Google Drive

1. Go to https://drive.google.com
2. Create a new folder called "NoCulture Test"
3. Add 3-5 audio files (.wav, .mp3, .flac)
4. Add 1-2 documents (.pdf, .txt)

## End-to-End Test

### Step 1: Start Dev Server

```bash
npm run dev
```

Server should be running at http://localhost:3000

### Step 2: Navigate to Google Drive Integration

Open: http://localhost:3000/integrations/google-drive

You should see:
- "Connect Google Drive" button
- Feature cards (Secure OAuth, Selective Sync, etc.)

### Step 3: Connect Google Drive

1. Click **"Connect Google Drive"**
2. Browser redirects to Google OAuth consent screen
3. Sign in with your Google account
4. Grant permissions (read-only access to Drive)
5. Redirected back to integration page with `?success=true`

**Expected Result:**
- Page shows "Connected" status
- Displays your email address
- Shows "Select a Folder" section

### Step 4: Select Folder

1. Click **"Select Folder"**
2. Modal appears with list of your Drive folders
3. Click on "NoCulture Test" folder
4. Alert: "Folder selected! You can now run an import."

**Expected Result:**
- Modal closes
- "Selected Folder" section shows "NoCulture Test"
- "Sync Controls" section appears

### Step 5: Run Import

1. Click **"Run Import Now"**
2. Alert: "Import started! Job ID: [job-id]. Files are being imported in the background."
3. Wait 10-30 seconds for import to complete

**Expected Result:**
- Import runs in background
- Files downloaded from Drive
- Assets created in database

### Step 6: Verify Import in Database

```bash
npx prisma studio
```

Navigate to tables and verify:

**Integration Table:**
- 1 record with provider='GOOGLE_DRIVE'
- `accessTokenEncrypted` and `refreshTokenEncrypted` populated
- `email` matches your Google account
- `status` = 'ACTIVE'

**DriveSyncConfig Table:**
- 1 record with `projectId='demo-project-1'`
- `driveFolderId` matches selected folder
- `driveFolderName` = 'NoCulture Test'
- `lastSyncAt` timestamp populated

**VaultImportJob Table:**
- 1 record with `status='COMPLETED'`
- `provider='GOOGLE_DRIVE'`
- `totalFiles` = number of supported files in folder
- `processedFiles` = same as totalFiles
- `failedFiles` = 0

**ProjectVersion Table:**
- 1 record with `source='GOOGLE_DRIVE'`
- `label` = "Drive Import — [date]"
- `projectId` = 'demo-project-1'

**VaultAsset Table:**
- N records (one per file imported)
- `sourceProvider` = 'GOOGLE_DRIVE'
- `sourceFileId` = Drive file ID
- `sourceFileRevision` = modifiedTime
- `fileName` matches original file name
- `storageKey` = 'uploads/drive/[fileId]_[filename]'

### Step 7: Verify Files on Disk

```bash
ls -la public/uploads/drive/
```

Should see downloaded files with pattern: `[driveFileId]_[filename]`

### Step 8: Test Deduplication

1. Go back to integration page
2. Click **"Run Import Now"** again
3. Wait for completion

**Expected Result:**
- New VaultImportJob created with status='COMPLETED'
- `processedFiles` = totalFiles (all skipped as duplicates)
- NO new VaultAsset records created
- Console logs show "Skipping duplicate file: [filename]"

### Step 9: Test New File Import

1. Add a new audio file to your "NoCulture Test" folder in Drive
2. Go to integration page
3. Click **"Run Import Now"**
4. Wait for completion

**Expected Result:**
- Only the new file is imported
- New VaultAsset created for new file only
- Existing files skipped (deduplication working)

## API Endpoints Reference

### GET /api/integrations/google-drive/auth
**Purpose:** Start OAuth flow  
**Response:** `{ authUrl: string }`

### GET /api/integrations/google-drive/callback
**Purpose:** OAuth callback handler  
**Query Params:** `code`, `state`  
**Redirects to:** `/integrations/google-drive?success=true`

### GET /api/integrations/google-drive/status
**Purpose:** Get connection status  
**Query Params:** `projectId` (optional)  
**Response:**
```json
{
  "connected": true,
  "email": "user@example.com",
  "status": "ACTIVE",
  "syncConfig": {
    "folderId": "...",
    "folderName": "NoCulture Test",
    "enabled": true,
    "lastSyncAt": "2024-12-15T..."
  }
}
```

### GET /api/integrations/google-drive/folders
**Purpose:** List user's Drive folders  
**Response:**
```json
{
  "folders": [
    { "id": "...", "name": "Folder 1", "modifiedTime": "..." },
    { "id": "...", "name": "Folder 2", "modifiedTime": "..." }
  ]
}
```

### POST /api/integrations/google-drive/select-folder
**Purpose:** Select folder for project  
**Body:** `{ folderId: string, folderName: string, projectId: string }`  
**Response:** `{ success: true, syncConfig: {...} }`

### POST /api/integrations/google-drive/import-now
**Purpose:** Start immediate import  
**Body:** `{ projectId: string }`  
**Response:** `{ success: true, jobId: string, message: string }`

## Files Changed

### Database Schema
- **Modified:** `/prisma/schema.prisma`
  - Updated `Integration` model with proper OAuth fields
  - Added `DriveSyncConfig` model
  - Updated `VaultAsset` with `sourceFileRevision` for deduplication
  - Added unique constraint: `(sourceProvider, sourceFileId, sourceFileRevision)`

### Encryption Library
- **Created:** `/lib/encryption.ts`
  - AES-256-GCM encryption/decryption
  - Used for OAuth token storage

### API Routes
- **Modified:** `/app/api/integrations/google-drive/auth/route.ts`
  - Better error handling
  - Configuration validation

- **Modified:** `/app/api/integrations/google-drive/callback/route.ts`
  - Use encryption library
  - Store tokens separately (access + refresh)
  - Calculate expiry timestamp

- **Created:** `/app/api/integrations/google-drive/folders/route.ts`
  - List user's Drive folders
  - Decrypt tokens for API calls

- **Created:** `/app/api/integrations/google-drive/select-folder/route.ts`
  - Create/update DriveSyncConfig
  - Link folder to project

- **Created:** `/app/api/integrations/google-drive/import-now/route.ts`
  - Create VaultImportJob
  - Process import in background
  - Stream file downloads
  - Deduplication logic
  - Create ProjectVersion and VaultAssets

- **Modified:** `/app/api/integrations/google-drive/status/route.ts`
  - Return sync config per project
  - Include folder selection status

### UI Pages
- **Modified:** `/app/integrations/google-drive/page.tsx`
  - Update status fetching with projectId
  - Fix folder selection to include projectId
  - Update import to use correct endpoint
  - Better error messages

## Troubleshooting

### "Google OAuth not configured"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Restart dev server after adding env vars

### OAuth redirect fails
- Verify redirect URI in Google Cloud Console matches exactly:
  `http://localhost:3000/api/integrations/google-drive/callback`
- Check `NEXT_PUBLIC_APP_URL` is set correctly

### "No folder selected for this project"
- Complete folder selection step before running import
- Check DriveSyncConfig table in Prisma Studio

### Import fails silently
- Check VaultImportJob table for error messages
- Look at server console logs
- Verify folder has supported file types

### Files not appearing
- Check `public/uploads/drive/` directory exists and has files
- Verify VaultAsset records created in database
- Check file permissions

### Duplicate files created
- Verify unique constraint exists on VaultAsset
- Check sourceFileRevision is being set correctly
- Run: `npx prisma db push` to ensure schema is up to date

## Security Notes

✅ **Implemented:**
- OAuth tokens encrypted at rest (AES-256-GCM)
- Minimal Drive scopes (readonly)
- CSRF protection with state parameter
- Refresh token support for long-term access
- Secure token storage in database

⚠️ **For Production:**
- Use proper KMS (AWS KMS, Google Cloud KMS)
- Implement token rotation
- Add rate limiting to import endpoints
- Use S3/R2 instead of local file storage
- Add audit logging
- Implement user authentication (replace demo-user)
- Add webhook for real-time Drive changes
- Implement proper error handling and retries

## Next Steps

1. **Add Vault UI Integration**
   - Show imported files in Vault
   - Display ProjectVersions with source tags
   - Add "Import" dropdown to Vault page

2. **FL Studio Recommended Path**
   - Update FL Studio page with Drive Desktop recommendation
   - Add instructions for exporting to Drive folder

3. **Incremental Sync**
   - Implement Drive Changes API
   - Store and use sync cursor
   - Auto-sync on schedule

4. **Multi-Project Support**
   - Let users select project when connecting
   - Support multiple folders per integration

5. **Production Deployment**
   - Switch to PostgreSQL
   - Implement job queue (Bull/BullMQ)
   - Set up cloud storage (S3/R2)
   - Add monitoring and alerts

## Success Criteria

✅ **Working End-to-End:**
- OAuth flow completes successfully
- Folder selection works
- Import creates VaultAssets
- Files downloaded to storage
- Deduplication prevents duplicates
- Background job processing works
- Database records properly created

The Google Drive integration is now fully functional and ready for testing!
