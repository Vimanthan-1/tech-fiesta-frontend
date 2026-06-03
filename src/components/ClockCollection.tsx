"use client";

import React, { useEffect, useState } from "react";
import AnalogClock from "./AnalogClock";

interface ClockCollectionProps {
  mainClockSize?: number;
  smallClockCount?: number;
  onReady?: () => void;
}

const ClockCollection = ({
  mainClockSize = 400,
  smallClockCount = 60,
  onReady,
}: ClockCollectionProps) => {
  const [viewportSize, setViewportSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && typeof window !== "undefined") {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && viewportSize && onReady) {
      const timer = setTimeout(() => {
        onReady();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, viewportSize, onReady]);

  const getResponsiveSizes = () => {
    if (!viewportSize)
      return { mainSize: mainClockSize, smallCount: smallClockCount };

    const { width, height } = viewportSize;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    let responsiveMainSize = mainClockSize;
    let responsiveSmallCount = smallClockCount;
    if (isMobile) {
      responsiveMainSize = Math.min(
        mainClockSize * 0.6,
        width * 0.6,
        height * 0.4
      );
      responsiveSmallCount = Math.min(
        Math.max(80, Math.floor(smallClockCount * 1.5)),
        120
      ); // Increased for coverage
    } else if (isTablet) {
      responsiveMainSize = Math.min(
        mainClockSize * 0.8,
        width * 0.5,
        height * 0.5
      );
      responsiveSmallCount = Math.min(
        Math.max(100, Math.floor(smallClockCount * 1.8)),
        150
      ); // Increased for coverage
    } else {
      responsiveMainSize = Math.min(mainClockSize, width * 0.4, height * 0.6);
      responsiveSmallCount = Math.min(
        Math.max(120, Math.floor(smallClockCount * 2.2)),
        180
      ); // Increased for coverage
    }

    return {
      mainSize: Math.max(200, responsiveMainSize),
      smallCount: responsiveSmallCount,
    };
  };

  const generateClocks = () => {
    const clocks: Array<{
      x: number;
      y: number;
      size: number;
      hourHandThickness: number;
      minuteHandThickness: number;
      secondHandThickness: number;
      zone: string;
      variant: number; // Add variant property
    }> = [];

    const { mainSize, smallCount } = getResponsiveSizes();

    const width = viewportSize?.width || 1200;
    const height = viewportSize?.height || 800;

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    let sizes;
    if (isMobile) {
      sizes = [
        { min: 50, max: 80, weight: 0.4 },
        { min: 80, max: 120, weight: 0.35 },
        { min: 120, max: 160, weight: 0.2 },
        { min: 160, max: 200, weight: 0.05 },
      ];
    } else if (isTablet) {
      sizes = [
        { min: 60, max: 100, weight: 0.4 },
        { min: 100, max: 140, weight: 0.35 },
        { min: 140, max: 180, weight: 0.2 },
        { min: 180, max: 220, weight: 0.05 },
      ];
    } else {
      sizes = [
        { min: 70, max: 120, weight: 0.4 },
        { min: 120, max: 170, weight: 0.35 },
        { min: 170, max: 220, weight: 0.2 },
        { min: 220, max: 280, weight: 0.05 },
      ];
    }

    const mainClockRadius = mainSize / 2;
    const avoidZoneRadius = mainClockRadius + 40;

    const getRandomSize = () => {
      const rand = Math.random();
      let cumulativeWeight = 0;

      for (const sizeRange of sizes) {
        cumulativeWeight += sizeRange.weight;
        if (rand <= cumulativeWeight) {
          return Math.floor(
            sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min)
          );
        }
      }
      return sizes[0].min;
    }; // Function to get random variant (1-7 for smaller clocks, excluding variant 0 which is reserved for main clock)
    const getRandomVariant = () => {
      return Math.floor(Math.random() * 7) + 1; // Returns 1-7, excluding 0
    };

    const isTooCloseToMainClock = (x: number, y: number, radius: number) => {
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      return distanceFromCenter < avoidZoneRadius + radius;
    };
    const gridSize = isMobile ? 60 : isTablet ? 70 : 80; // Smaller grid for denser coverage
    const extendedWidth = width * 1.4; // Extended coverage area for better screen filling
    const extendedHeight = height * 1.4;

    const cols = Math.ceil(extendedWidth / gridSize);
    const rows = Math.ceil(extendedHeight / gridSize);

    const allPositions = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * gridSize - extendedWidth / 2 + gridSize / 2;
        const y = row * gridSize - extendedHeight / 2 + gridSize / 2;

        const randomX = x + (Math.random() - 0.5) * gridSize * 0.7;
        const randomY = y + (Math.random() - 0.5) * gridSize * 0.7;

        allPositions.push({ x: randomX, y: randomY, row, col });
      }
    }

    // Shuffle positions for random placement
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
    }
    let placed = 0;
    const targetCount = Math.min(smallCount, 250); // Increased maximum for much better coverage

    for (const pos of allPositions) {
      if (placed >= targetCount) break;

      const size = getRandomSize();
      const radius = size / 2;

      if (isTooCloseToMainClock(pos.x, pos.y, radius)) {
        continue;
      }
      let completeOverlap = false;
      for (const existingClock of clocks) {
        const distance = Math.sqrt(
          (pos.x - existingClock.x) ** 2 + (pos.y - existingClock.y) ** 2
        );
        const minDistance = Math.max(
          15,
          (radius + existingClock.size / 2) * 0.9
        ); // Reduced spacing for denser coverage
        if (distance < minDistance) {
          completeOverlap = true;
          break;
        }
      }

      if (!completeOverlap) {
        const hourHandThickness = Math.max(0.8, size / 80);
        const minuteHandThickness = Math.max(0.6, size / 120);
        const secondHandThickness = Math.max(0.4, size / 160);

        clocks.push({
          x: pos.x,
          y: pos.y,
          size,
          hourHandThickness,
          minuteHandThickness,
          secondHandThickness,
          zone: `grid-${pos.row}-${pos.col}`,
          variant: getRandomVariant(), // Assign random variant
        });
        placed++;
      }
    } // Add additional random clocks
    let extraAttempts = 0;
    const extraTarget = Math.min(placed + 50, targetCount, 250); // Increased extra clocks and max to 250

    while (clocks.length < extraTarget && extraAttempts < 100) {
      extraAttempts++;

      const x = (Math.random() - 0.5) * extendedWidth;
      const y = (Math.random() - 0.5) * extendedHeight;
      const size = getRandomSize();
      const radius = size / 2;

      if (isTooCloseToMainClock(x, y, radius)) {
        continue;
      }
      let tooClose = false;
      for (const existingClock of clocks) {
        const distance = Math.sqrt(
          (x - existingClock.x) ** 2 + (y - existingClock.y) ** 2
        );
        if (distance < (radius + existingClock.size / 2) * 1.0) {
          // Tighter spacing for better coverage
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        const hourHandThickness = Math.max(0.8, size / 80);
        const minuteHandThickness = Math.max(0.6, size / 120);
        const secondHandThickness = Math.max(0.4, size / 160);

        clocks.push({
          x,
          y,
          size,
          hourHandThickness,
          minuteHandThickness,
          secondHandThickness,
          zone: "random-fill",
          variant: getRandomVariant(), // Assign random variant
        });
      }
    }

    return clocks;
  };

  const { smallClocks, mainSize } = React.useMemo(() => {
    if (isInitialized && viewportSize) {
      const { mainSize } = getResponsiveSizes();
      return {
        smallClocks: generateClocks(),
        mainSize,
      };
    }
    return { smallClocks: [], mainSize: mainClockSize };
  }, [isInitialized, viewportSize !== null]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black grayscale-100">
      {" "}
      {/* Main clock in center - exclusively uses variant 0 (enhanced 3D beveled border) */}
      <div
        className="absolute z-20"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <AnalogClock
          size={mainSize}
          hourHandThickness={mainSize / 100}
          minuteHandThickness={mainSize / 150}
          secondHandThickness={mainSize / 200}
          variant={0} // Main clock exclusively uses the enhanced 3D beveled border style
        />
      </div>
      {/* Smaller clocks with variations (variants 1-7 only) */}
      {viewportSize &&
        smallClocks.map((clock, i) => (
          <div
            key={`clock-${i}-${clock.x}-${clock.y}`}
            className="absolute z-10"
            style={{
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${clock.x}px), calc(-50% + ${clock.y}px))`,
            }}
          >
            <AnalogClock
              size={clock.size}
              hourHandThickness={clock.hourHandThickness}
              minuteHandThickness={clock.minuteHandThickness}
              secondHandThickness={clock.secondHandThickness}
              variant={clock.variant} // Use the assigned variant
            />
          </div>
        ))}
    </div>
  );
};

export default ClockCollection;
