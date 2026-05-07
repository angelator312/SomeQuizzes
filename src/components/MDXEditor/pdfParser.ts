import { Quiz, Question, Answer } from './types';
import { generateId } from './quizUtils';

// Answer key patterns for Bulgarian exams
const ANSWER_KEY_PATTERNS = [
  /ключ\s+с\s+верни/i,
  /верни\s+отговори/i,
  /отговор/i,
  /брой\s+точки/i
];

const ANSWER_LETTERS = ['А', 'Б', 'В', 'Г', 'A', 'B', 'C', 'D'];

interface ParsedQuestion {
  number: number;
  text: string;
  options: { letter: string; text: string }[];
}

interface AnswerKeyEntry {
  questionNumber: number;
  correctAnswer: string;
  points?: number;
}

/**
 * Parse PDF text content and extract quiz questions with answers
 */
export function parsePDFContent(text: string): Quiz {
  // Split content into main content and answer key
  const { mainContent, answerKeyContent } = splitContentAndAnswerKey(text);
  
  // Parse answer key first to know correct answers
  const answerKey = parseAnswerKey(answerKeyContent || text);
  
  // Parse questions from main content
  const parsedQuestions = parseQuestions(mainContent);
  
  // Convert to Quiz format with correct answers marked
  const questions: Question[] = parsedQuestions.map((pq) => {
    const correctAnswer = answerKey.find(ak => ak.questionNumber === pq.number);
    
    const answers: Answer[] = pq.options.map((opt) => ({
      id: generateId(),
      text: opt.text,
      explanation: '',
      isCorrect: correctAnswer ? isMatchingAnswer(opt.letter, correctAnswer.correctAnswer) : false
    }));
    
    // Ensure at least one answer if options were found
    if (answers.length === 0) {
      answers.push({
        id: generateId(),
        text: '',
        explanation: '',
        isCorrect: false
      });
    }
    
    return {
      id: generateId(),
      text: pq.text,
      answers
    };
  });
  
  return { questions };
}

/**
 * Split content into main exam content and answer key section
 */
function splitContentAndAnswerKey(text: string): { mainContent: string; answerKeyContent: string | null } {
  // Look for answer key section markers
  const lines = text.split('\n');
  let answerKeyStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (
      line.includes('ключ') || 
      (line.includes('no') && line.includes('отговор') && line.includes('точки')) ||
      (line.includes('задача') && line.includes('отговор') && line.includes('точки'))
    ) {
      answerKeyStartIndex = i;
      break;
    }
  }
  
  if (answerKeyStartIndex !== -1) {
    return {
      mainContent: lines.slice(0, answerKeyStartIndex).join('\n'),
      answerKeyContent: lines.slice(answerKeyStartIndex).join('\n')
    };
  }
  
  return { mainContent: text, answerKeyContent: null };
}

/**
 * Parse the answer key section
 */
function parseAnswerKey(text: string): AnswerKeyEntry[] {
  const entries: AnswerKeyEntry[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Pattern: "1 В 2" or "1. В 2" or "1 В" (question number, answer, optional points)
    const match = line.match(/^\s*(\d+)\.?\s+([АБВГABCD])\s*(\d*)\s*$/i);
    if (match) {
      entries.push({
        questionNumber: parseInt(match[1], 10),
        correctAnswer: match[2].toUpperCase(),
        points: match[3] ? parseInt(match[3], 10) : undefined
      });
    }
  }
  
  return entries;
}

/**
 * Parse questions from the main content
 */
function parseQuestions(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const lines = text.split('\n');
  
  let currentQuestion: ParsedQuestion | null = null;
  let currentOptionLetter: string | null = null;
  let collectingQuestionText = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if this line starts a new question (number followed by period or just number at start)
    const questionStartMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (questionStartMatch) {
      const qNum = parseInt(questionStartMatch[1], 10);
      
      // Save previous question
      if (currentQuestion && currentQuestion.text) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        number: qNum,
        text: questionStartMatch[2] || '',
        options: []
      };
      collectingQuestionText = true;
      currentOptionLetter = null;
      continue;
    }
    
    // Check if this line is an answer option (А), Б), В), Г) or A), B), C), D)
    const optionMatch = line.match(/^([АБВГABCD])\)\s*(.*)$/i);
    if (optionMatch && currentQuestion) {
      collectingQuestionText = false;
      currentOptionLetter = optionMatch[1].toUpperCase();
      const optionText = optionMatch[2] || '';
      
      currentQuestion.options.push({
        letter: currentOptionLetter,
        text: optionText
      });
      continue;
    }
    
    // Continue collecting question text or option text
    if (currentQuestion) {
      if (collectingQuestionText) {
        // Still collecting question text
        currentQuestion.text += (currentQuestion.text ? ' ' : '') + line;
      } else if (currentOptionLetter && currentQuestion.options.length > 0) {
        // Continue the last option's text
        const lastOption = currentQuestion.options[currentQuestion.options.length - 1];
        lastOption.text += ' ' + line;
      }
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentQuestion.text) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

/**
 * Check if an option letter matches the correct answer
 */
function isMatchingAnswer(optionLetter: string, correctAnswer: string): boolean {
  const normalized = (letter: string) => {
    const upper = letter.toUpperCase();
    // Map Cyrillic to Latin equivalents for comparison
    const cyrillicToLatin: Record<string, string> = {
      'А': 'A',
      'Б': 'B',
      'В': 'C',
      'Г': 'D'
    };
    return cyrillicToLatin[upper] || upper;
  };
  
  return normalized(optionLetter) === normalized(correctAnswer);
}

/**
 * Load PDF.js dynamically (for browser environment)
 */
export async function loadPDFJS() {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  
  return pdfjsLib;
}

/**
 * Extract text content from a PDF file with better line/paragraph handling
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await loadPDFJS();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items by their vertical position (y-coordinate) to reconstruct lines
    const items = textContent.items as any[];
    let lastY: number | null = null;
    let pageLines: string[] = [];
    let currentLine = '';
    
    for (const item of items) {
      if (!item.str) continue;
      
      const y = item.transform ? item.transform[5] : null;
      
      // If y position changed significantly, it's a new line
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }
        currentLine = item.str;
      } else {
        // Same line, add space if needed
        if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
          currentLine += ' ';
        }
        currentLine += item.str;
      }
      
      lastY = y;
    }
    
    // Don't forget the last line
    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }
    
    fullText += pageLines.join('\n') + '\n\n--- PAGE BREAK ---\n\n';
  }
  
  return fullText;
}

/**
 * Main function to import a PDF file and convert to Quiz
 */
export async function importPDFToQuiz(file: File): Promise<Quiz> {
  const text = await extractTextFromPDF(file);
  return parsePDFContent(text);
}
