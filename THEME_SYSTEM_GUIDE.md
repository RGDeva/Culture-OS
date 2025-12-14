# NoCulture OS - Theme System Implementation Guide

## Overview
The NoCulture OS now supports dual themes:
- **DARK MODE** (Terminal aesthetic) - Default
- **LIGHT MODE** (Sleek, minimal) - Alternative

Both themes maintain the same layout and information architecture, only adjusting color tokens and styling.

---

## Implementation Details

### 1. Theme Context (`/contexts/ThemeContext.tsx`)
- Provides global theme state: `'dark' | 'light'`
- Persists theme choice to `localStorage` as `noculture-theme`
- Automatically applies/removes `dark` class on `document.documentElement`
- Exports `useTheme()` hook for components

**Usage:**
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  )
}
```

---

### 2. CSS Variables (`/app/globals.css`)

#### Dark Mode (Default)
```css
:root {
  --bg-app: 0 0% 0%;           /* Pure black */
  --bg-panel: 0 0% 4%;         /* Near black */
  --bg-surface: 0 0% 8%;       /* Slightly lighter */
  --text-primary: 156 73% 50%; /* Neon green */
  --text-secondary: 156 73% 40%;
  --text-muted: 0 0% 60%;
  --border-accent: 156 73% 50%;
  --border-subtle: 0 0% 20%;
}
```

#### Light Mode
```css
.light {
  --bg-app: 0 0% 98%;          /* Off-white */
  --bg-panel: 0 0% 100%;       /* Pure white */
  --bg-surface: 0 0% 96%;      /* Light gray */
  --text-primary: 0 0% 10%;    /* Near black */
  --text-secondary: 0 0% 30%;  /* Dark gray */
  --text-muted: 0 0% 50%;      /* Medium gray */
  --border-accent: 156 60% 40%; /* Muted green */
  --border-subtle: 0 0% 85%;   /* Light gray */
}
```

---

### 3. Tailwind Configuration
Dark mode is enabled via class strategy in `tailwind.config.ts`:
```ts
darkMode: ["class"]
```

This allows using `dark:` and `light:` prefixes in className strings.

---

### 4. Theme Utilities (`/lib/theme-utils.ts`)

Pre-defined theme-aware class strings for common patterns:

```tsx
import { themeClasses, componentThemes } from '@/lib/theme-utils'

// Example usage
<div className={themeClasses.bgPanel}>
  <h1 className={componentThemes.heading}>Title</h1>
  <button className={themeClasses.btnPrimary}>Click</button>
</div>
```

**Available utilities:**
- `themeClasses.bgApp` - Main background
- `themeClasses.bgPanel` - Card/panel background
- `themeClasses.textPrimary` - Primary text color
- `themeClasses.borderAccent` - Accent border
- `themeClasses.btnPrimary` - Primary button
- `themeClasses.input` - Form input styling
- And more...

---

### 5. Right Navigation Panel (`/components/layout/RightNav.tsx`)

**Features:**
- Fixed top-right toggle button (hamburger menu)
- Slides in from right side
- Contains:
  - App branding
  - Theme toggle button
  - Navigation links (HOME, VAULT, MARKETPLACE, etc.)
  - User profile/logout
- Fully theme-aware with proper dark/light styling
- Collapsible with overlay backdrop

**Theme Toggle:**
```tsx
<button onClick={toggleTheme}>
  > THEME: {theme.toUpperCase()}
  {theme === 'dark' ? <Moon /> : <Sun />}
</button>
```

---

### 6. Updated Components

#### Homepage (`/app/page.tsx`)
- ✅ Removed duplicate hero text
- ✅ Simplified to static text (no TerminalText animation)
- ✅ Theme-aware background and text colors
- ✅ Matrix background only visible in dark mode

#### Marketplace (`/app/marketplace/page.tsx`)
- ✅ Bounties tab now links to Network page
- ✅ Theme-aware styling throughout

#### Providers (`/components/providers.tsx`)
- ✅ Integrated ThemeProvider at root
- ✅ Replaced MainNav with RightNav
- ✅ Removed old theme provider

#### Layout (`/app/layout.tsx`)
- ✅ Removed hardcoded `dark` class
- ✅ Let ThemeContext handle theme class

---

## How to Apply Theme to New Components

### Method 1: Direct Tailwind Classes
```tsx
<div className="bg-black dark:bg-black light:bg-white text-green-400 dark:text-green-400 light:text-gray-900">
  Content
</div>
```

### Method 2: Using Theme Utilities
```tsx
import { themeClasses } from '@/lib/theme-utils'

<div className={themeClasses.bgPanel}>
  <p className={themeClasses.textPrimary}>Content</p>
</div>
```

### Method 3: Conditional with useTheme
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme } = useTheme()
  
  return (
    <div className={theme === 'dark' ? 'bg-black' : 'bg-white'}>
      Content
    </div>
  )
}
```

---

## Color Guidelines

### Dark Mode (Terminal)
- **Background:** Pure black (#000000)
- **Text:** Neon green (#00ff41)
- **Accents:** Cyan, pink for secondary elements
- **Effects:** Glows, shadows, matrix effects
- **Feel:** Cyberpunk, hacker, terminal

### Light Mode (Sleek)
- **Background:** Off-white, light gray
- **Text:** Near-black, dark gray
- **Accents:** Muted green (#4a9d6f), subtle colors
- **Effects:** Minimal shadows, clean borders
- **Feel:** Professional, minimal, modern

---

## Testing Checklist

- [x] Theme persists across page reloads
- [x] Theme toggle works instantly
- [x] All pages respect theme
- [x] Navigation is accessible in both themes
- [x] Text is readable in both themes
- [x] Buttons/inputs work in both themes
- [x] No flash of wrong theme on load

---

## Future Enhancements

1. **User Profile Theme Preference**
   - Store theme in user profile (database)
   - Sync across devices

2. **Auto Theme Based on Time**
   - Dark mode at night
   - Light mode during day

3. **Custom Theme Colors**
   - Allow users to customize accent colors
   - Multiple theme presets

4. **Accessibility**
   - High contrast mode
   - Reduced motion option

---

## File Structure

```
/contexts
  └── ThemeContext.tsx          # Theme state management

/components/layout
  └── RightNav.tsx              # Navigation with theme toggle

/lib
  └── theme-utils.ts            # Theme utility classes

/app
  ├── globals.css               # CSS variables for themes
  ├── layout.tsx                # Root layout
  └── page.tsx                  # Homepage (theme-aware)

/app/marketplace
  └── page.tsx                  # Marketplace (theme-aware)
```

---

## Key Changes Summary

1. **Created ThemeContext** - Global theme state with localStorage persistence
2. **Added CSS Variables** - Semantic color tokens for dark/light modes
3. **Built RightNav** - Collapsible navigation panel with theme toggle
4. **Updated Homepage** - Fixed duplicate text, added theme support
5. **Enhanced Marketplace** - Bounties link, theme-aware styling
6. **Created Theme Utils** - Reusable theme-aware class strings

---

## Notes

- The theme system does NOT change the layout or structure
- Both themes use the same components and information architecture
- Only colors, shadows, and visual effects change between themes
- Terminal aesthetic (monospace, uppercase labels) is preserved in both modes
- Light mode is more subtle but maintains the same "OS" feel
