# 🎨 Hero Section - Visual Reference Guide

## Dashboard Card Visual Breakdown

```
┌────────────────────────────────────────────────────────┐
│ GLASSMORPHIC PREMIUM DASHBOARD CARD                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Background: white/70 opacity                         │
│  Backdrop: blur-2xl (ultra-smooth)                    │
│  Border: white/50 (subtle definition)                 │
│  Shadow: 2xl (premium depth)                          │
│  Rounded: 3xl (premium corners)                       │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║                                            [👤]     ║ │
│  ║  Student Dashboard                                ║ │
│  ║  Alex Johnson                                     ║ │
│  ╠═══════════════════════════════════════════════════╣ │
│  ║                                                   ║ │
│  ║  ┌─────────────┐  ┌─────────────┐               ║ │
│  ║  │ Assignments │  │ Notes       │               ║ │
│  ║  │    12/15    │  │    28       │               ║ │
│  ║  │ Submitted   │  │ Generated   │               ║ │
│  ║  └─────────────┘  └─────────────┘               ║ │
│  ║                                                   ║ │
│  ║  ┌─────────────┐  ┌─────────────┐               ║ │
│  ║  │ Exams       │  │ Progress    │               ║ │
│  ║  │     8       │  │    87%      │               ║ │
│  ║  │ Attempted   │  │ Overall     │               ║ │
│  ║  └─────────────┘  └─────────────┘               ║ │
│  ║                                                   ║ │
│  ╠═══════════════════════════════════════════════════╣ │
│  ║                                                   ║ │
│  ║  Weekly Activity                                ║ │
│  ║  ▁ ▃ ▁ ▆ ▄ █ ▅                                 ║ │
│  ║  M T W T F S S                                 ║ │
│  ║                                                   ║ │
│  ╠═══════════════════════════════════════════════════╣ │
│  ║                                                   ║ │
│  ║  ┌─────────────┐  ┌─────────────┐               ║ │
│  ║  │ AI Usage    │  │ Last Active │               ║ │
│  ║  │    156      │  │ Today 2:30  │               ║ │
│  ║  │ This Month  │  │ PM          │               ║ │
│  ║  └─────────────┘  └─────────────┘               ║ │
│  ║                                                   ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                        │
│  Floating: Gentle -10px to 0px up/down (6s loop)    │
│  Glow: Pulsing shadow effect (4s cycle)             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Color Palette In Use

```
┌──────────────────────────────────────────────────────┐
│ COLOR SYSTEM                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Primary Text & Borders                             │
│ ■ Green Primary (#2F5D50)                          │
│   Used: Headlines, "Assignments", main borders     │
│                                                      │
│ Accent & Highlights                                │
│ ■ Gold (#D4A017)                                   │
│   Used: "Notes", "Progress", accents               │
│                                                      │
│ Secondary Gradient                                  │
│ ■ Green Secondary (#6B8E23)                        │
│   Used: Chart bars, "Exams", gradients             │
│                                                      │
│ Background                                          │
│ ■ White (#FFFFFF)                                  │
│   Used: Card main background (70% opacity)         │
│                                                      │
│ Page Background                                     │
│ ■ Cream (#F8F6F0)                                  │
│   Used: Page base color                            │
│                                                      │
│ Secondary Text                                      │
│ ■ Gray-500 (#6B7280)                              │
│   Used: Labels, descriptions, secondary info       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Text Hierarchy

```
BADGE
─────────────────────────────────────────
✨ AI-Powered Learning
Size: sm, Weight: 600, Color: green-primary/10 bg


HEADING (H1)
─────────────────────────────────────────
Learn
Smarter with AI

Size: 5xl-7xl (responsive)
Weight: 700 (bold)
Color: Mixed (green-primary + gradient-text)
Line-height: tight


DESCRIPTION (P)
─────────────────────────────────────────
Get personalized AI tutoring, instant study notes,
smart exam prep, and real-time assignment feedback.
Designed for students who want to excel.

Size: lg-xl (responsive)
Weight: 400
Color: gray-600
Line-height: relaxed


STAT LABELS
─────────────────────────────────────────
Students    Teachers    Success Rate
Size: sm, Weight: 600, Color: gray-500
Uppercase, letter-spacing


STAT VALUES
─────────────────────────────────────────
50K+    10K+    99%
Size: 2xl-3xl, Weight: 700, Color: green-primary
```

## Interactive States

### Button Hover
```
Before:
┌───────────────┐
│ Start Trial   │ (Green bg, normal shadow)
└───────────────┘

After:
┌───────────────┐
│ Start Trial   │ (Green bg, lifted 5px, large shadow)
└───────────────┘
Hover scale: 1.05
Shadow: glow-lg effect
```

### Stats Card Hover
```
Before:
┌──────────────┐
│ Assignments  │ (white/40 bg)
│   12/15      │
└──────────────┘

After:
      ↑ 4px
┌──────────────┐
│ Assignments  │ (white/40 bg)
│   12/15      │
└──────────────┘
Translation: y -4px
Smooth transition
```

### Chart Bar Hover
```
Before:
█ (normal opacity)

After:
█ (opacity: 1, fully visible)
Smooth transition
```

## Animation Timeline

```
TOTAL ANIMATION DURATION: ~2 seconds for full entry

0.0s
├─ Page starts loading
├─ Background gradients fade in
└─ Content area ready

0.2s
├─ [STAGGER BEGINS]
└─ Badge element starts appearing

0.35s
├─ Heading (h1) fades and slides up
└─ Background changes to gradient-text

0.5s
├─ Description paragraph appears
└─ Dashboard card starts sliding from right

0.65s
├─ CTA buttons enter and appear ready to click
└─ Dashboard card 3D perspective applied

0.8s
├─ Stats row appears below CTAs
├─ Chart bars start animated fill
└─ Dashboard fully visible

1.0s+
├─ Dashboard floating motion begins
├─ Glow effect starts pulsing
├─ Chart animation completes
└─ Page is fully interactive

∞ (Infinite loops)
├─ Dashboard floating: -10 to 0px (6s cycle)
├─ Glow pulsing: 0.1 to 0.2 opacity (4s cycle)
├─ Scroll indicator bouncing: 0-10px (2.5s cycle)
└─ Weekly bars: 30-70% height varying
```

## Responsive Breakpoints

```
MOBILE (< 640px)
───────────────────────────────────
┌─────────────────────┐
│                     │
│  [LEFT CONTENT]     │
│  • Badge            │
│  • Heading (4xl)    │
│  • Description      │
│  • 2 Buttons        │
│  • 3 Stats          │
│                     │
│ (Dashboard hidden)  │
│                     │
└─────────────────────┘


TABLET (640px - 1024px)
───────────────────────────────────
┌─────────────────────────────────┐
│                                 │
│      [LEFT CONTENT]             │
│      • Badge                    │
│      • Heading (5xl)            │
│      • Description              │
│      • 2 Buttons                │
│      • 3 Stats                  │
│                                 │
│    (Dashboard still hidden)     │
│                                 │
└─────────────────────────────────┘


DESKTOP (> 1024px)
───────────────────────────────────
┌──────────────────┬──────────────────┐
│                  │                  │
│  LEFT CONTENT    │  DASHBOARD CARD  │
│  • Badge         │  ┌──────────────┐│
│  • Heading (6xl) │  │ Real Product │││
│  • Description   │  │ Dashboard    │││
│  • 2 Buttons     │  └──────────────┘│
│  • 3 Stats       │  Floating...    │
│                  │  Glowing...     │
│                  │                  │
└──────────────────┴──────────────────┘
```

## Component Spacing

```
HERO SECTION PADDING
├─ Top: pt-24 (6rem from navbar)
└─ Bottom: pb-16 (4rem)

GRID GAP
├─ Desktop: gap-16 (4rem between columns)
└─ Mobile: gap-12 (3rem stacked)

CARD INTERNAL PADDING
├─ p-8 (2rem padding on all sides)
└─ Maintains 12:1 ratio for content

STAT GRID SPACING
├─ gap-4 (1rem between stat cards)
└─ Responsive grid with 2 columns

TEXT SPACING
├─ Badge → Heading: mb-6
├─ Heading → Description: mb-6
├─ Description → Buttons: mb-8
└─ Buttons → Stats: mb-12
```

## Shadow & Depth

```
CARD SHADOW
shadow-2xl
├─ X-offset: 0
├─ Y-offset: 25px
├─ Blur: 50px
└─ Spread: 0
└─ Color: rgba(0,0,0,0.15)

GLOW EFFECT
Animated box-shadow
├─ Min: 0 0 60px rgba(47,93,80,0.1)
├─ Peak: 0 0 80px rgba(47,93,80,0.2)
└─ Cycle: 4 seconds infinite

OUTER GLOW DECORATIVE
├─ Top-right: gold/20 32x32 blur-2xl
└─ Bottom-left: green/10 24x24 blur-2xl
```

## Glassmorphism Layers

```
LAYER 1: Base Background
├─ Color: white
├─ Opacity: 70% (0.7)
└─ Effect: Base solid color

LAYER 2: Backdrop Blur
├─ Type: blur-2xl
├─ Amount: 16px blur
└─ Effect: Frosted glass appearance

LAYER 3: Border
├─ Color: white
├─ Opacity: 50% (0.5)
├─ Width: 1px
└─ Effect: Subtle definition

LAYER 4: Internal Gradient
├─ Direction: Diagonal (br)
├─ From: green-primary/10
├─ Via: transparent
├─ To: gold/10
└─ Effect: Subtle color tint

RESULT: Premium frosted glass effect with color depth
```

## SVG/Icon Usage

### Student Avatar
```
W-12 h-12 (3rem)
Gradient: green-primary to green-secondary
Rounded-full (circle)
No inner content (solid color)
```

### Stats Icons (None - Clean Design)
```
NO ICONS used in stats
✗ Avoided icon clutter
✗ Avoided generic AI symbols
✓ Clean text-based design
✓ Professional appearance
```

---

## Quick Reference Sizes

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Heading | text-4xl | text-5xl | text-6xl |
| Description | text-lg | text-lg | text-xl |
| Stats Value | text-2xl | text-2xl | text-3xl |
| Card Width | 100% | 100% | 60% |
| Grid Gap | 12 | 12 | 16 |

---

This visual guide shows exactly how the new Hero section is structured, styled, and animated to create a premium, product-focused landing page experience.
