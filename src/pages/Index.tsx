import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Target, Zap, Plus, User, BookOpen, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [customMinutes, setCustomMinutes] = useState("");
  const [customCount, setCustomCount] = useState("");
  const [openCustomTime, setOpenCustomTime] = useState(false);
  const [openCustomCount, setOpenCustomCount] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        { label: "8 questions", count: 8 },
      ],
    },
  ];

  const handleModeSelect = (minutes?: number, count?: number) => {
    const params = new URLSearchParams();
    if (minutes) params.set("minutes", minutes.toString());
    if (count) params.set("count", count.toString());
    navigate(`/study?${params.toString()}`);
  };

  const handleCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0) {
      setOpenCustomTime(false);
      handleModeSelect(minutes);
    }
  };

  const handleCustomCount = () => {
    const count = parseInt(customCount);
    if (count > 0) {
      setOpenCustomCount(false);
      handleModeSelect(undefined, count);
    }
  };

  const handleBackfillDescriptions = async () => {
    setIsBackfilling(true);
    toast({
      title: "Starting backfill",
      description: "Fetching descriptions for existing questions...",
    });

    try {
      const { data, error } = await supabase.functions.invoke('backfill-leetcode-descriptions');
      
      if (error) throw error;

      toast({
        title: "Backfill complete!",
        description: `Successfully updated ${data.success} questions. Failed: ${data.failed}`,
      });
    } catch (error) {
      console.error('Error during backfill:', error);
      toast({
        title: "Error",
        description: "Failed to backfill descriptions. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      {/* Top Right Corner - Auth Button */}
      <div className="fixed top-6 right-6 z-10">
        {user ? (
          <Button 
            onClick={() => navigate("/profile")}
            size="lg"
            variant="outline"
          >
            <User className="w-5 h-5 mr-2" />
            Profile
          </Button>
        ) : (
          <Button 
            onClick={() => navigate("/auth")}
            size="lg"
            variant="outline"
          >
            Sign In
          </Button>
        )}
      </div>

      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              LeetCode Flash Cards
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/80">
            Choose your study mode and start practicing
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button 
              onClick={() => navigate("/browse")}
              size="lg"
              className="mt-2"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Problems
            </Button>
            <Button 
              onClick={() => navigate("/add-question")}
              size="lg"
              variant="outline"
              className="mt-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Solved Question
            </Button>
          </div>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleBackfillDescriptions}
              size="sm"
              variant="ghost"
              disabled={isBackfilling}
              className="text-white/60 hover:text-white/80"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isBackfilling ? 'animate-spin' : ''}`} />
              {isBackfilling ? 'Updating Descriptions...' : 'Update Existing Question Descriptions'}
            </Button>
          </div>
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
                  {mode.title === "Countdown Mode" && (
                    <Dialog open={openCustomTime} onOpenChange={setOpenCustomTime}>
                      <DialogTrigger asChild>
                        <Button className="w-full" size="lg" variant="outline">
                          Custom Time
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Set Custom Time</DialogTitle>
                          <DialogDescription>
                            Enter the number of minutes for your practice session
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-minutes">Minutes</Label>
                            <Input
                              id="custom-minutes"
                              type="number"
                              min="1"
                              placeholder="e.g., 60"
                              value={customMinutes}
                              onChange={(e) => setCustomMinutes(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleCustomTime} className="w-full">
                            Start Practice
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {mode.title === "Quick Practice" && (
                    <Dialog open={openCustomCount} onOpenChange={setOpenCustomCount}>
                      <DialogTrigger asChild>
                        <Button className="w-full" size="lg" variant="outline">
                          Custom Count
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Set Custom Question Count</DialogTitle>
                          <DialogDescription>
                            Enter the number of questions you want to practice
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-count">Number of Questions</Label>
                            <Input
                              id="custom-count"
                              type="number"
                              min="1"
                              placeholder="e.g., 10"
                              value={customCount}
                              onChange={(e) => setCustomCount(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleCustomCount} className="w-full">
                            Start Practice
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
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
