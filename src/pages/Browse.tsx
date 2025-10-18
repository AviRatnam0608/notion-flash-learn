import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowLeft, ExternalLink, Code2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const ITEMS_PER_PAGE = 12;

export default function Browse() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, searchQuery, selectedTopic]);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("problem_type")
        .not("problem_type", "is", null);

      if (error) throw error;

      const uniqueTopics = [...new Set(data.map((q) => q.problem_type).filter(Boolean))] as string[];
      setTopics(uniqueTopics.sort());
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("questions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,problem_type.ilike.%${searchQuery}%`);
      }

      if (selectedTopic !== "all") {
        query = query.eq("problem_type", selectedTopic);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setQuestions(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
    setCurrentPage(1);
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
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Browse Problems</h1>
            <p className="text-muted-foreground mt-1">
              Explore all available coding problems
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <>
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

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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
