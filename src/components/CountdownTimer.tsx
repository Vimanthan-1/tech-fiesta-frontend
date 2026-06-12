"use client";

import React, { useState, useEffect } from "react";

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const CountdownTimer: React.FC = () => {
  const calculateTimeLeft = (): TimeLeft => {
    // Set target date to July 24, 2026 (Tech Fiesta 2.0)
    const targetDate = new Date("2026-07-24T00:00:00").getTime();
    const difference = targetDate - new Date().getTime();

    let days = "00";
    let hours = "00";
    let minutes = "00";
    let seconds = "00";

    if (difference > 0) {
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      days = d < 10 ? `0${d}` : `${d}`;
      hours = h < 10 ? `0${h}` : `${h}`;
      minutes = m < 10 ? `0${m}` : `${m}`;
      seconds = s < 10 ? `0${s}` : `${s}`;
    }

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-end gap-1.5 sm:gap-4 select-none mt-4 sm:mt-8 animate-fade-in anim-delay-1000">
      <style jsx>{`
        .timer-box {
          background: rgba(10, 3, 3, 0.85);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(239, 68, 68, 0.4); /* light crimson */
          border-radius: 8px;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444; /* crimson red */
          font-family: var(--font-geist-mono), monospace;
          font-size: 1.45rem;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2), inset 0 0 8px rgba(239, 68, 68, 0.1);
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .timer-box:hover {
          border-color: rgba(239, 68, 68, 0.9);
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.45), inset 0 0 12px rgba(239, 68, 68, 0.2);
          transform: translateY(-3px);
          color: #ff3b30;
        }
        @media (min-width: 640px) {
          .timer-box {
            width: 76px;
            height: 76px;
            font-size: 2.35rem;
            border-radius: 12px;
          }
        }
      `}</style>

      {timeBlocks.map((block, idx) => (
        <React.Fragment key={block.label}>
          {idx > 0 && (
            <div className="flex flex-col gap-1 sm:gap-1.5 justify-center h-[52px] sm:h-[76px] px-0.5 sm:px-1 mb-[18px] sm:mb-[25px]">
              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-red-500/80 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-red-500/80 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="timer-box">{block.value}</div>
            <span className="text-red-400/80 font-mono text-[8px] sm:text-[10px] tracking-[0.2em] mt-1.5 sm:mt-2.5 uppercase">
              {block.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default CountdownTimer;
