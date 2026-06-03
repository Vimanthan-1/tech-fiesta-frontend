"use client";

import React, { useEffect, useRef } from "react";

interface MatrixRainProps {
  onClose: () => void;
}

export default function MatrixRain({ onClose }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Make canvas full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix characters (mix of Japanese katakana, binary, and hex)
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ12034567890ABCDEF$#@%&*";
    const charArray = chars.split("");

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops: number[] = Array(columns).fill(1);

    let animationFrameId: number;

    const draw = () => {
      // Draw a semi-transparent black background to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Crimson Red color for matrix characters
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Pick a random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Draw the character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Make some characters brighter white/red to look like leading drops
        if (Math.random() > 0.975) {
          ctx.fillStyle = "#FFFFFF";
        } else {
          ctx.fillStyle = "#EF4444"; // Crimson Red
        }
        
        ctx.fillText(char, x, y);

        // Reset drop to top of screen once it reaches the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Escape key press handler to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] cursor-pointer"
      onClick={onClose}
      title="Click or press ESC to exit terminal simulation overlay"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Floating high-tech HUD indicator */}
      <div className="absolute top-4 right-4 bg-black/90 border border-red-500/40 rounded px-2.5 py-1.5 text-red-500 font-mono text-[9px] tracking-[0.15em] uppercase select-none flex items-center gap-2 pointer-events-none animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.25)]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        HACK_MODE OVERLAY ACTIVE // CLICK ANYWHERE TO ABORT
      </div>
    </div>
  );
}
