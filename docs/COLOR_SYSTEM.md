# Rexi Creator Color System

This document outlines the new "Modern & Advanced" color palette for the Rexi Creator application. The system is designed to be concise, professional, and accessible (WCAG 2.1 AA+).

## Core Palette

### Primary (Brand)
Used for primary actions, active states, and brand emphasis.
- **Color**: Deep Royal Blue (Blue 800)
- **Hex**: `#1E40AF`
- **RGB**: `30, 64, 175`
- **HSL**: `224, 71%, 40%`
- **Contrast**: 9.65:1 against White (AAA)

### Secondary (Surface/Muted)
Used for secondary actions, backgrounds, and muted elements.
- **Color**: Slate 100
- **Hex**: `#F1F5F9`
- **RGB**: `241, 245, 249`
- **HSL**: `210, 40%, 96%`

### Foreground (Text)
Used for primary text and headings.
- **Color**: Slate 900
- **Hex**: `#0F172A`
- **RGB**: `15, 23, 42`
- **HSL**: `222, 47%, 11%`

### Background
Base canvas color.
- **Color**: White
- **Hex**: `#FFFFFF`
- **RGB**: `255, 255, 255`
- **HSL**: `0, 0%, 100%`

## Semantic Colors

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `destructive` | `#EF4444` | `0 84% 60%` | Critical errors, destructive actions |
| `success` | `#16A34A` | `142 76% 36%` | Success states, confirmations |
| `warning` | `#F59E0B` | `38 92% 50%` | Warnings, attention required |
| `muted` | `#F1F5F9` | `210 40% 96%` | De-emphasized backgrounds |
| `border` | `#E2E8F0` | `214 32% 91%` | Borders, dividers |

## Dark Mode Adaptation

The system automatically inverts to a "Deep Slate" theme in dark mode.

- **Background**: `#0F172A` (Slate 950)
- **Foreground**: `#F8FAFC` (Slate 50)
- **Primary**: `#3B82F6` (Blue 500) - Lightened for better visibility on dark backgrounds.
- **Surface**: `#1E293B` (Slate 900)

## Usage Guidelines

1. **Text Contrast**: Always use `text-foreground` on `bg-background` or `bg-card`.
2. **Interactive Elements**: Use `bg-primary` with `text-primary-foreground` (White/Slate 50) for primary buttons.
3. **Borders**: Use `border-border` (Slate 200) for subtle separation.
4. **Hover States**:
   - Buttons: Darken by 10% (Light Mode) or Lighten by 10% (Dark Mode).
   - Cards: Add shadow or slight translation.

## CSS Variables

The system is implemented using CSS Custom Properties in `globals.css`:

```css
:root {
  --primary: 224 71% 40%;
  --secondary: 210 40% 96.1%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  /* ... */
}
```
