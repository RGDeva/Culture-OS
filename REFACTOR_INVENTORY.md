# Culture OS UI Refactor - Inventory & Plan

## Current Routes Inventory

### Core Pages
- `/` - Landing page
- `/dashboard` - Main dashboard
- `/login` - Authentication
- `/onboarding` - User onboarding flow
- `/profile/setup` - Profile setup
- `/profile/[userId]` - User profile view

### Vault & Projects
- `/vault` - Main vault page (PRIORITY)
- `/vault/new` - Create new vault project
- `/vault/projects/[id]` - Project detail view
- `/vault/integrations/fl-studio` - FL Studio integration
- `/vault/integrations/google-drive` - Google Drive integration
- `/session-vault-v2` - Session vault alternative

### Integrations
- `/integrations/fl-studio` - FL Studio setup
- `/integrations/google-drive` - Google Drive setup

### Collaboration & Network
- `/network` - Network/collaborators view
- `/creator-map` - Creator map visualization
- `/creator/[id]` - Creator profile

### Marketplace & Earnings
- `/marketplace` - Marketplace browse
- `/marketplace/upload` - Upload to marketplace
- `/marketplace/play/[id]` - Play/preview
- `/marketplace/provider/[id]` - Provider view
- `/earn` - Earnings dashboard
- `/earnings` - Earnings detail
- `/bounties` - Bounties/campaigns

### Tools & Features
- `/assistant` - AI assistant
- `/music` - Music tools
- `/studio` - Studio tools
- `/tools` - General tools
- `/notifications` - Notifications center

### Experimental/Beta
- `/artist-index` - Artist directory
- `/book-studio` - Studio booking
- `/content-feed` - Content feed
- `/creator-mesh` - Creator mesh
- `/drop-archive` - Drop archive
- `/map` - Map view
- `/shop-terminal` - Shop terminal
- `/signal-feed` - Signal feed
- `/submit-portal` - Submit portal

## Current Component Structure

### Layout Components
- `TopNav` - Top navigation bar (already updated with HeroUI)
- `RightNav` - Right sidebar navigation
- `MainNav` - Main navigation component
- `Navbar` - Alternative navbar

### Shared Components
- `LoadingSpinner` - Loading states
- `ErrorBoundary` - Error handling
- `DiagnosticOverlay` - Dev diagnostics
- `ProfileCompletionBanner` - Profile progress

### Feature Components
- `/auth` - Authentication components
- `/bounties` - Bounty/campaign components
- `/dashboard` - Dashboard widgets
- `/vault` - Vault components (including UnlockButton - already updated)
- `/marketplace` - Marketplace components
- `/profile` - Profile components
- `/onboarding` - Onboarding flow
- `/intelligence` - AI/intelligence components
- `/payments` - Payment components

### UI Primitives (existing)
- `/ui` - Currently empty, will be populated with design system

## Patterns Identified

### Modal Patterns
- Payment modals (x402)
- Confirmation dialogs
- Create/upload modals
- Settings modals

### Form Patterns
- Profile setup forms
- Asset upload forms
- Integration connection forms
- Bounty creation forms

### List/Table Patterns
- Asset lists in vault
- Project lists
- Collaborator lists
- Transaction history
- Marketplace items

### Card Patterns
- Project cards
- Asset cards
- Integration cards
- Stat cards
- Creator cards

## Refactor Plan

### Phase 1: Design System Foundation (CURRENT)
**Priority: HIGH**

Create `/ui` folder with HeroUI-based primitives:

#### Layout Components
- ✅ `AppShell.tsx` - Main app container with sidebar + topbar
- ✅ `PageHeader.tsx` - Consistent page headers
- ✅ `PageContainer.tsx` - Content wrapper with consistent padding
- ✅ `Sidebar.tsx` - Left navigation sidebar
- ✅ `Topbar.tsx` - Top navigation bar

#### Data Display
- ✅ `Card.tsx` - Base card component
- ✅ `StatCard.tsx` - Statistics card
- ✅ `EmptyState.tsx` - Empty state placeholder
- ✅ `Skeleton.tsx` - Loading skeletons
- ✅ `DataTable.tsx` - Table with sorting/pagination
- ✅ `AssetCard.tsx` - Asset display card
- ✅ `ProjectCard.tsx` - Project display card

#### Forms
- ✅ `TextField.tsx` - Text input
- ✅ `Select.tsx` - Dropdown select
- ✅ `Textarea.tsx` - Multi-line text
- ✅ `Switch.tsx` - Toggle switch
- ✅ `Radio.tsx` - Radio buttons
- ✅ `Checkbox.tsx` - Checkboxes
- ✅ `FileUpload.tsx` - File upload component

#### Feedback
- ✅ `Modal.tsx` - Modal dialog
- ✅ `Drawer.tsx` - Side drawer
- ✅ `ConfirmDialog.tsx` - Confirmation dialog
- ✅ `Toast.tsx` - Toast notifications
- ✅ `Alert.tsx` - Alert messages

#### Navigation
- ✅ `Tabs.tsx` - Tab navigation
- ✅ `Breadcrumbs.tsx` - Breadcrumb navigation
- ✅ `Dropdown.tsx` - Dropdown menu

#### Misc
- ✅ `Badge.tsx` - Status badges
- ✅ `Avatar.tsx` - User avatars
- ✅ `Tooltip.tsx` - Tooltips
- ✅ `Button.tsx` - Button variants

