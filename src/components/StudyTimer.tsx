import { useState, useEffect } from "react";
import { Clock, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "./ui/button";

interface StudyTimerProps {
  seconds: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const StudyTimer = ({ seconds, isRunning, onPause, onResume, onStop, onReset }: StudyTimerProps) => {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
      <Clock className="w-4 h-4 text-primary" />
      <span className="font-mono text-base font-semibold min-w-[60px]">{formatTime(seconds)}</span>
      <div className="flex items-center gap-1 border-l border-border pl-2">
        {isRunning ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPause}>
            <Pause className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onResume}>
            <Play className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onStop}>
          <Square className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReset}>
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
