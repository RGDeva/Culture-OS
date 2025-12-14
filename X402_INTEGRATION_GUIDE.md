# x402 Integration Guide for NoCulture Marketplace

Based on the [x402-music example](https://github.com/thirdweb-example/x402-music), here's everything you need to make x402 payments fully functional.

## 📋 Prerequisites

### 1. Thirdweb Account Setup
1. Go to [thirdweb.com](https://thirdweb.com) and sign up
2. Create a new project in the dashboard
3. Get your **Client ID** (for frontend)
4. Get your **Secret Key** (for backend)

### 2. Server Wallet Setup
You need a wallet that will receive payments:

**Option A: Generate New Wallet**
```bash
# Using thirdweb CLI
npx thirdweb generate

# Or use any wallet generator
# Save the private key securely!
```

**Option B: Use Existing Wallet**
- Use MetaMask or any wallet
- Export the private key (keep it secret!)
- Get the wallet address

### 3. Fund Server Wallet
- Add some ETH to your server wallet on **Arbitrum Mainnet**
- Needed for gas fees when processing payments
- ~0.01 ETH should be enough to start

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
npm install thirdweb @thirdweb-dev/sdk
```

### Step 2: Environment Variables

Create/update `.env.local`:

```env
# Thirdweb Frontend (Public)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Thirdweb Backend (Secret - DO NOT COMMIT)
THIRDWEB_SECRET_KEY=your_secret_key_here
THIRDWEB_SERVER_WALLET_ADDRESS=0x...your_server_wallet_address
THIRDWEB_SERVER_WALLET_PRIVATE_KEY=0x...your_private_key

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=42161  # Arbitrum Mainnet
NEXT_PUBLIC_USDC_ADDRESS=0xaf88d065e77c8cC2239327C5EDb3A432268e5831

# Existing Privy Config (keep these)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_secret
```

### Step 3: Update .gitignore

Make sure your `.gitignore` includes:
```
.env.local
.env
*.key
```

## 🏗️ Architecture Overview

### How x402 Works in This System

1. **User browses marketplace** → Sees products with prices in USDC
2. **User clicks UNLOCK** → Privy authenticates user
3. **Frontend requests approval** → User approves USDC spending
4. **Frontend calls checkout API** → Sends payment request
5. **Backend processes payment** → Transfers USDC from user to server wallet
6. **Backend records purchase** → Grants access to content
7. **User gets access** → Can play/download purchased content

### Payment Flow Diagram

```
User Wallet (USDC) 
    ↓ (approve spending)
    ↓ (transferFrom)
Server Wallet (receives USDC)
    ↓ (records purchase)
Database (grants access)
    ↓
User (plays content)
```

## 💻 Code Implementation

### Files Already Created

✅ `lib/thirdweb-client.ts` - Frontend Thirdweb config
✅ `lib/thirdweb-server.ts` - Backend Thirdweb config  
✅ `app/api/x402/checkout-real/route.ts` - Real x402 payment endpoint

### What You Need to Do

#### 1. Update Marketplace Page to Use Real Checkout

In `app/marketplace/page.tsx`, change the checkout call:

```typescript
// BEFORE (mock):
const response = await fetch('/api/x402/checkout', {

// AFTER (real x402):
const response = await fetch('/api/x402/checkout-real', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    productId,
    userId: user.id || user.email || 'anonymous',
    userWalletAddress: user.wallet?.address // Get from Privy
  }),
})
```

#### 2. Add USDC Approval Step

Before checkout, user needs to approve USDC spending:

```typescript
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb'
import { thirdwebClient, USDC_ADDRESS, CHAIN_ID } from '@/lib/thirdweb-client'

async function approveUSDC(amount: number, userWallet: any) {
  const usdcContract = getContract({
    client: thirdwebClient,
    chain: { id: CHAIN_ID },
    address: USDC_ADDRESS,
  })

  const transaction = prepareContractCall({
    contract: usdcContract,
    method: "approve",
    params: [
      process.env.NEXT_PUBLIC_SERVER_WALLET_ADDRESS,
      BigInt(amount * 1_000_000) // USDC has 6 decimals
    ],
  })

  await sendTransaction({
    transaction,
    account: userWallet,
  })
}
```

#### 3. Update ProductCard Component

Add approval step before unlock:

```typescript
const handleUnlock = async (productId: string) => {
  try {
    // Step 1: Approve USDC spending
    setStatus('Approving USDC...')
    await approveUSDC(product.priceUSDC, userWallet)
    
    // Step 2: Process payment
    setStatus('Processing payment...')
    await onUnlock(productId)
    
    setStatus('Success!')
  } catch (error) {
    console.error('Unlock failed:', error)
    setError(error.message)
  }
}
```

## 🧪 Testing the Integration

### Test on Arbitrum Sepolia (Testnet) First

1. **Change network to testnet**:
```env
NEXT_PUBLIC_CHAIN_ID=421614  # Arbitrum Sepolia
NEXT_PUBLIC_USDC_ADDRESS=0x...  # Testnet USDC address
```

2. **Get testnet tokens**:
- Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)
- Bridge to Arbitrum Sepolia
- Get testnet USDC

3. **Test the flow**:
- Upload a product
- Try to purchase it
- Check if USDC transfers
- Verify access is granted

### Test on Mainnet (Production)

1. **Switch to mainnet**:
```env
NEXT_PUBLIC_CHAIN_ID=42161  # Arbitrum Mainnet
NEXT_PUBLIC_USDC_ADDRESS=0xaf88d065e77c8cC2239327C5EDb3A432268e5831
```

2. **Use real USDC**:
- Make sure users have USDC on Arbitrum
- Start with small amounts for testing

## 🔒 Security Considerations

### Critical Security Rules

1. **NEVER commit private keys** to git
2. **Store secrets in environment variables** only
3. **Validate all inputs** on the backend
4. **Check transaction success** before granting access
5. **Use HTTPS** in production
6. **Rate limit** API endpoints
7. **Log all transactions** for audit trail

### Recommended Security Measures

```typescript
// Add rate limiting
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
})

