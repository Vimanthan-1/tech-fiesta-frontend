"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  loadingTasks?: {
    name: string;
    completed: boolean;
  }[];
}

const LoadingScreen = ({
  onLoadingComplete,
  loadingTasks = [],
}: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Calculate if background loading tasks are completed
  const completedTasks = loadingTasks.filter((task) => task.completed).length;
  const totalTasks = loadingTasks.length;
  const allTasksCompleted = totalTasks > 0 ? completedTasks === totalTasks : true;

  useEffect(() => {
    // Prevent scroll during loading
    document.body.style.overflow = "hidden";
    setIsMounted(true);

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Smooth simulated progress count from 0 to 100 over 1.8 seconds
  useEffect(() => {
    const duration = 1800; // 1.8s loading screen
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const computedProgress = Math.min((elapsed / duration) * 100, 100);

      // Hold at 99% if background assets (like WebGL PixelBlast) are not ready yet
      let nextProgress = computedProgress;
      if (computedProgress >= 99 && !allTasksCompleted) {
        nextProgress = 99;
      }
      setAnimatedProgress(nextProgress);

      if (elapsed >= duration && allTasksCompleted) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [allTasksCompleted]);

  // Handle completion when animated progress reaches 100% and tasks are done
  useEffect(() => {
    if (allTasksCompleted && animatedProgress >= 100) {
      window.scrollTo(0, 0);

      onLoadingComplete?.(); // Transition start callback
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        document.body.style.overflow = "";
        setIsVisible(false);
      }, 250); // duration of fade transition

      return () => clearTimeout(timer);
    }
  }, [allTasksCompleted, animatedProgress, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-all duration-200 ease-in-out ${
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Dark vintage texture overlay on background */}
      {isMounted && (
        <div
          className={`absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-15 transition-opacity duration-200 ${
            isTransitioning ? "opacity-0" : "opacity-15"
          }`}
          style={{ backgroundImage: "url('/vintage_map.png')" }}
        />
      )}

      {/* Main loading element */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-200 ${
          isTransitioning
            ? "opacity-0 transform translate-y-4 scale-95"
            : "opacity-100 transform translate-y-0 scale-100"
        }`}
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Spartan character avatar inside circular frame */}
          <div className="w-28 h-28 rounded-full border border-red-600/30 bg-black/90 shadow-[0_0_20px_rgba(220,38,38,0.2)] overflow-hidden flex items-center justify-center relative p-1">
            <img 
              src="/odyssey_poster.png" 
              alt="The Odyssey Poster" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Glowing Red Progress Ring */}
          <div className="absolute inset-0 w-32 h-32">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="rgba(220, 38, 38, 0.15)"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#dc2626"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * animatedProgress) / 100}
                style={{
                  transition: "stroke-dashoffset 0.1s ease-out",
                }}
              />
            </svg>
          </div>
        </div>

        {/* Loading status text */}
        <div className="mt-8 text-center">
          <div className="text-white text-xl font-light tracking-widest uppercase mb-2">
            Initiating Odyssey
            <span className="inline-block">
              <span className="animate-pulse">.</span>
              <span
                className="animate-pulse"
                style={{ animationDelay: "0.2s" }}
              >
                .
              </span>
              <span
                className="animate-pulse"
                style={{ animationDelay: "0.4s" }}
              >
                .
              </span>
            </span>
          </div>
          <div className="text-red-500 font-semibold tracking-wider text-sm">
            {Math.round(animatedProgress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
