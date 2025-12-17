# Collaborator Invitation System - Implementation Guide

Complete implementation of email-based collaborator invitations for Vault projects with contract splits.

## What Was Implemented

### ✅ Database Schema

**ProjectCollaborator Model:**
- Tracks active collaborators on projects
- Roles: OWNER, ADMIN, COLLABORATOR, VIEWER
- Contract split percentages
- Granular permissions (canEdit, canInvite, canManageSplits)

**CollaboratorInvitation Model:**
- Email-based invitations with unique tokens
- 7-day expiration
- Status tracking: PENDING, ACCEPTED, DECLINED, EXPIRED
- Personal messages and role assignment

### ✅ Email System

**Gmail Integration:**
- Professional HTML email templates
- Invitation emails with accept links
- Acceptance notification emails to inviters
- Uses nodemailer with Gmail SMTP

**Email Features:**
- Beautiful responsive design
- Contract split information
- Personal messages
- Expiration warnings
- Direct accept links

### ✅ API Endpoints

**POST /api/projects/[id]/collaborators/invite**
- Send invitation to email address
- Validate email format
- Check for duplicates
- Generate secure token
- Send email notification

**GET /api/projects/[id]/collaborators/invite**
- List all collaborators
- List pending invitations
- View contract split allocations

**POST /api/invite/[token]/accept**
- Accept invitation via token
- Create collaborator record
- Update invitation status
- Send acceptance notification

### ✅ UI Components

**CollaboratorManager Component:**
- Invite collaborator modal
- Role selection (Viewer, Collaborator, Admin)
- Contract split percentage input
- Personal message field
- Active collaborators list
- Pending invitations list
- Total split calculation with warnings

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```bash
# Gmail Configuration for Invitations
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Already configured
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Create new app password:
   - App: Mail
   - Device: Other (Custom name) - "NoCulture OS"
5. Copy the 16-character password
6. Add to `.env.local` as `GMAIL_APP_PASSWORD`

### 3. Database Migration

Already completed:
```bash
npx prisma db push
npx prisma generate
```

### 4. Install Dependencies

Already installed:
```bash
npm install nodemailer @types/nodemailer
```

## Usage Guide

### For Project Owners

**Invite a Collaborator:**

1. Navigate to your Vault project
2. Click "Invite Collaborator" button
3. Fill in the form:
   - **Email**: Collaborator's email address
   - **Role**: 
     - Viewer (read-only)
     - Collaborator (can edit)
     - Admin (full access)
   - **Contract Split**: Percentage (0-100%)
   - **Message**: Optional personal note
4. Click "Send Invitation"

**Manage Collaborators:**

- View active collaborators with roles and splits
- See pending invitations
- Monitor total contract split allocation
- Warning if total exceeds 100%

### For Invitees

**Accept Invitation:**

1. Check email inbox for invitation
2. Click "Accept Invitation" button in email
3. Redirected to accept page
4. Invitation automatically accepted
5. Access granted to project

**Invitation Details:**

- Valid for 7 days
- One-time use token
- Secure unique link
- Email notification to inviter on acceptance

## API Reference

### Send Invitation

```bash
POST /api/projects/{projectId}/collaborators/invite
Content-Type: application/json

