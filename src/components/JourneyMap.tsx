"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Trophy, Terminal, Compass, Target, Radio, Activity, Navigation } from "lucide-react";

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
      icon: Info,
      href: "#about",
      coords: { x: 125, y: 75, pctX: "12.5%", pctY: "25%" },
      mobileCoords: { x: 25, y: 80, pctX: "25%", pctY: "10%" },
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
      icon: Trophy,
      href: "#events",
      coords: { x: 375, y: 225, pctX: "37.5%", pctY: "75%" },
      mobileCoords: { x: 75, y: 280, pctX: "75%", pctY: "35%" },
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
      icon: Terminal,
      href: "#workshops",
      coords: { x: 625, y: 75, pctX: "62.5%", pctY: "25%" },
      mobileCoords: { x: 25, y: 480, pctX: "25%", pctY: "60%" },
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
      icon: Compass,
      href: "/registration",
      coords: { x: 875, y: 225, pctX: "87.5%", pctY: "75%" },
      mobileCoords: { x: 75, y: 680, pctX: "75%", pctY: "85%" },
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
    <div className="w-full py-16 px-4 relative overflow-hidden select-none border border-red-500/15 bg-black/65 backdrop-blur-md rounded-3xl mt-12 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(220,38,38,0.08)]">
      
      {/* 1. Root styled-jsx configuration block */}
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

        /* Floating sonar pulse along the SVG paths */
        @keyframes travel-path {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .sonar-pulse-desktop {
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 12px #ef4444, 0 0 25px #ef4444, 0 0 40px #ef4444;
          position: absolute;
          offset-path: path("M 125 75 C 250 75, 250 225, 375 225 S 500 75, 625 75 S 750 225, 875 225");
          animation: travel-path 10s linear infinite;
        }
        .sonar-pulse-mobile {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444;
          position: absolute;
          offset-path: path("M 25 80 C 25 180, 75 180, 75 280 S 25 380, 25 480 S 75 580, 75 680");
          animation: travel-path 7s linear infinite;
        }

        /* Cyber CRT overlay lines */
        .crt-scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
          background-size: 100% 4px;
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
      <div className="relative w-full max-w-5xl mx-auto h-[750px] md:h-[350px] z-10">
        
        {/* DESKTOP SVG CONNECTION PATH */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            {/* Background static dashed path */}
            <path
              d="M 125 75 C 250 75, 250 225, 375 225 S 500 75, 625 75 S 750 225, 875 225"
              fill="none"
              stroke="rgba(239, 68, 68, 0.15)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {/* Animated glowing overlay path */}
            <path
              d="M 125 75 C 250 75, 250 225, 375 225 S 500 75, 625 75 S 750 225, 875 225"
              fill="none"
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth="2.5"
              strokeDasharray="25 150"
              className="animate-[dash_10s_linear_infinite]"
            />
          </svg>
          {/* Glowing dot traveling along the path */}
          <div className="sonar-pulse-desktop" />
        </div>

        {/* MOBILE SVG CONNECTION PATH */}
        <div className="block md:hidden absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 800" preserveAspectRatio="none">
            {/* Background static dashed path */}
            <path
              d="M 25 80 C 25 180, 75 180, 75 280 S 25 380, 25 480 S 75 580, 75 680"
              fill="none"
              stroke="rgba(239, 68, 68, 0.15)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {/* Animated glowing overlay path */}
            <path
              d="M 25 80 C 25 180, 75 180, 75 280 S 25 380, 25 480 S 75 580, 75 680"
              fill="none"
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth="2.5"
              strokeDasharray="30 250"
              className="animate-[dash_8s_linear_infinite]"
            />
          </svg>
          {/* Glowing dot traveling along the path */}
          <div className="sonar-pulse-mobile" />
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
                <div className="absolute top-16 sm:top-18 w-[160px] sm:w-[200px] text-center pointer-events-none opacity-100 md:opacity-85 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  <div className="bg-black/95 border border-red-500/25 rounded-lg p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md">
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

      {/* 4. REAL-TIME TELEMETRY PANEL (Fills bottom map viewport area) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-6 bg-black/85 border border-red-500/20 rounded-xl p-4 font-mono text-xs text-red-400 shadow-[0_4px_25px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-red-500/10 pb-2 mb-3">
          <Activity className="w-4 h-4 text-red-500 animate-[pulse_1.5s_infinite]" />
          <span className="font-bold uppercase tracking-wider text-[10px] sm:text-xs text-red-500">
            ODY-SYSTEMS TELEMETRY CONSOLE
          </span>
          <span className="ml-auto text-[9px] text-red-500/60 uppercase">
            STATUS: [ MONITORING ]
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] sm:text-xs">
          <div>
            <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// LOCKED POINT</span>
            <span className="text-white font-bold uppercase">
              {currentHoverData ? currentHoverData.label : "SCANNING..."}
            </span>
          </div>
          <div>
            <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// BEARING LOCK</span>
            <span className="text-white font-mono">
              {currentHoverData ? currentHoverData.telemetry.bearing : "0.0.0.0° SCAN"}
            </span>
          </div>
          <div>
            <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// COORDINATES</span>
            <span className="text-white font-mono">
              {currentHoverData ? currentHoverData.telemetry.loc : "WAITING FOR RETRIEVAL..."}
            </span>
          </div>
          <div>
            <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// VECTOR TARGET</span>
            <span className="text-white font-mono uppercase">
              {currentHoverData ? currentHoverData.telemetry.vector : "STANDBY_"}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-red-500/10 flex flex-wrap gap-2 items-center text-[9px] text-red-500/60">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            RADAR SCAN: ACTIVE
          </span>
          <span className="hidden sm:inline">//</span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 text-red-500" />
            TARGET LOCK: {currentHoverData ? "LOCKED" : "WAITING"}
          </span>
          <span className="ml-auto font-bold text-red-500/90 text-[10px]">
            {currentHoverData 
              ? `COURSE RESOLVED: ${currentHoverData.telemetry.progress}` 
              : "ACQUIRING SIGNAL..."
            }
          </span>
        </div>
      </div>

    </div>
  );
}
