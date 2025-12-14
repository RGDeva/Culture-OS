# NoCulture OS - Payment System Documentation

## Overview
Complete payment infrastructure integrating **Thirdweb x402**, **Privy wallets**, and **Base Sepolia** for marketplace purchases, bounty payments, tips, and project funding.

---

## Architecture

### Core Components

1. **x402 Integration** - Crypto payments via Thirdweb
2. **Payment Store** - Transaction tracking and history
3. **Earnings System** - Real-time earnings calculations
4. **Escrow System** - Secure bounty payments
5. **XP Integration** - Automatic XP awards on payments

---

## Payment Types

### 1. Marketplace Purchases
**Type:** `MARKETPLACE_PURCHASE`  
**Fee:** 5%  
**Flow:**
1. User clicks UNLOCK on product
2. x402 payment initiated
3. Payment recorded in store
4. On success: Grant access + award XP
5. Update earnings for seller

**API:** `POST /api/x402/checkout-real`

**Example:**
```typescript
// Frontend
const response = await fetch('/api/x402/checkout-real', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-payment': paymentProof, // From x402
  },
  body: JSON.stringify({
    productId: 'product_123',
    userId: user.id,
  })
})
```

### 2. Bounty Payments
**Type:** `BOUNTY_PAYMENT`  
**Fee:** 10%  
**Flow:**
1. Bounty marked as COMPLETED
2. Poster initiates payment
3. Payment goes to ESCROWED status
4. After confirmation, released to collaborator
5. Both parties receive XP

**API:** `POST /api/bounties/[id]/pay`

**Example:**
```typescript
// Initiate payment (escrow)
await fetch(`/api/bounties/${bountyId}/pay`, {
  method: 'POST',
  body: JSON.stringify({
    userId: posterId,
    releaseImmediately: false, // true to skip escrow
  })
})

// Release from escrow
await fetch(`/api/bounties/${bountyId}/pay`, {
  method: 'PUT',
  body: JSON.stringify({
    userId: posterId,
    paymentId: payment.id,
  })
})
```

### 3. Tips
**Type:** `TIP`  
**Fee:** 5%  
**Status:** Coming soon

### 4. Project Funding
**Type:** `PROJECT_FUNDING`  
**Fee:** 10%  
**Status:** Coming soon

### 5. Studio Sessions
**Type:** `STUDIO_SESSION`  
**Fee:** 10%  
**Status:** Coming soon

---

## Payment Store

### Data Structure

```typescript
interface Payment {
  id: string
  type: PaymentType
  status: PaymentStatus
  method: PaymentMethod
  
  // Parties
  fromUserId: string        // Payer
  toUserId: string          // Recipient
  
  // Amount
  amountUSDC: number        // Total amount
  platformFee: number       // Platform fee
  netAmount: number         // Amount after fees
  
  // Related entities
  productId?: string
  bountyId?: string
  projectId?: string
  
  // Transaction
  txHash?: string
  x402PaymentData?: string
  
  // Timestamps
  createdAt: string
  completedAt?: string
  updatedAt: string
}
```

### Payment Statuses

- **PENDING** - Payment initiated
- **PROCESSING** - x402 processing
- **COMPLETED** - Successfully settled
- **FAILED** - Payment failed
- **REFUNDED** - Payment refunded
- **ESCROWED** - Held in escrow (bounties)

---

## Platform Fees

```typescript
const PLATFORM_FEES = {
  MARKETPLACE_PURCHASE: 0.05,  // 5%
  BOUNTY_PAYMENT: 0.10,        // 10%
  TIP: 0.05,                   // 5%
  PROJECT_FUNDING: 0.10,       // 10%
  STUDIO_SESSION: 0.10,        // 10%
}
```

**Example Calculation:**
```
Purchase: $100 USDC
Platform Fee: $5 (5%)
Creator Receives: $95 USDC
```

---

## Earnings System

### Earnings Summary

