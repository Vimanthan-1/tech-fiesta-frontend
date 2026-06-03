"use client";

import { useState } from "react";

interface NavBarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function NavBar({ activeSection, onSectionChange }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define navigation items
  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Workshops", href: "#workshops" },
    { label: "Register", href: "/registration" },
  ];

  // Handle navigation clicks
  const handleNavClick = (href: string) => {
    if (href.startsWith("/")) {
      // External route - navigate to page
      window.location.href = href;
    } else {
      // Internal anchor - switch tab/view
      const sectionId = href.replace("#", "");
      onSectionChange(sectionId);
    }
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
        `}</style>

        {/* Left Side: Asymmetric Brand Logo Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => handleNavClick("#home")}
            className={`box-btn inline-flex items-center gap-2.5 cursor-pointer ${activeSection === "home" ? "active" : ""}`}
          >
            <img 
              src="/assNo_00000.png" 
              alt="Asymmetric Logo" 
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
            />
            <span className="text-sm sm:text-base font-bold tracking-wider uppercase font-[family-name:var(--font-bebas-neue)]">
              Asymmetric
            </span>
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
                className={`box-btn text-sm font-bold tracking-wider uppercase font-[family-name:var(--font-bebas-neue)] cursor-pointer ${isActive ? "active" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Hamburger Menu Button (visible on mobile) */}
        <div className="lg:hidden pointer-events-auto">
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
                  className={`mobile-box-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavClick(item.href);
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
