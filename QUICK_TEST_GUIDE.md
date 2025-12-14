# 🚀 Quick Test Guide - 5 Minutes

## Test Everything in 5 Minutes

### **1. Marketplace (1 min)**
```
Visit: http://localhost:3000/marketplace

✓ Search: "beat"
✓ Filter TYPE: BEAT
✓ Sort: PRICE_LOW → HIGH
✓ See enhanced cards with tags, BPM, ratings
✓ Click UNLOCK (should work with existing x402)
```

### **2. Vault → Bounty Creation (2 min)**
```
Visit: http://localhost:3000/vault/new

✓ Title: "Test Track"
✓ Tags: trap, dark
✓ Click ADD_ROLE:
   - Title: "Mixing Engineer"
   - Type: ENGINEER
   - Compensation: Flat Fee
   - Min: $150, Max: $250
✓ Submit
✓ Check console: "Created bounty for role: Mixing Engineer"
```

### **3. Network - Bounties (2 min)**
```
Visit: http://localhost:3000/network?tab=bounties

✓ See 6 bounties (5 mock + 1 you just created)
✓ Filter ROLE: ENGINEER
✓ Should see your "Mixing Engineer" bounty
✓ Click VIEW_DETAILS
✓ See full modal with budget $150-$250
```

## API Quick Test

```bash
# Products
curl "http://localhost:3000/api/products?type=BEAT&sort=popular"

# Bounties
curl "http://localhost:3000/api/bounties?role=ENGINEER&status=OPEN"
```

## What to Look For

### **Marketplace:**
- ✅ Filters update results instantly
- ✅ Cards show: tags, BPM, delivery, ratings
- ✅ zkp2p button (if enabled)
- ✅ Hover effects work

### **Vault:**
- ✅ Enhanced role form with budgets
- ✅ Console logs bounty creation
- ✅ No errors on submit

### **Network:**
- ✅ Two tabs: PEOPLE and BOUNTIES
- ✅ Bounties from vault appear
- ✅ Filters work
- ✅ Modal shows full details

## Success = All ✅ Green!

If everything above works, the implementation is 100% complete and functional.
