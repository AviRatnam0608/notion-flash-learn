export interface Attempt {
  date: string;
  timeTaken: number;
  solved: boolean;
}

export interface FlashCardData {
  id: string;
  title: string;
  leetcodeUrl: string;
  description: string;
  topic: string;
  code: string;
  explanation: string;
  attempts: Attempt[];
}

export type AttemptHistory = Attempt;
