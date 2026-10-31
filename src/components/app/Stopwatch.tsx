import { HelpTooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center gap-1.5 mr-3 px-3 py-1 rounded-md border bg-border border-border">
      <Timer size={14} className="text-muted-foreground" />
      <span
        className="text-foreground text-xs font-mono"
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: '3.2em' }}
      >
        {formatTime(elapsedSeconds)}
      </span>
      <HelpTooltip content={isRunning ? 'Pause' : 'Resume'} variant="default">
      <Button variant="icon" size="timer" tone="timer"
        onClick={() => setIsRunning((r) => !r)}
        aria-label={isRunning ? 'Pause' : 'Resume'}
      >
        {isRunning ? <Pause size={12} /> : <Play size={12} />}
      </Button>
      </HelpTooltip>
      <HelpTooltip content="Reset" variant="default">
      <Button variant="icon" size="timer" tone="timer"
        onClick={() => {
          setElapsedSeconds(0);
          setIsRunning(true);
        }}
        aria-label="Reset"
      >
        <RotateCcw size={12} />
      </Button>
      </HelpTooltip>
    </div>
  );
}
