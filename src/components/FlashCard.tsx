import { useState } from "react";
import type { FlashCardData, AttemptHistory } from "@/types/flashcard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Lightbulb, Code2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type { FlashCardData };

interface FlashCardProps {
  data: FlashCardData;
  currentTime: number;
  userId: string | null;
}

export const FlashCard = ({ data, currentTime, userId }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSolutionDialog, setShowSolutionDialog] = useState(false);
  const [attempts, setAttempts] = useState<AttemptHistory[]>(data.attempts || []);
  const { toast } = useToast();

  // Parse explanation into steps and add topic as first hint
  const parseSteps = (explanation: string, topic: string): string[] => {
    const lines = explanation.split('\n').filter(line => line.trim());
    const steps: string[] = [`Topic: ${topic}`]; // Add topic as first hint
    let currentStepText = '';
    let stepNumber = 1;
    
    for (const line of lines) {
      // Check if line starts with a number (1., 2., etc.)
      if (/^\d+\./.test(line.trim())) {
        if (currentStepText) {
          steps.push(`${stepNumber}. ${currentStepText.replace(/^\d+\.\s*/, '').trim()}`);
          stepNumber++;
        }
        currentStepText = line;
      } else {
        currentStepText += '\n' + line;
      }
    }
    
    if (currentStepText) {
      steps.push(`${stepNumber}. ${currentStepText.replace(/^\d+\.\s*/, '').trim()}`);
    }
    
    return steps;
  };

  const explanationSteps = parseSteps(data.explanation, data.topic);
  const totalSteps = explanationSteps.length;

  const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMarkAttempt = async (solved: boolean) => {
    const newAttempt: AttemptHistory = {
      date: new Date().toISOString(),
      timeTaken: currentTime,
      solved,
    };
    setAttempts([...attempts, newAttempt]);

    // Save to database if user is logged in
    if (userId) {
      try {
        const { error } = await supabase.from("attempt_history").insert({
          user_id: userId,
          question_id: data.id,
          solved,
          time_taken: currentTime,
          topic: data.topic,
        });

        if (error) throw error;

        toast({
          title: "Progress saved",
          description: solved ? "Great job solving this problem!" : "Keep practicing, you'll get it!",
        });
      } catch (error: any) {
        console.error("Error saving attempt:", error);
        toast({
          title: "Could not save progress",
          description: "Your progress was not saved to your profile",
          variant: "destructive",
        });
      }
    }
  };

  const handleFlip = () => {
    setIsFlipped(true);
    setCurrentStep(0);
  };

  const handleBackToFront = () => {
    setIsFlipped(false);
    setCurrentStep(0);
    setShowSolutionDialog(false);
  };

  const handleNextHint = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-4xl mx-auto">
      <div
        className={`relative transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <Card
          className={`absolute inset-0 backface-hidden min-h-[500px] px-8 pt-4 pb-8 flex flex-col justify-between shadow-lg ${
            isFlipped ? "invisible" : "visible"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {lastAttempt && (
              <div className="text-sm text-muted-foreground">
                Last attempt: {formatTime(lastAttempt.timeTaken)} ({lastAttempt.solved ? "Solved ✓" : "Not solved"})
              </div>
            )}
            {data.leetcodeUrl ? (
              <a
                href={data.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl font-bold hover:text-primary transition-colors"
              >
                {data.title}
              </a>
            ) : (
              <h2 className="text-3xl font-bold">{data.title}</h2>
            )}
            <div className="text-lg text-muted-foreground leading-relaxed">
              {data.description}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 pt-8">
            <Button
              onClick={handleFlip}
              size="lg"
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              Get Hints
            </Button>
            <TooltipProvider>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMarkAttempt(true)}
                      className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500"
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>I could solve this</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMarkAttempt(false)}
                      className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>I couldn't solve this</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </Card>

        {/* Back of card - Progressive Hints */}
        <Card
          className={`absolute inset-0 backface-hidden min-h-[500px] px-8 pt-4 pb-8 flex flex-col justify-between shadow-lg ${
            !isFlipped ? "invisible" : "visible"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex-1 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{data.title}</h3>
            </div>

            <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-primary">
                  Hints ({currentStep + 1}/{totalSteps})
                </h4>
              </div>

              {/* Show hints progressively */}
              <div className="space-y-4">
                {explanationSteps.slice(0, currentStep + 1).map((step, idx) => (
                  <div
                    key={idx}
                    className="animate-fade-in bg-card/50 rounded-lg p-4 border border-border"
                  >
                    <p className="text-sm whitespace-pre-wrap">{step}</p>
                  </div>
                ))}
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1 pt-2">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      idx <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <div className="flex gap-3">
              {currentStep < totalSteps - 1 && (
                <Button
                  onClick={handleNextHint}
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  Next Hint
                </Button>
              )}

              <Dialog open={showSolutionDialog} onOpenChange={setShowSolutionDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="flex-1 gap-2 bg-primary hover:bg-primary/90">
                    <Code2 className="w-5 h-5" />
                    Show Solution
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      {data.title} - Solution
                    </DialogTitle>
                  </DialogHeader>
                  <div className="rounded-lg overflow-hidden">
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      {data.code}
                    </SyntaxHighlighter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button
              onClick={handleBackToFront}
              variant="ghost"
              size="lg"
            >
              Back to Problem
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
