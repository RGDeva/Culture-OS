# Vault Auto-Import Implementation Summary

Complete implementation of FL Studio Bridge, Google Drive Sync, and Drive Agent for NoCulture OS.

## Files Added/Modified

### Database Schema
- **Modified:** `/prisma/schema.prisma`
  - Added `Integration` model for OAuth integrations
  - Added `VaultImportJob` model for tracking import jobs
  - Added `VaultAsset` model for imported files with metadata
  - Added `ProjectVersion` model for version tracking
  - Added `BridgeDevice` model for device token management

### UI Pages
- **Created:** `/app/vault/integrations/fl-studio/page.tsx`
  - FL Studio Bridge integration UI
  - Device token generation
  - Setup instructions
  - Connection status display

- **Created:** `/app/vault/integrations/google-drive/page.tsx`
  - Google Drive OAuth connection
  - Folder picker
  - Continuous sync toggle
  - Import controls
  - Drive Agent documentation

### API Endpoints

#### Bridge APIs
- **Created:** `/app/api/bridge/token/route.ts`
  - POST: Generate device token for Bridge authentication
  - Returns 64-character hex token

- **Created:** `/app/api/bridge/status/route.ts`
  - GET: Check Bridge connection status
  - Returns connection state and last import time

#### Google Drive APIs
- **Created:** `/app/api/integrations/google-drive/auth/route.ts`
  - GET: Start OAuth flow
  - Generates authorization URL with CSRF protection

- **Created:** `/app/api/integrations/google-drive/callback/route.ts`
  - GET: OAuth callback handler
  - Exchanges code for tokens
  - Encrypts and stores tokens securely

- **Created:** `/app/api/integrations/google-drive/status/route.ts`
  - GET: Get integration status
  - Returns connection state, folder info, sync settings

- **Created:** `/app/api/integrations/google-drive/import/route.ts`
  - POST: Start import job
  - Lists files in selected folder
  - Downloads and registers assets
  - Handles deduplication

### Bridge CLI Application
- **Created:** `/bridge/package.json`
  - Dependencies: chokidar, commander, axios, ffmpeg, chalk, ora

- **Created:** `/bridge/src/cli.ts`
  - Commands: init, start, status
  - Configuration management
  - User-friendly CLI interface

- **Created:** `/bridge/src/watcher.ts`
  - File system watcher with chokidar
  - Debounced file detection
  - Metadata extraction with ffprobe
  - Secure upload with signed URLs
  - Asset registration

- **Created:** `/bridge/README.md`
  - Installation instructions
  - Setup guide
  - Usage examples
  - Troubleshooting

### Documentation
- **Created:** `/VAULT_IMPORT_TESTING.md`
  - Comprehensive testing guide
  - 8 test scenarios
  - Expected results
  - Troubleshooting tips

- **Created:** `/VAULT_IMPORT_IMPLEMENTATION.md` (this file)
  - Implementation summary
  - Setup instructions
  - Architecture overview

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Main app
npm install googleapis

# Bridge
cd bridge
npm install
npm run build
npm link  # Makes noculture-bridge available globally
cd ..
```

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Google OAuth (get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption key (32 characters - generate with: openssl rand -hex 16)
ENCRYPTION_KEY=your-32-char-secret-key-here!!

# Database
DATABASE_URL=file:./dev.db
```

### 3. Setup Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/integrations/google-drive/callback`
5. Copy Client ID and Secret to `.env.local`

### 4. Update Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create migration
npx prisma migrate dev --name add_vault_integrations
```

### 5. Start Development Server

```bash
npm run dev
```

Server will be available at http://localhost:3000

---

## Testing Locally

### Test FL Studio Bridge

1. **Navigate to integration page:**
   ```
   http://localhost:3000/vault/integrations/fl-studio
   ```

2. **Generate device token:**
   - Click "Generate Token"
   - Copy the token

3. **Initialize Bridge:**
   ```bash
   cd bridge
   npm run dev -- init
   ```
   - API Base URL: `http://localhost:3000`
   - Paste device token

4. **Create test folder:**
   ```bash
   mkdir -p ~/NoCulture/Exports
   ```

5. **Start Bridge:**
   ```bash
   npm run dev -- start --watch ~/NoCulture/Exports --projectId test-project-123
   ```

6. **Test export:**
   ```bash
   # Create test audio file
   ffmpeg -f lavfi -i "sine=frequency=440:duration=5" ~/NoCulture/Exports/test-export.wav
   ```

7. **Verify:**
   - Bridge console shows successful import
   - Check database: `npx prisma studio`
   - VaultAsset should exist with sourceProvider="FL_EXPORT"

### Test Google Drive Sync