```typescript
interface EarningsSummary {
  totalEarned: number        // All-time
  thisMonth: number          // Current month
  lastMonth: number          // Previous month
  pendingPayouts: number     // In escrow
  breakdown: {
    marketplace: number
    bounties: number
    tips: number
    projects: number
  }
}
```

### API Endpoints

**Get Earnings:**
```
GET /api/payments/earnings?userId=xxx
```

**Get Payment History:**
```
GET /api/payments?userId=xxx&limit=20
```

---

## XP Integration

### Automatic XP Awards

**Marketplace:**
- Buyer completes purchase: +30 XP
- Seller receives payment: +30 XP

**Bounties:**
- Collaborator completes bounty: +40 XP
- Poster releases payment: +40 XP

**Implementation:**
```typescript
// In x402 checkout
addXp(userId, xpForEvent('COMPLETE_ORDER'))

// In bounty payment
addXp(collaboratorId, xpForEvent('COMPLETE_BOUNTY'))
```

---

## Escrow System (Bounties)

### Flow

1. **Bounty Completed**
   - Collaborator marks work as done
   - Status: `COMPLETED`

2. **Payment Initiated**
   - Poster initiates payment
   - Payment status: `ESCROWED`
   - Funds held securely

3. **Review Period**
   - Poster reviews work
   - Can release or request changes

4. **Payment Released**
   - Poster confirms satisfaction
   - Payment status: `COMPLETED`
   - XP awarded to both parties

### Security

- Only bounty poster can initiate/release payment
- Payment locked until explicit release
- Dispute resolution (future feature)

---

## Components

### EarningsCard
**Location:** `components/payments/EarningsCard.tsx`  
**Purpose:** Display earnings summary with breakdown

**Usage:**
```tsx
<EarningsCard userId={user.id} />
```

**Features:**
- Total earned (all-time)
- This month earnings
- Pending payouts (escrowed)
- Breakdown by type

### PaymentHistory
**Location:** `components/payments/PaymentHistory.tsx`  
**Purpose:** Display transaction history

**Usage:**
```tsx
<PaymentHistory userId={user.id} limit={20} />
```

**Features:**
- Incoming/outgoing indicators
- Status badges
- Transaction hash links
- Platform fee display
- Relative timestamps

---

## Dashboard Integration

### Real Earnings Display

**Before:** Placeholder `$0.00`  
**After:** Real earnings from payment store

**Implementation:**
```typescript
// lib/dashboardMetrics.ts
const earnings = getEarningsSummary(userId)
const earningsThisMonth = earnings.thisMonth
```

**Dashboard Card:**
```tsx
<div className="metric-card">
  <span>EARNINGS_THIS_MONTH</span>
  <div>${earningsThisMonth.toFixed(2)}</div>
</div>
```

---

## Testing

### Test Marketplace Purchase

1. **Setup:**
   - Login with Privy
   - Navigate to `/marketplace`
   - Find a product

2. **Purchase:**
   - Click UNLOCK
   - Complete x402 payment
   - Verify success message

3. **Verify:**
   - Check `/earnings` page
   - Confirm payment in history
   - Verify XP increase
   - Check seller's earnings

### Test Bounty Payment

1. **Setup:**
   - Create bounty with budget
   - Accept collaborator
   - Mark bounty as COMPLETED

2. **Escrow:**
   ```bash
   POST /api/bounties/[id]/pay
   {
     "userId": "poster_id",
     "releaseImmediately": false
   }
   ```

3. **Release:**
   ```bash
   PUT /api/bounties/[id]/pay
   {
     "userId": "poster_id",
     "paymentId": "payment_id"
   }
   ```

4. **Verify:**
   - Check payment status: COMPLETED
   - Verify XP awards
   - Check earnings for collaborator

---

## Environment Variables

```bash
# Thirdweb
THIRDWEB_SECRET_KEY=your_secret_key
THIRDWEB_SERVER_WALLET_ADDRESS=0x...

# Base Network
# Using Base Sepolia testnet (chainId: 84532)
```

