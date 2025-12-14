# zkp2p On-Ramp Integration

## Overview

NoCulture OS now supports fiat-to-USDC on-ramp via zkp2p v3 API. Users can add funds to their creative wallet (USDC on Base) using bank transfers, Venmo, or Zelle.

## Required Environment Variables

Add these to your `.env.local`:

```bash
# zkp2p On-Ramp Configuration
ZKP2P_API_KEY=your_zkp2p_api_key_here
ZKP2P_ONRAMP_ENV=sandbox  # or "production"
ZKP2P_BASE_CHAIN_ID=84532  # Base Sepolia (84532) or Base Mainnet (8453)

# Privy (already configured - do not modify)
NEXT_PUBLIC_PRIVY_APP_ID=...
PRIVY_APP_SECRET=...
```

## Architecture

### Server-Side Components

1. **`lib/zkp2p.ts`** - zkp2p API client
   - `createOnrampSession()` - Initiate new on-ramp
   - `getOnrampSessionStatus()` - Poll session status
   - Handles authentication, error handling, and response mapping

2. **`app/api/zkp2p/onramp/route.ts`** - Create session endpoint
   - POST `/api/zkp2p/onramp`
   - Requires Privy authentication
   - Validates amount ($1-$5000)
   - Returns payment instructions

3. **`app/api/zkp2p/onramp/[sessionId]/route.ts`** - Status polling endpoint
   - GET `/api/zkp2p/onramp/{sessionId}`
   - Returns current session status
   - No authentication required (session ID acts as token)

### Client-Side Components

1. **`components/dashboard/AddFundsPanel.tsx`** - Main UI component
   - Amount input with quick-select buttons
   - Optional memo field
   - Payment instructions display
   - Auto-polling for status updates
   - Terminal-style UI matching NoCulture aesthetic

2. **`app/page.tsx`** - Integration point
   - AddFundsPanel shown after login
   - Positioned between Dashboard Snapshot and Profile Intel

## User Flow

1. **User logs in** via Privy (email/wallet)
2. **Clicks "START_ONRAMP"** in Add Funds panel
3. **Enters amount** ($1-$5000) and optional memo
4. **Session created** - API calls zkp2p to create on-ramp session
5. **Payment instructions shown**:
   - Payment method (bank/venmo/zelle)
   - Recipient ID
   - Amount
   - Memo/reference
   - Optional redirect URL
6. **User completes payment** off-platform
7. **Status auto-polls** every 12 seconds
8. **Completion notification** when USDC arrives in wallet

## Status Flow

```
PENDING → COMPLETED (success)
        → FAILED (payment failed)
        → EXPIRED (session timeout)
```

## Security

- ✅ API key never exposed to client
- ✅ All zkp2p calls server-side only
- ✅ Privy authentication required for session creation
- ✅ Amount validation on server
- ✅ Generic error messages to client
- ✅ Detailed error logging server-side

## Future Enhancements

TODOs marked in code for:
- [ ] Database persistence of sessions
- [ ] XP rewards on successful on-ramp
- [ ] In-app notifications
- [ ] Transaction history
- [ ] User balance tracking

## Testing

### Sandbox Mode
Set `ZKP2P_ONRAMP_ENV=sandbox` to test without real money.

### Production Mode
Set `ZKP2P_ONRAMP_ENV=production` for live transactions.

## API Reference

### Create Session
```typescript
POST /api/zkp2p/onramp
Headers: { Authorization: "Bearer {privy_token}" }
Body: { amountUsd: number, memo?: string }
Response: {
  success: true,
  session: {
    id: string,
    status: "PENDING",
    amountUsd: number,
    paymentInstructions: {
      method: string,
      recipientId: string,
      amount: string,
      memo?: string,
      redirectUrl?: string
    }
  }
}
```

### Poll Status
```typescript
GET /api/zkp2p/onramp/{sessionId}
Response: {
  success: true,
  sessionId: string,
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED",
  txHash?: string,
  amountReceivedUsdc?: string,
  updatedAt: string
}
```

## Troubleshooting

### "ZKP2P_API_KEY not configured"
- Ensure `ZKP2P_API_KEY` is set in `.env.local`
- Restart dev server after adding env vars

### "No wallet address found"
- User must complete Privy login
- Privy creates smart wallet automatically

### Session stuck in PENDING
- Check zkp2p dashboard for session status
- Verify payment was completed correctly
- Check memo/reference matches exactly

## Support

For zkp2p API issues, see: https://docs.zkp2p.xyz/developer/developer/api/v3/onramp
