"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PixelBlast from "@/components/PixelBlast";
import MatrixRain from "@/components/MatrixRain";
import LoadingScreen from "@/components/LoadingScreen";
import ScrambledText from "@/components/ScrambledText";
import CountdownTimer from "@/components/CountdownTimer";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EventGrid from "@/components/EventGrid";
import WorkshopGrid from "@/components/WorkshopGrid";
import GlareHover from "@/components/ReactBits/GlareHover/GlareHover";
import { events } from "@/data/events";
import { workshops } from "@/data/workshops";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [clockCollectionReady, setClockCollectionReady] = useState(false);
  const [showAnimatedText, setShowAnimatedText] = useState(false);
  const [showNavBar, setShowNavBar] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isSelfDestructing, setIsSelfDestructing] = useState(false);
  const [selfDestructCount, setSelfDestructCount] = useState(5);

  useEffect(() => {
    if (!isSelfDestructing) return;
    
    const playSiren = (count: number) => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = "sawtooth";
        osc2.type = "sine";
        
        osc1.frequency.setValueAtTime(330, ctx.currentTime);
        osc2.frequency.setValueAtTime(440, ctx.currentTime);
        
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(ctx.currentTime + 0.8);
        osc2.stop(ctx.currentTime + 0.8);
      } catch (err) {}
    };

    playSiren(selfDestructCount);

    const timer = setInterval(() => {
      setSelfDestructCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.reload();
          return 0;
        }
        playSiren(prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSelfDestructing]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Start the animated text after the loading is complete and clock is visible
    setTimeout(() => {
      setShowAnimatedText(true);
    }, 1000); // Show text 1 second after clock becomes visible
  };

  const handleClockCollectionReady = () => {
    setClockCollectionReady(true);
  };
  const handleTextAnimationComplete = () => {
    // Show NavBar immediately (no delay)
    setShowNavBar(true);

    console.log("Text animation completed");
  };
  // Define loading tasks to track
  const loadingTasks = [
    { name: "Odyssey Background", completed: clockCollectionReady },
  ];

  return (
    <>
      <style jsx global>{`
        html,
        body {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          scrollbar-width: none; /* Hide scrollbar for Firefox */
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }

        /* Ensure mobile scrolling works properly */
        @media (max-width: 768px) {
          body {
            position: relative;
            height: auto;
            min-height: 100vh;
          }
        }
      `}</style>
      {isLoading && (
        <LoadingScreen
          onLoadingComplete={handleLoadingComplete}
          loadingTasks={loadingTasks}
        />
      )}{" "}
      <div
        className={`relative min-h-screen w-full p-0 m-0 overflow-x-hidden ${
          isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
        } transition-opacity duration-500`}
      >
        {/* Fixed background with Vintage Map and PixelBlast */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
          <div 
            className="absolute inset-0 opacity-55 max-sm:opacity-50 bg-cover bg-center max-sm:mix-blend-normal mix-blend-luminosity" 
            style={{ backgroundImage: "url('/vintage_map.png')" }}
          />
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#DC2626"
            patternScale={2.5}
            patternDensity={1.2}
            pixelSizeJitter={0.1}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.15}
            rippleIntensityScale={2.0}
            liquid={true}
            liquidStrength={0.08}
            liquidRadius={1.2}
            liquidWobbleSpeed={4.0}
            speed={0.4}
            edgeFade={0.3}
            transparent
            onReady={handleClockCollectionReady}
          />
          <div 
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.85) 100%)" }}
          />
        </div>

        {/* Content layer - scrollable */}
        <div
          className="relative z-10 touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* NavBar appears after animated text completes */}
          {showNavBar && (
            <NavBar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
          )}

          {/* Animated text that appears after clock is visible */}
          {showAnimatedText && (
            <div className="w-full pt-20 sm:pt-24 min-h-screen flex flex-col justify-between">
              <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeSection === "home" && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full flex items-center justify-center min-h-[calc(100vh-200px)] py-4 sm:py-8 relative px-4"
                    >
                      {/* Cyberpunk corner brackets */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/40 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-500/40 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-red-500/40 pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500/40 pointer-events-none" />

                      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
                        {/* Left side: Heading Text */}
                        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start select-none font-[family-name:var(--font-bebas-neue)] tracking-wider">
                          <div className="overflow-hidden">
                            <ScrambledText
                              className="text-white text-6xl sm:text-8xl md:text-9xl leading-none font-bold uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                              radius={120}
                              duration={1.0}
                              speed={0.6}
                              scrambleChars=".:"
                              delay={0.1}
                            >
                              TECH
                            </ScrambledText>
                          </div>
                          <div className="overflow-hidden mt-1 md:mt-2">
                            <ScrambledText
                              className="text-white text-6xl sm:text-8xl md:text-9xl leading-none font-bold uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                              radius={120}
                              duration={1.0}
                              speed={0.6}
                              scrambleChars=".:"
                              delay={0.2}
                            >
                              FIESTA
                            </ScrambledText>
                          </div>
                          
                          {/* The Odyssey slanted stamp banner */}
                          <div className="my-3 md:my-6 transform -rotate-2 origin-left overflow-hidden bg-red-600 px-4 py-1.5 md:px-6 md:py-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500/30">
                            <ScrambledText
                              className="text-black text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.1em]"
                              radius={120}
                              duration={1.0}
                              speed={0.6}
                              scrambleChars=".:"
                              delay={0.3}
                            >
                              THE ODYSSEY
                            </ScrambledText>
                          </div>

                          <div className="overflow-hidden">
                            <ScrambledText
                              className="text-white text-6xl sm:text-8xl md:text-9xl leading-none font-bold uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                              radius={120}
                              duration={1.0}
                              speed={0.6}
                              scrambleChars=".:"
                              delay={0.4}
                              onComplete={handleTextAnimationComplete}
                            >
                              2.0
                            </ScrambledText>
                          </div>
                          
                          <CountdownTimer />
                        </div>
                        
                        {/* Center: Tech HUD divider (visible on md and up) */}
                        <div className="hidden xl:flex flex-col items-center justify-center gap-5 text-red-500/40 font-mono text-[9px] tracking-[0.25em] uppercase select-none px-4 relative min-w-[120px] animate-[fadeIn_1s_ease-out_forwards] delay-1000">
                          <div className="text-[10px] text-red-500 animate-pulse font-bold tracking-[0.1em]">[ SYSTEM ]</div>
                          <div className="w-px h-12 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                          <div className="flex flex-col gap-1 items-center leading-normal">
                            <span>SEC: ODY-2.0</span>
                            <span>LAT: 12.8256° N</span>
                            <span>LON: 80.0398° E</span>
                          </div>
                          <div className="relative w-8 h-8 flex items-center justify-center my-1">
                            <div className="absolute inset-0 border border-red-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-1 border border-dashed border-red-500/40 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                            <span className="text-[8px] text-red-500/60">+</span>
                          </div>
                          <div className="flex flex-col gap-1 items-center leading-normal">
                            <span>STATUS: ONLINE</span>
                            <span>LOAD: 98.4%</span>
                            <span>PORT: 3001</span>
                          </div>
                          <div className="w-px h-12 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                          <div className="text-[10px] text-red-500 animate-pulse font-bold tracking-[0.1em]">[ TELEMETRY ]</div>
                        </div>
                        
                        {/* Right side: Spartan Poster */}
                        <div className="flex-1 min-w-[140px] sm:min-w-[240px] md:min-w-[380px] lg:min-w-[320px] max-w-[170px] sm:max-w-[280px] md:max-w-[480px] lg:max-w-[420px] relative z-10 character-float select-none animate-[fadeIn_1.2s_ease-out_forwards]">
                          {/* Outer glowing backlight red aura */}
                          <div className="absolute inset-0 bg-red-600/15 blur-[60px] rounded-2xl scale-95" />
                          <img
                            src="/odyssey_poster.png"
                            alt="Tech Fiesta 2.0: The Odyssey Poster"
                            className="w-full h-auto object-contain rounded-2xl border border-red-500/20 shadow-[0_20px_50px_rgba(220,38,38,0.3)] pointer-events-none"
                          />
                          
                          {/* Techy block overlay to cover the diamond symbol */}
                          <div className="absolute bottom-[4.2%] right-[4.2%] bg-black border border-red-500/40 rounded px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-red-500 font-mono text-[8px] sm:text-[9px] tracking-[0.15em] uppercase select-none flex items-center gap-1 sm:gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.8)] pointer-events-auto hover:border-red-500 transition-all duration-300">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-ping" />
                            SYS ACTIVE
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "about" && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full flex items-center justify-center min-h-[calc(100vh-200px)] py-8"
                    >
                      <div className="text-center text-white max-w-4xl px-5 py-8 sm:p-10 rounded-2xl bg-black/75 border border-red-500/20 backdrop-blur-sm shadow-[0_0_25px_rgba(220,38,38,0.15)]">
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 font-[family-name:var(--font-bebas-neue)] tracking-wider">
                          About Tech Fiesta 2.0
                        </h2>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-red-500 mb-6 font-mono tracking-widest uppercase">
                          Theme: The Odyssey
                        </h3>
                        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed text-gray-300">
                          Embark on an epic voyage of innovation, challenge, and triumph at Tech Fiesta 2.0: The Odyssey. Inspired by the ancient journey of Odysseus, this year&apos;s festival is a grand expedition navigating the frontiers of modern technology, game development, cybersecurity, AI, and creative design. Join innovators and creators from around the world as curiosity becomes innovation, and innovation becomes legacy.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
                          <GlareHover
                            width="100%"
                            height="auto"
                            background="rgba(10, 10, 10, 0.7)"
                            borderRadius="0.5rem"
                            borderColor="rgba(239, 68, 68, 0.3)"
                            glareColor="#DC2626"
                            glareOpacity={0.4}
                            glareAngle={-45}
                            transitionDuration={600}
                          >
                            <div className="rounded-lg p-6">
                              <div className="text-4xl font-bold text-red-500 mb-2 font-[family-name:var(--font-bebas-neue)] tracking-wider">
                                500+
                              </div>
                              <div className="text-gray-300 font-medium">Attendees Expected</div>
                            </div>
                          </GlareHover>
                          <GlareHover
                            width="100%"
                            height="auto"
                            background="rgba(10, 10, 10, 0.7)"
                            borderRadius="0.5rem"
                            borderColor="rgba(239, 68, 68, 0.3)"
                            glareColor="#DC2626"
                            glareOpacity={0.4}
                            glareAngle={-45}
                            transitionDuration={600}
                          >
                            <div className="rounded-lg p-6">
                              <div className="text-4xl font-bold text-red-500 mb-2 font-[family-name:var(--font-bebas-neue)] tracking-wider">
                                20+
                              </div>
                              <div className="text-gray-300 font-medium">Industry Speakers</div>
                            </div>
                          </GlareHover>
                          <GlareHover
                            width="100%"
                            height="auto"
                            background="rgba(10, 10, 10, 0.7)"
                            borderRadius="0.5rem"
                            borderColor="rgba(239, 68, 68, 0.3)"
                            glareColor="#DC2626"
                            glareOpacity={0.4}
                            glareAngle={-45}
                            transitionDuration={600}
                          >
                            <div className="rounded-lg p-6">
                              <div className="text-4xl font-bold text-red-500 mb-2 font-[family-name:var(--font-bebas-neue)] tracking-wider">
                                3
                              </div>
                              <div className="text-gray-300 font-medium">Days of Innovation</div>
                            </div>
                          </GlareHover>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "events" && (
                    <motion.div
                      key="events"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full min-h-[calc(100vh-200px)] py-4 sm:py-8"
                    >
                      <div className="max-w-7xl mx-auto">
                        <EventGrid
                          events={events}
                          title="Featured Events"
                          showFilter={true}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "workshops" && (
                    <motion.div
                      key="workshops"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full min-h-[calc(100vh-200px)] py-4 sm:py-8"
                    >
                      <div className="max-w-7xl mx-auto">
                        <WorkshopGrid
                          workshops={workshops.map((w) => ({
                            ...w,
                            level:
                              w.level === "Beginner" ||
                              w.level === "Intermediate" ||
                              w.level === "Advanced"
                                ? w.level
                                : undefined,
                          }))}
                          title="Hands-On Workshops"
                          showFilter={true}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Footer */}
              <Footer 
                onSectionChange={setActiveSection}
                onTriggerMatrix={() => setIsMatrixActive((prev) => !prev)}
                onTriggerSelfDestruct={() => setIsSelfDestructing(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Secret Matrix Overlay */}
      {isMatrixActive && (
        <MatrixRain onClose={() => setIsMatrixActive(false)} />
      )}

      {/* Secret Self-Destruct Overlay */}
      {isSelfDestructing && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono p-6 select-none animate-[pulse_1.5s_infinite]">
          <div className="absolute inset-4 border border-red-600 animate-[ping_1.5s_infinite_ease-in-out]" />
          <div className="absolute inset-0 bg-red-950/15 pointer-events-none" />
          
          <div className="text-red-600 font-bold text-lg sm:text-2xl tracking-[0.2em] mb-4 text-center">
            ⚠️ CRITICAL SYSTEM FAILURE ⚠️
          </div>
          
          <div className="text-gray-400 text-xs sm:text-sm max-w-md text-center leading-relaxed mb-8">
            SECURITY BREACH OR VOLUNTARY BYPASS OVERRIDE DETECTED. ALL LOCAL TERMINAL MEMORY BUFFERS ARE BEING PURGED.
          </div>

          <div className="relative flex items-center justify-center w-32 h-32 border-2 border-dashed border-red-500 rounded-full mb-6">
            <div className="absolute inset-2 border border-red-500/30 rounded-full" />
            <span className="text-white text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
              0{selfDestructCount}
            </span>
          </div>

          <div className="text-red-500 text-[10px] sm:text-xs tracking-wider animate-pulse">
            EMERGENCY KERNEL REBOOT INITIATED
          </div>
        </div>
      )}
    </>
  );
}
