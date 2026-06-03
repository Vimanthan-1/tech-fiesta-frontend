"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: string;
  delay?: number;
  onComplete?: () => void;
}

const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:/\\*#@!$%&?",
  className = "",
  style = {},
  children,
  delay = 0,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Grab all character elements inside the paragraph
    const p = containerRef.current.querySelector("p");
    if (!p) return;

    const spans = p.querySelectorAll(".scramble-char");
    charsRef.current = Array.from(spans) as HTMLSpanElement[];

    // Store original characters in dataset
    charsRef.current.forEach((char) => {
      char.setAttribute("data-content", char.innerHTML);
    });

    // Proximity logic
    const handleMove = (e: PointerEvent) => {
      charsRef.current.forEach((c) => {
        const originalText = c.getAttribute("data-content") || "";
        if (originalText === " ") return; // Don't scramble spaces

        const rect = c.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        // If the cursor is close enough, scramble the character
        if (dist < radius) {
          // If already in a scramble cycle, don't overlap too frequently
          if (c.getAttribute("data-scrambling") === "true") return;

          c.setAttribute("data-scrambling", "true");

          // Calculate duration based on distance (closer = faster scramble, further = shorter scramble)
          const factor = 1 - dist / radius;
          const totalScrambles = Math.max(3, Math.round(duration * 10 * factor));
          let currentScramble = 0;

          const intervalTime = Math.max(30, 100 * (1 - speed));

          const scrambleInterval = setInterval(() => {
            if (currentScramble >= totalScrambles) {
              clearInterval(scrambleInterval);
              c.innerHTML = originalText;
              c.removeAttribute("data-scrambling");
            } else {
              // Pick a random scramble char
              const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
              c.innerHTML = randChar;
              currentScramble++;
            }
          }, intervalTime);
        }
      });
    };

    window.addEventListener("pointermove", handleMove);

    // Initial swipe-up / fade-in entry animation
    gsap.fromTo(
      charsRef.current,
      {
        y: 65, // slightly larger swipe-up distance
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: delay,
        stagger: 0.02,
        ease: "power3.out",
        onComplete: () => {
          onComplete?.();
        },
      }
    );

    return () => {
      window.removeEventListener("pointermove", handleMove);
    };
  }, [radius, duration, speed, scrambleChars, delay, onComplete]);

  // Split string into characters for scramble rendering
  const textChars = children.split("");

  return (
    <div ref={containerRef} className={`text-block ${className}`} style={style}>
      <p style={{ margin: 0, display: "inline-block" }}>
        {textChars.map((char, index) => (
          <span
            key={index}
            className="scramble-char"
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              willChange: "transform, opacity",
            }}
          >
            {char}
          </span>
        ))}
      </p>
    </div>
  );
};

export default ScrambledText;
