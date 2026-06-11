"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Target, Cpu, Navigation, Radio, Activity, ShieldAlert, Cpu as CpuIcon } from "lucide-react";

interface JourneyMapProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function JourneyMap({ activeSection, onSectionChange }: JourneyMapProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [hexLogs, setHexLogs] = useState<string[]>([
    "[SYS] STATUS: STANDBY",
    "[TRK] LOCK_BRG: 000.0°",
    "[SYS] VOLTAGE_OK: 1.25V",
    "[VEC] SCANNING SECTOR_ODY",
  ]);

  const steps = [
    {
      id: "about",
      label: "About",
      title: "The Departure",
      description: "Explore the theme and origins of the Odyssey.",
      icon: Anchor,
      href: "#about",
      coords: { x: 125, y: 75, pctX: "12.5%", pctY: "25%" },
      mobileCoords: { x: 25, y: 80, pctX: "25%", pctY: "10%" },
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
      coords: { x: 375, y: 225, pctX: "37.5%", pctY: "75%" },
      mobileCoords: { x: 75, y: 280, pctX: "75%", pctY: "35%" },
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
      coords: { x: 625, y: 75, pctX: "62.5%", pctY: "25%" },
      mobileCoords: { x: 25, y: 480, pctX: "25%", pctY: "60%" },
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
      coords: { x: 875, y: 225, pctX: "87.5%", pctY: "75%" },
      mobileCoords: { x: 75, y: 680, pctX: "75%", pctY: "85%" },
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

  // Random log generator to simulate live tech feedback
  useEffect(() => {
    const interval = setInterval(() => {
      const prefixes = ["[SYS]", "[TRK]", "[VEC]", "[ODY]", "[LOCK]"];
      const messages = [
        "SIG_STR: 98.4%",
        "SECTOR_LOCK: TRUE",
        "TEMP_STABLE: 44.2°C",
        "GRID_DEC_KEY: 0xFD4A",
        "SYS_TICK: OK",
        "DATA_STREAM: OPEN",
        "SYNCING CORE...",
        "DECRYPT_PASS: 99.69%",
      ];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      setHexLogs((prev) => {
        const next = [...prev.slice(1), `${randomPrefix} ${randomMsg}`];
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

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

      {/* 4. UPGRADED футуристический HUD TELEMETRY PANEL */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mt-12 bg-black/90 border-2 border-red-500/35 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-lg">
        {/* Glowing border outline */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/80 to-transparent" />
        
        {/* Top Header Bar */}
        <div className="bg-red-950/30 px-4 py-2 border-b border-red-500/20 flex items-center justify-between text-[10px] sm:text-xs text-red-500 font-mono">
          <div className="flex gap-2 items-center">
            <Radio className="w-3.5 h-3.5 animate-[pulse_1s_infinite] text-red-500" />
            <span className="font-bold tracking-[0.15em] uppercase">SYSTEMS TELEMETRY & TARGETING CONSOLE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-60 hidden sm:inline">SYS_VER: 2.0.44</span>
            <span className="bg-red-950 border border-red-500/40 rounded px-1.5 py-0.5 text-red-500/80 font-bold uppercase tracking-wider animate-pulse">
              {currentHoverData ? "TARGET LOCK" : "SCANNING"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 font-mono text-xs text-red-400">
          
          {/* A. RADAR SCOPE WIDGET (Col span 3) */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center border-r border-red-500/10 pr-0 lg:pr-6 relative">
            <div className="absolute top-0 left-0 text-[8px] text-red-500/40 tracking-wider">// RADAR_FEED</div>
            
            {/* SVG Interactive Radar Scope */}
            <div className="w-24 h-24 rounded-full border border-red-500/30 bg-red-950/5 relative overflow-hidden flex items-center justify-center mt-2 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Concentric radar lines */}
                <circle cx="50" cy="50" r="45" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.5" fill="none" />
                <circle cx="50" cy="50" r="30" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.5" fill="none" />
                <circle cx="50" cy="50" r="15" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.5" fill="none" />
                {/* Crosshairs */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="0.5" />
                
                {/* Sweep line */}
                <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1" className="radar-scope-line" />
                
                {/* Display dots for all steps */}
                {steps.map((step) => {
                  const isThisActive = hoveredStep === step.id || activeSection === step.id;
                  return (
                    <g key={step.id}>
                      <circle
                        cx={step.radarCoords.cx}
                        cy={step.radarCoords.cy}
                        r={isThisActive ? "2.5" : "1.5"}
                        fill={isThisActive ? "#ef4444" : "rgba(239, 68, 68, 0.4)"}
                        className={isThisActive ? "animate-[pulse_1s_infinite]" : ""}
                      />
                      {isThisActive && (
                        <circle
                          cx={step.radarCoords.cx}
                          cy={step.radarCoords.cy}
                          r="4"
                          stroke="#ef4444"
                          strokeWidth="0.5"
                          fill="none"
                          className="animate-ping"
                          style={{ animationDuration: "1.5s" }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <span className="text-[8px] text-red-500/60 font-mono tracking-widest mt-2 uppercase">ANT_SIG_LOCK: 98%</span>
          </div>

          {/* B. TELEMETRY FIELDS & WAVEFORM (Col span 6) */}
          <div className="lg:col-span-6 flex flex-col justify-between py-1 border-r border-red-500/10 pr-0 lg:pr-6 relative">
            <div className="absolute top-0 left-0 text-[8px] text-red-500/40 tracking-wider">// VECTOR_READOUTS</div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] sm:text-xs">
              <div className="bg-red-950/15 border border-red-500/10 rounded p-2">
                <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// LOCKED POINT</span>
                <span className="text-white font-bold uppercase tracking-wider">
                  {currentHoverData ? currentHoverData.label : "SCANNING..."}
                </span>
              </div>
              <div className="bg-red-950/15 border border-red-500/10 rounded p-2">
                <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// BEARING LOCK</span>
                <span className="text-white font-mono font-semibold">
                  {currentHoverData ? currentHoverData.telemetry.bearing : "0.00° VECTOR_STBY"}
                </span>
              </div>
              <div className="bg-red-950/15 border border-red-500/10 rounded p-2">
                <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// COORDINATES</span>
                <span className="text-white font-mono break-all font-semibold">
                  {currentHoverData ? currentHoverData.telemetry.loc : "ACQUIRING..."}
                </span>
              </div>
              <div className="bg-red-950/15 border border-red-500/10 rounded p-2">
                <span className="text-red-500/50 block text-[9px] uppercase tracking-wide">// VECTOR TARGET</span>
                <span className="text-white font-mono uppercase font-semibold">
                  {currentHoverData ? currentHoverData.telemetry.vector : "GRID_LOCK: OFF"}
                </span>
              </div>
            </div>

            {/* Signal Waveform Indicator */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[9px] text-red-500/40 font-mono tracking-widest uppercase">// SIG_WAVE</span>
              
              {/* Dynamic Equalizer / Audio visualizer bars */}
              <div className="flex items-end gap-1 h-5 flex-grow">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
                  const duration = 0.4 + Math.random() * 0.6;
                  const maxHeight = 8 + Math.random() * 10;
                  return (
                    <div
                      key={bar}
                      className="audio-bar w-full bg-red-600/60 rounded-t-xs"
                      style={{
                        "--max-height": `${maxHeight}px`,
                        "--bounce-duration": `${duration}s`,
                      } as React.CSSProperties}
                    />
                  );
                })}
              </div>
              <span className="text-[9px] font-mono text-red-500/80 font-bold">
                {currentHoverData ? `LOCK_SIG: ${currentHoverData.telemetry.progress}` : "ACQUIRING..."}
              </span>
            </div>
          </div>

          {/* C. LIVE STATUS LOGS / DATA STREAM (Col span 3) */}
          <div className="lg:col-span-3 pl-0 lg:pl-6 flex flex-col justify-between py-1 relative">
            <div className="absolute top-0 left-0 text-[8px] text-red-500/40 tracking-wider">// CODE_STREAM</div>
            
            <div className="bg-red-950/10 border border-red-500/10 rounded p-2.5 h-28 overflow-hidden font-mono text-[9px] leading-normal text-red-500/60 mt-4 flex flex-col gap-0.5">
              {hexLogs.map((log, index) => (
                <div key={index} className="flex justify-between font-mono">
                  <span>{log}</span>
                  <span className="text-red-500/30">0x{Math.floor(Math.random() * 256).toString(16).toUpperCase()}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[8px] text-red-500/50 uppercase tracking-widest font-mono">
              <span>CORE: ACTIVE</span>
              <span className="flex items-center gap-1 font-bold text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                LIVE FEED
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
