import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export const StudyTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
      <Clock className="w-4 h-4 text-primary" />
      <span className="font-mono text-lg font-semibold">
        {formatTime(seconds)}
      </span>
    </div>
  );
};
