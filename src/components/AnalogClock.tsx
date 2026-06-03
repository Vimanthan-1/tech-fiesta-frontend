"use client";

import { useEffect, useState } from "react";

interface AnalogClockProps {
  size?: number;
  hourHandThickness?: number;
  minuteHandThickness?: number;
  secondHandThickness?: number;
  variant?: number;
}

function AnalogClock({
  size = 256,
  hourHandThickness = 1.5,
  minuteHandThickness = 1,
  secondHandThickness = 0.5,
  variant = 0,
}: AnalogClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const clockVariants = [
    // Variant 0: Dark Vintage Pocket Watch with Realistic Beveled Border
    {
      faceColor: "bg-gradient-to-br from-neutral-800 to-neutral-900",
      borderColor: "border-neutral-700",
      borderWidth: 12,
      numberStyle: "roman",
      hourHandColor: "bg-amber-400",
      minuteHandColor: "bg-amber-300",
      secondHandColor: "bg-red-500",
      centerDotColor: "bg-amber-500",
      markerColor: "rgb(251, 191, 36)",
      shadowColor: "shadow-neutral-800/50",
      textColor: "text-amber-200",
      design: "vintage",
      handStyle: "ornate",
    },
    // Other variants remain the same...
    {
      faceColor: "bg-gradient-to-br from-stone-800 to-stone-950",
      borderColor: "border-orange-600",
      borderWidth: 8,
      numberStyle: "arabic",
      hourHandColor: "bg-orange-400",
      minuteHandColor: "bg-orange-300",
      secondHandColor: "bg-red-500",
      centerDotColor: "bg-orange-500",
      markerColor: "rgb(251, 146, 60)",
      shadowColor: "shadow-orange-600/60",
      textColor: "text-orange-200",
      design: "steampunk",
      hasGears: true,
      handStyle: "industrial",
    },
    {
      faceColor: "bg-black",
      borderColor: "border-white",
      borderWidth: 1,
      numberStyle: "modern",
      hourHandColor: "bg-white",
      minuteHandColor: "bg-white",
      secondHandColor: "bg-cyan-400",
      centerDotColor: "bg-white",
      markerColor: "white",
      shadowColor: "shadow-cyan-400/30",
      textColor: "text-white",
      design: "modern",
      hasNeonGlow: true,
      handStyle: "sleek",
    },
    {
      faceColor: "bg-gradient-to-br from-slate-900 to-black",
      borderColor: "border-yellow-500",
      borderWidth: 4,
      numberStyle: "roman",
      hourHandColor: "bg-yellow-400",
      minuteHandColor: "bg-yellow-300",
      secondHandColor: "bg-red-500",
      centerDotColor: "bg-yellow-500",
      markerColor: "rgb(234, 179, 8)",
      shadowColor: "shadow-yellow-500/40",
      textColor: "text-yellow-300",
      design: "artdeco",
      hasGeometricPattern: true,
      handStyle: "geometric",
    },
    {
      faceColor: "bg-gradient-to-br from-slate-900 to-slate-950",
      borderColor: "border-blue-500",
      borderWidth: 2,
      numberStyle: "digital",
      hourHandColor: "bg-blue-400",
      minuteHandColor: "bg-blue-300",
      secondHandColor: "bg-green-400",
      centerDotColor: "bg-blue-500",
      markerColor: "rgb(96, 165, 250)",
      shadowColor: "shadow-blue-500/50",
      textColor: "text-blue-300",
      design: "digital",
      hasDigitalElements: true,
      handStyle: "tech",
    },
    {
      faceColor: "bg-gradient-to-br from-purple-900 to-black",
      borderColor: "border-purple-400",
      borderWidth: 3,
      numberStyle: "constellation",
      hourHandColor: "bg-purple-300",
      minuteHandColor: "bg-purple-200",
      secondHandColor: "bg-pink-400",
      centerDotColor: "bg-purple-400",
      markerColor: "rgb(196, 181, 253)",
      shadowColor: "shadow-purple-500/60",
      textColor: "text-purple-200",
      design: "cosmic",
      hasStars: true,
      handStyle: "cosmic",
    },
    {
      faceColor: "bg-gradient-to-br from-orange-900 to-red-950",
      borderColor: "border-yellow-600",
      borderWidth: 5,
      numberStyle: "retro",
      hourHandColor: "bg-yellow-400",
      minuteHandColor: "bg-orange-300",
      secondHandColor: "bg-red-400",
      centerDotColor: "bg-yellow-500",
      markerColor: "rgb(251, 191, 36)",
      shadowColor: "shadow-orange-600/50",
      textColor: "text-yellow-300",
      design: "retro",
      hasRetroPattern: true,
      handStyle: "retro",
    },
    {
      faceColor: "bg-gradient-to-br from-green-900 to-green-950",
      borderColor: "border-green-600",
      borderWidth: 6,
      numberStyle: "military",
      hourHandColor: "bg-green-300",
      minuteHandColor: "bg-green-200",
      secondHandColor: "bg-red-500",
      centerDotColor: "bg-green-400",
      markerColor: "rgb(134, 239, 172)",
      shadowColor: "shadow-green-600/40",
      textColor: "text-green-200",
      design: "military",
      hasCrosshairs: true,
      handStyle: "tactical",
    },
  ];

  const currentVariant = clockVariants[variant % clockVariants.length];
  const scale = size / 256;
  const hourHandHeight = 60 * scale;
  const minuteHandHeight = 80 * scale;
  const secondHandHeight = 90 * scale;
  const markerHeight = 15 * scale;

  // Adjust marker distance based on variant - variant 0 has extra border layers
  const baseMarkerDistance = size / 2 - 20 * scale;
  const markerDistance =
    variant === 0 ? baseMarkerDistance - 12 * scale : baseMarkerDistance;

  const centerDotSize = 12 * scale;
  const borderWidth = Math.max(1, currentVariant.borderWidth * scale);

  const scaledHourHandThickness = Math.max(1, hourHandThickness * scale);
  const scaledMinuteHandThickness = Math.max(0.8, minuteHandThickness * scale);
  const scaledSecondHandThickness = Math.max(0.5, secondHandThickness * scale);

  const romanNumerals = [
    "XII",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
  ];
  const arabicNumbers = [
    "12",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
  ];
  const modernNumbers = ["12", "", "", "3", "", "", "6", "", "", "9", "", ""];
  const digitalNumbers = [
    "12",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
  ];
  const constellationSymbols = [
    "✦",
    "★",
    "✧",
    "✩",
    "✪",
    "✫",
    "✬",
    "✭",
    "✮",
    "✯",
    "✰",
    "✱",
  ];
  const retroNumbers = [
    "12",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
  ];
  const militaryNumbers = [
    "12",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
  ];

  let secondDegrees = 0;
  let minuteDegrees = 0;
  let hourDegrees = 0;

  if (time) {
    secondDegrees = time.getSeconds() * 6;
    minuteDegrees = time.getMinutes() * 6 + time.getSeconds() * 0.1;
    hourDegrees = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;
  }

  if (!mounted) {
    return (
      <div
        className={`rounded-full ${currentVariant.borderColor} ${currentVariant.faceColor} mx-auto flex items-center justify-center`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderWidth: `${borderWidth}px`,
        }}
      />
    );
  }

  const renderDesignElements = () => {
    const elements = [];

    switch (currentVariant.design) {
      case "steampunk":
        if (currentVariant.hasGears) {
          elements.push(
            <div
              key="gear-1"
              className="absolute"
              style={{
                width: `${size * 0.15}px`,
                height: `${size * 0.15}px`,
                background: `conic-gradient(from 0deg, ${currentVariant.markerColor} 0deg, transparent 45deg, ${currentVariant.markerColor} 90deg, transparent 135deg, ${currentVariant.markerColor} 180deg, transparent 225deg, ${currentVariant.markerColor} 270deg, transparent 315deg)`,
                borderRadius: "50%",
                top: "20%",
                right: "20%",
                opacity: 0.4,
              }}
            />,
            <div
              key="gear-2"
              className="absolute"
              style={{
                width: `${size * 0.12}px`,
                height: `${size * 0.12}px`,
                background: `conic-gradient(from 45deg, ${currentVariant.markerColor} 0deg, transparent 60deg, ${currentVariant.markerColor} 120deg, transparent 180deg, ${currentVariant.markerColor} 240deg, transparent 300deg)`,
                borderRadius: "50%",
                bottom: "25%",
                left: "15%",
                opacity: 0.3,
              }}
            />
          );
        }
        break;

      case "cosmic":
        if (currentVariant.hasStars) {
          for (let i = 0; i < 8; i++) {
            const angle = (i * 45 * Math.PI) / 180;
            const radius = size * 0.35;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            elements.push(
              <div
                key={`star-${i}`}
                className="absolute text-purple-300"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  fontSize: `${Math.max(8, 12 * scale)}px`,
                  opacity: 0.6,
                }}
              >
                ✦
              </div>
            );
          }
        }
        break;

      case "military":
        if (currentVariant.hasCrosshairs) {
          elements.push(
            <div
              key="crosshair-h"
              className="absolute"
              style={{
                width: `${size * 0.7}px`,
                height: "1px",
                backgroundColor: currentVariant.markerColor,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.3,
              }}
            />,
            <div
              key="crosshair-v"
              className="absolute"
              style={{
                width: "1px",
                height: `${size * 0.7}px`,
                backgroundColor: currentVariant.markerColor,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.3,
              }}
            />
          );
        }
        break;

      case "artdeco":
        if (currentVariant.hasGeometricPattern) {
          elements.push(
            <div
              key="deco-pattern"
              className="absolute rounded-full"
              style={{
                width: `${size * 0.9}px`,
                height: `${size * 0.9}px`,
                background: `conic-gradient(from 0deg, transparent 0deg, ${currentVariant.markerColor}20 15deg, transparent 30deg, ${currentVariant.markerColor}20 45deg, transparent 60deg, ${currentVariant.markerColor}20 75deg, transparent 90deg, ${currentVariant.markerColor}20 105deg, transparent 120deg, ${currentVariant.markerColor}20 135deg, transparent 150deg, ${currentVariant.markerColor}20 165deg, transparent 180deg, ${currentVariant.markerColor}20 195deg, transparent 210deg, ${currentVariant.markerColor}20 225deg, transparent 240deg, ${currentVariant.markerColor}20 255deg, transparent 270deg, ${currentVariant.markerColor}20 285deg, transparent 300deg, ${currentVariant.markerColor}20 315deg, transparent 330deg, ${currentVariant.markerColor}20 345deg, transparent 360deg)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.2,
              }}
            />
          );
        }
        break;

      case "retro":
        if (currentVariant.hasRetroPattern) {
          elements.push(
            <div
              key="retro-pattern"
              className="absolute rounded-full"
              style={{
                width: `${size * 0.8}px`,
                height: `${size * 0.8}px`,
                background: `radial-gradient(circle at 30% 30%, ${currentVariant.markerColor}15 0%, transparent 40%), radial-gradient(circle at 70% 70%, ${currentVariant.markerColor}10 0%, transparent 40%)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.3,
              }}
            />
          );
        }
        break;

      case "digital":
        if (currentVariant.hasDigitalElements) {
          elements.push(
            <div
              key="digital-grid"
              className="absolute"
              style={{
                width: `${size * 0.9}px`,
                height: `${size * 0.9}px`,
                backgroundImage: `linear-gradient(${currentVariant.markerColor}20 1px, transparent 1px), linear-gradient(90deg, ${currentVariant.markerColor}20 1px, transparent 1px)`,
                backgroundSize: `${size * 0.1}px ${size * 0.1}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.15,
                borderRadius: "50%",
              }}
            />
          );
        }
        break;
    }

    return elements;
  };

  const renderNumbers = () => {
    let numbers;
    switch (currentVariant.numberStyle) {
      case "roman":
        numbers = romanNumerals;
        break;
      case "digital":
        numbers = digitalNumbers;
        break;
      case "constellation":
        numbers = constellationSymbols;
        break;
      case "retro":
        numbers = retroNumbers;
        break;
      case "military":
        numbers = militaryNumbers;
        break;
      case "modern":
        numbers = modernNumbers;
        break;
      default:
        numbers = arabicNumbers;
    }

    return numbers.map((num, i) => {
      if (!num) return null;

      const angle = i * 30 - 90;
      const radian = (angle * Math.PI) / 180;
      let numberDistance =
        markerDistance -
        (currentVariant.numberStyle === "roman" ? 25 * scale : 20 * scale);

      if (currentVariant.numberStyle === "military") {
        numberDistance = markerDistance - 35 * scale;
      } else if (currentVariant.numberStyle === "constellation") {
        numberDistance = markerDistance - 15 * scale;
      }

      const x = Math.cos(radian) * numberDistance;
      const y = Math.sin(radian) * numberDistance;

      let fontSize = Math.max(8, 14 * scale);
      let fontFamily = "sans-serif";
      let fontWeight = "font-bold";

      switch (currentVariant.numberStyle) {
        case "roman":
          fontFamily = "serif";
          fontWeight = "font-extrabold";
          break;
        case "digital":
          fontFamily = "monospace";
          fontWeight = "font-black";
          fontSize = Math.max(10, 16 * scale);
          break;
        case "constellation":
          fontSize = Math.max(12, 18 * scale);
          fontWeight = "font-normal";
          break;
        case "military":
          fontFamily = "monospace";
          fontSize = Math.max(6, 8 * scale);
          fontWeight = "font-bold";
          break;
        case "retro":
          fontFamily = "serif";
          fontWeight = "font-black";
          fontSize = Math.max(10, 16 * scale);
          break;
      }

      return (
        <div
          key={i}
          className={`absolute ${currentVariant.textColor} ${fontWeight} select-none`}
          style={{
            fontSize: `${fontSize}px`,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            fontFamily: fontFamily,
            textShadow:
              currentVariant.design === "modern" && currentVariant.hasNeonGlow
                ? `0 0 10px ${currentVariant.markerColor}`
                : "none",
          }}
        >
          {num}
        </div>
      );
    });
  };

  // Helper function to attempt to parse Tailwind color class
  const getColorFromTailwindClass = (twClass: string): string => {
    const parts = twClass.split("-");
    if (parts.length < 2) return twClass;
    const colorName = parts[1];
    const shade = parts[2];

    const colorPalette: { [key: string]: { [key: string]: string } } = {
      neutral: { "700": "#404040", "800": "#262626", "900": "#171717" },
      amber: {
        "200": "#fef3c7",
        "300": "#fde68a",
        "400": "#fbbf24",
        "500": "#f59e0b",
      },
      orange: {
        "300": "#fdba74",
        "400": "#fb923c",
        "500": "#f97316",
        "600": "#ea580c",
        "700": "#c2410c",
        "900": "#7c2d12",
      },
      red: { "500": "#ef4444" },
      cyan: { "400": "#22d3ee" },
      yellow: {
        "300": "#fde047",
        "400": "#facc15",
        "500": "#eab308",
        "600": "#ca8a04",
        "700": "#a16207",
      },
      blue: {
        "300": "#93c5fd",
        "400": "#60a5fa",
        "500": "#3b82f6",
        "600": "#2563eb",
        "700": "#1d4ed8",
        "900": "#1e3a8a",
      },
      purple: {
        "200": "#e9d5ff",
        "300": "#d8b4fe",
        "400": "#c084fc",
        "500": "#a855f7",
        "600": "#9333ea",
        "700": "#7e22ce",
        "900": "#581c87",
      },
      green: {
        "200": "#bbf7d0",
        "300": "#86efac",
        "400": "#4ade80",
        "500": "#22c55e",
        "600": "#16a34a",
        "700": "#15803d",
        "800": "#166534",
        "900": "#14532d",
      },
      white: { default: "#ffffff" },
    };
    if (colorPalette[colorName] && colorPalette[colorName][shade]) {
      return colorPalette[colorName][shade];
    }
    if (colorName === "white" && colorPalette.white.default)
      return colorPalette.white.default;
    return twClass.startsWith("border-") || twClass.startsWith("bg-")
      ? twClass.substring(twClass.indexOf("-") + 1)
      : twClass; // Fallback
  };

  // Function to render the clock face content (common to all variants)
  const renderClockFace = () => (
    <div
      className={`relative rounded-full ${currentVariant.faceColor} flex items-center justify-center`}
      style={{
        width: "100%",
        height: "100%",
        boxShadow:
          variant === 0
            ? `
          inset 0 0 12px rgba(0,0,0,0.8),
          inset 0 4px 8px rgba(0,0,0,0.6),
          0 2px 4px rgba(0,0,0,0.3)
        `
            : `inset 0 2px 8px rgba(0,0,0,0.4)`,
      }}
    >
      <div className="absolute inset-0 rounded-full">
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const isSpecial = [0, 3, 6, 9].includes(i);
          return (
            <div
              key={i}
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                width: `${Math.max(1, isSpecial ? 3 * scale : 1.5 * scale)}px`,
                height: `${Math.max(
                  8,
                  isSpecial ? markerHeight * 1.5 : markerHeight
                )}px`,
                backgroundColor: currentVariant.markerColor,
                transform: `translate(-50%, -50%) rotate(${
                  i * 30
                }deg) translateY(-${markerDistance}px)`,
                transformOrigin: "50% 50%",
              }}
            />
          );
        })}

        {/* Numbers */}
        {renderNumbers()}

        {/* Design Elements */}
        {renderDesignElements()}

        {/* Clock hands */}
        <div
          className={`absolute ${currentVariant.hourHandColor} transition-transform duration-1000 ease-in-out`}
          style={{
            width: `${scaledHourHandThickness}px`,
            height: `${hourHandHeight}px`,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -100%) rotate(${hourDegrees}deg)`,
            transformOrigin: "50% 100%",
            borderRadius:
              currentVariant.handStyle === "sleek"
                ? `${scaledHourHandThickness / 2}px`
                : currentVariant.handStyle === "geometric"
                ? "0px"
                : `${scaledHourHandThickness / 4}px`,
            clipPath:
              currentVariant.handStyle === "ornate"
                ? "polygon(40% 0%, 60% 0%, 70% 20%, 60% 100%, 40% 100%, 30% 20%)"
                : currentVariant.handStyle === "geometric"
                ? "polygon(45% 0%, 55% 0%, 60% 30%, 55% 100%, 45% 100%, 40% 30%)"
                : currentVariant.handStyle === "cosmic"
                ? "polygon(47% 0%, 53% 0%, 55% 15%, 53% 100%, 47% 100%, 45% 15%)"
                : "none",
            boxShadow:
              currentVariant.design === "modern" && currentVariant.hasNeonGlow
                ? `0 0 8px ${currentVariant.hourHandColor
                    .replace("bg-", "")
                    .replace("white", "#ffffff")
                    .replace("blue-400", "#60a5fa")}`
                : "none",
          }}
        />

        <div
          className={`absolute ${currentVariant.minuteHandColor} transition-transform duration-1000 ease-in-out`}
          style={{
            width: `${scaledMinuteHandThickness}px`,
            height: `${minuteHandHeight}px`,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -100%) rotate(${minuteDegrees}deg)`,
            transformOrigin: "50% 100%",
            borderRadius:
              currentVariant.handStyle === "sleek"
                ? `${scaledMinuteHandThickness / 2}px`
                : currentVariant.handStyle === "geometric"
                ? "0px"
                : `${scaledMinuteHandThickness / 4}px`,
            clipPath:
              currentVariant.handStyle === "ornate"
                ? "polygon(42% 0%, 58% 0%, 65% 25%, 58% 100%, 42% 100%, 35% 25%)"
                : currentVariant.handStyle === "geometric"
                ? "polygon(46% 0%, 54% 0%, 58% 35%, 54% 100%, 46% 100%, 42% 35%)"
                : currentVariant.handStyle === "cosmic"
                ? "polygon(48% 0%, 52% 0%, 54% 20%, 52% 100%, 48% 100%, 46% 20%)"
                : "none",
            boxShadow:
              currentVariant.design === "modern" && currentVariant.hasNeonGlow
                ? `0 0 6px ${currentVariant.minuteHandColor
                    .replace("bg-", "")
                    .replace("white", "#ffffff")
                    .replace("blue-300", "#93c5fd")}`
                : "none",
          }}
        />

        <div
          className={`absolute ${currentVariant.secondHandColor}`}
          style={{
            width: `${scaledSecondHandThickness}px`,
            height: `${secondHandHeight}px`,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -100%) rotate(${secondDegrees}deg)`,
            transformOrigin: "50% 100%",
            borderRadius:
              currentVariant.handStyle === "sleek"
                ? `${scaledSecondHandThickness / 2}px`
                : currentVariant.handStyle === "geometric"
                ? "0px"
                : `${scaledSecondHandThickness / 4}px`,
            clipPath:
              currentVariant.handStyle === "tactical"
                ? "polygon(48% 0%, 52% 0%, 50% 10%, 52% 100%, 48% 100%, 50% 10%)"
                : currentVariant.handStyle === "cosmic"
                ? "polygon(49% 0%, 51% 0%, 50% 5%, 51% 100%, 49% 100%, 50% 5%)"
                : "none",
            boxShadow:
              currentVariant.design === "modern" && currentVariant.hasNeonGlow
                ? `0 0 4px ${currentVariant.secondHandColor
                    .replace("bg-", "")
                    .replace("cyan-400", "#22d3ee")}`
                : "none",
          }}
        />

        {/* Center dot */}
        <div
          className={`absolute ${currentVariant.centerDotColor} rounded-full z-10`}
          style={{
            width: `${Math.max(8, centerDotSize)}px`,
            height: `${Math.max(8, centerDotSize)}px`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
  // Function to render the clock with appropriate border based on variant
  const renderClockWithBorder = () => {
    if (variant === 0) {
      // Variant 0: Enhanced 3D Beveled Border (Realistic Watch)
      return (
        <div
          className="relative mx-auto" // Outermost bezel container
          style={{
            width: `${size + 40}px`,
            height: `${size + 40}px`,
            background: `
              radial-gradient(circle at 25% 25%, #f3f4f6 0%, #d1d5db 15%, #9ca3af 30%, #6b7280 50%, #4b5563 70%, #374151 85%, #1f2937 100%)
            `,
            borderRadius: "50%",
            boxShadow: `
              0 0 0 1px #0f172a,
              0 0 0 3px #1e293b,
              0 0 0 5px #334155,
              0 0 0 7px #475569,
              inset 0 6px 12px rgba(0,0,0,0.4),
              inset 0 -4px 8px rgba(255,255,255,0.15),
              inset 2px 2px 6px rgba(255,255,255,0.2),
              inset -2px -2px 6px rgba(0,0,0,0.3),
              0 12px 24px rgba(0,0,0,0.5),
              0 6px 12px rgba(0,0,0,0.3)
            `,
            padding: "20px",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        >
          {/* Middle bezel ring */}
          <div
            className="relative"
            style={{
              width: "100%",
              height: "100%",
              background: `
                conic-gradient(from 0deg, 
                  #9ca3af 0deg, #b0b5c0 30deg, #8b919e 60deg, 
                  #6b7280 90deg, #5a6169 120deg, #7a8088 150deg,
                  #9ca3af 180deg, #b0b5c0 210deg, #8b919e 240deg,
                  #6b7280 270deg, #5a6169 300deg, #7a8088 330deg, #9ca3af 360deg)
              `,
              borderRadius: "50%",
              boxShadow: `
                inset 0 3px 6px rgba(255,255,255,0.25),
                inset 0 -3px 6px rgba(0,0,0,0.4),
                inset 1px 1px 3px rgba(255,255,255,0.3),
                inset -1px -1px 3px rgba(0,0,0,0.3),
                0 0 0 2px #374151,
                0 2px 4px rgba(0,0,0,0.2)
              `,
              padding: "8px",
            }}
          >
            {/* Inner metallic ring with micro-textures */}
            <div
              className="relative"
              style={{
                width: "100%",
                height: "100%",
                background: `
                  radial-gradient(circle at 35% 35%, #e5e7eb 0%, #d1d5db 20%, #9ca3af 40%, #6b7280 60%, #4b5563 80%, #374151 100%),
                  repeating-conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 1deg, transparent 2deg)
                `,
                borderRadius: "50%",
                boxShadow: `
                  inset 0 2px 4px rgba(255,255,255,0.3),
                  inset 0 -2px 4px rgba(0,0,0,0.5),
                  inset 1px 1px 2px rgba(255,255,255,0.4),
                  inset -1px -1px 2px rgba(0,0,0,0.4),
                  0 0 0 1px #1f2937,
                  0 1px 2px rgba(0,0,0,0.3)
                `,
                padding: "6px",
                position: "relative",
              }}
            >
              {/* Crown/winding mechanism indicator */}
              <div
                className="absolute"
                style={{
                  width: `${size * 0.04}px`,
                  height: `${size * 0.08}px`,
                  background:
                    "linear-gradient(90deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)",
                  borderRadius: "2px",
                  top: "50%",
                  right: "-2px",
                  transform: "translateY(-50%)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.3)",
                }}
              />{" "}
              {/* Micro hour markers on bezel */}
              {[...Array(60)].map((_, i) => {
                const isMainMarker = i % 5 === 0;
                // Adjust bezel marker distance to position markers on the bezel ring
                const bezelMarkerDistance = (size + 20) * 0.42; // Position on the middle bezel ring
                return (
                  <div
                    key={`bezel-marker-${i}`}
                    className="absolute"
                    style={{
                      width: isMainMarker ? "3px" : "1.5px",
                      height: isMainMarker
                        ? `${size * 0.06}px`
                        : `${size * 0.03}px`,
                      background: isMainMarker ? "#ffffff" : "#d1d5db",
                      top: "50%",
                      left: "50%",
                      transformOrigin: "50% 50%",
                      transform: `translate(-50%, -50%) rotate(${
                        i * 6
                      }deg) translateY(-${bezelMarkerDistance}px)`,
                      opacity: isMainMarker ? 0.9 : 0.7,
                      boxShadow: isMainMarker
                        ? "0 0 2px rgba(0,0,0,0.8), inset 0 1px rgba(255,255,255,0.3)"
                        : "0 0 1px rgba(0,0,0,0.6)",
                      borderRadius: "1px",
                      zIndex: 10,
                    }}
                  />
                );
              })}
              {renderClockFace()}
            </div>
          </div>{" "}
        </div>
      );
    } else {
      // Other variants: 2-level 3D border (simplified version)
      const borderColor = currentVariant.borderColor.startsWith("border-")
        ? getColorFromTailwindClass(currentVariant.borderColor)
        : currentVariant.borderColor;

      return (
        <div
          className="relative mx-auto" // Outer bezel container
          style={{
            width: `${size + 20}px`,
            height: `${size + 20}px`,
            background: `
              radial-gradient(circle at 25% 25%, ${borderColor}40 0%, ${borderColor}60 20%, ${borderColor}80 50%, ${borderColor} 80%, ${borderColor}cc 100%)
            `,
            borderRadius: "50%",
            boxShadow: `
              0 0 0 1px ${borderColor}30,
              0 0 0 2px ${borderColor}60,
              inset 0 3px 6px rgba(0,0,0,0.3),
              inset 0 -2px 4px rgba(255,255,255,0.1),
              inset 1px 1px 3px rgba(255,255,255,0.15),
              inset -1px -1px 3px rgba(0,0,0,0.2),
              0 6px 12px rgba(0,0,0,0.3),
              0 0 ${8 * scale}px ${currentVariant.markerColor}60
            `,
            padding: "5px",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        >
          {/* Inner metallic ring */}
          <div
            className="relative"
            style={{
              width: "100%",
              height: "100%",
              background: `
                conic-gradient(from 0deg, 
                  ${borderColor}80 0deg, ${borderColor}a0 90deg, ${borderColor}60 180deg, ${borderColor}a0 270deg, ${borderColor}80 360deg)
              `,
              borderRadius: "50%",
              boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.2),
                inset 0 -2px 4px rgba(0,0,0,0.3),
                inset 1px 1px 2px rgba(255,255,255,0.25),
                inset -1px -1px 2px rgba(0,0,0,0.25),
                0 0 0 1px ${borderColor}40,
                0 1px 2px rgba(0,0,0,0.2)
              `,
              padding: "5px",
            }}
          >
            {renderClockFace()}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center">{renderClockWithBorder()}</div>
  );
}

export default AnalogClock;