{
  "email": "collaborator@example.com",
  "role": "COLLABORATOR",
  "splitPercentage": 25,
  "message": "Let's work together on this track!"
}
```

**Response:**
```json
{
  "success": true,
  "invitation": {
    "id": "clx...",
    "email": "collaborator@example.com",
    "role": "COLLABORATOR",
    "splitPercentage": 25,
    "status": "PENDING",
    "expiresAt": "2024-12-23T...",
    "invitationUrl": "http://localhost:3000/invite/abc123..."
  }
}
```

### Get Collaborators

```bash
GET /api/projects/{projectId}/collaborators/invite
```

**Response:**
```json
{
  "collaborators": [
    {
      "id": "clx...",
      "userId": "user123",
      "role": "COLLABORATOR",
      "splitPercentage": 25,
      "canEdit": true,
      "invitedAt": "2024-12-16T..."
    }
  ],
  "invitations": [
    {
      "id": "clx...",
      "email": "pending@example.com",
      "role": "COLLABORATOR",
      "splitPercentage": 15,
      "status": "PENDING",
      "expiresAt": "2024-12-23T...",
      "createdAt": "2024-12-16T..."
    }
  ]
}
```

### Accept Invitation

```bash
POST /api/invite/{token}/accept
```

**Response:**
```json
{
  "success": true,
  "collaborator": {
    "id": "clx...",
    "projectId": "proj123",
    "role": "COLLABORATOR",
    "splitPercentage": 25
  }
}
```

## Integration with Vault

### Add to Vault Page

```tsx
import { CollaboratorManager } from '@/components/vault/CollaboratorManager'

