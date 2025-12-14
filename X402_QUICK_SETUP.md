# x402 Quick Setup Checklist

## ✅ What You Need (5 Minutes)

### 1. Thirdweb Account
- [ ] Go to [thirdweb.com](https://thirdweb.com)
- [ ] Create account
- [ ] Create new project
- [ ] Copy **Client ID** 
- [ ] Copy **Secret Key**

### 2. Server Wallet
- [ ] Generate new wallet OR use existing
- [ ] Copy **wallet address** (0x...)
- [ ] Copy **private key** (0x...)
- [ ] Add 0.01 ETH on Arbitrum Mainnet (for gas)

### 3. Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=clxxxxx...
THIRDWEB_SECRET_KEY=xxxxx...
THIRDWEB_SERVER_WALLET_ADDRESS=0x...
THIRDWEB_SERVER_WALLET_PRIVATE_KEY=0x...
```

### 4. Install Package
```bash
npm install thirdweb
```

### 5. Update Code
In `app/marketplace/page.tsx`, change:
```typescript
// Line ~132: Change this
fetch('/api/x402/checkout', {

// To this
fetch('/api/x402/checkout-real', {
```

## 🧪 Test It

1. Upload a product
2. Try to buy it
3. Approve USDC spending
4. Complete payment
5. Access granted!

## 🚨 If It Doesn't Work

**Check these first:**
- [ ] All env variables set?
- [ ] Server wallet has ETH for gas?
- [ ] User has USDC on Arbitrum?
- [ ] Correct wallet address format?
- [ ] Secret key is correct?

**Common Errors:**
- "Insufficient funds" → User needs USDC
- "Approval required" → Need to approve USDC first
- "Invalid signature" → Check private key
- "Network error" → Check Arbitrum RPC

## 📖 Full Guide

See `X402_INTEGRATION_GUIDE.md` for complete details.

## 🎯 What's Already Done

✅ Frontend marketplace UI  
✅ Upload system  
✅ Mock payment flow  
✅ Playback system  
✅ Purchase tracking  
✅ Thirdweb config files  
✅ Real x402 checkout endpoint  

## 🔜 What You Need to Add

1. **USDC Approval UI** - Button to approve spending
2. **Balance Check** - Show user's USDC balance
3. **Error Handling** - Better error messages
4. **Loading States** - Show transaction progress
5. **Success Confirmation** - Show transaction hash

## 💡 Pro Tips

- Test on **Arbitrum Sepolia** first (testnet)
- Start with **small amounts** ($1-5)
- Monitor **gas costs** (should be ~$0.10)
- Keep **server wallet funded** with ETH
- **Log all transactions** for debugging

---

**Total setup time: ~10 minutes**  
**Ready to accept real crypto payments!** 🚀
