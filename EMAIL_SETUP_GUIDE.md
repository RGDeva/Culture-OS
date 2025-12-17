# Email Setup Guide for Collaborator Invitations

## How Email Sending Works

### Current Implementation (Development)

**Sender:** Company email (e.g., `invites@noculture.com`)  
**Display Name:** `{Inviter Name} via NoCulture OS`  
**Reply-To:** Inviter's actual email address

**Example:**
```
From: John Doe via NoCulture OS <invites@noculture.com>
Reply-To: john@example.com
To: collaborator@example.com
Subject: John Doe invited you to collaborate on "My Track"
```

When the recipient replies, it goes directly to John's email, not the company email.

---

## Setup Options

### Option 1: Gmail (Development Only)

**Use Case:** Local testing, MVP, small scale

**Setup:**
1. Create a Gmail account: `nocultureos.invites@gmail.com`
2. Enable 2-Step Verification
3. Generate App Password
4. Add to `.env.local`:
```bash
GMAIL_USER=nocultureos.invites@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password
```

**Limitations:**
- 500 emails/day limit
- May be marked as spam
- Not professional for production
- No analytics

**Cost:** Free

---

### Option 2: SendGrid (Recommended for Production)

**Use Case:** Production, scalable, professional

**Setup:**

1. **Create SendGrid Account:**
   - Go to https://sendgrid.com
   - Sign up (Free tier: 100 emails/day)
   - Verify your email

2. **Create API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the key

3. **Verify Domain (Optional but Recommended):**
   - Settings → Sender Authentication
   - Authenticate Your Domain
   - Add DNS records to your domain
   - This improves deliverability

4. **Update Code:**

Install SendGrid:
```bash
npm install @sendgrid/mail
```

Update `/lib/email.ts`:
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendCollaboratorInvitation({
  to,
  projectName,
  inviterName,
  inviterEmail,
  invitationUrl,
  role,
  splitPercentage,
  message
}: SendInvitationEmailParams) {
  const msg = {
    to,
    from: {
      email: 'invites@noculture.com', // Your verified sender
      name: `${inviterName} via NoCulture OS`
    },
    replyTo: inviterEmail,
    subject: `${inviterName} invited you to collaborate on "${projectName}"`,
    html: `...your HTML template...`,
    text: `...your text version...`
  }

  await sgMail.send(msg)
}
```

5. **Environment Variables:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=invites@noculture.com
```

**Benefits:**
- ✅ 100 emails/day free (40,000/month paid)
- ✅ Professional deliverability
- ✅ Email analytics
- ✅ Template management
- ✅ Bounce handling
- ✅ Unsubscribe management

**Cost:** 
- Free: 100 emails/day
- Essentials: $19.95/month (50,000 emails)

---

### Option 3: AWS SES (Best for Scale)

**Use Case:** High volume, lowest cost

**Setup:**

1. **AWS Account Setup:**
   - Create AWS account
   - Go to Amazon SES
   - Request production access (starts in sandbox)

2. **Verify Domain:**
   - Add domain to SES
   - Add DNS records
   - Verify domain ownership

3. **Create IAM User:**
   - Create user with SES send permissions
   - Get Access Key ID and Secret

4. **Install SDK:**
```bash
npm install @aws-sdk/client-ses
```

5. **Update Code:**
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function sendCollaboratorInvitation({...}) {
  const command = new SendEmailCommand({
    Source: `${inviterName} via NoCulture OS <invites@noculture.com>`,
    Destination: { ToAddresses: [to] },
    ReplyToAddresses: [inviterEmail],
    Message: {
      Subject: { Data: `${inviterName} invited you...` },
      Body: {
        Html: { Data: `...HTML...` },
        Text: { Data: `...text...` }
      }
    }
  })

  await ses.send(command)
}
```

**Benefits:**
- ✅ Cheapest ($0.10 per 1,000 emails)
- ✅ Unlimited scale
- ✅ High deliverability
- ✅ AWS ecosystem integration

**Cost:** $0.10 per 1,000 emails

---

## Invitation Flow with Privy

### Step-by-Step Process

**1. User A Invites User B:**
```typescript
// User A clicks "Invite Collaborator"
POST /api/projects/proj123/collaborators/invite
{
  email: "userb@example.com",
  role: "COLLABORATOR",
  splitPercentage: 25
}

// System creates invitation with unique token
// Sends email to userb@example.com
```

**2. User B Receives Email:**
```
From: User A via NoCulture OS <invites@noculture.com>
Reply-To: usera@example.com

[Beautiful HTML Email]
- Project name
- Role and split info
- Personal message
- [Accept Invitation Button] → /invite/abc123xyz
```

**3. User B Clicks Accept Link:**
```
URL: https://noculture.com/invite/abc123xyz

Page loads → Checks if user is logged in
```

**4a. If User B Not Logged In:**
```typescript
// Redirect to login with return URL
/login?redirect=/invite/abc123xyz

// User logs in via Privy
// After login, redirect back to invitation
```

**4b. If User B Logged In:**
```typescript
// Automatically accept invitation
POST /api/invite/abc123xyz/accept

// Creates ProjectCollaborator record
// Updates invitation status to ACCEPTED
// Redirects to project
```

**5. User A Gets Notified:**
```
Email: "User B accepted your invitation to 'My Track'"
```

**6. User B Sees Project:**
```
// Project now appears in User B's Vault
// With appropriate permissions based on role
```

---

## Implementation Details

### Database Flow

**Before Acceptance:**
```sql
-- CollaboratorInvitation table
{
  id: "inv_123",
  projectId: "proj_456",
  email: "userb@example.com",
  token: "abc123xyz",
  status: "PENDING",
  role: "COLLABORATOR",
  splitPercentage: 25,
  expiresAt: "2024-12-23T..."
}
```

**After Acceptance:**
```sql
-- CollaboratorInvitation updated
{
  status: "ACCEPTED",
  acceptedAt: "2024-12-16T..."
}

