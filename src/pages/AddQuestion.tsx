import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PROBLEM_TYPES = [
  "Strings and Arrays",
  "Two Pointers",
  "Stacks",
  "Linked Lists",
  "Binary Search",
  "Hash Maps and Sets",
  "Recursion",
  "Sliding Window",
  "Binary Trees",
  "Heaps",
  "Dynamic Programming",
  "Miscellaneous",
];

const AddQuestion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [showAddTypeDialog, setShowAddTypeDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

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

  // Fetch custom problem types
  useEffect(() => {
    const fetchCustomTypes = async () => {
      const { data, error } = await supabase
        .from("custom_problem_types")
        .select("name")
        .order("name");

      if (!error && data) {
        setCustomTypes(data.map((item) => item.name));
      }
    };
    fetchCustomTypes();
  }, []);

  const handleAddCustomType = async () => {
    if (!newTypeName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a problem type name.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingType(true);

    try {
      const { error } = await supabase
        .from("custom_problem_types")
        .insert({ name: newTypeName.trim() });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Type already exists",
            description: "This problem type already exists.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setCustomTypes([...customTypes, newTypeName.trim()].sort());
      setFormData({ ...formData, problemType: newTypeName.trim() });
      setNewTypeName("");
      setShowAddTypeDialog(false);

      toast({
        title: "Success!",
        description: "Custom problem type added.",
      });
    } catch (error) {
      console.error("Error adding custom type:", error);
      toast({
        title: "Error",
        description: "Failed to add custom type.",
        variant: "destructive",
      });
    } finally {
      setIsAddingType(false);
    }
  };

  const allProblemTypes = [...DEFAULT_PROBLEM_TYPES, ...customTypes].sort();

  // Normalize title by removing leading numbers and converting to lowercase
  const normalizeTitle = (title: string): string => {
    return title.replace(/^\d+\.\s*/, '').toLowerCase().trim();
  };

  const handleReset = () => {
    setFormData({
      title: "",
      problemType: "",
      problemUrl: "",
      codeSolution1: "",
      codeSolution2: "",
      codeSolution3: "",
      explanation: "",
    });
    setShowSolution2(false);
    setShowSolution3(false);
  };

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
      // Check for duplicate questions
      const normalizedNewTitle = normalizeTitle(formData.title);
      const { data: existingQuestions, error: fetchError } = await supabase
        .from("questions")
        .select("title");

      if (fetchError) throw fetchError;

      const isDuplicate = existingQuestions?.some(
        (q) => normalizeTitle(q.title) === normalizedNewTitle
      );

      if (isDuplicate) {
        toast({
          title: "Duplicate Question",
          description: "This question has already been added.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

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
                <div className="flex gap-2">
                  <Select
                    value={formData.problemType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, problemType: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a problem type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {allProblemTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showAddTypeDialog} onOpenChange={setShowAddTypeDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>Add Custom Problem Type</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newTypeName">Type Name</Label>
                          <Input
                            id="newTypeName"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="e.g., Graph Algorithms"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomType();
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleAddCustomType}
                          disabled={isAddingType}
                          className="w-full"
                        >
                          {isAddingType ? "Adding..." : "Add Type"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={handleReset}
                >
                  Clear All
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : "Save Question"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddQuestion;
