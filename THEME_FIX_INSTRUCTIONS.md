# SM TarPark Theme Fix Instructions

## Global Color Replacements Needed

Replace all hardcoded colors in `.tsx` files with theme-aware variables:

### Text Colors
- `text-gray-900` → `text-foreground`
- `text-gray-800` → `text-foreground`
- `text-gray-700` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground`
- `text-white` → `text-primary-foreground` (only when on colored backgrounds)
- `text-blue-800` → `text-primary`
- `text-blue-900` → `text-primary`

### Background Colors
- `bg-white` → `bg-card`
- `bg-gray-50` → `bg-secondary`
- `bg-gray-100` → `bg-secondary`
- `bg-gray-200` → `bg-muted`

### Border Colors
- `border-gray-100` → `border-border`
- `border-gray-200` → `border-border`
- `border-gray-300` → `border-border`

### Input/Select Colors
- Input backgrounds: `bg-white` → `bg-input`
- Select backgrounds: `bg-white` → `bg-input`
- Input text: add `text-foreground`
- Border: `border-gray-300` → `border-border`

## Files That Need Updates

### Priority 1 - Core Pages:
1. `/src/app/pages/AdminDashboard.tsx`
2. `/src/app/pages/TollDashboard.tsx`
3. `/src/app/pages/VehiclesPage.tsx`
4. `/src/app/pages/ViolationsPage.tsx`
5. `/src/app/pages/PaymentsPage.tsx`
6. `/src/app/pages/ReportsPage.tsx`
7. `/src/app/pages/SettingsPage.tsx`
8. `/src/app/pages/SlotsPage.tsx`

### Priority 2 - UI Components:
1. `/src/app/components/ui/Button.tsx`
2. `/src/app/components/ui/Card.tsx`
3. `/src/app/components/ui/Input.tsx` (if exists)
4. `/src/app/components/ui/Select.tsx` (if exists)

## Quick Fix Pattern

For each .tsx file, use find & replace:

### Pattern 1: Headers
```tsx
// BEFORE:
<h1 className="text-2xl font-bold text-gray-900">
<h2 className="text-xl font-bold text-gray-900">
<h3 className="text-lg font-bold text-gray-900">

// AFTER:
<h1 className="text-2xl font-bold text-foreground">
<h2 className="text-xl font-bold text-foreground">
<h3 className="text-lg font-bold text-foreground">
```

### Pattern 2: Body Text
```tsx
// BEFORE:
<p className="text-sm text-gray-600">
<span className="text-gray-600">

// AFTER:
<p className="text-sm text-muted-foreground">
<span className="text-muted-foreground">
```

### Pattern 3: Cards
```tsx
// BEFORE:
<div className="bg-white rounded-lg p-4">

// AFTER:
<div className="bg-card rounded-lg p-4 border border-border">
```

### Pattern 4: Inputs/Selects
```tsx
// BEFORE:
<select className="px-3 py-2 border border-gray-300 rounded-lg">
<input className="px-3 py-2 border border-gray-300 rounded-lg">

// AFTER:
<select className="px-3 py-2 bg-input border border-border rounded-lg text-foreground">
<input className="px-3 py-2 bg-input border border-border rounded-lg text-foreground">
```

### Pattern 5: Icon Colors
```tsx
// BEFORE:
<Icon className="w-5 h-5 text-gray-400" />
<Icon className="w-5 h-5 text-gray-600" />

// AFTER:
<Icon className="w-5 h-5 text-muted-foreground" />
<Icon className="w-5 h-5 text-primary" />
```

## Theme Variable Reference

```css
/* Available in all themes */
--foreground: Main text color (always readable)
--muted-foreground: Secondary text (always readable)
--card: Card background
--card-foreground: Text on cards
--primary: Primary brand color
--primary-foreground: Text on primary color
--secondary: Secondary background
--secondary-foreground: Text on secondary
--border: Border color
--input: Input background
--accent: Accent color
--destructive: Error/danger color
```

## Testing Checklist

After making changes, test each theme:

1. ✅ **Light Mode**: All text clearly visible
2. ✅ **Dark Mode**: All text clearly visible
3. ✅ **Night Mode**: All text clearly visible

Test these pages in all three themes:
- Login page
- Public dashboard
- Admin dashboard
- Toll dashboard
- Vehicles page
- Violations page
- Payments page
- Settings page

## Critical Fix Areas

### Select/Input Elements
All select and input elements MUST have:
```tsx
className="bg-input border border-border text-foreground"
```

### Card Components
All cards MUST have:
```tsx
className="bg-card border border-border"
```

### Modal/Dialog
All modals MUST have:
```tsx
className="bg-card border border-border text-card-foreground"
```

### Table Cells
All table cells MUST use:
```tsx
className="text-foreground" // for main content
className="text-muted-foreground" // for secondary content
```

## Completed Fixes ✅

- ✅ Button.tsx
- ✅ Card.tsx  
- ✅ Modal.tsx
- ✅ DataTable.tsx
- ✅ ParkingMap.tsx
- ✅ Footer.tsx
- ✅ Charts.tsx
- ✅ Navbar.tsx
- ✅ Sidebar.tsx
- ✅ Login.tsx
- ✅ PublicDashboard.tsx
- ✅ DashboardLayout.tsx
- ✅ Theme CSS variables (all 3 themes with proper contrast)
- ✅ Custom CSS utilities

## Remaining Files to Fix

- [ ] AdminDashboard.tsx
- [ ] TollDashboard.tsx
- [ ] VehiclesPage.tsx
- [ ] ViolationsPage.tsx
- [ ] PaymentsPage.tsx
- [ ] ReportsPage.tsx
- [ ] SettingsPage.tsx
- [ ] SlotsPage.tsx

## Auto-Fix Script (if needed)

```bash
# Run this from project root to fix common patterns
find ./src -name "*.tsx" -type f -exec sed -i 's/text-gray-900/text-foreground/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/text-gray-800/text-foreground/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/text-gray-600/text-muted-foreground/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/text-gray-500/text-muted-foreground/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/text-gray-400/text-muted-foreground/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/bg-white/bg-card/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/bg-gray-50/bg-secondary/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/border-gray-200/border-border/g' {} +
find ./src -name "*.tsx" -type f -exec sed -i 's/border-gray-300/border-border/g' {} +
```
