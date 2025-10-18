import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, TrendingUp, Target, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { TopicAnalysis } from "@/components/TopicAnalysis";
import { AISuggestions } from "@/components/AISuggestions";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalUnsolved: 0,
    successRate: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Load attempt history
      const { data: attemptsData } = await supabase
        .from("attempt_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("attempted_at", { ascending: false });

      setAttempts(attemptsData || []);

      // Calculate stats
      const solved = attemptsData?.filter((a) => a.solved).length || 0;
      const unsolved = attemptsData?.filter((a) => !a.solved).length || 0;
      const total = solved + unsolved;

      setStats({
        totalSolved: solved,
        totalUnsolved: unsolved,
        successRate: total > 0 ? Math.round((solved / total) * 100) : 0,
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white/80">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile?.full_name || "User"}</CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">Solved</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">{stats.totalSolved}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <CardTitle className="text-lg">Unsolved</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-500">{stats.totalUnsolved}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{stats.successRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Heatmap & Topic Analysis */}
        <div className="grid md:grid-cols-2 gap-4">
          <ActivityHeatmap attempts={attempts} />
          <TopicAnalysis attempts={attempts} />
        </div>

        {/* AI Suggestions */}
        <AISuggestions attempts={attempts} />
      </div>
    </div>
  );
};

export default Profile;
