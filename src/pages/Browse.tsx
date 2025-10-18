import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowLeft, ExternalLink, Code2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: string;
  title: string;
  problem_url: string;
  problem_type: string | null;
  code_solution_1: string;
  code_solution_2: string | null;
  code_solution_3: string | null;
  explanation: string | null;
  created_at: string;
}

export default function Browse() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCodeSolution = (code: string, index: number) => (
    <div key={index} className="space-y-2">
      <h4 className="font-semibold text-sm">Solution {index + 1}</h4>
      <div className="rounded-lg overflow-hidden border">
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Browse Problems</h1>
            <p className="text-muted-foreground mt-1">
              Explore all available coding problems
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No problems found</p>
              <Button onClick={() => navigate("/add-question")}>
                Add Your First Problem
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((question) => (
              <Card
                key={question.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedQuestion(question)}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {question.title}
                  </CardTitle>
                  {question.problem_type && (
                    <CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        {question.problem_type}
                      </Badge>
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedQuestion && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-start justify-between gap-4">
                    <span>{selectedQuestion.title}</span>
                    {selectedQuestion.problem_type && (
                      <Badge variant="secondary">
                        {selectedQuestion.problem_type}
                      </Badge>
                    )}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedQuestion.problem_url, "_blank")}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Original Problem
                    </Button>
                  </div>

                  {selectedQuestion.explanation && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                          <Code2 className="w-5 h-5" />
                          Explanation
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {selectedQuestion.explanation}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Solutions</h3>
                    {renderCodeSolution(selectedQuestion.code_solution_1, 0)}
                    {selectedQuestion.code_solution_2 &&
                      renderCodeSolution(selectedQuestion.code_solution_2, 1)}
                    {selectedQuestion.code_solution_3 &&
                      renderCodeSolution(selectedQuestion.code_solution_3, 2)}
                  </div>

                  <Separator />

                  <div className="text-xs text-muted-foreground">
                    Added on {new Date(selectedQuestion.created_at).toLocaleDateString()}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
