import { Quiz, Question, Answer } from './types';
import { generateId } from './quizUtils';

interface AnswerKeyEntry {
  questionNumber: number;
  correctAnswer: string;
  points?: number;
}

/**
 * Parse PDF text content and extract quiz questions with answers
 */
export function parsePDFContent(text: string): Quiz {
  // Parse answer key first
  const answerKey = parseAnswerKey(text);
  
  // Parse questions from content
  const questions = parseQuestions(text, answerKey);
  
  return { questions };
}

/**
 * Parse the answer key section
 */
function parseAnswerKey(text: string): AnswerKeyEntry[] {
  const entries: AnswerKeyEntry[] = [];
  
  // Match patterns like "1 В 2" or "1. В" or "1 А" from answer key
  const matches = text.matchAll(/(\d+)\s*\.?\s+([АБВГABCD])\s*(\d*)/gi);
  
  for (const match of matches) {
    const qNum = parseInt(match[1], 10);
    const answer = match[2].toUpperCase();
    
    if (qNum >= 1 && qNum <= 50 && !entries.find(e => e.questionNumber === qNum)) {
      entries.push({
        questionNumber: qNum,
        correctAnswer: answer
      });
    }
  }
  
  entries.sort((a, b) => a.questionNumber - b.questionNumber);
  return entries;
}

/**
 * Parse questions from the content
 */
function parseQuestions(text: string, answerKey: AnswerKeyEntry[]): Question[] {
  const questions: Question[] = [];
  
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  const lines = normalizedText.split('\n');
  
  let currentQuestion: { number: number; textParts: string[]; options: Map<string, string> } | null = null;
  let inAnswerKey = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Stop at answer key
    if (line.toLowerCase().includes('ключ') || line.toLowerCase().includes('верни отговори')) {
      inAnswerKey = true;
      if (currentQuestion) {
        const q = createQuestion(currentQuestion, answerKey);
        if (q) questions.push(q);
        currentQuestion = null;
      }
      break;
    }
    
    if (inAnswerKey) continue;
    
    // Detect question number - more flexible: "1.", "1 ", or just "1" followed by space/period
    const questionMatch = line.match(/^(\d+)[.\s]+(.*)$/);
    if (questionMatch) {
      const qNum = parseInt(questionMatch[1], 10);
      
      if (qNum >= 1 && qNum <= 30) {
        // Save previous question
        if (currentQuestion) {
          const q = createQuestion(currentQuestion, answerKey);
          if (q) questions.push(q);
        }
        
        currentQuestion = {
          number: qNum,
          textParts: questionMatch[2] ? [questionMatch[2]] : [],
          options: new Map()
        };
        continue;
      }
    }
    
    // Detect answer option: "А)" or "A)" - more flexible
    const optionMatch = line.match(/^([АБВГABCD])\)\s*(.*)$/i);
    if (optionMatch && currentQuestion) {
      const letter = optionMatch[1].toUpperCase();
      const text = optionMatch[2] || '';
      currentQuestion.options.set(letter, text);
      continue;
    }
    
    // Add to current context
    if (currentQuestion) {
      if (currentQuestion.options.size > 0) {
        // Add to last option
        const lastLetter = Array.from(currentQuestion.options.keys()).pop();
        if (lastLetter) {
          const lastText = currentQuestion.options.get(lastLetter) || '';
          currentQuestion.options.set(lastLetter, lastText + ' ' + line);
        }
      } else {
        // Add to question text
        currentQuestion.textParts.push(line);
      }
    }
  }
  
  // Save last question
  if (currentQuestion) {
    const q = createQuestion(currentQuestion, answerKey);
    if (q) questions.push(q);
  }
  
  return questions;
}

/**
 * Create a Question object from parsed data
 */
function createQuestion(
  parsed: { number: number; textParts: string[]; options: Map<string, string> },
  answerKey: AnswerKeyEntry[]
): Question | null {
  const questionText = parsed.textParts.join(' ').trim();
  if (!questionText) return null;
  
  const correctAnswer = answerKey.find(ak => ak.questionNumber === parsed.number);
  
  let answers: Answer[];
  
  if (parsed.options.size > 0) {
    answers = Array.from(parsed.options.entries()).map(([letter, text]) => ({
      id: generateId(),
      text: text.trim(),
      explanation: '',
      isCorrect: correctAnswer ? isMatchingAnswer(letter, correctAnswer.correctAnswer) : false
    }));
  } else {
    answers = [{
      id: generateId(),
      text: '',
      explanation: '',
      isCorrect: true
    }];
  }
  
  return {
    id: generateId(),
    text: questionText,
    answers
  };
}

/**
 * Check if an option letter matches the correct answer
 */
function isMatchingAnswer(optionLetter: string, correctAnswer: string): boolean {
  const normalize = (letter: string) => {
    const upper = letter.toUpperCase();
    const cyrillicToLatin: Record<string, string> = {
      'А': 'A', 'Б': 'B', 'В': 'C', 'Г': 'D'
    };
    return cyrillicToLatin[upper] || upper;
  };
  
  return normalize(optionLetter) === normalize(correctAnswer);
}

let pdfjsLibCache: typeof import('pdfjs-dist') | null = null;

/**
 * Load PDF.js dynamically
 */
export async function loadPDFJS(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsLibCache) {
    return pdfjsLibCache;
  }
  
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.7.284/legacy/build/pdf.worker.min.mjs';
  }
  
  pdfjsLibCache = pdfjsLib as typeof import('pdfjs-dist');
  return pdfjsLibCache;
}

/**
 * Extract text content from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await loadPDFJS();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const items = (textContent.items as any[]).filter(item => item.str);
    const lineMap = new Map<number, { x: number; str: string }[]>();
    
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push({ x, str: item.str });
    }
    
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    
    for (const y of sortedYs) {
      const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      const lineText = lineItems.map(item => item.str).join(' ').trim();
      if (lineText) {
        fullText += lineText + '\n';
      }
    }
    
    fullText += '\n';
  }
  
  return fullText;
}

/**
 * Import PDF file and convert to Quiz
 */
export async function importPDFToQuiz(file: File): Promise<Quiz> {
  const text = await extractTextFromPDF(file);
  return parsePDFContent(text);
}
