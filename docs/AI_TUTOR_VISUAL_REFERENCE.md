# 🎨 AI Tutor Demo - Visual Design Reference

## Complete Visual Breakdown

```
┌────────────────────────────────────────────────────────┐
│                AI TUTOR DEMO CARD                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ HEADER (green/5 to gold/5 gradient bg)          │ │
│  │ 🤖 AI Tutor                          🔴 Live    │ │
│  │ Always Ready to Help                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ CHAT AREA (white/30 to white/10 gradient)      │ │
│  │                                                  │ │
│  │        [Student Message - Right Aligned]        │ │
│  │  ╔════════════════════════════════════════╗    │ │
│  │  ║ Explain Binary Search in simple terms. ║    │ │
│  │  ╚════════════════════════════════════════╝    │ │
│  │  [Green gradient background]                   │ │
│  │                                                  │ │
│  │  [AI Response - Left Aligned]                  │ │
│  │  ╔════════════════════════════════════════╗    │ │
│  │  ║ Imagine searching a word in a          ║    │ │
│  │  ║ dictionary. Instead of checking        ║    │ │
│  │  ║ every page, you open the middle page   ║    │ │
│  │  ║ and decide whether to go left or right.║    │ │
│  │  ║ Binary Search works the same way.      ║    │ │
│  │  ║ ⏳ ⏳ ⏳                                   ║    │ │
│  │  ╚════════════════════════════════════════╝    │ │
│  │  [White/60 glass background]                   │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ FEATURES (white/40 glass bg)                    │ │
│  │ Powered by AI                                   │ │
│  │                                                  │ │
│  │  [🤖]           [📝]                            │ │
│  │  AI Tutor       Smart Notes                     │ │
│  │                                                  │ │
│  │  [📚]           [✍️]                             │ │
│  │  Exam Gen       Evaluation                      │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Card Style:                                          │
│  • Background: white/70 + backdrop-blur-2xl          │
│  • Border: white/50                                  │
│  • Radius: rounded-3xl                              │
│  • Shadow: shadow-2xl                               │
│  • Animation: Float (6s) + Glow (4s) + Hover       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Color Palette Reference

```
HEADER GRADIENT:
┌─────────────────────────────────────┐
│ from-green-primary/5 to-gold/5      │
│ Green Primary (Light) → Gold (Light)│
│ Subtle gradient for visual interest  │
└─────────────────────────────────────┘

STUDENT MESSAGE:
┌─────────────────────────────────────┐
│ from-green-primary to-green-secondary│
│ Deep Green → Olive Green            │
│ Vibrant gradient for student        │
│ White text (high contrast)           │
└─────────────────────────────────────┘

