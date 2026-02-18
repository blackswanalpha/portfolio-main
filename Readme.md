# Portfolio-Main

A modern, high-performance portfolio website built with Next.js 16, React 19, and Chakra UI v3. Features immersive 3D animations, dark mode, responsive design, and a comprehensive showcase of projects, experience, and testimonials.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI library |
| Chakra UI | 3.33.0 | Component library |
| Tailwind CSS | 4.x | Utility-first styling |
| Three.js | 0.183.0 | 3D graphics |
| Framer Motion | 12.x | Animations |
| Zustand | 5.0.11 | State management |
| TypeScript | 5.x | Type safety |

## Features

- **Hero Section** - Animated introduction with 3D background, stats, and CTAs
- **Projects Portfolio** - Filterable project grid with search and categories
- **Experience Timeline** - Interactive career history with achievements
- **Testimonials** - Client reviews with ratings and social proof
- **Contact Form** - Professional inquiry form with FAQ
- **Dark Mode** - System preference detection with manual toggle
- **Responsive Design** - Mobile-first with adaptive layouts
- **3D Animations** - Three.js powered hero background
- **Glassmorphism** - Modern UI with backdrop blur effects

## Project Structure

```
portfolio-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── projects/          # Projects pages
│   │   ├── experience/        # Experience page
│   │   └── testimonials/      # Testimonials page
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, MobileMenu
│   │   ├── sections/          # Hero, About, Contact, Testimonials
│   │   └── ui/                # Provider, GlassPanel, StatCard
│   └── theme/                 # Chakra UI theme & colors
├── public/                    # Static assets
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd portfolio-main

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

Create a `.env.local` file in the root directory for any environment-specific configuration:

```env
# Example variables (add as needed)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Folder Structure

### `/src/app`
Next.js App Router pages and layouts. Each route is a folder with a `page.tsx` file.

### `/src/components/layout`
Shared layout components:
- `Navbar.tsx` - Navigation bar with theme toggle
- `Footer.tsx` - Site footer
- `MobileMenu.tsx` - Mobile navigation

### `/src/components/sections`
Page-specific section components:
- `Hero.tsx` - Landing section
- `About.tsx` - Biography and skills
- `Contact.tsx` - Contact form
- `Testimonials.tsx` - Client reviews
- `Hero3DBackground.tsx` - Three.js background

### `/src/components/ui`
Reusable UI components and providers:
- `provider.tsx` - Chakra UI + theme provider
- `color-mode.tsx` - Theme toggle
- `GlassPanel.tsx` - Glassmorphism container
- `StatCard.tsx` - Statistics card

### `/src/theme`
Chakra UI theme configuration:
- `index.ts` - Theme system with semantic tokens
- `colors.ts` - Color palette definitions

## Theme System

The application uses a dual-theme system:
- **Chakra UI** - Component theming with semantic tokens
- **Tailwind CSS** - Utility classes with custom CSS variables

Dark mode is handled via `next-themes` with system preference detection.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for distribution.
