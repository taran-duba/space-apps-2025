"use client";

import React, { JSX, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Wind,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LandbotChat from "./bot";

const palette = {
  midnight: "#0A0424",
  deep: "#18314F",
  steel: "#384E77",
  sea: "#A4CCC1",
  ice: "#C7E8F3",
} as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

type Feature = {
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const featuresData: readonly Feature[] = [
  { title: "Location-aware insights", desc: "Pinpoint AQI and ozone around you with privacy-first geolocation.", Icon: MapPin },
  { title: "Live air metrics", desc: "Near-real-time PM2.5/PM10, wind, and ozone signals you can trust.", Icon: Wind },
  { title: "NASA-backed data", desc: "Fused satellite + ground-sensor feeds for resilient coverage.", Icon: Globe },
  { title: "Health context", desc: "Tie exposure to respiratory guidance with an open database.", Icon: Database },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Home(): JSX.Element {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.group("<Home /> smoke tests");
    ["#about", "#features", "#faq", "#contact"].forEach((sel) => console.assert(!!document.querySelector(sel), `${sel} should exist`));
    console.groupEnd();
  }, []);

  const bgUrl = "/earth-overlay.jpg";

  return (
    <main className="min-h-screen text-white relative pt-16">
      <div aria-hidden data-bg="earth" className="fixed inset-0 -z-20" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div aria-hidden data-bg="veil" className="fixed inset-0 -z-10" style={{ background: `linear-gradient(0deg, rgba(10,4,36,0.72), rgba(10,4,36,0.72))` }} />
      
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-14 lg:pb-28 lg:pt-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="mb-6">
              <h2 className="text-7xl sm:text-8xl font-extrabold tracking-tight text-transparent" style={{ WebkitTextStroke: `2px ${palette.ice}`, color: "transparent" }}>CLAIRIFY</h2>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Here to help you breathe, clear.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">We&apos;re here to make sure you can do anything— and not while irritating your lungs. Using data from NASA to <em>Clairify</em> your safety, we ensure your comfort in knowing that the air you breathe is clean.</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/location-services">
                <Button size="lg" className="rounded-2xl px-8 py-6 text-base" style={{ backgroundColor: palette.ice, color: palette.deep }}>Find My Location<Globe className="ml-2 h-5 w-5" /></Button>
              </Link>
              <Link href="/diseases">
                <Button size="lg" variant="outline" className="rounded-2xl border px-8 py-6 text-base" style={{ borderColor: palette.sea, color: palette.ice, background: "transparent" }}>Database of Respiratory Illness<ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="relative">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">About Us</h2>
          <p className="mt-2 max-w-3xl text-white/80">Environauts is focused on making air‑quality insights accessible. We blend satellite data and ground sensors to help communities make cleaner, safer choices every day.</p>
        </div>
      </section>

      <section id="features" className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuresData.map(({ title, desc, Icon }, i) => (
              <div key={title} data-feature-card className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30"><Icon className="h-5 w-5" /></div>
                  <div data-feature-index className="ml-3 select-none rounded-full px-2.5 py-1 text-xs font-semibold tracking-widest" style={{ border: `1px solid ${palette.ice}55`, color: palette.ice }}>{pad2(i + 1)}</div>
                </div> 
                <h3 className="mt-4 text-base font-semibold" style={{ color: palette.ice }}>{title}</h3>
                <p className="mt-2 text-sm text-white/80">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="relative">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl ring-1" style={{ borderColor: `${palette.ice}22` }}>
            {([ ["What if I don’t want to provide personal information?", "Users are able to browse the website, however results won't be personalized to your respiratory illness or location."], ["How accurate is the data that is used?", "We acquire our data sets from NASA and they are refurbished when new Weather/AQI/Ozone/etc. data are collected and updated on the website."], ["What is <em>Clairify</em>'s definition of health?", "We perceive health as one's physical and mental well-being. Here at Clairify, we focus on your respiratory needs and what you need to thrive with healthy lungs and clear airways."] ] as const).map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: palette.ice }}><span dangerouslySetInnerHTML={{ __html: q }} /></span>
                  <span className="text-xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-white/80" dangerouslySetInnerHTML={{ __html: a }} />
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Contact Us</h2>
          <p className="mt-2 max-w-2xl text-white/80">We&apos;d love to hear from you! Reach out through any of the platforms below.</p>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <a href="mailto:support@clairify.earth" className="flex items-center gap-2 text-white/80 transition hover:text-white"><Mail className="h-5 w-5" /> support@clairify.earth</a>
            <a href="https://github.com/taran-duba/space-apps-2025" className="flex items-center gap-2 text-white/80 transition hover:text-white"><Github className="h-5 w-5" /> GitHub</a>
            <a href="#" className="flex items-center gap-2 text-white/80 transition hover:text-white"><Linkedin className="h-5 w-5" /> LinkedIn</a>
          </div>
        </div>
      </section>

      <hr data-test="section-divider" className="border-t-4 border-white my-8 w-11/12 mx-auto opacity-80" />
      <LandbotChat />
    </main>
  );
}
