import { Quiz, Question, Answer } from './types';

const escapeXML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const generateMDX = (quiz: Quiz): string => {
  const questions = quiz.questions
    .map(question => generateQuestion(question))
    .join('\n');

  return `<Quiz>\n${questions}\n</Quiz>`;
};

const generateQuestion = (question: Question): string => {
  const answers = question.answers
    .map(answer => generateAnswer(answer))
    .join('\n  ');

  return `  <Quiz.Question>
    ${escapeXML(question.text)}
    ${answers}
  </Quiz.Question>`;
};

const generateAnswer = (answer: Answer): string => {
  const correctAttr = answer.isCorrect ? ' correct' : '';
  const explanation =
    answer.explanation.trim() !== ''
      ? `
      <Quiz.Explanation>
      ${escapeXML(answer.explanation)}
      </Quiz.Explanation>`
      : '';

  return `<Quiz.Answer${correctAttr}>
      ${escapeXML(answer.text)}${explanation}
  </Quiz.Answer>`;
};