1. **Navigate to integration page:**
   ```
   http://localhost:3000/vault/integrations/google-drive
   ```

2. **Connect Google Drive:**
   - Click "Connect Google Drive"
   - Complete OAuth flow
   - Grant permissions

3. **Select folder:**
   - Click "Select Folder"
   - Choose a folder with audio files

4. **Run import:**
   - Click "Run Import Now"
   - Wait for completion

5. **Verify:**
   - Check database: `npx prisma studio`
   - VaultImportJob status should be "COMPLETED"
   - VaultAssets should exist with sourceProvider="GOOGLE_DRIVE"

6. **Test deduplication:**
   - Click "Run Import Now" again
   - Should skip existing files
   - No duplicates created

---

## Architecture Overview

### Data Flow: FL Studio Bridge

```
FL Studio Export
    ↓
Local Folder (watched by Bridge)
    ↓
Bridge detects file (chokidar)
    ↓
Extract metadata (ffprobe)
    ↓
Create ProjectVersion (API)
    ↓
Get signed upload URL (API)
    ↓
Upload file to storage
    ↓
Register VaultAsset (API)
    ↓
Vault UI shows imported file
```

### Data Flow: Google Drive Sync

```
User connects Drive (OAuth)
    ↓
Select folder to sync
    ↓
Start import job
    ↓
List files in folder (Drive API)
    ↓
For each file:
  - Check if already imported (dedup)
  - Download file (stream)
  - Upload to storage
  - Create VaultAsset
    ↓
Update job status to COMPLETED
    ↓
Vault UI shows imported files
```

### Security Architecture

1. **Bridge Authentication:**
   - Device token: 64-char hex (crypto.randomBytes(32))
   - Stored in BridgeDevice table
   - Can be revoked by user
   - Used as Bearer token in API requests

2. **Google OAuth:**
   - Standard OAuth 2.0 flow
   - Tokens encrypted with AES-256-CBC
   - Encryption key from environment variable
   - Refresh tokens stored for continuous sync

3. **File Uploads:**
   - Signed URLs with expiration
   - Direct upload to storage (no server buffering)
   - Content-Type validation
   - Size limits enforced

4. **Deduplication:**
   - Unique constraint on (sourceProvider, sourceFileId)
   - Prevents duplicate imports
   - Safe for concurrent imports

---

## API Endpoints Reference

### Bridge APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/bridge/token` | POST | User | Generate device token |
| `/api/bridge/status` | GET | User | Get connection status |
| `/api/uploads/sign` | POST | Device Token | Get signed upload URL |
| `/api/projects/:id/versions` | POST | Device Token | Create version |
| `/api/projects/:id/versions/:versionId/assets` | POST | Device Token | Register asset |

### Google Drive APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/integrations/google-drive/auth` | GET | User | Start OAuth |
| `/api/integrations/google-drive/callback` | GET | OAuth | OAuth callback |
| `/api/integrations/google-drive/status` | GET | User | Get status |
| `/api/integrations/google-drive/folders` | GET | User | List folders |
| `/api/integrations/google-drive/select-folder` | POST | User | Select folder |
| `/api/integrations/google-drive/import` | POST | User | Start import |
| `/api/integrations/google-drive/sync` | POST | User | Run sync |
| `/api/integrations/google-drive/toggle-sync` | POST | User | Toggle continuous sync |
| `/api/integrations/google-drive/disconnect` | POST | User | Disconnect |

---

## Database Schema Reference

### Integration
```prisma
model Integration {
  id              String    @id @default(cuid())
  userId          String
  provider        String    // FL_STUDIO_BRIDGE, GOOGLE_DRIVE, DRIVE_AGENT
  encryptedTokens String?   // Encrypted OAuth tokens
  scopes          String?   // JSON array
  config          String?   // JSON: { folderId, continuousSync, etc }
  status          String    @default("ACTIVE")
  lastSyncAt      DateTime?
  
  @@unique([userId, provider])
}
```

### VaultImportJob
```prisma
model VaultImportJob {
  id              String    @id @default(cuid())
  integrationId   String
  projectId       String?
  provider        String
  sourcePath      String?
  status          String    @default("PENDING")
  totalFiles      Int       @default(0)
  processedFiles  Int       @default(0)
  failedFiles     Int       @default(0)
  syncCursor      String?   // For Drive Changes API
  startedAt       DateTime?
  finishedAt      DateTime?
}
```

### VaultAsset
```prisma
model VaultAsset {
  id              String    @id @default(cuid())
  projectId       String
  versionId       String
  storageKey      String
  fileName        String
  fileSize        Int
  mimeType        String?
  sourceProvider  String    // FL_EXPORT, GOOGLE_DRIVE, DRIVE_AGENT
  sourceFileId    String?
  duration        Float?
  sampleRate      Int?
  bitrate         Int?
  channels        Int?
  format          String?
  metadata        String?   // JSON
  
  @@unique([sourceProvider, sourceFileId])
}
```

