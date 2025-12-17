# Coinbase x402 with Privy Authentication - Implementation Status

## ✅ Completed

### 1. Database Schema (COMPLETE)
- ✅ User model with Privy user ID as primary key
- ✅ VaultAsset updated with payment fields (isPaid, priceCents, currency, receiverAddress)
- ✅ Entitlement model with unique constraint on (privyUserId, assetId)
- ✅ X402Transaction model with dedup via (privyUserId, assetId, idempotencyKey)
- ✅ All migrations pushed to database

### 2. Storage Service (COMPLETE)
- ✅ S3/R2 signed URL generation (`/lib/storage/signedUrls.ts`)
- ✅ Support for local storage fallback
- ✅ Time-limited URLs (default 1 hour)
- ✅ Proper Content-Disposition and Content-Type headers

### 3. Environment Variables (COMPLETE)
- ✅ All required variables added to `.env.local`
- ✅ CDP credentials configured
- ✅ Receiver address set to: `0xf8998ef0dea767d7335907a75213F47A8f7152Df`
- ✅ Kill switch: `X402_ENABLED=true`
- ✅ Onramp stub: `ONRAMP_ENABLED=false`

## 🚧 Remaining Implementation

### Critical Path (Required for MVP)

**1. Privy Authentication Middleware**
- Create `/lib/auth/privyAuth.ts`
- Extract privyUserId from Privy session
- Verify user is authenticated
- Return 401 if not authenticated

**2. Download Endpoint with Entitlements**
- Update `/app/api/vault/assets/[id]/download/route.ts`
- Flow:
  1. Verify Privy authentication → get privyUserId
  2. Load asset, check project permissions
  3. If not isPaid → return signed URL
  4. Check Entitlement for (privyUserId, assetId)
  5. If entitlement exists → return signed URL
  6. If X402_ENABLED=false → return 403 or normal flow
  7. Return HTTP 402 with payment challenge
  8. On payment authorization → verify, create Entitlement + Transaction, return signed URL

**3. Unlock Status Endpoint**
- Create `/app/api/vault/assets/[id]/unlock-status/route.ts`
- Return: `{ isPaid, hasEntitlement, priceCents, currency }`

**4. Frontend Unlock Button**
- Update `/components/vault/UnlockButton.tsx`
- Check unlock status
- Show appropriate button (Download vs Unlock)
- Handle Privy wallet connection
- Trigger x402 payment flow
- Handle no-wallet case (connect wallet prompt)

**5. x402 Payment Verification**
- Update `/lib/cdp/x402Service.ts`
- Implement proper Coinbase x402 verification
- Verify transaction on-chain
- Return txRef for recording

### Files to Create/Update

```
CRITICAL:
- /lib/auth/privyAuth.ts (NEW)
- /app/api/vault/assets/[id]/download/route.ts (REPLACE)
- /app/api/vault/assets/[id]/unlock-status/route.ts (NEW)
- /lib/cdp/x402Service.ts (UPDATE for Privy)
- /components/vault/UnlockButton.tsx (REPLACE)

OPTIONAL:
- /app/api/onramp/route.ts (Phase 2 stub)
- /components/vault/OnrampModal.tsx (Phase 2 stub)
```

## 📋 Implementation Plan

### Phase 1: Core x402 Flow (PRIORITY)

**Step 1: Privy Auth Middleware**
```typescript
// /lib/auth/privyAuth.ts
import { NextRequest } from 'next/server'

export async function getPrivyUserId(req: NextRequest): Promise<string | null> {
  // Extract from Privy session cookie or header
  // Verify with Privy API if needed
  // Return privyUserId or null
}

export async function requireAuth(req: NextRequest): Promise<string> {
  const privyUserId = await getPrivyUserId(req)
  if (!privyUserId) {
    throw new Error('Authentication required')
  }
  return privyUserId
}
```

