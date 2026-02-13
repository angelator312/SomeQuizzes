export type Answer = {
  id: string;
  text: string;
  explanation: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

export type Quiz = {
  questions: Question[];
  name?: string;
};
