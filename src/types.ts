export type QuestionType = 'single' | 'multiple' | 'boolean';

// Structure expected in the JSON file
export interface RawQuestion {
  id?: string | number;
  type: QuestionType;
  question: string;
  options?: string[]; // Required for single/multiple
  answer: number | number[] | boolean; // Flexible input
  explanation?: string;
}

export interface RawTemplate {
  title?: string;
  description?: string;
  questions: RawQuestion[];
}

// Internal Normalized Structure
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswers: number[]; // Always array of indices
  explanation?: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, number[]>; // questionId -> selected indices
  isSubmitted: boolean; // Current question submitted?
  score: number;
  quizTitle: string;
}

export type Screen = 'start' | 'quiz' | 'result';