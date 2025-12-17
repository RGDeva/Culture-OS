# Environment Variables Setup for CDP x402 Integration

## Required Environment Variables

Add these to your `.env.local` file (NEVER commit this file):

```bash
# ============================================
# Coinbase CDP x402 Configuration
# ============================================

# CDP Project Configuration
CDP_PROJECT_ID="d6b9e5e8-5749-48f6-b4a5-a92e072df68d"
CDP_API_KEY_ID="892c5492-624e-41b2-ac62-57295066a2dd"
CDP_API_PRIVATE_KEY="jY1kndO0JwR++Bw+iPd7KxlDWyvQdtWVl3acf8uOcBYkzGYIDKR5n0hS9zCNq6QzExnuFr7yeQZjdvACjPot1w=="

# x402 Feature Configuration
X402_ENABLED="true"                          # Set to "false" to disable x402 (kill switch)
X402_NETWORK="base"                          # Network: "base" or "ethereum"
X402_CURRENCY="USDC"                         # Payment currency
X402_DEFAULT_PRICE_CENTS="500"               # Default price in cents ($5.00)
X402_RECEIVER_ADDRESS="__REPLACE_WITH_YOUR_WALLET__"  # Wallet to receive payments

# ============================================
# Storage Configuration (for Vault assets)
# ============================================

STORAGE_PROVIDER="s3"                        # "s3" or "r2" (Cloudflare R2)
STORAGE_BUCKET="__REPLACE__"                 # Your S3/R2 bucket name
STORAGE_REGION="us-east-1"                   # AWS region or "auto" for R2
STORAGE_ACCESS_KEY_ID="__REPLACE__"          # S3/R2 access key
STORAGE_SECRET_ACCESS_KEY="__REPLACE__"      # S3/R2 secret key
STORAGE_PUBLIC_BASE_URL="__REPLACE__"        # Public URL base (optional for streaming)

# ============================================
# Existing Configuration (keep these)
# ============================================

# Database
DATABASE_URL="file:./dev.db"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID="cmd4wfneb008ujs0lbqln5875"
PRIVY_APP_SECRET="41GyiTnQzzE2qSfLheHpyoXgrxXFi4EKtCw3tE6wBZr1z7eQNRta7DdwWyuw9jb6YwsZHErqbkgS46gHzbxn62Ay"

# Google Drive Integration
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
ENCRYPTION_KEY="your-32-char-secret-key-here!!"

# Email Configuration
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

## Security Notes

### ⚠️ CRITICAL: Never Commit Secrets

1. **CDP_API_PRIVATE_KEY** is base64-encoded. Keep it secret.
2. **STORAGE_SECRET_ACCESS_KEY** grants full access to your storage.
3. **PRIVY_APP_SECRET** and **GMAIL_APP_PASSWORD** are sensitive.

### Kill Switch

Set `X402_ENABLED="false"` to immediately disable all x402 payment flows in production without deploying new code.

### Key Rotation

If keys are compromised:
1. Generate new CDP API key in Coinbase Developer Platform
2. Update env vars in Vercel
3. Redeploy

## Vercel Deployment

Add these environment variables in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. For multiline keys (like CDP_API_PRIVATE_KEY), paste the full base64 string
4. Click "Save"

## Local Development

1. Copy this template to `.env.local`
2. Replace `__REPLACE__` placeholders with your actual values
3. Never commit `.env.local` to git
4. Restart dev server after changes: `npm run dev`
