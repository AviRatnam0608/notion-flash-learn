import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface FlashCardData {
  id: string;
  title: string;
  leetcodeUrl?: string;
  description: string;
  code: string;
  explanation: string;
  topic: string;
}

interface FlashCardProps {
  data: FlashCardData;
}

export const FlashCard = ({ data }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-4xl mx-auto">
      <div
        className={`relative transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <Card
          className={`absolute inset-0 backface-hidden min-h-[500px] p-8 flex flex-col justify-between shadow-lg ${
            isFlipped ? "invisible" : "visible"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <Badge className="self-start bg-accent text-accent-foreground">
              {data.topic}
            </Badge>
            {data.leetcodeUrl ? (
              <a
                href={data.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl font-bold hover:text-primary transition-colors"
              >
                {data.title}
              </a>
            ) : (
              <h2 className="text-3xl font-bold">{data.title}</h2>
            )}
            <div className="text-lg text-muted-foreground leading-relaxed">
              {data.description}
            </div>
          </div>
          <div className="flex justify-center pt-8">
            <Button
              onClick={() => setIsFlipped(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Show Solution
            </Button>
          </div>
        </Card>

        {/* Back of card */}
        <Card
          className={`absolute inset-0 backface-hidden min-h-[500px] p-8 flex flex-col justify-between shadow-lg ${
            !isFlipped ? "invisible" : "visible"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Badge className="bg-accent text-accent-foreground">
                {data.topic}
              </Badge>
              <h3 className="text-xl font-semibold">{data.title}</h3>
            </div>
            
            <div className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language="javascript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                {data.code}
              </SyntaxHighlighter>
            </div>

            {data.explanation && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-primary">Explanation:</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {data.explanation}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center pt-6">
            <Button
              onClick={() => setIsFlipped(false)}
              variant="outline"
              size="lg"
            >
              Back to Problem
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
