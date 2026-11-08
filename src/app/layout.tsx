import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, JetBrains_Mono } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import AIChatFab from "@/components/chat/AIChatFab";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

// Both families are loaded as variable fonts (no fixed `weight` list). Static
// weight requests for variable families make Google Fonts intermittently answer
// with `/l/font?kit=…&skey=…` URLs, which Turbopack's next/font loader cannot
// parse ("next/font/google queries have exactly one entry"). The variable axis
// still covers every weight used in the app (300–700 / 100–900).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Figures, dates and code (Chakra `fontFamily="mono"`). Previously referenced
// but never loaded, so it fell back to each OS's default monospace.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const FALLBACK_TITLE = "Victor Mbugua - Portfolio";
const FALLBACK_DESCRIPTION =
  "Portfolio of Victor Mbugua, Full Stack Developer & UI/UX Designer";

/**
 * Build page metadata from the admin-managed site settings (SEO meta title /
 * description editable on /admin/settings). Falls back to static defaults if the
 * backend is unreachable so the page metadata never breaks. Cached for 5 minutes
 * so saved changes propagate without a rebuild.
 */
export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/v1/settings/`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const s = await res.json();
      return {
        title: s.meta_title || FALLBACK_TITLE,
        description: s.meta_description || FALLBACK_DESCRIPTION,
      };
    }
  } catch {
    /* backend unavailable — fall back to defaults */
  }
  return { title: FALLBACK_TITLE, description: FALLBACK_DESCRIPTION };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {/* Icon font used app-wide via className="material-symbols-outlined"; the
            no-page-custom-font rule is a pages-router check and a false positive
            in the app router root layout. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`antialiased bg-background-light text-slate-800 font-display min-h-screen relative overflow-x-hidden`}>
        <Provider>
          <PageViewTracker />
          {children}
          <AIChatFab />
        </Provider>
      </body>
    </html>
  );
}
