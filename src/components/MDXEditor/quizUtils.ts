import { Quiz, Question, Answer } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createEmptyAnswer = (): Answer => ({
  id: generateId(),
  text: '',
  explanation: '',
  isCorrect: false,
});

export const createEmptyQuestion = (): Question => ({
  id: generateId(),
  text: '',
  answers: [createEmptyAnswer()],
});

export const createEmptyQuiz = (): Quiz => ({
  questions: [],
});

export const addQuestion = (quiz: Quiz): Quiz => ({
  ...quiz,
  questions: [...quiz.questions, createEmptyQuestion()],
});

export const deleteQuestion = (quiz: Quiz, questionId: string): Quiz => ({
  ...quiz,
  questions: quiz.questions.filter(q => q.id !== questionId),
});

export const updateQuestion = (quiz: Quiz, questionId: string, text: string): Quiz => ({
  ...quiz,
  questions: quiz.questions.map(q =>
    q.id === questionId ? { ...q, text } : q
  ),
});

export const addAnswer = (quiz: Quiz, questionId: string): Quiz => ({
  ...quiz,
  questions: quiz.questions.map(q =>
    q.id === questionId
      ? { ...q, answers: [...q.answers, createEmptyAnswer()] }
      : q
  ),
});

export const deleteAnswer = (quiz: Quiz, questionId: string, answerId: string): Quiz => ({
  ...quiz,
  questions: quiz.questions.map(q =>
    q.id === questionId
      ? { ...q, answers: q.answers.filter(a => a.id !== answerId) }
      : q
  ),
});

export const updateAnswer = (
  quiz: Quiz,
  questionId: string,
  answerId: string,
  updates: Partial<Answer>
): Quiz => ({
  ...quiz,
  questions: quiz.questions.map(q =>
    q.id === questionId
      ? {
          ...q,
          answers: q.answers.map(a =>
            a.id === answerId ? { ...a, ...updates } : a
          ),
        }
      : q
  ),
});

export const markCorrectAnswer = (
  quiz: Quiz,
  questionId: string,
  answerId: string
): Quiz => ({
  ...quiz,
  questions: quiz.questions.map(q =>
    q.id === questionId
      ? {
          ...q,
          answers: q.answers.map(a =>
            a.id === answerId
              ? { ...a, isCorrect: true }
              : { ...a, isCorrect: false }
          ),
        }
      : q
  ),
});
