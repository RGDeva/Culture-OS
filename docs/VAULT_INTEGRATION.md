# 🔌 Vault Integration Guide

How to integrate the AI Analysis Pipeline with your existing vault.

---

## 📋 Integration Checklist

### ✅ **Already Integrated:**
1. **Upload API** - Automatically queues analysis after file upload
2. **Analysis API Routes** - Queue, process, retry endpoints ready
3. **Database Models** - Asset and AssetAnalysis tables created
4. **Python Worker** - Mansuba AI analysis service
5. **UI Component** - AnalysisTab component ready

### 🔧 **What You Need to Do:**

#### **1. Use the New Modal Component**

Replace `AssetDetailModal` with `AssetDetailModalV2` in your vault page:

```tsx
// In app/vault/page.tsx or wherever you use AssetDetailModal

// OLD:
import { AssetDetailModal } from '@/components/vault/AssetDetailModal'

// NEW:
import { AssetDetailModalV2 } from '@/components/vault/AssetDetailModalV2'

// Then use it:
{selectedAsset && (
  <AssetDetailModalV2
    asset={selectedAsset}
    isOpen={!!selectedAsset}
    onClose={() => setSelectedAsset(null)}
    onUpdate={handleUpdateAsset}
    onDelete={handleDeleteAsset}
  />
)}
```

#### **2. Fetch Analysis with Assets (Optional)**

If you want to show analysis status in the asset list:

```tsx
// In your fetchAssets function
const response = await fetch(`/api/vault/assets?${params}`)
const data = await response.json()

// For each asset, optionally fetch analysis status
const assetsWithAnalysis = await Promise.all(
  data.assets.map(async (asset) => {
    try {
      const analysisRes = await fetch(`/api/analysis/queue?assetId=${asset.id}`)
      if (analysisRes.ok) {
        const { analysis } = await analysisRes.json()
        return { ...asset, analysis }
      }
    } catch (error) {
      console.warn('Failed to fetch analysis:', error)
    }
    return asset
  })
)

setAssets(assetsWithAnalysis)
```

#### **3. Show Analysis Badge in Asset Cards**

Add a visual indicator for analysis status:

```tsx
// In your AssetCard component
{asset.analysis?.status === 'COMPLETE' && (
  <div className="absolute top-2 right-2">
    <Sparkles className="h-4 w-4 text-green-400" />
  </div>
)}

{asset.analysis?.status === 'PENDING' && (
  <div className="absolute top-2 right-2">
    <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
  </div>
)}
```

---

## 🎨 UI Customization

### **Change Tab Colors**

Edit `AssetDetailModalV2.tsx`:

```tsx
// Line ~200: Change tab trigger colors
<TabsTrigger
  value="analysis"
  className="font-mono data-[state=active]:text-cyan-400" // Change color here
>
```

### **Customize Analysis Display**

Edit `AnalysisTab.tsx`:

```tsx
// Change section colors, layout, or add new fields
<div className="border border-purple-400/20 bg-purple-400/5"> // Custom colors
  <h5 className="text-purple-400">CUSTOM_SECTION:</h5>
  {/* Your custom content */}
</div>
```

### **Add Custom Analysis Fields**

1. **Update Database Schema:**
```prisma
// In prisma/schema.prisma
model AssetAnalysis {
  // ... existing fields
  customField String?
}
```

2. **Update Analysis Function:**
```typescript
// In lib/analysis/analyzeAsset.ts
await prisma.assetAnalysis.update({
  data: {
    // ... existing fields
    customField: yourCustomData
  }
})
```

3. **Display in UI:**
```tsx
// In components/vault/AnalysisTab.tsx
{analysis.customField && (
  <div>
    <h5>CUSTOM_FIELD:</h5>
    <p>{analysis.customField}</p>
  </div>
)}
```

---

## 🔄 Workflow Integration

### **Trigger Analysis Manually**

Add a button to trigger analysis for existing assets:

```tsx
<Button
  onClick={async () => {
    await fetch('/api/analysis/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: asset.id })
    })
    // Refresh asset to show pending status
    fetchAssets()
  }}
>
  ANALYZE_NOW
</Button>
```

### **Bulk Analysis**

Analyze multiple assets at once:

```tsx
const analyzeBulk = async (assetIds: string[]) => {
  await Promise.all(
    assetIds.map(assetId =>
      fetch('/api/analysis/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      })
    )
  )
}
```

### **Auto-Retry Failed Analyses**

Add a cron job or background task:

```typescript
// In a background job (e.g., Vercel Cron)
export async function retryFailedAnalyses() {
  const failed = await prisma.assetAnalysis.findMany({
    where: {
      status: 'FAILED',
      retryCount: { lt: 3 }
    }
  })
  
  for (const analysis of failed) {
    await fetch('/api/analysis/retry?assetId=' + analysis.assetId, {
      method: 'POST'
    })
  }
}
```

