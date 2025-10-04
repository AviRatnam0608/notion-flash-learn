import { useState, useEffect } from "react";
import { FlashCard } from "@/components/FlashCard";
import { StudyTimer } from "@/components/StudyTimer";
import { CardNavigation } from "@/components/CardNavigation";
import { sampleCards } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const cards = sampleCards;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);
  const handleStop = () => {
    setIsRunning(false);
    setSeconds(0);
  };
  const handleReset = () => {
    setSeconds(0);
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            LeetCode Flash Cards
          </h1>
          <p className="text-base md:text-lg mt-1.5 opacity-80">
            Practice active recall with your solutions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StudyTimer
            seconds={seconds}
            isRunning={isRunning}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onReset={handleReset}
          />
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-flex-start pb-8">
        <FlashCard
          data={cards[currentCardIndex]}
          key={currentCardIndex}
          currentTime={seconds}
        />
        <div className="mt-8">
          <CardNavigation
            currentIndex={currentCardIndex}
            totalCards={cards.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
