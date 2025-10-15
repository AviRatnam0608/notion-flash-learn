import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Target, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const studyModes = [
    {
      title: "Countdown Mode",
      description: "Solve as many questions as you can",
      icon: Clock,
      options: [
        { label: "15 minutes", minutes: 15 },
        { label: "30 minutes", minutes: 30 },
        { label: "45 minutes", minutes: 45 },
      ],
    },
    {
      title: "Quick Practice",
      description: "Solve a fixed number of questions",
      icon: Target,
      options: [
        { label: "3 questions", count: 3 },
        { label: "5 questions", count: 5 },
      ],
    },
  ];

  const handleModeSelect = (minutes?: number, count?: number) => {
    const params = new URLSearchParams();
    if (minutes) params.set("minutes", minutes.toString());
    if (count) params.set("count", count.toString());
    navigate(`/study?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              LeetCode Flash Cards
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/80">
            Choose your study mode and start practicing
          </p>
        </div>

        {/* Study Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {studyModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card key={mode.title} className="bg-card/50 backdrop-blur border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl">{mode.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mode.options.map((option) => (
                    <Button
                      key={option.label}
                      onClick={() =>
                        handleModeSelect(
                          "minutes" in option ? option.minutes : undefined,
                          "count" in option ? option.count : undefined
                        )
                      }
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      {option.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
