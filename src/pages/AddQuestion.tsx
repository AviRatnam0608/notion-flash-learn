import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AddQuestion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    problemType: "",
    problemUrl: "",
    codeSolution1: "",
    codeSolution2: "",
    codeSolution3: "",
    explanation: "",
  });

  const [showSolution2, setShowSolution2] = useState(false);
  const [showSolution3, setShowSolution3] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.problemUrl || !formData.codeSolution1) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, problem URL, and at least one code solution.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("questions").insert({
        title: formData.title,
        problem_type: formData.problemType || null,
        problem_url: formData.problemUrl,
        code_solution_1: formData.codeSolution1,
        code_solution_2: formData.codeSolution2 || null,
        code_solution_3: formData.codeSolution3 || null,
        explanation: formData.explanation || null,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Question added successfully.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Add Solved Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Problem Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Two Sum"
                  required
                />
              </div>

              {/* Problem Type */}
              <div className="space-y-2">
                <Label htmlFor="problemType">Problem Type</Label>
                <Input
                  id="problemType"
                  value={formData.problemType}
                  onChange={(e) =>
                    setFormData({ ...formData, problemType: e.target.value })
                  }
                  placeholder="e.g., Array, Dynamic Programming"
                />
              </div>

              {/* Problem URL */}
              <div className="space-y-2">
                <Label htmlFor="problemUrl">
                  Problem URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="problemUrl"
                  type="url"
                  value={formData.problemUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, problemUrl: e.target.value })
                  }
                  placeholder="https://leetcode.com/problems/..."
                  required
                />
              </div>

              {/* Code Solution 1 */}
              <div className="space-y-2">
                <Label htmlFor="codeSolution1">
                  Code Solution 1 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="codeSolution1"
                  value={formData.codeSolution1}
                  onChange={(e) =>
                    setFormData({ ...formData, codeSolution1: e.target.value })
                  }
                  placeholder="Paste your code here..."
                  className="min-h-[200px] font-mono"
                  required
                />
              </div>

              {/* Code Solution 2 */}
              {!showSolution2 && !showSolution3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSolution2(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Solution
                </Button>
              )}

              {showSolution2 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="codeSolution2">Code Solution 2</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSolution2(false);
                        setFormData({ ...formData, codeSolution2: "" });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    id="codeSolution2"
                    value={formData.codeSolution2}
                    onChange={(e) =>
                      setFormData({ ...formData, codeSolution2: e.target.value })
                    }
                    placeholder="Paste your code here..."
                    className="min-h-[200px] font-mono"
                  />
                </div>
              )}

              {/* Code Solution 3 */}
              {showSolution2 && !showSolution3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSolution3(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Third Solution
                </Button>
              )}

              {showSolution3 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="codeSolution3">Code Solution 3</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSolution3(false);
                        setFormData({ ...formData, codeSolution3: "" });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    id="codeSolution3"
                    value={formData.codeSolution3}
                    onChange={(e) =>
                      setFormData({ ...formData, codeSolution3: e.target.value })
                    }
                    placeholder="Paste your code here..."
                    className="min-h-[200px] font-mono"
                  />
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  placeholder="Explain your approach..."
                  className="min-h-[150px]"
                />
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddQuestion;
