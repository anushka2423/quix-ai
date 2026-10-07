export type Difficulty = "Easy" | "Medium" | "Hard";
export type OptionLabel = "A" | "B" | "C" | "D";
export type AnswerLabel = OptionLabel | "?";

export interface Option {
  label: OptionLabel;
  text: string;
}

export interface Question {
  id: number;
  section: string;
  difficulty: Difficulty;
  question: string;
  options: Option[];
  /** Correct label(s): "B" for single-answer, "A,C" for multi-answer questions */
  answer: string;
}

export interface QuizModule {
  id: number;
  title: string;
  description: string;
  status?: string;
  locked?: boolean;
  questions: Question[];
}
