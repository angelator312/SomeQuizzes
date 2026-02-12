import { Quiz, Question, Answer } from './types';
import { generateId, createEmptyAnswer } from './quizUtils';

const unescapeXML = (str: string): string => {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
};

export const parseMDX = (mdxContent: string): Quiz => {
  const questions: Question[] = [];

  // Extract all <Quiz.Question> blocks
  const questionRegex = /<Quiz\.Question>([\s\S]*?)<\/Quiz\.Question>/g;
  let questionMatch;

  while ((questionMatch = questionRegex.exec(mdxContent)) !== null) {
    const questionContent = questionMatch[1];
    const question = parseQuestion(questionContent);
    if (question) {
      questions.push(question);
    }
  }

  return { questions };
};

const parseQuestion = (content: string): Question | null => {
  const answers: Answer[] = [];

  // Extract question text (everything before first <Quiz.Answer>)
  const firstAnswerIndex = content.indexOf('<Quiz.Answer');
  let questionText =
    firstAnswerIndex !== -1
      ? content.substring(0, firstAnswerIndex).trim()
      : content.trim();

  // Remove leading/trailing whitespace from each line and unescape
  questionText = questionText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  questionText = unescapeXML(questionText);

  // Extract all <Quiz.Answer> blocks
  const answerRegex = /<Quiz\.Answer\s*(?:correct)?\s*>([\s\S]*?)<\/Quiz\.Answer>/g;
  let answerMatch;

  while ((answerMatch = answerRegex.exec(content)) !== null) {
    const fullMatch = answerMatch[0];
    const isCorrect = fullMatch.includes('correct');
    const answerContent = answerMatch[1];
    const answer = parseAnswer(answerContent, isCorrect);
    if (answer) {
      answers.push(answer);
    }
  }

  // If no answers were found, create a default one
  if (answers.length === 0) {
    answers.push(createEmptyAnswer());
  }

  return {
    id: generateId(),
    text: questionText,
    answers,
  };
};

const parseAnswer = (content: string, isCorrect: boolean): Answer | null => {
  // Extract answer text and explanation
  const explanationRegex =
    /<Quiz\.Explanation>([\s\S]*?)<\/Quiz\.Explanation>/;
  const explanationMatch = explanationRegex.exec(content);

  let answerText = content;
  let explanation = '';

  if (explanationMatch) {
    // Remove explanation from answer text
    answerText = content
      .substring(0, explanationMatch.index)
      .concat(content.substring(explanationMatch.index + explanationMatch[0].length));
    explanation = explanationMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    explanation = unescapeXML(explanation);
  }

  answerText = answerText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  answerText = unescapeXML(answerText);

  if (!answerText) {
    return null;
  }

  return {
    id: generateId(),
    text: answerText,
    explanation,
    isCorrect,
  };
};
