# Culture OS Design System

## Overview

This design system is built on HeroUI and provides a consistent, modern, professional interface for Culture OS. All components follow a black and white color scheme with subtle blue accents.

---

## Color Palette

### Background Colors
- **Primary Background**: `#000000` (black)
- **Surface**: `#09090b` (zinc-950)
- **Card Background**: `#18181b` (zinc-900)
- **Hover Background**: `#27272a` (zinc-800)

### Border Colors
- **Default**: `#27272a` (zinc-800)
- **Hover**: `#3f3f46` (zinc-700)
- **Active**: `#52525b` (zinc-600)

### Text Colors
- **Primary**: `#ffffff` (white)
- **Secondary**: `#fafafa` (zinc-50)
- **Muted**: `#a1a1aa` (zinc-400)
- **Disabled**: `#71717a` (zinc-500)

### Accent Colors
- **Primary (Blue)**: `#3b82f6` - Main actions, links
- **Success (Green)**: `#10b981` - Success states, confirmations
- **Warning (Amber)**: `#f59e0b` - Warnings, incomplete states
- **Danger (Red)**: `#ef4444` - Errors, destructive actions

---

## Typography

### Font Families
- **Sans**: Inter (default)
- **Mono**: JetBrains Mono (code, technical)

### Scale
```tsx
h1: text-2xl (24px) font-semibold
h2: text-xl (20px) font-semibold
h3: text-lg (18px) font-semibold
h4: text-base (16px) font-medium
body: text-sm (14px) font-normal
small: text-xs (12px) font-normal
```

---

## Spacing

Use Tailwind's spacing scale:
- `gap-2` (8px) - Tight spacing
- `gap-4` (16px) - Default spacing
- `gap-6` (24px) - Section spacing
- `gap-8` (32px) - Large spacing

---

## Components

### Layout Components

#### AppShell
Main application container with sidebar and topbar.

```tsx
import { AppShell } from '@/ui/AppShell'

<AppShell>
  {/* Your page content */}
</AppShell>
```

#### PageHeader
Consistent page headers with breadcrumbs and actions.

```tsx
import { PageHeader } from '@/ui/PageHeader'

<PageHeader
  title="Vault"
  subtitle="Manage your project assets"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Vault' }
  ]}
  primaryAction={{
    label: 'Upload',
    onClick: handleUpload,
    icon: <Upload />
  }}
/>
```

#### PageContainer
Content wrapper with consistent padding and max-width.

```tsx
import { PageContainer } from '@/ui/PageContainer'

<PageContainer maxWidth="xl">
  {/* Content */}
</PageContainer>
```

### Data Display

#### StatCard
Display statistics with optional trend indicators.

```tsx
import { StatCard } from '@/ui/StatCard'

<StatCard
  title="Total Assets"
  value="1,234"
  change={{ value: 12, trend: 'up' }}
  icon={<FolderOpen />}
  description="Last 30 days"
/>
```

#### AssetCard
Display asset information with actions.

```tsx
import { AssetCard } from '@/ui/AssetCard'

<AssetCard
  id="asset-1"
  name="track-final.wav"
  type="Audio"
  size="24.5 MB"
  tags={['master', 'final']}
  onDownload={handleDownload}
  onShare={handleShare}
  onClick={handleView}
/>
```

#### EmptyState
Show when no data is available.

```tsx
import { EmptyState } from '@/ui/EmptyState'

<EmptyState
  icon={<FolderOpen />}
  title="No assets yet"
  description="Upload your first asset to get started"
  action={{
    label: 'Upload Asset',
    onClick: handleUpload
  }}
/>
```

### Forms

#### FileUpload
Drag and drop file upload component.

```tsx
import { FileUpload } from '@/ui/FileUpload'

<FileUpload
  accept="audio/*,video/*"
  multiple
  maxSize={100 * 1024 * 1024} // 100MB
  onFilesSelected={handleFiles}
/>
```

---

## Button Hierarchy

### Primary
Use for main actions (save, submit, create).
```tsx
<Button color="primary" variant="shadow">
  Create Project
</Button>
```

### Secondary
Use for secondary actions.
```tsx
<Button variant="bordered" className="border-zinc-700">
  Cancel
</Button>
```

### Ghost
Use for tertiary actions or icon buttons.
```tsx
<Button variant="light">
  Learn More
</Button>
```

### Destructive
Use for delete or destructive actions.
```tsx
<Button color="danger" variant="shadow">
  Delete
</Button>
```

---

## Best Practices

### Do ✅
- Use consistent spacing (4, 6, 8)
- Keep text concise and confident
- Add loading states to all async actions
- Provide empty states with clear next actions
- Use semantic HTML
- Add ARIA labels for accessibility
- Use HeroUI components for consistency

### Don't ❌
- Mix different border radius values
- Use bright colors excessively
- Create custom components when HeroUI has one
- Forget loading/error states
- Use inline styles
- Ignore mobile responsiveness
- Skip accessibility attributes

---

## Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

---

## Accessibility

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use proper focus indicators
- Implement focus traps in modals

### ARIA Labels
```tsx
<Button aria-label="Close dialog">
  <X />
</Button>
```

### Color Contrast
All text must meet WCAG AA standards:
- Normal text: 4.5:1
- Large text: 3:1

---

## Examples

### Page Layout
```tsx
import { AppShell } from '@/ui/AppShell'
import { PageHeader } from '@/ui/PageHeader'
import { PageContainer } from '@/ui/PageContainer'

export default function MyPage() {
  return (
    <AppShell>
      <PageHeader
        title="My Page"
        subtitle="Page description"
        primaryAction={{
          label: 'New Item',
          onClick: handleCreate
        }}
      />
      <PageContainer maxWidth="xl">
        {/* Content */}
      </PageContainer>
    </AppShell>
  )
}
```

### Grid of Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <AssetCard key={item.id} {...item} />
  ))}
</div>
```

### Form with Validation
```tsx
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'

<form onSubmit={handleSubmit}>
  <Input
    label="Project Name"
    placeholder="Enter name"
    isRequired
    errorMessage="Name is required"
  />
  <Button type="submit" color="primary">
    Create
  </Button>
</form>
```

---

## Component Checklist

When creating a new component:
- [ ] Uses HeroUI primitives
- [ ] Follows color palette
- [ ] Has loading state
- [ ] Has error state
- [ ] Has empty state (if applicable)
- [ ] Is responsive
- [ ] Has proper ARIA labels
- [ ] Supports keyboard navigation
- [ ] Uses consistent spacing
- [ ] Has proper TypeScript types

---

**Last Updated**: Dec 17, 2024
**Version**: 1.0.0
