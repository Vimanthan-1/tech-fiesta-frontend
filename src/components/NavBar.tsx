"use client";

import { useState, useEffect, useRef } from "react";

interface NavBarProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  selectionCount?: number;
}

export default function NavBar({ activeSection, onSectionChange, selectionCount = 0 }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [processedImage, setProcessedImage] = useState<string>("");
  const flickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/secret_brackets.jpg";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = (r + g + b) / 3;
            // Alpha is inversely proportional to brightness (white bg transparent, dark logo opaque)
            const alpha = Math.max(0, Math.min(255, 255 - brightness));
            
            data[i] = 239;     // R (crimson red)
            data[i + 1] = 68;  // G
            data[i + 2] = 68;  // B
            data[i + 3] = alpha;
          }
          ctx.putImageData(imageData, 0, 0);
          setProcessedImage(canvas.toDataURL("image/png"));
        } catch (e) {
          console.error("Failed to remove image background via canvas", e);
        }
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (flickerTimeoutRef.current) {
        clearTimeout(flickerTimeoutRef.current);
      }
    };
  }, []);

  const handleBrandDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFlickering((prev) => {
      const nextState = !prev;
      if (flickerTimeoutRef.current) {
        clearTimeout(flickerTimeoutRef.current);
      }
      if (nextState) {
        flickerTimeoutRef.current = setTimeout(() => {
          setIsFlickering(false);
        }, 1000); // Stop flickering after 1 second
      }
      return nextState;
    });
  };

  // Define navigation items
  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Workshops", href: "#workshops" },
    { label: "Contact", href: "#contact" },
    { label: "Register", href: "#register", badge: selectionCount },
  ];

  // Handle navigation clicks
  const handleNavClick = (href: string) => {
    const sectionId = href.replace("#", "");
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-50 w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto flex items-center justify-between pointer-events-none select-none animate-[slideDown_0.4s_ease-out_forwards]">
        <style jsx>{`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .box-btn {
            background: rgba(10, 10, 10, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(239, 68, 68, 0.35); /* light crimson red border */
            border-radius: 8px;
            padding: 8px 16px;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            color: #f87171; /* light crimson red text */
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
          }
          .box-btn:hover {
            border-color: rgba(239, 68, 68, 0.85);
            transform: translateY(-4px); /* swipe up */
            color: #ef4444; /* bright crimson red */
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.25);
          }
          .box-btn.active {
            border-color: rgba(239, 68, 68, 0.85);
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444; /* bright crimson red */
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
            transform: translateY(-2px);
          }
          .box-btn:active {
            transform: translateY(-2px);
          }
          @keyframes flicker {
            0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
              opacity: 0.99;
              filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.75));
            }
            20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
              opacity: 0.15;
              filter: drop-shadow(0 0 1px rgba(239, 68, 68, 0.15));
            }
          }
          .animate-flicker {
            animation: flicker 1.8s infinite;
          }
        `}</style>

        {/* Left Side: Asymmetric Brand Logo Button */}
        <div className="pointer-events-auto relative">
          <button
            onClick={() => handleNavClick("#home")}
            onDoubleClick={handleBrandDoubleClick}
            className={`box-btn inline-flex items-center gap-2.5 cursor-pointer relative overflow-hidden ${activeSection === "home" ? "active" : ""}`}
            style={{ minWidth: "135px" }}
            title="Double click to reveal"
          >
            {/* Standard content */}
            <img 
              src="/assNo_00000.png" 
              alt="Asymmetric Logo" 
              className={`w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0 transition-opacity duration-300 ${isFlickering ? "opacity-0" : "opacity-100"}`}
            />
            <span className={`text-sm sm:text-base font-bold tracking-wider uppercase font-[family-name:var(--font-bebas-neue)] transition-opacity duration-300 ${isFlickering ? "opacity-0" : "opacity-100"}`}>
              Asymmetric
            </span>

            {/* Flickering custom brackets logo overlay */}
            {isFlickering && (
              <div className="absolute inset-0 bg-black/95 flex items-center justify-center animate-flicker z-10">
                <img 
                  src={processedImage || "/secret_brackets.jpg"} 
                  alt="Code Brackets" 
                  className="h-10 sm:h-12 w-auto object-contain"
                  style={{
                    filter: processedImage ? "none" : "invert(1) brightness(1.5)"
                  }}
                />
              </div>
            )}
          </button>
        </div>

        {/* Right Side: Desktop Nav Buttons (hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-3.5 pointer-events-auto">
          {navItems.map((item) => {
            const isAnchor = item.href.startsWith("#");
            const targetSection = item.href.replace("#", "");
            const isActive = isAnchor && activeSection === targetSection;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`box-btn text-sm font-bold tracking-wider uppercase font-[family-name:var(--font-bebas-neue)] cursor-pointer flex items-center gap-1.5 ${isActive ? "active" : ""}`}
              >
                {item.label}
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono leading-none bg-red-600 text-white rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.7)] border border-red-500">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Mobile Hamburger Menu Button (visible on mobile) */}
        <div className="lg:hidden pointer-events-auto relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="box-btn p-2.5 flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {!isMenuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </button>
          {selectionCount > 0 && !isMenuOpen && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-mono leading-none bg-red-600 text-white rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.7)] border border-red-500">
              {selectionCount}
            </span>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay and Dropdown */}
      {isMenuOpen && (
        <>
          {/* Semi-transparent overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Mobile menu - floating list of box buttons */}
          <div className="lg:hidden fixed top-20 left-4 right-4 z-50 pointer-events-auto flex flex-col gap-2.5">
            <style jsx>{`
              .mobile-box-btn {
                background: rgba(10, 10, 10, 0.95);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(239, 68, 68, 0.35);
                border-radius: 8px;
                padding: 14px;
                text-align: center;
                color: #f87171; /* light crimson red */
                font-size: 1rem;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-family: var(--font-bebas-neue), sans-serif;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                cursor: pointer;
              }
              .mobile-box-btn:active {
                background: rgba(239, 68, 68, 0.15);
                border-color: #ef4444;
                transform: translateY(-2px); /* swipe up on active touch */
              }
              .mobile-box-btn.active {
                background: rgba(239, 68, 68, 0.15);
                border-color: rgba(239, 68, 68, 0.85);
                color: #ef4444;
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
              }
            `}</style>
            {navItems.map((item) => {
              const isAnchor = item.href.startsWith("#");
              const targetSection = item.href.replace("#", "");
              const isActive = isAnchor && activeSection === targetSection;
              return (
                <button
                  key={item.label}
                  className={`mobile-box-btn flex items-center justify-center gap-2 ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavClick(item.href);
                  }}
                >
                  {item.label}
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 text-xs font-mono leading-none bg-red-600 text-white rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.7)] border border-red-500">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
