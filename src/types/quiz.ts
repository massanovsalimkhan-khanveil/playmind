
export type QuizQuestion = {
  id: string;
  clue: string;
  options: string[];
  answer: string;
  fact: string;
};

export type QuizCategory = {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};