AI RESPONSE:
┌─────────────────────────────────────┐
│ bg-white/60 backdrop-blur-md        │
│ white/40 border                     │
│ Charcoal text (#1F2937)            │
│ Glass morphism effect                │
└─────────────────────────────────────┘

FEATURE CHIPS:
┌─────────────────────────────────────┐
│ bg-white/60 backdrop-blur-md        │
│ border-white/40                     │
│ Charcoal text                        │
│ Hover: Scale 1.05 + Lift            │
└─────────────────────────────────────┘

DECORATIVE ELEMENTS:
┌─────────────────────────────────────┐
│ Top-right: gold/20 (gradient to transparent)
│ Bottom-left: green-primary/10 (gradient to transparent)
│ Both: Blur-2xl + Positioned outside │
└─────────────────────────────────────┘
```

## Typography Reference

```
HEADER TEXT:
┌──────────────────────────────────────┐
│ "AI Tutor"                           │
│ Font-weight: 600 (semibold)         │
│ Size: sm (14px)                      │
│ Color: Charcoal (#1F2937)           │
│
│ "Always Ready to Help"              │
│ Font-weight: 400 (regular)          │
│ Size: xs (12px)                      │
│ Color: Gray-500 (#6B7280)           │
└──────────────────────────────────────┘

MESSAGES:
┌──────────────────────────────────────┐
│ Both Student and AI messages:       │
│ Font-weight: 400 (regular)          │
│ Size: sm (14px)                      │
│ Line-height: relaxed (1.625)        │
│ Max-width: xs (20rem)               │
└──────────────────────────────────────┘

FEATURE LABEL:
┌──────────────────────────────────────┐
│ "Powered by AI"                      │
│ Font-weight: 500 (medium)           │
│ Size: xs (12px)                      │
│ Text-transform: uppercase            │
│ Letter-spacing: widened              │
│ Color: Gray-500                      │
│
│ Feature names:                       │
│ Font-weight: 600 (semibold)         │
│ Size: xs (12px)                      │
│ Color: Charcoal                      │
└──────────────────────────────────────┘
```

## Message Bubble Styles

### Student Message (Right)
```
┌───────────────────────────────┐
│ Student: "Explain Binary..."  │
│                               │
│ Style:                        │
│ ├─ Gradient: Green Primary    │
│ ├─ to Green Secondary         │
│ ├─ Text: White               │
│ ├─ Rounded: 2xl              │
│ ├─ Sharp corner: top-right   │
│ ├─ Alignment: Right          │
│ ├─ Shadow: Soft              │
│ └─ Max-width: xs             │
└───────────────────────────────┘
```

### AI Response (Left)
```
┌───────────────────────────────┐
│ AI: "Imagine searching...     │
│     Binary Search works..."   │
│                               │
│ Style:                        │
│ ├─ Background: white/60       │
│ ├─ Backdrop: blur-md          │
│ ├─ Border: white/40           │
│ ├─ Text: Charcoal            │
│ ├─ Rounded: 2xl              │
│ ├─ Sharp corner: top-left    │
│ ├─ Alignment: Left           │
│ ├─ Shadow: Soft              │
│ └─ Max-width: xs             │
│                               │
│ Typing dots (after message):  │
│ ⏳ ⏳ ⏳                          │
│ (animated bounce, mt-2)       │
└───────────────────────────────┘
```

## Feature Chips Grid

```
┌──────────────────────────────────────────┐
│ FEATURE CHIPS (2x2 GRID)                │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ 🤖          │  │ 📝          │      │
│  │ AI Tutor    │  │ Smart Notes │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ 📚          │  │ ✍️           │      │
│  │ Exam Gen    │  │ Evaluation  │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
├──────────────────────────────────────────┤
│ Each Chip:                               │
│ • Background: white/60 glass            │
│ • Border: white/40                      │
│ • Rounded: xl                           │
│ • Icon: Large emoji (text-lg)          │
│ • Label: Small, bold (text-xs)         │
│ • Padding: p-3                          │
│ • Hover: scale-105 + lift 2px          │
│ • Transition: Smooth 300ms              │
└──────────────────────────────────────────┘
```

## Animation Timeline Visualization

```
TIME ┤
     │    Student Message
     │    ↓
     │    [FADE + SLIDE UP]
     │    ┃
0.0s ├────┃─────────────────────────
     │    ┃
     │    ┃    AI Response
0.3s ├────┃────↓
     │    ┃    [FADE + SLIDE UP]
     │    ┃    ┃
0.8s ├────┃────┃─────────────────────
     │    ┃    ┃
     │    ┃    ┃    Typing Indicator
     │    ┃    ┃    ↓
3.0s ├────┃────┃────[BOUNCE]
     │    ✓    ✓    ┃
     │         [PULSING DOT ANIMATION]
```

## Floating Animation (Infinite)

```
Y-POSITION OVER TIME (6 SECOND CYCLE):

0px   ├─────────────────────────────
      │      ╱╲
-6px  ├─────╱  ╲───────────────────
      │    ╱    ╲
-12px ├───╱      ╲
      │  ╱        ╲    ╱
0px   ├──────────╲─╱  ╱───
      │          ╰──╱
      │
      └─────────────────────────────
        0s    3s    6s    9s   12s

Animation:
y: [0, -12, 0]
duration: 6s
easing: easeInOut (smooth)
repeat: ∞ (infinite)

Speed: 2px per second (smooth, not jerky)
```

## Glow Pulse Animation (Infinite)

```
OPACITY OVER TIME (4 SECOND CYCLE):

Opacity
  │
1.0│
    │     ╱╲
0.8│    ╱  ╲
    │   ╱    ╲
0.6│  ╱      ╲    ╱╲
    │ ╱        ╲  ╱  ╲
0.4│           ╱      ╲
    │          ╱        ╲
0.2├─────────╱──────────╲─
    │
    └───────────────────────
      0s    2s    4s    6s

Shadow Animation:
0.1 → 0.2 → 0.1 (pulse)
duration: 4s
repeat: ∞ (infinite)

Effect: Subtle pulsing glow that draws attention
        without being distracting
```

## Responsive Breakpoint Visualization

```
DESKTOP (1024px+):
┌─────────────────────┬──────────────────┐
│   LEFT CONTENT      │  AI TUTOR DEMO   │
│   (40%)             │  (60%)           │
│                     │                  │
│   Heading           │   ┌────────────┐ │
│   Description       │   │ Chat       │ │
│   CTAs              │   │ Features   │ │
│   Stats             │   └────────────┘ │
│                     │   (Floating)     │
└─────────────────────┴──────────────────┘

TABLET (640-1023px):
┌──────────────────────────────────────┐
│   LEFT CONTENT                       │
│   (Full width)                       │
│                                      │
│   Heading                            │
│   Description                        │
│   CTAs                               │
│   Stats                              │
│                                      │
│   [AI Tutor Demo Hidden]             │
└──────────────────────────────────────┘

MOBILE (< 640px):
┌──────────────────────┐
│ LEFT CONTENT         │
│ (Full width)         │
│                      │
│ Heading              │
│ Description          │
│ CTAs                 │
│ Stats                │
│                      │
│ [AI Tutor Hidden]    │
└──────────────────────┘
```

## Design System Quick Reference

| Element | Property | Value |
|---------|----------|-------|
| **Card Background** | opacity | 70% |
| **Backdrop Blur** | amount | 2xl (32px) |
| **Border** | opacity | 50% |
| **Border Radius** | size | rounded-3xl (24px) |
| **Shadow** | intensity | shadow-2xl |
| **Glow Min** | opacity | 0.1 (10%) |
| **Glow Max** | opacity | 0.2 (20%) |
| **Float Range** | pixels | -12 to 0px |
| **Float Duration** | time | 6s |
| **Glow Duration** | time | 4s |
| **Chip Hover Scale** | multiplier | 1.05x |
| **Chip Hover Lift** | pixels | -2px |

---

This visual reference provides everything needed to understand, customize, and maintain the AI Tutor demo design.