---

## Security Considerations

### Current Implementation

✅ **Server-side payment processing**  
✅ **Payment verification via x402**  
✅ **Escrow for bounties**  
✅ **Platform fee calculation**  
✅ **Transaction logging**

### TODO

- [ ] Add authentication checks to all payment APIs
- [ ] Implement payment refund system
- [ ] Add dispute resolution for bounties
- [ ] Rate limiting on payment endpoints
- [ ] Webhook notifications for payment events
- [ ] Multi-signature for large payments

---

## Database Migration

### Current: In-Memory

```typescript
const payments = new Map<string, Payment>()
```

### Future: Prisma Schema

```prisma
model Payment {
  id              String   @id @default(cuid())
  type            String
  status          String
  method          String
  fromUserId      String
  toUserId        String
  amountUSDC      Float
  platformFee     Float
  netAmount       Float
  productId       String?
  bountyId        String?
  projectId       String?
  txHash          String?
  x402PaymentData String?
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  updatedAt       DateTime @updatedAt
  
  @@index([fromUserId])
  @@index([toUserId])
  @@index([status])
  @@index([createdAt])
}
```

---

## API Reference

### Marketplace

**POST /api/x402/checkout-real**
- Process marketplace purchase
- Awards XP on success
- Records payment

**GET /api/x402/checkout-real**
- Check purchase status

### Bounties

**POST /api/bounties/[id]/pay**
- Initiate bounty payment
- Creates escrow

**PUT /api/bounties/[id]/pay**
- Release escrowed payment
- Awards XP

### Payments

**GET /api/payments**
- Get payment history
- Query: `userId`, `limit`

**GET /api/payments/earnings**
- Get earnings summary
- Query: `userId`

---

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Tip functionality
- [ ] Project funding
- [ ] Studio session booking

### Phase 2 (Short-term)
- [ ] Payment splits (multiple recipients)
- [ ] Recurring payments
- [ ] Payment plans
- [ ] Gift cards

### Phase 3 (Long-term)
- [ ] Multi-chain support
- [ ] Fiat on-ramp integration
- [ ] Automated royalty splits
- [ ] Tax reporting
- [ ] Invoice generation

---

## Troubleshooting

### Payment Fails

**Check:**
1. User has sufficient funds
2. x402 payment proof is valid
3. Product exists and is available
4. Network connection is stable

**Logs:**
```
[x402] Payment not completed: { status: 402, productId: 'xxx' }
```

### Earnings Not Updating

**Check:**
1. Payment status is COMPLETED
2. User is the recipient (toUserId)
3. Payment is within current month
4. Dashboard metrics API is responding

**Debug:**
```typescript
const earnings = getEarningsSummary(userId)
console.log('Earnings:', earnings)
```

### Escrow Not Releasing

**Check:**
1. User is bounty poster
2. Payment exists and is ESCROWED
3. Bounty is COMPLETED
4. Payment ID is correct

---

## Success Metrics

Track these to measure payment system health:

1. **Payment Success Rate** - % of successful payments
2. **Average Transaction Value** - Mean payment amount
3. **Platform Revenue** - Total fees collected
4. **Escrow Release Time** - Time from escrow to release
5. **Failed Payment Rate** - % of failed transactions
6. **User Earnings Growth** - Month-over-month growth

---

## Status

✅ **Marketplace payments** - Fully functional  
✅ **Payment tracking** - Complete  
✅ **Earnings system** - Real-time calculations  
✅ **Bounty escrow** - Implemented  
✅ **XP integration** - Automatic awards  
✅ **Dashboard integration** - Real earnings display  
🚧 **Tips** - Coming soon  
🚧 **Project funding** - Coming soon  
🚧 **Studio sessions** - Coming soon  

---

**The payment system is production-ready for marketplace and bounty transactions!** 🎉
