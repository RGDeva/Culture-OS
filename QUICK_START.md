# NoCulture OS - Quick Start Guide

## 🚀 Running the App

```bash
npm run dev
```

**Access:** http://localhost:3002

---

## 🎨 Theme System

### Toggle Theme
1. Click **hamburger menu** (top-right corner)
2. Click **"THEME: DARK"** or **"THEME: LIGHT"** button
3. Theme switches instantly and persists

### Available Themes
- **DARK** - Terminal aesthetic (neon green on black)
- **LIGHT** - Sleek minimal (dark text on white)

---

## 🧭 Navigation

### Access Menu
- Click **hamburger icon** (☰) in top-right corner
- Menu slides in from right
- Click outside or X to close

### Pages Available
- **HOME** - Landing page with hero
- **VAULT** - Project management
- **MARKETPLACE** - Products and bounties
- **NETWORK** - Creator discovery with filters
- **MAP** - Creator locations
- **EARNINGS** - Financial tracking
- **INTELLIGENCE** - Analytics
- **PROFILE** - User settings

---

## 👤 Profile Setup

### Complete Your Profile
1. Click menu → **PROFILE**
2. Fill in required fields:
   - Display Name
   - Handle
   - Roles (select multiple)
   - Location (City, State, Country)
   - Genres
3. Add optional fields:
   - **Bio** - Describe yourself
   - **Looking For** - What you're seeking
   - **Studio Association** - Your studio
   - Platform links (Spotify, YouTube, SoundCloud, Audiomack, etc.)
4. Click **SAVE_PROFILE**

### New Profile Fields
- ✅ Bio (textarea)
- ✅ Looking For (what you need)
- ✅ Studio Association (dropdown)
- ✅ Audiomack URL
- ✅ State/Province
- ✅ XP tracking
- ✅ Tags

---

## 🌐 Network Page

### Filter Creators
1. Go to **NETWORK** page
2. Use filters:
   - **Search** - Name or bio
   - **Roles** - Select multiple (ARTIST, PRODUCER, etc.)
   - **Location** - City, state, or country
   - **Genres** - Multi-select
   - **XP Tier** - ROOKIE, CORE, POWER_USER
3. Results update instantly

### Profile Cards Show
- Name and XP tier badge
- Roles
- Location
- Studio (if applicable)
- Genres
- Bio preview
- "Looking for" info
- XP and completion %

---

## 🎯 Marketplace

### Browse Products
- **Products Tab** - Digital products, beats, stems
- **Bounties Tab** - Links to Network bounties

### View Bounties
1. Click **Marketplace** → **Bounties** tab
2. Click **"GO TO BOUNTIES"**
3. Redirects to Network page bounties section

---

## 🔑 Authentication

### Connect Wallet
1. Click menu → **CONNECT_WALLET**
2. Choose login method:
   - Email
   - Wallet
   - Google
   - Twitter
   - Discord
3. Complete authentication

### Logout
1. Click menu
2. Click **LOGOUT** button (red)

---

## 🎨 For Developers

### Using Theme in Components

**Method 1: Tailwind Classes**
```tsx
<div className="bg-black dark:bg-black light:bg-white">
  Content
</div>
```

**Method 2: Theme Utilities**
```tsx
import { themeClasses } from '@/lib/theme-utils'

<div className={themeClasses.bgPanel}>
  <p className={themeClasses.textPrimary}>Content</p>
</div>
```

**Method 3: useTheme Hook**
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>Toggle</button>
}
```

### Available Theme Utilities
```tsx
themeClasses.bgApp        // Main background
themeClasses.bgPanel      // Card/panel background
themeClasses.textPrimary  // Primary text
themeClasses.borderAccent // Accent border
themeClasses.btnPrimary   // Primary button
themeClasses.input        // Form input
```

---

## 📂 Key Files

### Theme System
- `/contexts/ThemeContext.tsx` - Theme state
- `/lib/theme-utils.ts` - Utilities
- `/app/globals.css` - CSS variables

### Components
- `/components/layout/RightNav.tsx` - Navigation
- `/components/network/ProfileCard.tsx` - Profile cards
- `/components/home/DashboardSnapshot.tsx` - Dashboard

### Pages
- `/app/page.tsx` - Homepage
- `/app/network/page.tsx` - Network
- `/app/marketplace/page.tsx` - Marketplace
- `/app/profile/setup/page.tsx` - Profile setup

### APIs
- `/app/api/profile/route.ts` - Profile CRUD
- `/app/api/profiles/route.ts` - Profile search
- `/app/api/dashboard/snapshot/route.ts` - Dashboard data

---

## 🐛 Troubleshooting

### Theme Not Persisting
- Check browser localStorage
- Clear cache and reload
- Ensure JavaScript is enabled

### Navigation Not Opening
- Check for console errors
- Verify RightNav is imported in providers
- Try hard refresh (Cmd+Shift+R)

### Profile Not Saving
- Check network tab for API errors
- Verify all required fields filled
- Check console for validation errors

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Documentation

- **THEME_SYSTEM_GUIDE.md** - Complete theme docs
- **SESSION_SUMMARY.md** - Development summary
- **NOCULTURE_OS_TRANSFORMATION_PROGRESS.md** - Full progress

---

## 🎯 Quick Tips

1. **Theme persists** - Your choice is saved
2. **Navigation is collapsible** - Click outside to close
3. **Filters are instant** - No need to submit
4. **Profile is extensible** - More fields coming
5. **Both themes look great** - Try switching!

---

## 🚀 Next Features

- Creator map with profile pins
- Full bounties system
- Advanced marketplace filters
- Studio profiles
- Tools directory

---

**Happy building! 🎨**
