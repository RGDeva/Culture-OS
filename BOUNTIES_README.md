# Bounties System - Implementation Guide

## Overview
The Bounties system allows creators to incentivize fans to promote their music through two bounty types:
1. **VIEW_BOUNTY** - Pay fans based on social media views (Clip.Energy style)
2. **CONVERSION_BOUNTY** - Pay commission when fans drive sales (affiliate model)

## Database Schema

### New Tables (Prisma)
- `BountyCampaign` - Main campaign entity
- `BountyAssetLink` - Links campaigns to vault assets or marketplace listings
- `BountyParticipant` - Tracks user participation in campaigns
- `BountySubmission` - Social media post submissions for VIEW bounties
- `BountyEarning` - Tracks earnings for participants

## API Routes

### Campaigns
- `GET /api/bounties/campaigns` - List campaigns (filter by creatorId, status, type)
- `POST /api/bounties/campaigns` - Create new campaign
- `GET /api/bounties/campaigns/[id]` - Get campaign details
- `PATCH /api/bounties/campaigns/[id]` - Update campaign (creator only)
- `DELETE /api/bounties/campaigns/[id]` - Delete campaign (creator only, DRAFT only)

### Participation
- `POST /api/bounties/campaigns/[id]/join` - Join a campaign
- `POST /api/bounties/campaigns/[id]/submit` - Submit social proof (VIEW bounties)
- `GET /api/bounties/me` - Get user's participations and earnings

### Metrics & Admin
- `GET /api/bounties/campaigns/[id]/metrics` - Campaign performance metrics (creator only)
- `POST /api/bounties/tasks/poll` - Cron endpoint to update submission metrics

## UI Components

### Pages
- `/app/bounties/page.tsx` - Main bounties page with Explore/My Campaigns tabs

### Components
- `/components/bounties/CampaignCard.tsx` - Campaign display card
- `/components/bounties/CreateCampaignWizard.tsx` - 4-step campaign creation wizard
- `/components/bounties/SubmitProofModal.tsx` - Submit social media proof

## How to Run Locally

### 1. Generate Prisma Client
```bash
cd /Users/rishig/Downloads/culture-os-deploy
npx prisma generate
npx prisma migrate dev --name add_bounties_system
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Bounties
Navigate to: http://localhost:3000/bounties

## Campaign Creation Flow

### Step 1: Select Type
- Choose between VIEW or CONVERSION bounty

### Step 2: Attach Target (Optional)
- Link to a vault asset (beat, track, etc.)
- Link to a marketplace listing (for CONVERSION bounties)

### Step 3: Budget & Payout Rules
**VIEW Bounties:**
- Define view milestones (e.g., 1k views = $5, 10k views = $20)
- Add multiple tiers
- System tracks views automatically

**CONVERSION Bounties:**
- Set commission (percentage or fixed amount)
- System generates unique referral links for each participant

### Step 4: Campaign Details
- Title and description
- Total budget
- Campaign is created as DRAFT (activate manually)

## Participant Flow

### For VIEW Bounties:
1. Browse active campaigns in Explore tab
2. Click "JOIN_BOUNTY"
3. Receive unique participant ID
4. Create social media post promoting the music
5. Submit post URL via "SUBMIT" button
6. System tracks views automatically
7. Earn rewards when hitting view milestones

### For CONVERSION Bounties:
1. Browse active campaigns in Explore tab
2. Click "JOIN_BOUNTY"
3. Receive unique referral link
4. Share referral link on social media or with network
5. Earn commission when someone purchases via your link

## Metrics Tracking

### VIEW Bounties
- Submission count
- Total views across all submissions
- Earnings per milestone
- Pending vs paid earnings

### CONVERSION Bounties
- Referral link clicks (future)
- Conversion count
- Revenue generated
- Commission earned

## Future Enhancements

### Metrics Polling
The `/api/bounties/tasks/poll` endpoint is a placeholder for automatic metrics tracking. To implement:

1. **Set up cron job** (Vercel Cron or external service)
2. **Integrate platform APIs:**
   - TikTok API for view counts
   - Instagram Graph API for metrics
   - YouTube Data API for video stats
3. **Update submission metrics** automatically
4. **Trigger earnings** when milestones are reached

### Conversion Attribution
For CONVERSION bounties, integrate with checkout flow:
1. Capture `ref` parameter from URL
2. Store referral code in session
3. On purchase completion, call `/api/checkout/record-sale` with referral code
4. Create earning record for participant

## Integration Points

### Dashboard
- Add "Create Bounty" quick action
- Show active campaigns count
- Display pending earnings

### Earnings Page
- Add "Bounties" subsection
- Show pending vs available earnings
- List recent earning events

### Vault/Marketplace
- Add "Create Bounty" button on asset/listing pages
- Pre-select the asset when creating campaign

## Security Considerations

1. **Creator Ownership** - Verify user owns campaign before updates
2. **Participant Validation** - Ensure user joined campaign before submissions
3. **Budget Limits** - Prevent overspending beyond campaign budget
4. **Duplicate Prevention** - Check for duplicate submissions
5. **Status Checks** - Only allow actions on ACTIVE campaigns

## Testing Checklist

- [ ] Create VIEW bounty campaign
- [ ] Create CONVERSION bounty campaign
- [ ] Join campaign as different user
- [ ] Submit social proof for VIEW bounty
- [ ] Generate referral link for CONVERSION bounty
- [ ] View campaign metrics as creator
- [ ] Check earnings calculation
- [ ] Test budget limit enforcement
- [ ] Verify campaign status transitions
- [ ] Test empty states

## Troubleshooting

### Prisma Client Errors
If you see "Module '@prisma/client' has no exported member 'PrismaClient'":
```bash
npx prisma generate
```

### Database Migration Issues
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### TypeScript Errors
The codebase uses TypeScript strict mode. Ensure all types are properly defined.

## File Structure
```
/app
  /api
    /bounties
      /campaigns
        route.ts (GET, POST)
        /[id]
          route.ts (GET, PATCH, DELETE)
          /join
            route.ts (POST)
          /submit
            route.ts (POST)
          /metrics
            route.ts (GET)
      /me
        route.ts (GET)
      /tasks
        /poll
          route.ts (POST)
  /bounties
    page.tsx (Main UI)

/components
  /bounties
    CampaignCard.tsx
    CreateCampaignWizard.tsx
    SubmitProofModal.tsx

/prisma
  schema.prisma (Updated with Bounties models)
```

## Next Steps

1. **Generate Prisma Client** - Run `npx prisma generate`
2. **Run Migrations** - Run `npx prisma migrate dev`
3. **Update Dashboard** - Add bounties integration
4. **Update Earnings Page** - Add bounties section
5. **Test End-to-End** - Create and join campaigns
6. **Deploy** - Push to production when ready
