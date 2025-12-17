# Vault Auto-Import Testing Guide

Complete testing instructions for FL Studio Bridge, Google Drive Sync, and Drive Agent.

## Prerequisites

### Environment Variables

Add to `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption (32 characters)
ENCRYPTION_KEY=your-32-char-secret-key-here!!

# Database
DATABASE_URL=file:./dev.db
```

### Database Setup

```bash
# Generate Prisma client with new schema
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migration
npx prisma migrate dev --name add_vault_integrations
```

### Install Dependencies

```bash
# Main app
npm install googleapis

# Bridge
cd bridge
npm install
npm run build
cd ..
```

## Test 1: FL Studio Bridge Auto-Import

### Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to FL Studio integration:**
   - Go to `http://localhost:3000/vault/integrations/fl-studio`

3. **Generate device token:**
   - Click "Generate Token"
   - Copy the token (should be 64-character hex string)

4. **Initialize Bridge:**
   ```bash
   cd bridge
   npm run dev -- init
   ```
   - API Base URL: `http://localhost:3000`
   - Device Token: Paste the token from step 3

5. **Create test export folder:**
   ```bash
   mkdir -p ~/NoCulture/Exports
   ```

### Test Execution

1. **Start Bridge:**
   ```bash
   npm run dev -- start --watch ~/NoCulture/Exports --projectId test-project-123
   ```

2. **Export a test file:**
   - Option A: Copy a WAV file to the export folder:
     ```bash
     cp /path/to/test.wav ~/NoCulture/Exports/
     ```
   - Option B: Create a test audio file with FFmpeg:
     ```bash
     ffmpeg -f lavfi -i "sine=frequency=440:duration=5" ~/NoCulture/Exports/test-export.wav
     ```

3. **Observe Bridge output:**
   - Should detect the new file
   - Extract metadata
   - Create version
   - Upload file
   - Register asset

### Expected Results

✅ Bridge console shows:
```
📁 New file detected: test-export.wav
⠋ Processing test-export.wav...
✓ test-export.wav imported successfully
```

✅ Database check:
```bash
# Check BridgeDevice created
npx prisma studio
# Navigate to BridgeDevice table - should see 1 record

# Check ProjectVersion created
# Navigate to ProjectVersion table - should see version with source="FL_EXPORT"

# Check VaultAsset created
# Navigate to VaultAsset table - should see asset with sourceProvider="FL_EXPORT"
```

✅ Integration page shows:
- Status: Connected
- Last import timestamp updated

### Troubleshooting

**"FFmpeg not found":**
```bash
# macOS
brew install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg
```

**"Device token invalid":**
- Regenerate token in UI
- Run `bridge init` again

**File not detected:**
- Ensure Bridge is running
- Check file extension is supported (.wav, .mp3, etc.)
- Wait 3 seconds for debounce

---

## Test 2: Google Drive Sync

### Setup

