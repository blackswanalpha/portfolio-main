/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4
 * Hallmark · macrostructure: Split Studio · tone: soft · anchor hue: brand blue #2e6eb8 (~255°)
 * theme: project brand tokens (Fraunces display, Space Grotesk text, src/theme) · nav + footer: layout-owned
 * enrichment: desk photo (LCP) · photoreal Earth + studio still life in one shared WebGL context
 * motion: one CSS entrance on the hero text · slow globe spin (static under reduced motion)
 */
import fs from "node:fs";
import path from "node:path";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero, { LocationBand } from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import { RESUME_URL } from "@/components/home/format";
import StageProvider from "@/components/three/stage/StageProvider";

// Checked on the server (at build for a static page): the resume button only
// renders when public/resume.pdf actually exists.
const hasResume = fs.existsSync(path.join(process.cwd(), "public", RESUME_URL.replace(/^\//, "")));

// Server component: the sections hydrate on their own, and nothing here hides
// content behind JS. Every section reads live data client-side via useApi.
export default function Home() {
    return (
        <>
            <Navbar />
            <StageProvider>
                <main id="main" className="overflow-x-clip">
                    <Hero />
                    <About hasResume={hasResume} />
                    <FeaturedProjects />
                    <Services />
                    <Testimonials />
                    <Contact />
                    {/* "Working from Nairobi" globe, below the FAQ at the end of Contact. */}
                    <LocationBand />
                </main>
            </StageProvider>
            <Footer />
        </>
    );
}