---

## 📊 Analytics & Monitoring

### **Track Analysis Success Rate**

```typescript
const stats = await prisma.assetAnalysis.groupBy({
  by: ['status'],
  _count: true
})

// Returns: { status: 'COMPLETE', _count: 45 }, etc.
```

### **Monitor Processing Time**

Add timestamps to track duration:

```typescript
// In analyzeAsset function
const startTime = Date.now()
// ... analysis logic
const duration = Date.now() - startTime

await prisma.assetAnalysis.update({
  data: {
    processingTimeMs: duration
  }
})
```

### **Log Analysis Events**

```typescript
// In your analysis routes
console.log('[ANALYSIS_METRICS]', {
  assetId,
  status: 'complete',
  duration: durationMs,
  instruments: instrumentCount,
  timestamp: new Date().toISOString()
})
```

---

## 🚀 Performance Optimization

### **1. Cache Analysis Results**

Use Redis or in-memory cache:

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
})

// Cache analysis for 24 hours
await redis.setex(
  `analysis:${assetId}`,
  86400,
  JSON.stringify(analysis)
)
```

### **2. Queue System**

Use BullMQ for better job management:

```typescript
import { Queue } from 'bullmq'

const analysisQueue = new Queue('analysis', {
  connection: { host: 'localhost', port: 6379 }
})

// Add job
await analysisQueue.add('analyze', { assetId })

// Process jobs
const worker = new Worker('analysis', async (job) => {
  await analyzeAsset(job.data.assetId)
})
```

### **3. Parallel Processing**

Process multiple analyses concurrently:

```typescript
// In Python worker, increase workers
uvicorn main:app --workers 4

// Or use multiple worker instances
```

---

## 🔐 Security Considerations

### **1. Rate Limiting**

Prevent abuse of analysis API:

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // Max 10 analyses per 15 min
})

app.use('/api/analysis', limiter)
```

### **2. Authentication**

Ensure only asset owners can analyze:

```typescript
// In analysis queue route
const asset = await prisma.asset.findUnique({
  where: { id: assetId }
})

if (asset.ownerId !== userId) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 403 }
  )
}
```

### **3. File Validation**

Validate file URLs before analysis:

```typescript
// Check URL is from trusted source
const allowedDomains = ['res.cloudinary.com', 'your-cdn.com']
const url = new URL(fileUrl)

if (!allowedDomains.includes(url.hostname)) {
  throw new Error('Invalid file URL')
}
```

---

## 🧪 Testing

### **Unit Tests**

```typescript
// test/analysis.test.ts
import { analyzeAsset } from '@/lib/analysis/analyzeAsset'

describe('analyzeAsset', () => {
  it('should analyze audio file', async () => {
    const result = await analyzeAsset('test-asset-id')
    expect(result.success).toBe(true)
    expect(result.analysis).toBeDefined()
  })
})
```

### **Integration Tests**

```typescript
// test/api/analysis.test.ts
describe('POST /api/analysis/queue', () => {
  it('should queue analysis', async () => {
    const response = await fetch('/api/analysis/queue', {
      method: 'POST',
      body: JSON.stringify({ assetId: 'test-id' })
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.status).toBe('PENDING')
  })
})
```

---

## 📚 API Reference

### **POST /api/analysis/queue**
Queue asset for analysis.

**Request:**
```json
{ "assetId": "clx123abc" }
```

**Response:**
```json
{
  "message": "Analysis queued successfully",
  "analysis": {
    "id": "cly456def",
    "assetId": "clx123abc",
    "status": "PENDING"
  }
}
```

### **GET /api/analysis/queue?assetId=xxx**
Get analysis status.

**Response:**
```json
{
  "analysis": {
    "id": "cly456def",
    "status": "COMPLETE",
    "instruments": "[\"Piano\", \"Drums\"]",
    "audioSummary": "This track features...",
    "cyaniteBpm": 120
  }
}
```

### **POST /api/analysis/retry?assetId=xxx**
Retry failed analysis.

**Response:**
```json
{
  "message": "Analysis retry queued",
  "retryCount": 1
}
```

---

## 🎯 Next Steps

1. ✅ Replace AssetDetailModal with AssetDetailModalV2
2. ✅ Test upload → analysis → view workflow
3. ✅ Customize UI to match your brand
4. ✅ Add analysis badges to asset cards
5. ✅ Deploy Python worker to production
6. ✅ Monitor analysis success rates
7. ✅ Optimize for scale

**Questions?** Check `ANALYSIS_SETUP.md` or `QUICKSTART_ANALYSIS.md`!