**Step 2: Download Endpoint**
```typescript
// /app/api/vault/assets/[id]/download/route.ts
import { requireAuth } from '@/lib/auth/privyAuth'
import { generateSignedDownloadUrl } from '@/lib/storage/signedUrls'
import { isX402Enabled, createPaymentChallenge, verifyPayment } from '@/lib/cdp/x402Service'

export async function GET(req, { params }) {
  // 1. Auth
  const privyUserId = await requireAuth(req)
  
  // 2. Load asset
  const asset = await prisma.vaultAsset.findUnique({ where: { id: params.id } })
  
  // 3. Check permissions (project membership)
  // TODO: Implement project ACL check
  
  // 4. Free asset path
  if (!asset.isPaid) {
    const signedUrl = await generateSignedDownloadUrl(
      asset.storageKey,
      asset.fileName,
      asset.mimeType
    )
    return NextResponse.json({ downloadUrl: signedUrl })
  }
  
  // 5. Check entitlement
  const entitlement = await prisma.entitlement.findUnique({
    where: {
      privyUserId_assetId: { privyUserId, assetId: asset.id }
    }
  })
  
  if (entitlement) {
    const signedUrl = await generateSignedDownloadUrl(
      asset.storageKey,
      asset.fileName,
      asset.mimeType
    )
    return NextResponse.json({ downloadUrl: signedUrl })
  }
  
  // 6. Kill switch check
  if (!isX402Enabled()) {
    return NextResponse.json({ error: 'Payment required but x402 disabled' }, { status: 403 })
  }
  
  // 7. Payment required
  const paymentAuth = req.headers.get('x-payment-authorization')
  
  if (!paymentAuth) {
    // Return 402 challenge
    const challenge = createPaymentChallenge(asset)
    return NextResponse.json(
      { error: 'Payment required', payment: challenge },
      { status: 402 }
    )
  }
  
  // 8. Verify payment
  const paymentData = JSON.parse(paymentAuth)
  const verification = await verifyPayment(paymentData, asset)
  
  if (!verification.verified) {
    return NextResponse.json({ error: verification.error }, { status: 402 })
  }
  
  // 9. Create entitlement + transaction
  await prisma.$transaction([
    prisma.entitlement.create({
      data: { privyUserId, assetId: asset.id }
    }),
    prisma.x402Transaction.create({
      data: {
        privyUserId,
        assetId: asset.id,
        amountCents: asset.priceCents,
        currency: asset.currency,
        receiverAddress: asset.receiverAddress,
        network: 'base',
        txRef: verification.txRef,
        idempotencyKey: paymentData.idempotencyKey,
        status: 'CONFIRMED'
      }
    })
  ])
  
  // 10. Return signed URL
  const signedUrl = await generateSignedDownloadUrl(
    asset.storageKey,
    asset.fileName,
    asset.mimeType
  )
  return NextResponse.json({ downloadUrl: signedUrl })
}
```

**Step 3: Unlock Status**
```typescript
// /app/api/vault/assets/[id]/unlock-status/route.ts
export async function GET(req, { params }) {
  const privyUserId = await getPrivyUserId(req) // Optional auth
  const asset = await prisma.vaultAsset.findUnique({ where: { id: params.id } })
  
  let hasEntitlement = false
  if (privyUserId) {
    const entitlement = await prisma.entitlement.findUnique({
      where: { privyUserId_assetId: { privyUserId, assetId: asset.id } }
    })
    hasEntitlement = !!entitlement
  }
  
  return NextResponse.json({
    isPaid: asset.isPaid,
    hasEntitlement,
    priceCents: asset.priceCents,
    currency: asset.currency
  })
}
```

**Step 4: Frontend Unlock Button**
```tsx
// /components/vault/UnlockButton.tsx
'use client'
import { usePrivy } from '@privy-io/react-auth'

export function UnlockButton({ assetId }) {
  const { authenticated, user, connectWallet } = usePrivy()
  const [status, setStatus] = useState(null)
  
  useEffect(() => {
    fetch(`/api/vault/assets/${assetId}/unlock-status`)
      .then(r => r.json())
      .then(setStatus)
  }, [assetId])
  
  if (!status) return <div>Loading...</div>
  
  // Free asset
  if (!status.isPaid) {
    return <button onClick={handleDownload}>Download</button>
  }
  
  // Has entitlement
  if (status.hasEntitlement) {
    return <button onClick={handleDownload}>Download</button>
  }
  
  // Needs payment
  if (!authenticated) {
    return <button onClick={() => login()}>Sign in to unlock</button>
  }
  
  // Check if wallet connected
  const hasWallet = user?.wallet?.address
  
  if (!hasWallet) {
    return (
      <button onClick={connectWallet}>
        Connect wallet to unlock with USDC
      </button>
    )
  }
  
  return (
    <button onClick={handleUnlock}>
      Unlock with {status.priceCents / 100} USDC
    </button>
  )
}

async function handleUnlock() {
  // 1. Initiate x402 payment flow
  // 2. User approves in wallet
  // 3. Get txRef
  // 4. Call download endpoint with payment auth
  // 5. Download file
}
```

### Phase 2: Onramp (Stub Only)

