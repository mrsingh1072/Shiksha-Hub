# 🎨 Component Reference Guide

## Overview
This guide provides a quick reference for all components used in the Shiksha Hub landing page.

## Components Directory

### Navigation & Layout

#### `Navbar.jsx`
**Purpose**: Main navigation bar component
- Sticky positioning at top
- Desktop and mobile responsive
- Mobile hamburger menu toggle
- Links: Features, For Students, For Teachers, Pricing, FAQ
- CTA buttons: Sign In, Get Started
- Animated entrance from top
**Key Props**: None (internal state managed)
**Styling**: Glass effect with semi-transparent background

---

### Hero Section

#### `Hero.jsx`
**Purpose**: Main hero section with 3D scene
- Full viewport height with scrollable content
- Integrates 3D Scene3D component
- Gradient overlay for text readability
- Call-to-action buttons
- Statistics display (50K+ students, 10K+ teachers, 99% success rate)
- Scroll indicator animation
**Features**:
- Animated container with staggered children
- Gradient text effect
- Two CTA buttons (Primary & Secondary)
- Responsive on mobile, tablet, desktop
**Animation**: Framer Motion with fade and slide effects

#### `Scene3D.jsx`
**Purpose**: Three.js 3D scene with educational elements
- Particle field background
- Rotating box (book representation)
- Floating book with animation
- Graduation cap with rotation
- Lighting setup with ambient and point lights
**Components**:
- `ParticleField()`: 500 animated particles
- `RotatingBox()`: Represents a book
- `FloatingBook()`: Floating animated book
- `GraduationCap()`: Animated graduation cap
**Interaction**: Continuous smooth animation loop

---

### Trust & Features

#### `TrustedBy.jsx`
**Purpose**: Social proof section
- Shows trusted institutions
- Grid layout of company logos
- Hover scale effect on cards
- Staggered animation entry
**Content**: 6 educational institutions with emoji icons
**Styling**: Gray cards with green hover state

#### `WhyShiksha Hub.jsx`
**Purpose**: Key features showcase
- Dark green background with white text
- 4 feature cards in grid
- Icons for each feature:
  - BookOpen (Personalized Learning)
  - Zap (Instant Assistance)
  - BarChart3 (Progress Tracking)
  - Users (Community Learning)
- Glassmorphic card design
**Animation**: Staggered appearance with scale effect

---

### Feature Showcases

#### `AITutor.jsx`
**Purpose**: AI Tutor feature showcase
- Two-column layout (desktop)
- Left: Content with feature list
- Right: Visual mockup (chat-like interface)
- Three features with icons
- Primary CTA button
**Visual**: Green to secondary gradient card on right

#### `NotesGenerator.jsx`
**Purpose**: Notes generation feature
- Alternating layout (visual left, content right)
- Shows example notes structure
- Three benefits with icons
- Secondary CTA button
**Visual**: White card with note preview

#### `ExamGenerator.jsx`
**Purpose**: Practice exam creation feature
- Two-column layout (content left, visual right)
- Shows exam interface mockup
- Multiple choice questions visualization
- Three features with icons
- Primary CTA button
**Visual**: Green/secondary gradient card

#### `AssignmentEval.jsx`
**Purpose**: Assignment grading feature
- Visual left (grades visualization)
- Content right with features
- Shows score and subject performance
- Three benefits with icons
- Secondary CTA button
**Visual**: Card with progress bars

---

### Dashboards & Analytics

#### `Dashboard.jsx`
**Purpose**: Analytics dashboard preview
- Dark background with gradient
- Statistics grid (4 metrics)
- Two-column analytics display:
  - Left: Weekly learning hours (bar chart)
  - Right: Subject performance (progress bars)
- Animated progress bar fills on scroll
**Content**: 7 days of hours, 5 subjects with scores
**Styling**: Glassmorphic cards on dark background

#### `Analytics.jsx`
**Purpose**: Performance analytics & leaderboard
- Two-column layout
- Left: Leaderboard with 5 users
- Right: Performance stats (4 metrics)
- Medal emojis for ranking
- Gradient cards for each stat
**Data**: User scores, streaks, performance metrics
**Styling**: Premium card design with gradient backgrounds

---

### Features by Role

#### `StudentFeatures.jsx`
**Purpose**: Student-specific features
- 4 feature cards in responsive grid
- Icons for each feature:
  - Lightbulb (Smart Learning Path)
  - Trophy (Achievement Tracking)
  - BookMarked (Resource Library)
  - Zap (Quick Review Mode)
