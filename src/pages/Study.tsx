import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FlashCard, FlashCardData } from "@/components/FlashCard";
import { StudyTimer } from "@/components/StudyTimer";
import { CardNavigation } from "@/components/CardNavigation";
import { VoiceCoach } from "@/components/VoiceCoach";
import { sampleCards, fetchCardsFromNotion } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import { Settings, Home } from "lucide-react";

const Study = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const countdownMinutes = searchParams.get("minutes");
  const questionCount = searchParams.get("count");

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [seconds, setSeconds] = useState(
    countdownMinutes ? parseInt(countdownMinutes) * 60 : 0
  );
  const [isRunning, setIsRunning] = useState(true);
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(false);
  const [allCards, setAllCards] = useState<FlashCardData[]>(sampleCards);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  // Filter cards based on question count
  const cards = questionCount
    ? allCards.slice(0, parseInt(questionCount))
    : allCards;

  // Fetch cards from Notion on mount
  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      const databaseId = "28c57d62-9295-80b7-b2fc-ff9f9322b8f9";
      const fetchedCards = await fetchCardsFromNotion(databaseId);
      setAllCards(fetchedCards);
      setIsLoading(false);
    };
    loadCards();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          // Countdown mode: count down to 0
          if (countdownMinutes) {
            const newSeconds = prev - 1;
            if (newSeconds <= 0) {
              setIsRunning(false);
              setIsComplete(true);
              return 0;
            }
            return newSeconds;
          }
          // Regular mode: count up
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, countdownMinutes, isComplete]);

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else if (questionCount) {
      // If in question count mode and reached the end
      setIsRunning(false);
      setIsComplete(true);
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
    setSeconds(countdownMinutes ? parseInt(countdownMinutes) * 60 : 0);
  };
  const handleReset = () => {
    setSeconds(countdownMinutes ? parseInt(countdownMinutes) * 60 : 0);
    setIsRunning(true);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Session Complete! 🎉
          </h1>
          <p className="text-xl text-white/80">
            {countdownMinutes
              ? `Time's up! You completed ${currentCardIndex + 1} questions.`
              : `Great job! You completed all ${cards.length} questions.`}
          </p>
          <Button onClick={() => navigate("/")} size="lg">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
          >
            <Home className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {countdownMinutes
                ? `${countdownMinutes} Minute Challenge`
                : questionCount
                ? `${questionCount} Question Practice`
                : "LeetCode Flash Cards"}
            </h1>
            <p className="text-base md:text-lg mt-1.5 text-white/80">
              {countdownMinutes
                ? "Solve as many as you can before time runs out"
                : "Practice active recall with your solutions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <VoiceCoach
            currentCard={cards[currentCardIndex]}
            isEnabled={voiceCoachEnabled}
            onToggle={() => setVoiceCoachEnabled(!voiceCoachEnabled)}
          />
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
        {isLoading ? (
          <div className="text-white text-lg">Loading your flashcards from Notion...</div>
        ) : (
          <>
            <div className="mb-6 w-full">
              <CardNavigation
                currentIndex={currentCardIndex}
                totalCards={cards.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
            <FlashCard
              data={cards[currentCardIndex]}
              key={currentCardIndex}
              currentTime={seconds}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Study;
