# Cyanite Audio Analysis Integration

## Environment Variables

Add these to your `.env.local` file:

```env
# Cyanite API Configuration
CYANITE_API_BASE=https://api.cyanite.ai/graphql
CYANITE_INTEGRATION_ACCESS_TOKEN=your_cyanite_integration_access_token_here
CYANITE_WEBHOOK_SECRET=your_cyanite_webhook_secret_here
```

## Setup Instructions

### 1. Get Cyanite API Credentials

1. Sign up at [Cyanite.ai](https://cyanite.ai)
2. Create an integration in your Cyanite dashboard
3. Copy your Integration Access Token
4. Copy your Webhook Secret

### 2. Configure Webhook

Set up your webhook endpoint in the Cyanite dashboard:

**Webhook URL:** `https://yourdomain.com/api/webhooks/cyanite`

**Events to subscribe to:**
- `analysis.completed`
- `analysis.failed`

### 3. Test the Integration

1. Upload an audio file to your Vault
2. Check server logs for Cyanite API calls
3. Wait for webhook callback (usually 30-60 seconds)
4. Refresh the Vault page to see analysis results

## How It Works

### Upload Flow

1. User drags/drops audio file into Vault
2. File is uploaded and asset is created with `cyaniteStatus: 'PENDING'`
3. Server calls Cyanite API to start analysis (non-blocking)
4. User sees "ANALYZING..." badge on the asset
5. Cyanite processes the audio (30-60 seconds)
6. Cyanite sends webhook to `/api/webhooks/cyanite`
7. Webhook updates asset with analysis data
8. User refreshes and sees full analysis (BPM, key, moods, genres, etc.)

### Analysis Data

Cyanite provides:
- **BPM** - Tempo in beats per minute
- **Musical Key** - Key signature (C, D#m, etc.)
- **Energy** - 0-1 scale of track intensity
- **Valence** - 0-1 scale of positivity/happiness
- **Danceability** - 0-1 scale of how danceable
- **Moods** - Array of mood tags (happy, dark, energetic, etc.)
- **Genres** - Array of genre tags (hip-hop, trap, electronic, etc.)

### Filtering

Users can filter their Vault by:
- BPM range (e.g., 120-140)
- Musical key (e.g., C major, D# minor)
- Moods (multi-select)
- Genres (multi-select)
- Energy level (0-100%)
- Danceability (0-100%)

## Files Created/Modified

### New Files

- `lib/cyanite.ts` - Cyanite API client
- `app/api/webhooks/cyanite/route.ts` - Webhook handler
- `components/vault/CyaniteAnalysisBadge.tsx` - Analysis status badge
- `components/vault/CyaniteAnalysisPanel.tsx` - Detailed analysis display
- `components/vault/CyaniteFilters.tsx` - AI-powered filters

### Modified Files

- `types/vault.ts` - Added Cyanite fields to CreativeAsset
- `app/api/vault/upload/route.ts` - Trigger analysis on upload
- `app/vault/page.tsx` - Added filters and badges
- `components/vault/AssetDetailModal.tsx` - Added analysis panel

## API Endpoints

### POST /api/vault/upload
Uploads file and triggers Cyanite analysis

### POST /api/webhooks/cyanite
Receives Cyanite webhook callbacks

## Troubleshooting

### Analysis not starting
- Check `CYANITE_INTEGRATION_ACCESS_TOKEN` is set
- Check server logs for API errors
- Verify audio file URL is publicly accessible

### Webhook not received
- Check `CYANITE_WEBHOOK_SECRET` is set
- Verify webhook URL in Cyanite dashboard
- Check webhook signature verification
- Ensure your server is publicly accessible

### Analysis failed
- Check audio file format (must be valid audio)
- Check file size (Cyanite has limits)
- Check Cyanite dashboard for error details

## Development Mode

In development, webhook signature verification is relaxed. For production:

1. Implement proper signature verification in `lib/cyanite.ts`
2. Use HTTPS for webhook endpoint
3. Add retry logic for failed webhooks
4. Add monitoring/alerting for analysis failures

## Future Enhancements

- [ ] Retry failed analyses
- [ ] Batch analysis for multiple files
- [ ] Real-time analysis status updates (WebSocket)
- [ ] Analysis cost tracking
- [ ] Custom analysis parameters
- [ ] Export analysis data
- [ ] Compare tracks by similarity
- [ ] Auto-tagging based on analysis
- [ ] Playlist generation by mood/energy
