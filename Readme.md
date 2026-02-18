<div align="center">

# Portfolio-Main

**A modern, high-performance portfolio website for Victor Mbugua**

Built with Next.js 16, React 19, and Chakra UI v3

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-3.33.0-319795?style=flat-square&logo=chakra-ui)](https://chakra-ui.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/blackswanalpha/portfolio-main/issues) · [Request Feature](https://github.com/blackswanalpha/portfolio-main/issues)

</div>

---

## 📖 Overview

Portfolio-Main is a stunning personal portfolio website showcasing professional work, experience, and skills through an elegant, responsive interface with immersive 3D animations and smooth transitions. It serves as a digital resume and showcase platform for **Victor Mbugua**, a Full Stack Developer & UI/UX Designer.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Hero Section** | Animated landing with 3D background, availability status, stats, and CTAs |
| 📁 **Projects Portfolio** | Filterable project grid with search, categories, and pagination |
| 💼 **Experience Timeline** | Interactive career history with achievements and technologies |
| 💬 **Testimonials** | Client reviews with ratings, featured highlights, and social proof |
| 📧 **Contact Form** | Professional inquiry form with service types and FAQ accordion |
| 🌓 **Dark Mode** | System preference detection with smooth manual toggle |
| 📱 **Responsive Design** | Mobile-first approach with adaptive layouts |
| 🎨 **3D Animations** | Three.js powered hero background with interactive elements |
| 💎 **Glassmorphism** | Modern UI with backdrop blur effects |

## 🛠️ Tech Stack

### Frontend Framework
| Technology | Version | Description |
|------------|---------|-------------|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework with App Router |
| [React](https://reactjs.org/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |

### UI & Styling
| Technology | Version | Description |
|------------|---------|-------------|
| [Chakra UI](https://chakra-ui.com/) | 3.33.0 | Component library |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Theme management |

### Animation & 3D
| Technology | Version | Description |
|------------|---------|-------------|
| [Three.js](https://threejs.org/) | 0.183.0 | 3D graphics library |
| [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) | 9.5.0 | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10.7.7 | Useful helpers for R3F |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Animation library |
| [GSAP](https://greensock.com/gsap/) | 3.14.2 | Advanced animations |

### State & Utilities
| Technology | Version | Description |
|------------|---------|-------------|
| [Zustand](https://github.com/pmndrs/zustand) | 5.0.11 | State management |
| [Zod](https://zod.dev/) | 4.3.6 | Schema validation |
| [Lucide React](https://lucide.dev/) | 0.574.0 | Icon library |
| [React Icons](https://react-icons.github.io/react-icons/) | 5.5.0 | Icon collection |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blackswanalpha/portfolio-main.git
   cd portfolio-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint for code linting |

## 📁 Project Structure

```
portfolio-main/
├── public/                        # Static assets
│   ├── images/                   # Image assets
│   └── fonts/                    # Custom fonts
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles & animations
│   │   ├── projects/            # Projects section
│   │   │   ├── page.tsx         # Projects listing
│   │   │   └── [id]/page.tsx    # Project details
│   │   ├── experience/          # Experience timeline
│   │   │   └── page.tsx
│   │   └── testimonials/        # Testimonials page
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.tsx       # Navigation bar
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   └── MobileMenu.tsx   # Mobile navigation
│   │   ├── sections/            # Page sections
│   │   │   ├── Hero.tsx         # Hero landing section
│   │   │   ├── About.tsx        # About & skills
│   │   │   ├── Contact.tsx      # Contact form
│   │   │   ├── Testimonials.tsx # Client testimonials
│   │   │   └── Hero3DBackground.tsx  # Three.js background
│   │   └── ui/                  # Reusable UI components
│   │       ├── provider.tsx     # Chakra + Theme provider
│   │       ├── color-mode.tsx   # Theme toggle
│   │       ├── GlassPanel.tsx   # Glassmorphism container
│   │       └── StatCard.tsx     # Statistics card
│   └── theme/                   # Chakra UI configuration
│       ├── index.ts             # Theme definition
│       └── colors.ts            # Color palette
├── .env.example                  # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

## 🎨 Theming

### Color Palette

The application uses a custom color system with semantic tokens for automatic dark mode support:

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Primary | `#2E6EB8` | `#4A90D9` | Buttons, links, highlights |
| Background | `#F6F7F8` | `#13191F` | Page background |
| Surface | `#FFFFFF` | `#1A2129` | Cards, panels |
| Text Primary | `#1A202C` | `#F7FAFC` | Main text |
| Text Secondary | `#4A5568` | `#A0AEC0` | Secondary text |

### Dark Mode

Dark mode is implemented using `next-themes` with:
- System preference detection
- Manual toggle in navbar
- Persistent theme preference
- Smooth transitions between themes

## 🔗 Backend Integration

This frontend connects to the [Portfolio Backend API](https://github.com/blackswanalpha/portfolio_backend) for:

- Project data management
- Work experience entries
- Testimonials storage
- Contact form submissions
- Analytics tracking

Configure the backend URL in your environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/blackswanalpha/portfolio-main)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

### Docker

```bash
# Build the image
docker build -t portfolio-main .

# Run the container
docker run -p 3000:3000 portfolio-main
```

### Static Export

```bash
# Build static export
npm run build

# Output in ./out directory
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Public URL of your site | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Victor Mbugua**

- Website: [victormbugua.com](https://victormbugua.com)
- GitHub: [@blackswanalpha](https://github.com/blackswanalpha)
- LinkedIn: [Victor Mbugua](https://linkedin.com/in/victormbugua)

---

<div align="center">

**[⬆ Back to Top](#portfolio-main)**

Made with ❤️ by Victor Mbugua

</div>
