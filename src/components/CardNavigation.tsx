import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const CardNavigation = ({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
}: CardNavigationProps) => {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto relative z-10">
      <Button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {totalCards}
        </p>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: totalCards }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                idx === currentIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={currentIndex === totalCards - 1}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        Next
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
