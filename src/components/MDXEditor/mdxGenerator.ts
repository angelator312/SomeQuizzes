import { Quiz, Question, Answer } from './types';

export const generateMDX = (quiz: Quiz): string => {
  const questions = quiz.questions
    .map(question => generateQuestion(question))
    .join('\n');

  return `<Quiz>\n${questions}\n</Quiz>`;
};

const generateQuestion = (question: Question): string => {
  const answers = question.answers
    .map(answer => generateAnswer(answer))
    .map(answer => answer
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n')
    )
    .join('\n');

  // Indent multiline question text properly
  const questionText = question.text
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n');

  return `  <Quiz.Question>
${questionText}
${answers}
  </Quiz.Question>`;
};

const generateAnswer = (answer: Answer): string => {
  const correctAttr = answer.isCorrect ? ' correct' : '';

  // Indent multiline answer text properly
  const answerText = answer.text
    .split('\n')
    .map(line => `      ${line}`)
    .join('\n');

  // Indent multiline explanation text properly
  const explanationText = answer.explanation
    .split('\n')
    .map(line => `      ${line}`)
    .join('\n');

  const explanation =
    answer.explanation.trim() !== ''
      ? `
      <Quiz.Explanation>
${explanationText}
      </Quiz.Explanation>`
      : '';

  return `  <Quiz.Answer${correctAttr}>
${answerText}${explanation}
  </Quiz.Answer>`;
};
