export const portfolioContext = {
  name: "Victor Mbugua",
  title: "Full Stack Developer & UI/UX Designer",
  location: "Nairobi, Kenya (open to remote)",
  status: "Available for new projects",
  bio: "I craft high-end digital experiences that blend aesthetic beauty with robust engineering. Specialized in building scalable web applications and intuitive user interfaces for forward-thinking brands.",
  skills: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Node.js",
    "Three.js / WebGL",
    "Tailwind CSS",
    "Chakra UI",
    "Figma",
    "PostgreSQL",
    "FastAPI",
    "Docker",
  ],
  stats: {
    years: "5+",
    projects: "40+",
    clients: "25+",
    technologies: "12+",
  },
  projects: [
    {
      name: "Nova Financial Analytics",
      description:
        "Real-time fintech dashboard for market data visualization built with React, D3.js, and a Node backend.",
      tags: ["React", "D3.js", "Node.js"],
    },
    {
      name: "Luxe Fashion Store",
      description:
        "Complete UX redesign of a high-end e-commerce experience focused on conversion optimization.",
      tags: ["UX Research", "Shopify", "Figma"],
    },
    {
      name: "Cogni Chat",
      description:
        "Next-generation AI chat interface powered by large language models with a polished glassmorphism UI.",
      tags: ["OpenAI", "Tailwind", "Next.js"],
    },
  ],
  experience: [
    {
      role: "Lead Full Stack Engineer",
      company: "Fintech Studio",
      period: "2022 - Present",
      summary:
        "Architecting a microservices platform serving 500k+ users daily across three availability zones.",
    },
    {
      role: "Senior Frontend Engineer",
      company: "DesignAgency",
      period: "2020 - 2022",
      summary:
        "Led design-system adoption and shipped React + Next.js apps for international clients.",
    },
    {
      role: "Full Stack Developer",
      company: "StartupCo",
      period: "2018 - 2020",
      summary:
        "Built and launched MVPs for early-stage startups in fintech, healthtech and SaaS.",
    },
  ],
  contact: {
    email: "kamandembugua18@gmail.com",
    location: "Nairobi, Kenya (Remote)",
    links: [
      { label: "GitHub", handle: "@victormbugua" },
      { label: "LinkedIn", handle: "in/victormbugua" },
      { label: "Twitter", handle: "@victormbugua" },
      { label: "Dribbble", handle: "victormbugua" },
    ],
  },
  faq: [
    {
      q: "Are you available for freelance?",
      a: "Yes! I'm currently accepting new projects. Typical lead time is about 2 weeks.",
    },
    {
      q: "What's your rate?",
      a: "Projects start around $2,500 and scale with scope. I offer both hourly and fixed-price engagements.",
    },
    {
      q: "Do you work with startups?",
      a: "Absolutely. I love helping early-stage companies ship MVPs and design systems.",
    },
  ],
} as const;

export type PortfolioContext = typeof portfolioContext;