export default function VaultPage() {
  const projectId = 'your-project-id'
  
  return (
    <div>
      {/* Your existing Vault UI */}
      
      {/* Add Collaborator Manager */}
      <CollaboratorManager projectId={projectId} />
    </div>
  )
}
```

## Contract Splits

### How It Works

1. **Allocation**: Each collaborator can be assigned a percentage (0-100%)
2. **Tracking**: System calculates total allocated percentage
3. **Warning**: UI warns if total exceeds 100%
4. **Flexibility**: No hard limit - allows over-allocation for negotiation

### Use Cases

- **Equal Split**: 3 collaborators × 33.33% = 100%
- **Producer/Artist**: Producer 50%, Artist 50%
- **Team Project**: Lead 40%, Collaborator 30%, Collaborator 30%
- **Advisor**: Main team 90%, Advisor 10%

## Permissions System

### Role Hierarchy

**OWNER:**
- Full project control
- Can invite collaborators
- Can manage splits
- Can edit everything
- Cannot be removed

**ADMIN:**
- Can invite collaborators
- Can manage splits
- Can edit project
- Can be removed by owner

**COLLABORATOR:**
- Can edit project
- Cannot invite others
- Cannot manage splits
- Can be removed

**VIEWER:**
- Read-only access
- Cannot edit
- Cannot invite
- Can be removed

### Permission Matrix

| Action | Owner | Admin | Collaborator | Viewer |
|--------|-------|-------|--------------|--------|
| View project | ✅ | ✅ | ✅ | ✅ |
| Edit files | ✅ | ✅ | ✅ | ❌ |
| Upload files | ✅ | ✅ | ✅ | ❌ |
| Invite collaborators | ✅ | ✅ | ❌ | ❌ |
| Manage splits | ✅ | ✅ | ❌ | ❌ |
| Remove collaborators | ✅ | ✅ | ❌ | ❌ |

## Email Templates

### Invitation Email

**Subject:** `{Inviter} invited you to collaborate on "{Project}"`

**Content:**
- Professional header with gradient
- Project name and inviter details
- Role and contract split information
- Personal message (if provided)
- Prominent "Accept Invitation" button
- Expiration notice
- Footer with branding

### Acceptance Notification

**Subject:** `{Collaborator} accepted your invitation to "{Project}"`

**Content:**
- Success confirmation
- Collaborator details
- Project name
- Simple, clean design

## Testing

### Local Testing

1. **Setup Gmail credentials** in `.env.local`
2. **Restart dev server** to load new env vars
3. **Navigate to Vault** page
4. **Click "Invite Collaborator"**
5. **Enter test email** (your own email for testing)
6. **Send invitation**
7. **Check email inbox**
8. **Click accept link**
9. **Verify collaborator added**

### Test Scenarios

**Valid Invitation:**
- ✅ Email sent successfully
- ✅ Invitation appears in pending list
- ✅ Accept link works
- ✅ Collaborator added to project
- ✅ Acceptance notification sent

**Duplicate Prevention:**
- ✅ Cannot invite same email twice
- ✅ Error message shown
- ✅ Existing invitation preserved

**Expiration:**
- ✅ Invitation expires after 7 days
- ✅ Expired invitations cannot be accepted
- ✅ Status updated to EXPIRED

**Split Validation:**
- ✅ Warning when total > 100%
- ✅ Remaining percentage calculated
- ✅ Visual indicator for over-allocation

## Troubleshooting

### Email Not Sending

**Check Gmail Configuration:**
```bash
# Verify env vars are set
echo $GMAIL_USER
echo $GMAIL_APP_PASSWORD
```

**Common Issues:**
- App password not generated correctly
- 2-Step Verification not enabled
- Wrong email/password in `.env.local`
- Server not restarted after adding env vars

**Solution:**
1. Regenerate Gmail app password
2. Update `.env.local`
3. Restart dev server: `npm run dev`

### Invitation Link Not Working

**Check URL Configuration:**
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check invitation token is valid
- Ensure invitation hasn't expired

**Debug:**
```bash
# Check invitation in database
npx prisma studio
# Navigate to CollaboratorInvitation table
# Verify status and expiresAt
```

### Collaborator Not Added

**Check Logs:**
- Server console for errors
- Browser console for API errors
- Database for invitation status

**Common Issues:**
- User already a collaborator
- Invitation expired
- Invalid token
- Database connection issue

## Production Deployment

### Required Changes

1. **Use Production Email Service:**
   - SendGrid, AWS SES, or Mailgun
   - Better deliverability
   - Email analytics
   - Higher sending limits

2. **Implement Rate Limiting:**
   ```typescript
   // Limit invitations per user per day
   const MAX_INVITES_PER_DAY = 50
   ```

3. **Add Email Verification:**
   - Verify invitee email exists
   - Check for disposable emails
   - Validate domain

4. **Enhance Security:**
   - CSRF tokens
   - Rate limiting
   - IP tracking
   - Audit logs

5. **Add Notifications:**
   - In-app notifications
   - Email preferences
   - Notification history

6. **Improve UX:**
   - Real-time collaboration status
   - Activity feed
   - Collaborator profiles
   - Avatar images

## Future Enhancements

### Planned Features

1. **Team Management:**
   - Create teams/groups
   - Bulk invitations
   - Team-based permissions

2. **Advanced Splits:**
   - Time-based splits
   - Milestone-based splits
   - Automatic calculation
   - Legal contract generation

3. **Collaboration Tools:**
   - Real-time editing
   - Comments and feedback
   - Version control
   - Activity timeline

4. **Analytics:**
   - Collaboration metrics
   - Contribution tracking
   - Split history
   - Revenue distribution

5. **Integrations:**
   - Slack notifications
   - Discord webhooks
   - Calendar sync
   - Payment automation

## Files Created/Modified

### Database Schema
- **Modified:** `/prisma/schema.prisma`
  - Added `ProjectCollaborator` model
  - Added `CollaboratorInvitation` model

### Email System
- **Created:** `/lib/email.ts`
  - Email sending functions
  - HTML templates
  - Nodemailer configuration

### API Routes
- **Created:** `/app/api/projects/[id]/collaborators/invite/route.ts`
  - POST: Send invitation
  - GET: List collaborators and invitations

- **Created:** `/app/api/invite/[token]/accept/route.ts`
  - POST: Accept invitation

### UI Components
- **Created:** `/components/vault/CollaboratorManager.tsx`
  - Invitation modal
  - Collaborator list
  - Invitation list
  - Split calculator

### Documentation
- **Created:** `/COLLABORATOR_SYSTEM_GUIDE.md` (this file)

## Support

For issues or questions:
1. Check troubleshooting section
2. Review API logs
3. Inspect database records
4. Test with different email providers

---

**The collaborator invitation system is now fully implemented and ready for testing!**

Add Gmail credentials to `.env.local` and restart the server to start sending invitations.