// Add transaction verification
async function verifyTransaction(txHash: string) {
  // Check transaction on blockchain
  // Verify it's confirmed
  // Verify correct amount
  // Verify correct recipient
}
```

## 📊 Monitoring & Analytics

### Track These Metrics

1. **Successful payments** - Count and total volume
2. **Failed payments** - Reasons and frequency
3. **Gas costs** - Monitor and optimize
4. **User balances** - Warn if insufficient USDC
5. **Transaction times** - Optimize if slow

### Add Logging

```typescript
// In checkout endpoint
console.log({
  event: 'payment_initiated',
  productId,
  userId,
  amount: product.priceUSDC,
  timestamp: new Date().toISOString()
})

console.log({
  event: 'payment_success',
  transactionHash: result.transactionHash,
  timestamp: new Date().toISOString()
})
```

## 🐛 Troubleshooting

### Common Issues

#### "Insufficient funds"
- User doesn't have enough USDC
- Solution: Add "Buy USDC" widget

#### "Approval required"
- User hasn't approved USDC spending
- Solution: Add approval step before checkout

#### "Transaction failed"
- Network congestion or gas issues
- Solution: Retry with higher gas limit

#### "Invalid signature"
- Wrong private key or wallet mismatch
- Solution: Verify environment variables

### Debug Mode

Add this to see detailed logs:

```typescript
// In .env.local
DEBUG=thirdweb:*
NODE_ENV=development
```

## 🚀 Going to Production

### Pre-Launch Checklist

- [ ] Test on testnet thoroughly
- [ ] Verify all environment variables
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Add transaction logging
- [ ] Set up backup server wallet
- [ ] Test with real money (small amounts)
- [ ] Add user balance checks
- [ ] Implement retry logic
- [ ] Add customer support contact
- [ ] Create refund process

### Production Environment Variables

```env
NODE_ENV=production
NEXT_PUBLIC_CHAIN_ID=42161
NEXT_PUBLIC_USDC_ADDRESS=0xaf88d065e77c8cC2239327C5EDb3A432268e5831
# ... other production values
```

## 📚 Additional Resources

- [Thirdweb Docs](https://portal.thirdweb.com/)
- [x402 Music Example](https://github.com/thirdweb-example/x402-music)
- [Arbitrum Docs](https://docs.arbitrum.io/)
- [USDC on Arbitrum](https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831)

## 🆘 Need Help?

1. Check Thirdweb Discord
2. Review x402-music example code
3. Check transaction on Arbiscan
4. Review logs in console
5. Test with smaller amounts first

---

## Quick Start Summary

1. **Get Thirdweb credentials** → thirdweb.com
2. **Create server wallet** → Save private key
3. **Add environment variables** → .env.local
4. **Install dependencies** → npm install thirdweb
5. **Update checkout endpoint** → Use /api/x402/checkout-real
6. **Add approval step** → Before payment
7. **Test on testnet** → Arbitrum Sepolia
8. **Deploy to production** → Arbitrum Mainnet

**Your marketplace is ready for real crypto payments!** 🎉