### Phase 2: Global Layout
**Priority: HIGH**

- ✅ Implement AppShell with responsive sidebar
- ✅ Update TopNav (already done)
- ✅ Create consistent navigation structure
- ✅ Add breadcrumbs system
- ✅ Mobile responsive patterns

### Phase 3: Core Page Redesigns
**Priority: HIGH**

#### A. Landing Page (`/`)
- Clean hero section with clear CTA
- Feature sections with better spacing
- Trust elements and social proof
- Consistent typography and spacing

#### B. Dashboard (`/dashboard`)
- Quick stats cards
- Recent activity feed
- Quick actions panel
- Project overview cards

#### C. Vault (`/vault`) - **PREMIUM FOCUS**
- Import dropdown (Computer, Google Drive, FL Studio)
- Folder/filter system (type, date, owner)
- Asset grid/list toggle
- Asset detail panel/modal
- Version history UI
- Drag & drop upload
- Bulk actions

#### D. Projects (`/vault/projects/[id]`)
- Tab navigation: Overview, Vault, Activity, Collaborators, Settings
- Overview: key stats, recent activity
- Collaborators: roles, invite, permissions
- Clean settings panel

#### E. Integrations (`/integrations`)
- Integration hub with status cards
- Consistent setup wizard:
  - Step 1: Connect
  - Step 2: Configure
  - Step 3: Confirm
- Last sync status
- Quick actions

### Phase 4: Secondary Pages
**Priority: MEDIUM**

- Profile pages
- Network/collaborators
- Marketplace
- Earnings
- Bounties
- Tools

### Phase 5: Micro-interactions
**Priority: MEDIUM**

- Loading states everywhere
- Success/error toasts
- Inline validation
- Skeleton loaders
- Empty states with CTAs
- Confirm destructive actions
- Hover/active states
- Smooth transitions

### Phase 6: Accessibility & Polish
**Priority: MEDIUM**

- Keyboard navigation
- Focus management
- ARIA labels
- Color contrast
- Reduced motion support
- Screen reader testing

## Design System Rules

### Color Palette
- **Background**: `#000000` (black)
- **Surface**: `#09090b` (zinc-950), `#18181b` (zinc-900)
- **Border**: `#27272a` (zinc-800), `#3f3f46` (zinc-700)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `#a1a1aa` (zinc-400)
- **Text Muted**: `#71717a` (zinc-500)
- **Primary**: `#3b82f6` (blue-500) - subtle accent
- **Success**: `#10b981` (emerald-500)
- **Warning**: `#f59e0b` (amber-500)
- **Danger**: `#ef4444` (red-500)

### Typography Scale
- **Heading 1**: 2.5rem (40px), font-semibold
- **Heading 2**: 2rem (32px), font-semibold
- **Heading 3**: 1.5rem (24px), font-semibold
- **Heading 4**: 1.25rem (20px), font-medium
- **Body Large**: 1.125rem (18px), font-normal
- **Body**: 1rem (16px), font-normal
- **Body Small**: 0.875rem (14px), font-normal
- **Caption**: 0.75rem (12px), font-normal

### Spacing Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Border Radius
- **sm**: 6px
- **md**: 8px
- **lg**: 12px
- **full**: 9999px

### Shadows
- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

### Button Hierarchy
- **Primary**: Blue background, white text, shadow
- **Secondary**: Zinc-800 background, white text
- **Ghost**: Transparent, white text, hover bg
- **Destructive**: Red-500 background, white text
- **Bordered**: Border only, transparent bg

### Icon Set
Using Lucide React icons consistently throughout

## Risky Changes to Isolate

### High Risk
- Changing auth flow (Privy integration)
- Modifying API endpoints or data fetching
- Changing routing structure
- Breaking existing state management

### Medium Risk
- Replacing complex form components
- Updating table/list components with data
- Changing modal/drawer patterns mid-flow

### Low Risk
- Styling updates
- Adding loading/empty states
- Improving typography
- Adding new UI primitives
- Replacing simple components

## Implementation Strategy

### Week 1: Foundation
1. Create complete `/ui` design system
2. Implement AppShell and global layout
3. Update navigation structure
4. Create documentation

### Week 2: Core Pages
1. Redesign Vault (premium focus)
2. Redesign Dashboard
3. Redesign Projects detail
4. Redesign Integrations hub

### Week 3: Secondary Pages
1. Landing page polish
2. Profile pages
3. Marketplace
4. Network/collaborators

### Week 4: Polish
1. Add all loading/empty states
2. Accessibility pass
3. Mobile responsive fixes
4. Performance optimization
5. Testing and bug fixes

## Success Metrics

- ✅ All existing routes still work
- ✅ Auth flow unchanged
- ✅ API calls preserved
- ✅ Improved navigation clarity
- ✅ Consistent design system
- ✅ Better information hierarchy
- ✅ Premium feel on Vault
- ✅ Responsive on mobile
- ✅ Accessible (WCAG AA)
- ✅ Fast perceived performance

## Next Steps

1. ✅ Create `/ui` folder structure
2. ✅ Build core primitives (Card, Button, Input, etc.)
3. ✅ Implement AppShell with sidebar
4. Start with Vault redesign (highest priority)
5. Move to Dashboard
6. Continue with other pages

---

**Status**: Phase 1 in progress
**Last Updated**: Dec 17, 2024
