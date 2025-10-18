import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ActivityHeatmapProps {
  attempts: any[];
}

export const ActivityHeatmap = ({ attempts }: ActivityHeatmapProps) => {
  // Group attempts by date
  const activityByDate = attempts.reduce((acc, attempt) => {
    const date = new Date(attempt.attempted_at).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate last 90 days
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      count: activityByDate[dateStr] || 0,
    });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count <= maxCount * 0.25) return "bg-primary/20";
    if (count <= maxCount * 0.5) return "bg-primary/40";
    if (count <= maxCount * 0.75) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle>Activity</CardTitle>
        </div>
        <CardDescription>Your practice activity over the last 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(13,1fr)] gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-sm ${getIntensity(day.count)} transition-colors`}
              title={`${day.date}: ${day.count} question${day.count !== 1 ? "s" : ""}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-white/60">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/5" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};