- Hover lift effect
- Icon rotation animation on appear
**Background**: White with gradient to cream
**Styling**: Card design with shadows

#### `TeacherFeatures.jsx`
**Purpose**: Teacher-specific features
- 4 feature cards on dark green background
- Icons for each feature:
  - Users (Class Management)
  - BarChart3 (Advanced Analytics)
  - ClipboardList (Assignment Creation)
  - Settings (Customizable Assessments)
- Glassmorphic cards
- Gold accents
**Styling**: Dark theme with white/gold text

---

### Social & Engagement

#### `Testimonials.jsx`
**Purpose**: User testimonials and reviews
- 4 testimonial cards in responsive grid
- Star ratings (5 stars each)
- User name, role, and quote
- Avatar emoji
- Hover lift effect
**Content**: Mix of students, teachers, professors
**Styling**: White cards with gold border on hover

#### `FAQ.jsx`
**Purpose**: Frequently asked questions
- Accordion-style expandable items
- 6 common questions with answers
- Smooth expand/collapse animation
- ChevronDown icon that rotates
- First item open by default
**Interaction**: Click to toggle, only one open at a time
**Styling**: Card design with border separators

---

### Calls to Action

#### `CTA.jsx`
**Purpose**: Final conversion section
- Dark gradient background (green primary to secondary)
- Large headline with gold accent
- Description text
- Two CTA buttons (Primary gold, Secondary outlined)
- Three benefits listed below
**Animation**: Staggered entrance animation
**Styling**: Full-width section with centered content

#### `Footer.jsx`
**Purpose**: Footer with links and info
- Brand section with logo
- 4 link columns:
  - Product (Features, Pricing, Security, Roadmap)
  - Company (About, Blog, Careers, Contact)
  - Resources (Documentation, API, Community, Support)
  - Legal (Privacy, Terms, Cookie Policy, License)
- Social media links (Twitter, LinkedIn, GitHub, Email)
- Copyright notice
- Dark background
**Styling**: Professional footer layout with hover effects

---

## Styling System

### Global Classes (index.css)

#### Button Classes
- `.btn-primary`: Green background, white text, glow effect
- `.btn-secondary`: White background, green text, green border
- `.btn-outline`: Transparent with green border

#### Card Classes
- `.card`: White background with shadow, hover lift effect
- `.glass`: Semi-transparent with backdrop blur
- `.glass-dark`: Dark version of glass effect

#### Text Classes
- `.gradient-text`: Green to secondary gradient on text
- `.accent-underline`: Gold underline on text

#### Layout Classes
- `.section`: Padding for sections (py-20 md:py-28 lg:py-32)
- `.section-container`: Max width container (max-w-7xl)

### Color Variables (tailwind.config.js)
```
cream: #F8F6F0
green-primary: #2F5D50
green-secondary: #6B8E23
gold: #D4A017
text: #1F2937
dark: #222222
```

---

## Animation Patterns

### Scroll-Triggered Animation
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* content */}
</motion.div>
```

### Staggered Container
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

### Hover Effects
```jsx
<motion.div
  whileHover={{ scale: 1.05, y: -10 }}
  whileTap={{ scale: 0.95 }}
>
```

---

## Responsive Breakpoints

All components are responsive using Tailwind breakpoints:
- **Base**: Mobile (0px)
- **sm**: 640px
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)
- **xl**: 1280px (Large Desktop)

---

## Key Design Decisions

1. **No Glassmorphism Everywhere**: Used sparingly only in WhyShiksha Hub and Dashboard
2. **Color Consistency**: Green primary for most sections, alternating dark for contrast
3. **Animation Restraint**: Smooth, purposeful animations, no excessive effects
4. **Typography Hierarchy**: Clear h1, h2, h3 size progression
5. **Spacing**: Consistent use of Tailwind spacing scale
6. **Icons**: All from Lucide React for consistency
7. **Dark Mode Consideration**: Included dark background sections

---

## Performance Optimizations

- Lazy loading with React Suspense in Hero (3D scene)
- Component code splitting via dynamic imports
- CSS minification via Tailwind
- JavaScript minification via Vite
- Image optimization (emojis used instead of images)
- Smooth animations with transform and opacity only

---

## Accessibility Considerations

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast
- Touch-friendly button sizes (min 44px)
- Focus states on buttons

---

## Future Enhancements

- Add image assets for better visual hierarchy
- Implement dark mode toggle
- Add form validation and handling
- Integrate analytics tracking
- Add video sections
- Implement lazy loading for images
- Add search functionality
- Create admin dashboard preview
