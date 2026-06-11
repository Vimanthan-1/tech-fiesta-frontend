"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info, Trophy, Terminal, Compass } from "lucide-react";

interface JourneyMapProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function JourneyMap({ activeSection, onSectionChange }: JourneyMapProps) {
  const steps = [
    {
      id: "about",
      label: "About",
      title: "The Departure",
      description: "Explore the theme and origins of the Odyssey.",
      icon: Info,
      href: "#about",
      coords: { x: 125, y: 75, pctX: "12.5%", pctY: "25%" },
      mobileCoords: { x: 25, y: 80, pctX: "25%", pctY: "10%" },
    },
    {
      id: "events",
      label: "Events",
      title: "The Trials",
      description: "Test your skills in electrifying competitive arenas.",
      icon: Trophy,
      href: "#events",
      coords: { x: 375, y: 225, pctX: "37.5%", pctY: "75%" },
      mobileCoords: { x: 75, y: 280, pctX: "75%", pctY: "35%" },
    },
    {
      id: "workshops",
      label: "Workshops",
      title: "The Training",
      description: "Acquire wisdom from leading industry pioneers.",
      icon: Terminal,
      href: "#workshops",
      coords: { x: 625, y: 75, pctX: "62.5%", pctY: "25%" },
      mobileCoords: { x: 25, y: 480, pctX: "25%", pctY: "60%" },
    },
    {
      id: "register",
      label: "Register",
      title: "The Legacy",
      description: "Secure your passage and cement your legacy.",
      icon: Compass,
      href: "/registration",
      coords: { x: 875, y: 225, pctX: "87.5%", pctY: "75%" },
      mobileCoords: { x: 75, y: 680, pctX: "75%", pctY: "85%" },
    },
  ];

  const handleStepClick = (href: string, id: string) => {
    if (href.startsWith("/")) {
      window.location.href = href;
    } else {
      onSectionChange(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-16 px-4 relative overflow-hidden select-none border-t border-red-500/10 bg-black/40 backdrop-blur-xs rounded-3xl mt-12 shadow-[inset_0_0_30px_rgba(220,38,38,0.05)]">
      <style jsx global>{`
        .milestone-node {
          left: var(--x-mobile);
          top: var(--y-mobile);
        }
        @media (min-width: 768px) {
          .milestone-node {
            left: var(--x-desktop);
            top: var(--y-desktop);
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -300;
          }
        }
      `}</style>
      {/* Decorative lat/long grid markings */}
      <div className="absolute top-4 left-6 font-mono text-[9px] text-red-500/20 tracking-wider">
        GRID: 44.O2.89 // VOYAGE: ODY_2.0
      </div>
      <div className="absolute bottom-4 right-6 font-mono text-[9px] text-red-500/20 tracking-wider">
        SECTOR: CRIMSON_SEA // COURSE: TRUE
      </div>

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-bebas-neue)] tracking-wider text-white">
          THE ODYSSEY VOYAGE
        </h2>
        <p className="text-xs sm:text-sm text-red-500 font-mono tracking-[0.2em] uppercase mt-2">
          [ Chart your course through the festival ]
        </p>
      </div>

      {/* Journey Map Arena */}
      <div className="relative w-full max-w-5xl mx-auto h-[750px] md:h-[350px]">
        {/* DESKTOP SVG CONNECTION PATH */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            {/* Background static dashed path */}
            <path
              d="M 125 75 C 250 75, 250 225, 375 225 S 500 75, 625 75 S 750 225, 875 225"
              fill="none"
              stroke="rgba(239, 68, 68, 0.15)"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            {/* Animated glowing overlay path */}
            <path
              d="M 125 75 C 250 75, 250 225, 375 225 S 500 75, 625 75 S 750 225, 875 225"
              fill="none"
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth="3"
              strokeDasharray="20 120"
              className="animate-[dash_8s_linear_infinite]"
            />
          </svg>
        </div>

        {/* MOBILE SVG CONNECTION PATH */}
        <div className="block md:hidden absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 800" preserveAspectRatio="none">
            {/* Background static dashed path */}
            <path
              d="M 25 80 C 25 180, 75 180, 75 280 S 25 380, 25 480 S 75 580, 75 680"
              fill="none"
              stroke="rgba(239, 68, 68, 0.15)"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            {/* Animated glowing overlay path */}
            <path
              d="M 25 80 C 25 180, 75 180, 75 280 S 25 380, 25 480 S 75 580, 75 680"
              fill="none"
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth="3"
              strokeDasharray="30 200"
              className="animate-[dash_6s_linear_infinite]"
            />
          </svg>
        </div>

        {/* Milestone Nodes */}
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = activeSection === step.id;

          return (
            <div
              key={step.id}
              className="milestone-node absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
              style={{
                "--x-mobile": step.mobileCoords.pctX,
                "--y-mobile": step.mobileCoords.pctY,
                "--x-desktop": step.coords.pctX,
                "--y-desktop": step.coords.pctY,
              } as React.CSSProperties}
            >
              <div className="flex flex-col items-center group">
                {/* Node circle */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStepClick(step.href, step.id)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border cursor-pointer relative transition-all duration-300 ${
                    isActive
                      ? "bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : "bg-black/90 border-red-500/30 hover:border-red-500/70 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  }`}
                >
                  {/* Glowing background ring */}
                  <span className={`absolute inset-0 rounded-full border border-red-500/10 animate-ping opacity-75 ${
                    isActive ? "block" : "hidden group-hover:block"
                  }`} style={{ animationDuration: "2s" }} />

                  {/* Node icon */}
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    isActive ? "text-red-500" : "text-red-400/70 group-hover:text-red-400"
                  }`} />

                  {/* Waypoint Number Label */}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black border border-red-500/40 text-[9px] font-mono text-red-400 flex items-center justify-center font-bold">
                    0{index + 1}
                  </span>
                </motion.button>

                {/* Node details card */}
                <div className="absolute top-16 sm:top-18 w-[160px] sm:w-[200px] text-center pointer-events-none opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/90 border border-red-500/20 rounded-lg p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-xs">
                    <span className="text-[9px] font-mono text-red-500/70 uppercase tracking-widest block mb-0.5">
                      {step.title}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-[family-name:var(--font-bebas-neue)] tracking-wider">
                      {step.label}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 leading-normal mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