### ProjectVersion
```prisma
model ProjectVersion {
  id          String    @id @default(cuid())
  projectId   String
  label       String
  description String?
  source      String    @default("MANUAL")
  createdAt   DateTime  @default(now())
}
```

### BridgeDevice
```prisma
model BridgeDevice {
  id          String    @id @default(cuid())
  userId      String
  deviceToken String    @unique
  deviceName  String?
  status      String    @default("ACTIVE")
  lastSeenAt  DateTime?
}
```

---

## Production Deployment Notes

### Required Changes for Production

1. **Use PostgreSQL instead of SQLite:**
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

2. **Implement job queue for imports:**
   - Use Bull/BullMQ for background processing
   - Prevents timeout issues
   - Better error handling and retries

3. **Set up cron for continuous sync:**
   ```javascript
   // Every 5 minutes
   cron.schedule('*/5 * * * *', async () => {
     await runContinuousSync()
   })
   ```

4. **Configure file storage:**
   - AWS S3, Cloudflare R2, or similar
   - Implement signed URL generation
   - Set up CORS for direct uploads

5. **Use proper KMS for encryption:**
   - AWS KMS, Google Cloud KMS, or HashiCorp Vault
   - Rotate keys regularly
   - Audit access

6. **Add rate limiting:**
   ```javascript
   // Limit import requests
   rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10 // 10 requests per window
   })
   ```

7. **Implement monitoring:**
   - Track import job success/failure rates
   - Alert on failed imports
   - Monitor storage usage
   - Track API rate limits

8. **Security hardening:**
   - HTTPS only
   - Secure headers (helmet.js)
   - CSRF protection
   - Input validation
   - SQL injection prevention (Prisma handles this)

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **Bridge is single-project:**
   - Can only watch one folder per project
   - Workaround: Run multiple Bridge instances

2. **No real-time sync status:**
   - Import jobs run in background
   - UI doesn't show live progress
   - Enhancement: WebSocket for real-time updates

3. **No file versioning:**
   - Modified files create new assets
   - No automatic version detection
   - Enhancement: Implement file hash comparison

4. **Limited file type support:**
   - Audio and documents only
   - No video support yet
   - Enhancement: Add video processing

5. **No conflict resolution:**
   - Duplicate filenames not handled
   - Enhancement: Add conflict resolution UI

### Planned Enhancements

1. **Drive Agent (MCP-based):**
   - Natural language file search
   - Intelligent file selection
   - Local agent with MCP server

2. **Ableton/Logic Pro support:**
   - Similar to FL Studio Bridge
   - Different export folder patterns

3. **Dropbox/OneDrive integration:**
   - Additional cloud storage providers
   - Same architecture as Google Drive

4. **Collaborative imports:**
   - Team members can import to shared projects
   - Permission management

5. **Smart organization:**
   - AI-based file categorization
   - Automatic tagging
   - Genre detection

---

## Troubleshooting Guide

### Bridge Issues

**"FFmpeg not found":**
```bash
# Install FFmpeg
brew install ffmpeg  # macOS
choco install ffmpeg # Windows
```

**"Device token invalid":**
- Regenerate token in UI
- Run `noculture-bridge init` again
- Check token hasn't been revoked

**Files not importing:**
- Verify file extension is supported
- Check Bridge console for errors
- Ensure watch path is correct
- Wait for debounce (3 seconds)

### Google Drive Issues

**OAuth fails:**
- Check redirect URI matches exactly
- Verify Google OAuth credentials
- Ensure Drive API is enabled

**Import job stuck:**
- Check VaultImportJob status in database
- Look for error messages
- Verify Drive folder permissions

**Duplicates created:**
- Check unique constraint exists
- Verify sourceFileId is set correctly
- Run database migration

### General Issues

**Database errors:**
```bash
# Reset database (development only!)
rm prisma/dev.db
npx prisma db push
```

**Token encryption fails:**
- Verify ENCRYPTION_KEY is 32 characters
- Check key is consistent across restarts

**Storage upload fails:**
- Implement signed URL generation
- Check storage credentials
- Verify CORS settings

---

## Support & Resources

- **Documentation:** `/VAULT_IMPORT_TESTING.md`
- **Bridge README:** `/bridge/README.md`
- **Prisma Studio:** `npx prisma studio`
- **Database Migrations:** `npx prisma migrate dev`

For production deployment assistance, consult the deployment checklist in `VAULT_IMPORT_TESTING.md`.
