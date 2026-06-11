"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Target, Cpu, Navigation } from "lucide-react";

interface JourneyMapProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function JourneyMap({ activeSection, onSectionChange }: JourneyMapProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const steps = [
    {
      id: "about",
      label: "About",
      title: "The Departure",
      description: "Explore the theme and origins of the Odyssey.",
      icon: Anchor,
      href: "#about",
      coords: { x: 125, y: 54, pctX: "12.5%", pctY: "18%" },
      mobileCoords: { x: 25, y: 56, pctX: "25%", pctY: "10%" },
      radarCoords: { cx: 35, cy: 35 },
      telemetry: {
        vector: "VEC-ODY: 0x01",
        bearing: "044.2° NNE",
        status: "ACTIVE_ROUTE",
        progress: "25%",
        loc: "12.8256° N, 80.0398° E",
      },
    },
    {
      id: "events",
      label: "Events",
      title: "The Trials",
      description: "Test your skills in competitive arenas.",
      icon: Target,
      href: "#events",
      coords: { x: 375, y: 174, pctX: "37.5%", pctY: "58%" },
      mobileCoords: { x: 75, y: 173, pctX: "75%", pctY: "31%" },
      radarCoords: { cx: 65, cy: 70 },
      telemetry: {
        vector: "VEC-ODY: 0x02",
        bearing: "112.5° ESE",
        status: "READY_STANDBY",
        progress: "50%",
        loc: "12.8259° N, 80.0401° E",
      },
    },
    {
      id: "workshops",
      label: "Workshops",
      title: "The Training",
      description: "Acquire wisdom from leading pioneers.",
      icon: Cpu,
      href: "#workshops",
      coords: { x: 625, y: 54, pctX: "62.5%", pctY: "18%" },
      mobileCoords: { x: 25, y: 291, pctX: "25%", pctY: "52%" },
      radarCoords: { cx: 70, cy: 30 },
      telemetry: {
        vector: "VEC-ODY: 0x03",
        bearing: "215.1° SSW",
        status: "READY_STANDBY",
        progress: "75%",
        loc: "12.8262° N, 80.0404° E",
      },
    },
    {
      id: "register",
      label: "Register",
      title: "The Legacy",
      description: "Secure your passage and cement your legacy.",
      icon: Navigation,
      href: "/registration",
      coords: { x: 875, y: 174, pctX: "87.5%", pctY: "58%" },
      mobileCoords: { x: 75, y: 414, pctX: "75%", pctY: "74%" },
      radarCoords: { cx: 85, cy: 65 },
      telemetry: {
        vector: "VEC-ODY: 0x04",
        bearing: "318.9° NW",
        status: "FINAL_LOCK",
        progress: "100%",
        loc: "12.8265° N, 80.0407° E",
      },
    },
  ];



  const currentHoverData = steps.find((step) => step.id === hoveredStep);

  const handleStepClick = (href: string, id: string) => {
    if (href.startsWith("/")) {
      window.location.href = href;
    } else {
      onSectionChange(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="w-full py-12 px-4 relative overflow-hidden select-none mt-24 sm:mt-36 lg:mt-52 xl:mt-64"
      style={{
        cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'1.5\'><circle cx=\'16\' cy=\'16\' r=\'6\'/><line x1=\'16\' y1=\'2\' x2=\'16\' y2=\'10\'/><line x1=\'16\' y1=\'22\' x2=\'16\' y2=\'30\'/><line x1=\'2\' y1=\'16\' x2=\'10\' y2=\'16\'/><line x1=\'22\' y1=\'16\' x2=\'30\' y2=\'16\'/></svg>") 16 16, crosshair'
      }}
    >
      
      {/* 1. Root styled-jsx configuration block */}
      <style jsx global>{`
        .milestone-node {
          left: var(--x-mobile);
          top: var(--y-mobile);
        }
        @media (min-width: 1024px) {
          .milestone-node {
            left: var(--x-desktop);
            top: var(--y-desktop);
          }
        }

        /* Equalizer visualizer bounce */
        @keyframes equalizer-bounce {
          0%, 100% { height: 4px; }
          50% { height: var(--max-height, 16px); }
        }
        .audio-bar {
          animation: equalizer-bounce var(--bounce-duration, 1s) ease-in-out infinite;
        }
        
        /* Tactical grid background */
        .hud-grid {
          background-image: 
            linear-gradient(rgba(239, 68, 68, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          background-position: center;
        }

        /* Scanning radar sweeping animation */
        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-sweep {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: conic-gradient(from 0deg at 50% 50%, rgba(239, 68, 68, 0.05) 0deg, rgba(239, 68, 68, 0.01) 60deg, transparent 270deg);
          animation: sweep 15s linear infinite;
          pointer-events: none;
          transform-origin: center;
        }

        /* Compass rotating animation */
        @keyframes rot-compass {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .compass-rose-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          opacity: 0.03;
          animation: rot-compass 90s linear infinite;
          pointer-events: none;
        }

        /* Cyber CRT overlay lines */
        .crt-scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
          background-size: 100% 4px;
        }

        /* Radar sweep animation inside scope */
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-scope-line {
          animation: radar-spin 3s linear infinite;
          transform-origin: 50px 50px;
        }


      `}</style>

      {/* 2. Interactive Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 hud-grid opacity-75" />
        <div className="radar-sweep" />
        <div className="absolute inset-0 crt-scanlines opacity-10" />
        
        {/* Glowing concentric background HUD circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-red-500/[0.03] animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-dashed border-red-500/[0.01]" />

        {/* Vector SVG Compass Rose */}
        <svg className="compass-rose-bg" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="50" cy="50" r="45" strokeDasharray="1 2" stroke="rgba(239, 68, 68, 0.3)" />
          <circle cx="50" cy="50" r="38" stroke="rgba(239, 68, 68, 0.1)" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(239, 68, 68, 0.2)" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(239, 68, 68, 0.2)" />
          <polygon points="50,15 54,46 50,50 46,46" fill="rgba(239, 68, 68, 0.25)" stroke="rgba(239, 68, 68, 0.4)" />
          <polygon points="50,85 54,54 50,50 46,54" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.3)" />
          <polygon points="85,50 54,54 50,50 54,46" fill="rgba(239, 68, 68, 0.25)" stroke="rgba(239, 68, 68, 0.4)" />
          <polygon points="15,50 46,54 50,50 46,46" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.3)" />
          <text x="48" y="12" fill="rgba(239, 68, 68, 0.7)" fontSize="5" fontWeight="bold">N</text>
          <text x="48" y="93" fill="rgba(239, 68, 68, 0.4)" fontSize="5">S</text>
          <text x="89" y="52" fill="rgba(239, 68, 68, 0.4)" fontSize="5">E</text>
          <text x="7" y="52" fill="rgba(239, 68, 68, 0.4)" fontSize="5">W</text>
        </svg>
      </div>

      {/* Decorative lat/long grid markings */}
      <div className="absolute top-4 left-6 font-mono text-[9px] text-red-500/30 tracking-wider z-10 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 animate-pulse" />
        GRID: 44.O2.89 // VOYAGE: ODY_2.0 // DECRYPT: READY
      </div>
      <div className="absolute bottom-4 right-6 font-mono text-[9px] text-red-500/30 tracking-wider z-10">
        SECTOR: CRIMSON_SEA // COURSE: TRUE // VECTOR_LOCK: ON
      </div>

      {/* Header section */}
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-bebas-neue)] tracking-wider text-white">
          THE ODYSSEY PATHWAY
        </h2>
        <p className="text-xs sm:text-sm text-red-500 font-mono tracking-[0.2em] uppercase mt-2">
          [ Charting courses & locking vector points ]
        </p>
      </div>

      {/* 3. Journey Map Arena */}
      <div className="relative w-full max-w-5xl mx-auto h-[560px] lg:h-[380px] z-10">
        
        {/* DESKTOP SVG CONNECTION PATH */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <defs>
              <filter id="path-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background static dashed path */}
            <path
              d="M 125 54 C 250 54, 250 174, 375 174 S 500 54, 625 54 S 750 174, 875 174"
              fill="none"
              stroke="rgba(239, 68, 68, 0.15)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {/* Animated glowing overlay path */}
            <path
              d="M 125 54 C 250 54, 250 174, 375 174 S 500 54, 625 54 S 750 174, 875 174"
              fill="none"
              stroke="rgba(239, 68, 68, 0.85)"
              strokeWidth="2.5"
              strokeDasharray="25 150"
              className="animate-[dash_10s_linear_infinite]"
              filter="url(#path-glow)"
            />
          </svg>
        </div>

        {/* MOBILE SVG CONNECTION PATH */}
        <div className="block lg:hidden absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 800" preserveAspectRatio="none">
            <defs>
              <filter id="path-glow-mobile" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background static dashed path */}
            <path
              d="M 25 56 C 25 114.5, 75 114.5, 75 173 S 25 232, 25 291 S 75 352.5, 75 414"
              fill="none"
              stroke="rgba(239, 68, 68, 0.15)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {/* Animated glowing overlay path */}
            <path
              d="M 25 56 C 25 114.5, 75 114.5, 75 173 S 25 232, 25 291 S 75 352.5, 75 414"
              fill="none"
              stroke="rgba(239, 68, 68, 0.85)"
              strokeWidth="2.5"
              strokeDasharray="30 250"
              className="animate-[dash_8s_linear_infinite]"
              filter="url(#path-glow-mobile)"
            />
          </svg>
        </div>

        {/* Milestone Nodes */}
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = activeSection === step.id;
          const isHovered = hoveredStep === step.id;

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
              <div 
                className="flex flex-col items-center group relative"
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Tactical radar target bracket overlay when hovered/active */}
                <AnimatePresence>
                  {(isHovered || isActive) && (
                    <motion.div 
                      initial={{ scale: 1.4, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 1.4, opacity: 0, rotate: 45 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-[-12px] border border-red-500/40 rounded-lg pointer-events-none z-0"
                    >
                      {/* Corner bracket notches */}
                      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/90" />
                      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/90" />
                      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500/90" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/90" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Node circle */}
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStepClick(step.href, step.id)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border cursor-pointer relative z-10 transition-all duration-300 ${
                    isActive
                      ? "bg-red-950/50 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.45),inset_0_0_10px_rgba(239,68,68,0.3)]"
                      : "bg-black/95 border-red-500/30 hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                  }`}
                  style={{
                    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'1.5\'><circle cx=\'16\' cy=\'16\' r=\'6\'/><line x1=\'16\' y1=\'2\' x2=\'16\' y2=\'10\'/><line x1=\'16\' y1=\'22\' x2=\'16\' y2=\'30\'/><line x1=\'2\' y1=\'16\' x2=\'10\' y2=\'16\'/><line x1=\'22\' y1=\'16\' x2=\'30\' y2=\'16\'/></svg>") 16 16, pointer'
                  }}
                >
                  {/* Glowing background ring */}
                  <span className={`absolute inset-0 rounded-full border border-red-500/20 animate-ping opacity-70 ${
                    isActive ? "block" : "hidden group-hover:block"
                  }`} style={{ animationDuration: "2.5s" }} />

                  {/* Node icon */}
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 relative z-20 ${
                    isActive ? "text-red-500" : "text-red-400/70 group-hover:text-red-400"
                  }`} />

                  {/* Waypoint Number Label */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border border-red-500/40 text-[9px] font-mono text-red-400 flex items-center justify-center font-bold shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
                    0{index + 1}
                  </span>
                </motion.button>

                {/* Node details card */}
                <div className="absolute top-16 sm:top-18 w-[160px] sm:w-[200px] text-center pointer-events-none opacity-100 lg:opacity-85 group-hover:opacity-100 transition-all duration-200 z-20">
                  <div className="bg-black/85 border border-red-500/30 rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-lg relative overflow-hidden group-hover:border-red-500/50 transition-all duration-300">
                    {/* Tech top glow */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                    
                    <span className="text-[9px] font-mono text-red-500/70 uppercase tracking-widest block mb-0.5 font-bold">
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
