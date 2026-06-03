"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnimatedText from "@/components/AnimatedText";
import { AlertTriangle, Home, Calendar, ArrowLeft, Zap, Search } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (!isHydrated) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          setTimeout(() => router.push("/"), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router, isHydrated]);

  const handleGoHome = () => {
    setIsRedirecting(true);
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const suggestions = [
    { title: "Tech Fiesta 2.0 Events", href: "/" },
    { title: "Event Registration", href: "/registration" },
    { title: "Workshop Schedules", href: "/" },
    { title: "Contact Support", href: "/" }
  ];

  return (
    <>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Error Code with Glitch Effect */}
          <div className="relative mb-8">
            <div className="text-8xl sm:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-none">
              {isHydrated ? (
                <AnimatedText 
                  text="404" 
                  className="inline-block glitch-effect"
                  delay={0}
                />
              ) : (
                <span className="inline-block">404</span>
              )}
            </div>
            {/* Glitch overlay effects - only show after hydration */}
            {isHydrated && (
              <>
                <div className="absolute inset-0 text-8xl sm:text-9xl lg:text-[12rem] font-black text-red-500 opacity-20 animate-pulse">
                  404
                </div>
                <div className="absolute inset-0 text-8xl sm:text-9xl lg:text-[12rem] font-black text-cyan-400 opacity-10 transform translate-x-1 animate-ping">
                  404
                </div>
              </>
            )}
          </div>

          {/* Main Error Message */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <AlertTriangle className="w-16 h-16 text-yellow-400 animate-bounce" />
                {isHydrated && (
                  <div className="absolute inset-0 w-16 h-16 text-yellow-400 opacity-30 animate-ping">
                    <AlertTriangle className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
              {isHydrated ? (
                <AnimatedText 
                  text="TIME PARADOX DETECTED!" 
                  delay={200}
                />
              ) : (
                "TIME PARADOX DETECTED!"
              )}
            </h1>

            <div className="text-xl sm:text-2xl text-gray-300 mb-6 leading-relaxed">
              {isHydrated ? (
                <AnimatedText 
                  text="The page you're looking for seems to have been lost in the space-time continuum." 
                  delay={400}
                />
              ) : (
                "The page you're looking for seems to have been lost in the space-time continuum."
              )}
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-red-400/30 mb-8">
              <p className="text-red-300 font-medium mb-2">
                <Zap className="w-5 h-5 inline mr-2" />
                SYSTEM ERROR DETAILS:
              </p>
              <p className="text-gray-400 text-sm font-mono">
                ERROR_CODE: PAGE_NOT_FOUND_IN_TEMPORAL_MATRIX<br/>
                LOCATION: /tech-fiesta-2.0/unknown-dimension<br/>
                STATUS: REDIRECTING_TO_SAFE_TIMELINE
              </p>
            </div>

            {/* Auto-redirect countdown */}
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30 mb-8">
              <p className="text-blue-300 font-medium mb-2">
                <Calendar className="w-5 h-5 inline mr-2" />
                AUTO-NAVIGATION INITIATED
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-2xl font-bold text-white">
                  {isRedirecting ? (
                    <span className="text-green-400">REDIRECTING...</span>
                  ) : (
                    <span>{timeLeft}s</span>
                  )}
                </div>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Automatically returning to Tech Fiesta 2.0 home base...
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleGoHome}
              disabled={isRedirecting}
              className="group flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Home className="w-6 h-6 group-hover:animate-bounce" />
              Return to Tech Fiesta 2.0
            </button>

            <button
              onClick={handleGoBack}
              disabled={isRedirecting}
              className="group flex items-center justify-center gap-3 py-4 px-6 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-6 h-6 group-hover:animate-pulse" />
              Go Back in Time
            </button>
          </div>

          {/* Suggestions */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Navigate to Safe Dimensions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <Link
                  key={index}
                  href={suggestion.href}
                  className="group flex items-center justify-center gap-2 py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
                  <span className="font-medium">{suggestion.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tech-themed footer message */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              <code className="bg-gray-800/50 px-2 py-1 rounded text-green-400">
                if (lost) &#123; return home(); &#125;
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Add custom CSS for glitch effect */}
      <style jsx>{`
        .glitch-effect {
          position: relative;
          animation: glitch 2s infinite;
        }

        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
          }
          10% {
            transform: translate(-2px, 2px);
          }
          20% {
            transform: translate(-8px, -2px);
          }
          30% {
            transform: translate(8px, 2px);
          }
          40% {
            transform: translate(-2px, -8px);
          }
          50% {
            transform: translate(2px, 8px);
          }
          60% {
            transform: translate(-2px, 2px);
          }
          70% {
            transform: translate(8px, -2px);
          }
          80% {
            transform: translate(-8px, 2px);
          }
          90% {
            transform: translate(2px, -2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glitch-effect {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
