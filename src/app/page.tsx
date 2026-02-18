"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Floating animation for decorative background blobs
      gsap.to(".blob-1", {
        x: "10%",
        y: "15%",
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".blob-2", {
        x: "-15%",
        y: "10%",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Reveal animations for major sections
      const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
      sections.forEach((section) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display transition-colors duration-300 relative overflow-x-hidden"
    >
      {/* Decorative Blobs with Animation Classes */}
      <div className="blob-bg -top-20 -left-20 blob-1"></div>
      <div className="blob-bg top-40 -right-40 w-[800px] h-[800px] opacity-60 blob-2"></div>

      <Navbar />
      <Hero />

      <div className="reveal-section">
        <About />
      </div>

      <div className="reveal-section">
        <Testimonials />
      </div>

      <div className="reveal-section">
        <Contact />
      </div>

      <Footer />
    </main>
  );
}
