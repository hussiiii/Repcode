import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface StopwatchProps {
  resetKey: string | number;
}

export default function Stopwatch({ resetKey }: StopwatchProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset when resetKey changes
  useEffect(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    stopInterval();
  }, [resetKey, stopInterval]);

  // Sync interval with isRunning state
  useEffect(() => {
    if (isRunning) {
      startInterval();
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [isRunning, startInterval, stopInterval]);

  // Pause when tab is hidden, resume when visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval();
      } else if (isRunning) {
        startInterval();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, startInterval, stopInterval]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hrs > 0
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="flex items-center gap-1.5 mr-3 px-3 py-1 rounded-md border bg-[#3A4253] border-[#3A4253]">
      <Timer size={14} className="text-[#B0B7C3]" />
      <span
        className="text-white text-xs font-mono"
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: '3.2em' }}
      >
        {formatTime(elapsedSeconds)}
      </span>
      <button
        onClick={() => setIsRunning((r) => !r)}
        className="p-1 rounded hover:bg-[#2A303C]/50 transition-colors text-[#B0B7C3]"
        title={isRunning ? 'Pause' : 'Resume'}
      >
        {isRunning ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <button
        onClick={() => {
          setElapsedSeconds(0);
          setIsRunning(true);
        }}
        className="p-1 rounded hover:bg-[#2A303C]/50 transition-colors text-[#B0B7C3]"
        title="Reset"
      >
        <RotateCcw size={12} />
      </button>
    </div>
  );
}
