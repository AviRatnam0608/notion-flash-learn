import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";

interface TopicAnalysisProps {
  attempts: any[];
}

export const TopicAnalysis = ({ attempts }: TopicAnalysisProps) => {
  // Group by topic and calculate success rate
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

  const topics = Object.entries(topicStats)
    .map(([topic, stats]: [string, { total: number; solved: number }]) => ({
      topic,
      total: stats.total,
      solved: stats.solved,
      successRate: Math.round((stats.solved / stats.total) * 100),
    }))
    .sort((a, b) => a.successRate - b.successRate);

  if (topics.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle>Topic Analysis</CardTitle>
          </div>
          <CardDescription>No practice data yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle>Topic Analysis</CardTitle>
        </div>
        <CardDescription>Your performance across different topics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.topic} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{topic.topic}</span>
              <span className="text-white/60">
                {topic.solved}/{topic.total} ({topic.successRate}%)
              </span>
            </div>
            <Progress value={topic.successRate} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
