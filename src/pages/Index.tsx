import { useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { StudyTimer } from "@/components/StudyTimer";
import { CardNavigation } from "@/components/CardNavigation";
import { sampleCards } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const cards = sampleCards;

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

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">
            LeetCode Flash Cards
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice active recall with your solutions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StudyTimer />
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 pb-8">
        <FlashCard data={cards[currentCardIndex]} key={currentCardIndex} />
        <CardNavigation
          currentIndex={currentCardIndex}
          totalCards={cards.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </main>
    </div>
  );
};

export default Index;