-- ProjectCollaborator created
{
  id: "collab_789",
  projectId: "proj_456",
  userId: "user_b_id", // From Privy
  role: "COLLABORATOR",
  splitPercentage: 25,
  canEdit: true
}
```

### Privy Integration

**Getting User ID:**
```typescript
// In API route
import { getAuth } from '@privy-io/server-auth'

export async function POST(req: NextRequest) {
  const auth = await getAuth(req)
  const userId = auth?.userId // Privy user ID
  
  // Use this userId for ProjectCollaborator
}
```

**Frontend Check:**
```typescript
import { usePrivy } from '@privy-io/react-auth'

function InvitePage({ token }) {
  const { authenticated, login, user } = usePrivy()
  
  useEffect(() => {
    if (authenticated) {
      // Accept invitation
      acceptInvitation(token)
    } else {
      // Prompt to login
      login()
    }
  }, [authenticated])
}
```

---

## Email Template Best Practices

### What Makes a Good Invitation Email

**1. Clear Sender Identity:**
```
From: John Doe via NoCulture OS
Reply-To: john@example.com
```

**2. Compelling Subject:**
```
✅ "John Doe invited you to collaborate on 'Summer Vibes'"
❌ "You have an invitation"
```

**3. Clear Call-to-Action:**
```html
<a href="{invitationUrl}" style="
  display: inline-block;
  background: #10b981;
  color: white;
  padding: 14px 32px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
">
  Accept Invitation
</a>
```

**4. Context and Details:**
- Who invited you
- What project
- What role
- What split (if any)
- Personal message

**5. Expiration Notice:**
```
This invitation expires in 7 days.
```

**6. Plain Text Alternative:**
Always include a text version for email clients that don't support HTML.

---

## Security Considerations

### Token Generation

**Secure Random Token:**
```typescript
import crypto from 'crypto'

const token = crypto.randomBytes(32).toString('hex')
// Produces: 64-character hex string
// Example: a1b2c3d4e5f6...
```

### Token Validation

**Check on Accept:**
```typescript
// Verify token exists
// Check not expired
// Check not already accepted
// Validate user permissions
```

### Rate Limiting

**Prevent Abuse:**
```typescript
// Limit invitations per user per day
const MAX_INVITES_PER_DAY = 50

// Limit invitation attempts per token
const MAX_ACCEPT_ATTEMPTS = 5
```

---

## Testing

### Local Testing

**1. Setup Test Gmail:**
```bash
GMAIL_USER=test@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**2. Send Test Invitation:**
```bash
curl -X POST http://localhost:3000/api/projects/test-proj/collaborators/invite \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "role": "COLLABORATOR",
    "splitPercentage": 25,
    "message": "Let'\''s collaborate!"
  }'
```

**3. Check Email:**
- Look in inbox
- Check spam folder
- Verify sender display
- Test accept link

**4. Accept Invitation:**
- Click link in email
- Login via Privy
- Verify project appears in Vault

### Production Testing

**1. Test Deliverability:**
- Send to Gmail, Outlook, Yahoo
- Check spam scores
- Verify SPF/DKIM records

**2. Test Edge Cases:**
- Expired invitations
- Already accepted
- Invalid tokens
- User already collaborator

**3. Monitor Metrics:**
- Delivery rate
- Open rate
- Click rate
- Acceptance rate

---

## Troubleshooting

### Email Not Received

**Check:**
1. Spam folder
2. Email address correct
3. Sender credentials valid
4. Rate limits not exceeded
5. Domain verified (if using custom domain)

**Debug:**
```typescript
// Add logging
console.log('Sending email to:', to)
console.log('From:', from)
console.log('Subject:', subject)

try {
  await transporter.sendMail(mailOptions)
  console.log('Email sent successfully')
} catch (error) {
  console.error('Email failed:', error)
}
```

### Invitation Link Not Working

**Check:**
1. Token is valid (64 characters)
2. Not expired (< 7 days)
3. Status is PENDING
4. URL is correct

**Debug:**
```bash
# Check invitation in database
npx prisma studio
# Navigate to CollaboratorInvitation
# Find by token
# Check status and expiresAt
```

### User Not Added After Accept

**Check:**
1. User is logged in via Privy
2. User ID is captured correctly
3. No duplicate collaborator
4. Database transaction succeeded

**Debug:**
```typescript
// Add logging in accept route
console.log('User ID:', userId)
console.log('Project ID:', projectId)
console.log('Creating collaborator...')
```

---

## Recommended Setup

### For MVP/Testing
```bash
# Use Gmail
GMAIL_USER=nocultureos.invites@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### For Production
```bash
# Use SendGrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=invites@noculture.com
SENDGRID_FROM_NAME=NoCulture OS
```

### Environment Variables
```bash
# Email Service
GMAIL_USER=invites@noculture.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# OR for SendGrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=invites@noculture.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://noculture.com

# Privy (already configured)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

---

## Next Steps

1. **Choose email service** (Gmail for testing, SendGrid for production)
2. **Set up credentials** in `.env.local`
3. **Test invitation flow** end-to-end
4. **Monitor deliverability** and adjust as needed
5. **Scale to production service** when ready

The current implementation works with any email service - just update the transporter configuration in `/lib/email.ts`.
