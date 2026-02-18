# Portfolio-Main: Comprehensive Explanation

## Overview

Portfolio-Main is a modern, high-performance personal portfolio website for Victor Mbugua, a Full Stack Developer and UI/UX Designer. The application showcases professional work, experience, and skills through an elegant, responsive interface with immersive 3D animations and smooth transitions.

## What the Application Does

The portfolio serves as a digital resume and showcase platform featuring:

- **Hero Section**: Introduction with animated profile, availability status, professional title, and call-to-action buttons
- **About Section**: Detailed biography, professional timeline, skills visualization, and personal interests
- **Projects Portfolio**: Filterable grid of projects with categories, tech stacks, and live demo links
- **Experience Timeline**: Interactive career history with achievements and technologies used
- **Testimonials**: Client reviews with ratings, featured testimonials, and social proof
- **Contact Form**: Professional contact form with service inquiry options and FAQ section

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 |
| Component Library | Chakra UI v3.33.0 |
| Styling | Tailwind CSS v4 |
| 3D Graphics | Three.js with @react-three/fiber & @react-three/drei |
| Animations | Framer Motion 12, GSAP 3 |
| State Management | Zustand 5.0.11 |
| Theme Management | next-themes 0.4.6 |
| Icons | Lucide React, React Icons |
| Validation | Zod 4.3.6 |
| Language | TypeScript 5 |

## Project Structure

```
portfolio-main/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout with provider
│   │   ├── globals.css        # Global styles & animations
│   │   ├── projects/          # Projects listing & details
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── experience/        # Experience timeline
│   │   │   └── page.tsx
│   │   └── testimonials/      # Testimonials page
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── sections/          # Page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── Hero3DBackground.tsx
│   │   └── ui/                # Reusable UI components
│   │       ├── provider.tsx
│   │       ├── color-mode.tsx
│   │       ├── GlassPanel.tsx
│   │       └── StatCard.tsx
│   └── theme/
│       ├── index.ts           # Chakra UI theme configuration
│       └── colors.ts          # Color palette definitions
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Key Features

### 1. Hero Section
- Animated availability badge with pulse effect
- Gradient text typography
- Professional profile image with hover effects
- Quick statistics row (experience, projects, clients, technologies)
- CTA buttons for viewing projects and downloading CV
- Social proof with company logos

### 2. Projects Portfolio
- Category-based filtering (Web Development, Mobile Apps, UI/UX Design)
- Search functionality
- Sort options (Newest, Oldest, Alphabetical)
- Project cards with hover animations
- Technology tags display
- Live demo and details links

### 3. Experience Timeline
- Alternating left/right timeline layout
- Current role indicator
- Achievement highlights
- Technology badges
- Responsive vertical timeline on mobile

### 4. Testimonials
- Aggregate rating display (4.9/5)
- Rating breakdown bars
- Featured testimonial with gradient background
- Filterable review grid
- Company logo integration

### 5. Contact Form
- Full name and email fields
- Service type dropdown (Web Development, UI/UX Design, Full Stack, Consultation)
- Project details textarea
- Contact information sidebar
- Social media links
- Interactive FAQ accordion

### 6. Dark Mode
- System preference detection
- Manual toggle in navbar
- Smooth theme transitions
- Persistent theme preference

### 7. Responsive Design
- Mobile-first approach
- Breakpoints: base (mobile), sm, md, lg
- Adaptive layouts using CSS Grid and Flexbox
- Touch-friendly interactions

## Component Organization

### Layout Components (`/components/layout/`)
- **Navbar**: Fixed navigation with logo, links, and theme toggle
- **Footer**: Site footer with social links and copyright
- **MobileMenu**: Responsive hamburger menu for mobile devices

### Section Components (`/components/sections/`)
- **Hero**: Main landing section with 3D background support
- **About**: Biography, timeline, skills, and interests
- **Contact**: Form and contact information
- **Testimonials**: Client reviews and ratings
- **Hero3DBackground**: Three.js animated sphere background

### UI Components (`/components/ui/`)
- **provider.tsx**: Chakra UI + next-themes provider wrapper
- **color-mode.tsx**: Theme toggle button component
- **GlassPanel.tsx**: Reusable glassmorphism panel
- **StatCard.tsx**: Statistics display card

## Theme System & Styling

### Color Palette
Defined in `src/theme/colors.ts`:
- **Primary**: Blue scale (#2e6eb8 base) with 50-900 shades
- **Background**: Light (#f6f7f8) / Dark (#13191f)
- **Surface**: Light (#ffffff) / Dark (#1a2129)
- **Text**: Primary, secondary, muted variants for both modes
- **Glass**: Semi-transparent backgrounds with blur effects

### Styling Approach
1. **Tailwind CSS v4**: Utility-first styling with custom theme variables
2. **Chakra UI v3**: Component-level styling with semantic tokens
3. **CSS Modules**: Custom animations (pulse, shimmer, fade-in-up)
4. **Glassmorphism**: Backdrop blur effects with glass-panel utility class

### Semantic Tokens
The theme uses semantic tokens for automatic dark mode support:
- `text.primary`, `text.secondary`, `text.muted`
- `background`, `surface`
- `border.DEFAULT`
- `glass.bg`, `glass.border`

### Animation System
- **Framer Motion**: Page transitions and interactive animations
- **GSAP**: Complex timeline animations
- **CSS Keyframes**: pulse, shimmer for subtle effects
- **Three.js**: 3D sphere with distortion material for hero background