**Onramp Route (Stub)**
```typescript
// /app/api/onramp/route.ts
export async function POST(req) {
  if (process.env.ONRAMP_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Onramp not enabled' }, { status: 503 })
  }
  
  if (process.env.ONRAMP_PROVIDER !== 'coinbase') {
    return NextResponse.json({ error: 'Onramp provider not configured' }, { status: 503 })
  }
  
  // TODO: Implement Coinbase onramp integration
  return NextResponse.json({ error: 'Coming soon' }, { status: 501 })
}
```

## 🧪 Testing Instructions

### Prerequisites
```bash
# 1. Environment variables set in .env.local
# 2. Database migrated
npx prisma db push

# 3. Server running
npm run dev
```

### Test Flow

**1. Create Paid Asset**
```bash
npx prisma studio

# Create VaultAsset:
- isPaid: true
- priceCents: 500
- currency: "USDC"
- receiverAddress: "0xf8998ef0dea767d7335907a75213F47A8f7152Df"
- storageKey: "path/to/file.wav"
- fileName: "test.wav"
- mimeType: "audio/wav"
```

**2. Test Unauthenticated**
```bash
curl http://localhost:3000/api/vault/assets/asset-id/download
# Expected: 401 Unauthorized
```

**3. Test Authenticated, No Entitlement**
```bash
curl http://localhost:3000/api/vault/assets/asset-id/download \
  -H "Cookie: privy-session=..."
# Expected: 402 Payment Required with challenge
```

**4. Test Payment Flow**
```bash
# Frontend: Click "Unlock with USDC"
# Privy wallet opens
# User approves USDC payment
# Frontend retries download with payment auth
# Expected: Download URL returned
```

**5. Test Entitlement Persistence**
```bash
curl http://localhost:3000/api/vault/assets/asset-id/download \
  -H "Cookie: privy-session=..."
# Expected: Download URL (no payment required)
```

**6. Test Different User**
```bash
# Login as different Privy user
# Try to download same asset
# Expected: 402 Payment Required (new payment needed)
```

**7. Test Kill Switch**
```bash
# Set X402_ENABLED=false in .env.local
# Restart server
# Try to download paid asset
# Expected: 403 or normal flow (no 402)
```

## 📁 Files Summary

### Created
- `/lib/storage/signedUrls.ts` - S3/R2 signed URL generation ✅
- `/X402_PRIVY_IMPLEMENTATION.md` - This file ✅

### To Create
- `/lib/auth/privyAuth.ts` - Privy authentication middleware
- `/app/api/vault/assets/[id]/unlock-status/route.ts` - Status endpoint
- `/app/api/onramp/route.ts` - Onramp stub (Phase 2)

### To Update
- `/app/api/vault/assets/[id]/download/route.ts` - Replace with Privy flow
- `/lib/cdp/x402Service.ts` - Update for Privy + proper verification
- `/components/vault/UnlockButton.tsx` - Replace with Privy wallet flow
- `/components/landing/LandingPage.tsx` - Already updated ✅

### Database
- `/prisma/schema.prisma` - Updated with Entitlement + new X402Transaction ✅

## 🔒 Security Checklist

- ✅ No private keys in code
- ✅ No secrets in client code
- ✅ Entitlements tied to privyUserId (not wallet)
- ✅ Dedup constraint on transactions
- ✅ Kill switch implemented
- ✅ Signed URLs with expiration
- ⏳ Privy session verification (TODO)
- ⏳ Project permission checks (TODO)
- ⏳ On-chain payment verification (TODO)

## 🚀 Next Steps

1. **Implement Privy Auth Middleware** - Extract privyUserId from session
2. **Update Download Endpoint** - Full flow with entitlements
3. **Create Unlock Status Endpoint** - For frontend state
4. **Update x402 Service** - Proper Coinbase verification
5. **Update Unlock Button** - Privy wallet integration
6. **Test End-to-End** - Full payment flow
7. **Deploy to Production** - Vercel with env vars

## 📝 Notes

- User.id is Privy user ID (confirmed in schema)
- Entitlements are permanent (no expiration)
- Transactions have dedup via (privyUserId, assetId, idempotencyKey)
- Signed URLs expire after 1 hour (configurable)
- Kill switch disables all x402 flows instantly
- Onramp is Phase 2 (stub only for now)

---

**Status: Database + Storage Complete | Auth + Endpoints In Progress**

The foundation is solid. Need to implement Privy authentication middleware and update the download endpoint to complete the MVP.
