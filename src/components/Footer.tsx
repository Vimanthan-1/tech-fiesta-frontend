"use client";

import React, { useState, useRef, useEffect } from "react";

interface FooterProps {
  onSectionChange?: (sectionId: string) => void;
  onTriggerMatrix?: () => void;
  onTriggerSelfDestruct?: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  onSectionChange, 
  onTriggerMatrix, 
  onTriggerSelfDestruct 
}) => {
  const [command, setCommand] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "\"We operate in the shadows to serve the light. We are Asymmetric.\"",
    "STATUS: DEAD // DEC_KEY_LOCK: 99.69%",
    "SYSTEM: Bluelabel users don't explain themselves. Neither does their config.",
  ]);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Web Audio synthesizer for classic 8-bit tech sounds
  const playSound = (type: "keypress" | "success" | "error") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === "keypress") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === "success") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06); // A5
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.29);
      }
    } catch (err) {
      console.warn("Web Audio API not allowed or failed:", err);
    }
  };

  const handleLinkClick = (sectionId: string) => {
    playSound("success");
    if (onSectionChange) {
      onSectionChange(sectionId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
    playSound("keypress");
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = command.trim().toLowerCase();
    if (!cleanCmd) return;

    let response = "";
    let isError = false;

    switch (cleanCmd) {
      case "help":
        response = "DIRECTORY HASHES: 'matrix' | 'selfdestruct' | 'decrypt' | 'odyssey' | 'spartan' | 'clear'";
        break;
      case "odyssey":
        response = "VOYAGE DETECTED. PATHWAY UNLOCKED TO JULY 24, 2026.";
        break;
      case "spartan":
        response = "PROTOCOL ACTIVE: STAND FIRM. GLORY AWAITS IN THE ARENA.";
        break;
      case "decrypt":
      case "hack":
        response = "CORE KEY MATCHED: 'FIESTA_2.0_CRIMSON'. ACCESSED_FLAG{ODY_CRIMSON_2026}";
        break;
      case "matrix":
      case "rain":
        response = "INITIALIZING MATRIX CODE STREAM OVERLAY. PRESS 'ESC' OR CLICK TO KILL INTERACTION.";
        if (onTriggerMatrix) {
          setTimeout(() => onTriggerMatrix(), 200);
        }
        break;
      case "selfdestruct":
      case "destruct":
        response = "CRITICAL FAIL INITIATED. WARNING: SELF-DESTRUCT IN 5 SECONDS.";
        if (onTriggerSelfDestruct) {
          setTimeout(() => onTriggerSelfDestruct(), 200);
        }
        break;
      case "clear":
        setConsoleOutput([]);
        setCommand("");
        playSound("success");
        return;
      default:
        response = `[ERROR]: ILLEGAL SIGNATURE '${command}'. SYSTEM DECRYPT BLOCKED.`;
        isError = true;
    }

    if (isError) {
      playSound("error");
    } else {
      playSound("success");
    }

    setConsoleOutput((prev) => [...prev, `sys-access@ody-2.0:~$ ${command}`, response]);
    setCommand("");
  };

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleOutput]);

  return (
    <footer className="bg-black/90 border-t border-red-500/20 py-6 px-4 sm:px-6 relative overflow-hidden select-none">
      <style jsx>{`
        .footer-btn {
          background: rgba(10, 10, 10, 0.7);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 6px;
          padding: 6px 12px;
          color: #f87171;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          font-family: var(--font-mono), monospace;
          letter-spacing: 0.05em;
        }
        .footer-btn:hover {
          border-color: rgba(239, 68, 68, 0.75);
          color: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }
        .social-icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          background: rgba(10, 10, 10, 0.7);
          color: #f87171;
          transition: all 0.2s ease;
        }
        .social-icon-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.25);
          transform: scale(1.08);
        }
        .terminal-box::-webkit-scrollbar {
          width: 4px;
        }
        .terminal-box::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 2px;
        }
      `}</style>

      {/* Cyber background gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-950/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* MOBILE GRID LAYOUT: 2 Columns displaying all links */}
        <div className="grid grid-cols-2 max-sm:gap-4 gap-8 items-start border-b border-red-500/10 pb-5 mb-5 text-left">
          
          {/* Column 1: Brand details (Left side) */}
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <img 
                src="/assNo_00000.png" 
                alt="Asymmetric Logo" 
                className="w-7 h-7 object-contain"
              />
              <span className="text-base font-bold font-[family-name:var(--font-bebas-neue)] tracking-wider text-white">
                ASYMMETRIC
              </span>
              <span className="bg-black border border-red-500/35 rounded px-1 py-0.5 text-red-500/80 font-mono text-[8px] tracking-wider uppercase">
                SYS_OK
              </span>
            </div>
            
            {/* Techy Telemetry display for mobile/desktop to fill space in dark red theme colors */}
            <div 
              onDoubleClick={() => {
                playSound("error");
                setShowEasterEgg(true);
                setTimeout(() => setShowEasterEgg(false), 3000);
              }}
              className="flex flex-col gap-0.5 mt-1 font-mono text-[11px] text-red-900 tracking-wider cursor-pointer select-none"
              title="Double click for system override"
            >
              {showEasterEgg ? (
                <div className="text-red-500 font-bold animate-bounce">// hey fucker😜</div>
              ) : (
                <>
                  {/* Desktop/Laptop (Large screens) */}
                  <div className="hidden sm:block">// CPU: 98.4% // TEMP: 69.0°C // PORT: 69</div>
                  <div className="hidden sm:block">// NET: SECURE // SYS_STATUS: OK // NODE: 0x69</div>
                  
                  {/* Mobile (Small screens - reduced size and characters to align with email column) */}
                  <div className="block sm:hidden text-[9px]">// CPU: 98% // TEMP: 69°C // PORT: 69</div>
                  <div className="block sm:hidden text-[9px]">// NET: SECURE // SYS: OK</div>
                </>
              )}
            </div>
            
            <p className="text-gray-400 text-[10px] leading-relaxed max-w-sm max-sm:hidden">
              Navigating the frontiers of innovation, design, and cybersecurity at Tech Fiesta 2.0.
            </p>
          </div>

          {/* Column 2: Connect With Us Grid (Right side) */}
          <div className="flex flex-col items-end gap-1.5 w-full text-right">
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-1 mr-1">
              // CONNECT_WITH_US
            </span>
            <div className="flex gap-2 justify-end mt-1">
              <a
                href="https://www.instagram.com/clubasymmetric/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/club-asymmetric/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://asymmetric-livid.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Website"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m0 0a9 9 0 019-9" />
                </svg>
              </a>
            </div>
            <span className="font-mono text-[9px] text-gray-500/70 mt-1 mr-1 pointer-events-none select-none text-[9px]">
              Asymmetric@citchennai.net
            </span>
          </div>
        </div>

        {/* SECRET INTERACTIVE HUD CORE CONSOLE */}
        <div className="w-full mb-4 border border-red-500/35 rounded bg-black/95 overflow-hidden shadow-[0_0_15px_rgba(220,38,38,0.12)]">
          {/* Header Bar */}
          <div className="bg-red-950/20 px-3 py-1.5 border-b border-red-500/20 flex items-center justify-between text-[9px] text-red-400 font-mono">
            <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/10" />
              <span className="ml-1 text-red-500 font-bold uppercase tracking-wider">ODYSSEY HACK CORE</span>
            </div>
            <span className="opacity-60">[ PORT: 3001 ]</span>
          </div>

          {/* Console logs */}
          <div className="terminal-box h-24 overflow-y-auto p-2.5 font-mono text-[9px] leading-normal text-red-500/80 bg-black flex flex-col gap-0.5">
            {consoleOutput.map((out, index) => (
              <div 
                key={index}
                className={out.startsWith("sys") ? "text-red-400" : out.startsWith("[ERROR]") ? "text-red-600/90 font-bold" : "text-white/80"}
              >
                {out}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>

          {/* Console input */}
          <form onSubmit={handleCommandSubmit} className="flex border-t border-red-500/10">
            <span className="bg-black text-red-500 font-mono text-[9px] pl-2.5 py-1.5 flex items-center select-none font-bold">
              sys-access@ody-2.0:~$
            </span>
            <input
              type="text"
              value={command}
              onChange={handleInputChange}
              placeholder="type commands (e.g. matrix, selfdestruct, help)..."
              className="flex-grow bg-black text-red-400 font-mono text-[9px] py-1.5 px-1.5 outline-none border-none caret-red-500"
              autoComplete="off"
              spellCheck="false"
            />
          </form>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[9px] text-gray-600 font-mono gap-1 text-center sm:text-left">
          <span>© 2026 Club Asymmetric. All rights reserved.</span>
          <span className="max-sm:hidden">BUILDING_THE_FUTURE_VIA_TECHNOLOGY // SYS_OK</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