1. **Configure Google OAuth:**
   - Go to https://console.cloud.google.com
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/integrations/google-drive/callback`
   - Copy Client ID and Secret to `.env.local`

2. **Prepare test Drive folder:**
   - Create a folder in Google Drive named "NoCulture Test"
   - Add 3-5 audio files (.wav, .mp3, .flac)
   - Add 1-2 documents (.pdf, .txt)

### Test Execution

1. **Navigate to Google Drive integration:**
   ```
   http://localhost:3000/vault/integrations/google-drive
   ```

2. **Connect Google Drive:**
   - Click "Connect Google Drive"
   - Complete OAuth flow
   - Grant permissions
   - Should redirect back with success

3. **Select folder:**
   - Click "Select Folder"
   - Choose "NoCulture Test" folder
   - Click to select

4. **Run initial import:**
   - Click "Run Import Now"
   - Wait for import to complete (check console logs)

5. **Verify import:**
   ```bash
   npx prisma studio
   # Check VaultImportJob - status should be "COMPLETED"
   # Check VaultAsset - should see all files with sourceProvider="GOOGLE_DRIVE"
   ```

### Expected Results

✅ OAuth flow completes successfully

✅ Folder selection works

✅ Import job creates:
- 1 VaultImportJob record (status: COMPLETED)
- 1 ProjectVersion (source: GOOGLE_DRIVE)
- N VaultAsset records (one per file)

✅ No duplicate imports on second run

### Test Incremental Sync

1. **Add new file to Drive folder:**
   - Upload a new audio file to the "NoCulture Test" folder

2. **Run sync:**
   - Click "Run Import Now" again

3. **Verify:**
   - Only new file is imported
   - No duplicates of existing files
   - processedFiles count increments

### Troubleshooting

**OAuth redirect fails:**
- Check `NEXT_PUBLIC_APP_URL` is correct
- Verify redirect URI in Google Console matches exactly

**"No folder selected":**
- Complete folder selection step first

**Import fails:**
- Check Google OAuth token is valid
- Verify Drive API is enabled in Google Console
- Check file permissions in Drive

---

## Test 3: Continuous Sync

### Setup

1. **Enable continuous sync:**
   - In Google Drive integration page
   - Toggle "Continuous Sync" to ON

2. **Verify sync interval:**
   - Check that sync runs automatically every 5 minutes
   - (In production, implement with cron job or queue)

### Test Execution

1. **Add file to Drive:**
   - Upload new file to synced folder

2. **Wait for sync:**
   - Should auto-sync within 5 minutes
   - Check VaultImportJob for new job

3. **Modify file in Drive:**
   - Update an existing file
   - Verify changes are detected

### Expected Results

✅ New files auto-imported

✅ Modified files updated (if implementing change detection)

✅ Deleted files handled gracefully

---

## Test 4: Drive Agent (Experimental)

### Setup

1. **Install Drive Agent:**
   ```bash
   # TODO: Create drive-agent package
   npm install -g @noculture/drive-agent
   ```

2. **Authenticate:**
   ```bash
   drive-agent auth
   # Opens browser for OAuth
   ```

### Test Execution

1. **Search files:**
   ```bash
   drive-agent search "audio files from last week"
   ```

2. **Import specific files:**
   ```bash
   drive-agent import --fileIds abc123,def456 --projectId test-project-123
   ```

### Expected Results

✅ Search returns relevant files

✅ Import creates VaultAsset records with sourceProvider="DRIVE_AGENT"

---

## Test 5: Deduplication

### Test Execution

1. **Import same file twice:**
   - Run Bridge on same export folder twice
   - Or run Google Drive import twice

2. **Verify:**
   ```bash
   npx prisma studio
   # Check VaultAsset table
   # Should only have ONE record per unique sourceFileId
   ```

### Expected Results

✅ Unique constraint prevents duplicates:
```
@@unique([sourceProvider, sourceFileId])
```

✅ Second import skips existing files

---

## Test 6: Large File Handling

### Test Execution

1. **Create large test file (100MB+):**
   ```bash
   ffmpeg -f lavfi -i "sine=frequency=440:duration=600" -b:a 320k ~/NoCulture/Exports/large-file.mp3
   ```

2. **Import via Bridge:**
   - Should handle streaming upload
   - No memory issues

### Expected Results

✅ File uploads successfully

✅ Memory usage stays reasonable

✅ Progress indicators work

---

## Test 7: Error Handling

### Test Execution

1. **Invalid device token:**
   - Modify bridge config with wrong token
   - Try to import
   - Should show auth error

2. **Network failure:**
   - Disconnect internet during import
   - Should retry or fail gracefully

3. **Unsupported file type:**
   - Add .txt file to export folder
   - Should be ignored by Bridge

### Expected Results

✅ Clear error messages

✅ Failed imports logged in VaultImportJob

✅ Partial imports don't corrupt database

---

## Test 8: Metadata Extraction

### Test Execution

1. **Import file with metadata:**
   - Use audio file with known properties
   - Check extracted metadata

2. **Verify in database:**
   ```bash
   npx prisma studio
   # Check VaultAsset record
   # Should have: duration, sampleRate, bitrate, channels, format
   ```

### Expected Results

✅ Audio metadata correctly extracted:
- Duration (seconds)
- Sample rate (Hz)
- Bitrate (bps)
- Channels (1=mono, 2=stereo)
- Format (wav, mp3, etc.)

---

## Performance Benchmarks

### Bridge Performance

- **File detection latency:** < 3 seconds
- **Metadata extraction:** < 1 second per file
- **Upload speed:** Network-dependent
- **Memory usage:** < 100MB for typical files

### Google Drive Import

- **Initial import (100 files):** ~5-10 minutes
- **Incremental sync:** < 1 minute
- **API rate limits:** Handled with backoff

---

## Security Checklist

✅ Device tokens are cryptographically random (32 bytes)

✅ OAuth tokens encrypted at rest

✅ Signed upload URLs expire after 1 hour

✅ No tokens logged in console

✅ HTTPS required in production

✅ Scoped Drive permissions (readonly)

---

## Production Deployment Checklist

### Environment

- [ ] Set `ENCRYPTION_KEY` to secure 32-character string
- [ ] Configure Google OAuth with production redirect URIs
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable database connection pooling

### Infrastructure

- [ ] Deploy import job processing to queue (Bull/BullMQ)
- [ ] Set up cron for continuous sync
- [ ] Configure file storage (S3/R2/Cloudflare)
- [ ] Add rate limiting to import endpoints
- [ ] Set up monitoring and alerts

### Security

- [ ] Use proper KMS for token encryption
- [ ] Rotate encryption keys regularly
- [ ] Implement token revocation
- [ ] Add audit logging
- [ ] Set up CORS properly

---

## Common Issues

### Bridge won't start

**Check:**
- Node.js version (18+)
- FFmpeg installed
- Config file exists (`~/.noculture/bridge-config.json`)
- Watch path exists

### Google Drive import fails

**Check:**
- OAuth credentials valid
- Drive API enabled
- Correct scopes granted
- Folder permissions

### Files not appearing in Vault

**Check:**
- VaultImportJob status
- VaultAsset records created
- ProjectVersion exists
- Storage upload succeeded

---

## Support

For issues during testing:

1. Check console logs (both app and Bridge)
2. Inspect database with `npx prisma studio`
3. Verify environment variables
4. Review API responses in Network tab

Report bugs with:
- Steps to reproduce
- Console output
- Database state
- Environment details
