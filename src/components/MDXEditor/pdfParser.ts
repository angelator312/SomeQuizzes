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
  console.log('[v0] Raw PDF text length:', text.length);
  console.log('[v0] First 2000 chars:', text.substring(0, 2000));
  
  // Parse answer key first to know correct answers
  const answerKey = parseAnswerKey(text);
  console.log('[v0] Found answer key entries:', answerKey.length, answerKey);
  
  // Parse questions from content
  const questions = parseQuestions(text, answerKey);
  console.log('[v0] Found questions:', questions.length);
  
  return { questions };
}

/**
 * Parse the answer key section - looks for patterns like "1 В 2" or table format
 */
function parseAnswerKey(text: string): AnswerKeyEntry[] {
  const entries: AnswerKeyEntry[] = [];
  
  // Multiple patterns to match answer keys:
  // Pattern 1: "1 В 2" (number, cyrillic letter, points)
  // Pattern 2: "1. В" (number with period, letter)
  // Pattern 3: Table format from the answer key section
  
  const patterns = [
    // Matches: 1 В 2 or 1 В or 1. В 2
    /(\d+)\.?\s+([АБВГABCD])\s*(\d*)/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const qNum = parseInt(match[1], 10);
      const answer = match[2].toUpperCase();
      const points = match[3] ? parseInt(match[3], 10) : undefined;
      
      // Only add if not already exists and question number is reasonable (1-50)
      if (qNum >= 1 && qNum <= 50 && !entries.find(e => e.questionNumber === qNum)) {
        entries.push({
          questionNumber: qNum,
          correctAnswer: answer,
          points
        });
      }
    }
  }
  
  // Sort by question number
  entries.sort((a, b) => a.questionNumber - b.questionNumber);
  
  return entries;
}

/**
 * Parse questions from the content
 */
function parseQuestions(text: string, answerKey: AnswerKeyEntry[]): Question[] {
  const questions: Question[] = [];
  
  // Normalize text - replace multiple spaces/newlines
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
  
  // Split into lines for processing
  const lines = normalizedText.split('\n');
  console.log('[v0] Total lines to parse:', lines.length);
  
  let currentQuestion: { number: number; textParts: string[]; options: { letter: string; text: string }[] } | null = null;
  let inAnswerKeySection = false;
  let questionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Debug: log first 20 lines to see their format
    if (i < 30) {
      console.log(`[v0] Line ${i}: "${line.substring(0, 60)}"`);
    }
    
    // Detect answer key section and stop parsing questions
    if (line.toLowerCase().includes('ключ') || 
        line.toLowerCase().includes('верни отговори') ||
        (line.includes('No') && line.includes('Отговор') && line.includes('точки'))) {
      inAnswerKeySection = true;
      // Save current question before stopping
      if (currentQuestion && currentQuestion.textParts.length > 0) {
        const q = createQuestion(currentQuestion, answerKey);
        if (q) questions.push(q);
      }
      break;
    }
    
    if (inAnswerKeySection) continue;
    
    // Check for question start: "1." or "1. " - more lenient matching
    const questionMatch = line.match(/^(\d+)\.\s+/);
    if (questionMatch) {
      const qNum = parseInt(questionMatch[1], 10);
      
      // Only treat as question if it's a reasonable number (1-30 for first part)
      if (qNum >= 1 && qNum <= 30) {
        console.log('[v0] Found question', qNum, ':', line.substring(0, 80));
        
        // Save previous question
        if (currentQuestion && currentQuestion.textParts.length > 0) {
          const q = createQuestion(currentQuestion, answerKey);
          if (q) {
            questions.push(q);
            questionCount++;
          }
        }
        
        // Start new question - get text after the number and period
        const afterNum = line.substring(questionMatch[0].length);
        currentQuestion = {
          number: qNum,
          textParts: afterNum ? [afterNum] : [],
          options: []
        };
        continue;
      }
    }
    
    // Check for answer option: А) or A) at start of line
    const optionMatch = line.match(/^([АБВГABCD])\)\s*(.*)$/i);
    if (optionMatch && currentQuestion) {
      currentQuestion.options.push({
        letter: optionMatch[1].toUpperCase(),
        text: optionMatch[2] || ''
      });
      continue;
    }
    
    // Continue adding to current question text or last option
    if (currentQuestion) {
      if (currentQuestion.options.length > 0) {
        // Add to last option
        const lastOpt = currentQuestion.options[currentQuestion.options.length - 1];
        lastOpt.text += ' ' + line;
      } else {
        // Add to question text
        currentQuestion.textParts.push(line);
      }
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentQuestion.textParts.length > 0) {
    const q = createQuestion(currentQuestion, answerKey);
    if (q) {
      questions.push(q);
      questionCount++;
    }
  }
  
  console.log('[v0] Final question count:', questionCount, 'questions:', questions.length);
  
  return questions;
}

/**
 * Create a Question object from parsed data
 */
function createQuestion(
  parsed: { number: number; textParts: string[]; options: { letter: string; text: string }[] },
  answerKey: AnswerKeyEntry[]
): Question | null {
  const questionText = parsed.textParts.join(' ').trim();
  if (!questionText) return null;
  
  const correctAnswer = answerKey.find(ak => ak.questionNumber === parsed.number);
  
  // Create answers from options, or create empty answers if no options
  let answers: Answer[];
  
  if (parsed.options.length > 0) {
    answers = parsed.options.map(opt => ({
      id: generateId(),
      text: opt.text.trim(),
      explanation: '',
      isCorrect: correctAnswer ? isMatchingAnswer(opt.letter, correctAnswer.correctAnswer) : false
    }));
  } else {
    // Open-ended question - create single empty answer
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
    // Map Cyrillic to Latin equivalents for comparison
    const cyrillicToLatin: Record<string, string> = {
      'А': 'A', 'Б': 'B', 'В': 'C', 'Г': 'D'
    };
    return cyrillicToLatin[upper] || upper;
  };
  
  return normalize(optionLetter) === normalize(correctAnswer);
}

// Cached pdfjsLib instance
let pdfjsLibCache: typeof import('pdfjs-dist') | null = null;

/**
 * Load PDF.js dynamically (for browser environment)
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
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
  }).promise;
  
  console.log('[v0] PDF loaded, pages:', pdf.numPages);
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Sort items by position (top to bottom, left to right)
    const items = (textContent.items as any[]).filter(item => item.str);
    
    // Group by Y position to form lines
    const lineMap = new Map<number, { x: number; str: string }[]>();
    
    for (const item of items) {
      const y = Math.round(item.transform[5]); // Round Y to group nearby items
      const x = item.transform[4];
      
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push({ x, str: item.str });
    }
    
    // Sort lines by Y (descending since PDF Y is bottom-up) and items within line by X
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    
    for (const y of sortedYs) {
      const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      const lineText = lineItems.map(item => item.str).join(' ').trim();
      if (lineText) {
        fullText += lineText + '\n';
      }
    }
    
    fullText += '\n'; // Page break
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
