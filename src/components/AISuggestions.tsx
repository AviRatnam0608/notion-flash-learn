import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AISuggestionsProps {
  attempts: any[];
}

export const AISuggestions = ({ attempts }: AISuggestionsProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (attempts.length > 0) {
      generateSuggestions();
    }
  }, [attempts]);

  const generateSuggestions = async () => {
    try {
      setLoading(true);

      // Analyze weak topics
      const topicStats = attempts.reduce((acc, attempt) => {
        if (!acc[attempt.topic]) {
          acc[attempt.topic] = { total: 0, solved: 0 };
        }
        acc[attempt.topic].total++;
        if (attempt.solved) {
          acc[attempt.topic].solved++;
        }
        return acc;
      }, {} as Record<string, { total: number; solved: number }>);

      const weakTopics = Object.entries(topicStats)
        .map(([topic, stats]: [string, { total: number; solved: number }]) => ({
          topic,
          successRate: (stats.solved / stats.total) * 100,
          attempts: stats.total,
        }))
        .filter((t) => t.successRate < 70)
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, 3);

      if (weakTopics.length === 0) {
        setSuggestions(["Great job! Keep practicing to maintain your skills."]);
        return;
      }

      // Call edge function to get AI suggestions
      const { data, error } = await supabase.functions.invoke("generate-suggestions", {
        body: { weakTopics },
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Could not generate suggestions",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (attempts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>AI-Powered Recommendations</CardTitle>
        </div>
        <CardDescription>
          Personalized study suggestions based on your performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <Badge className="mt-0.5">{index + 1}</Badge>
                <p className="text-sm text-white/80">{suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
