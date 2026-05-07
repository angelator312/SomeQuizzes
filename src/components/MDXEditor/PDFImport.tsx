'use client';

import React, { useRef, useState } from 'react';
import { Quiz } from './types';
import { importPDFToQuiz } from './pdfParser';
import { generateId } from './quizUtils';

interface PDFImportProps {
  onImport: (quiz: Quiz) => void;
}

type ImportStep = 'idle' | 'loading' | 'preview' | 'answer-setup' | 'error';

interface PreviewQuestion {
  id: string;
  number: number;
  text: string;
  options: { id: string; letter: string; text: string; isCorrect: boolean }[];
}

export const PDFImport: React.FC<PDFImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>('idle');
  const [error, setError] = useState<string>('');
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
  const [pdfName, setPdfName] = useState<string>('');
  const [showAnswerKeyInput, setShowAnswerKeyInput] = useState(false);
  const [answerKeyText, setAnswerKeyText] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file');
      setStep('error');
      return;
    }

    setPdfName(file.name.replace('.pdf', ''));
    setStep('loading');
    setError('');

    try {
      const quiz = await importPDFToQuiz(file);
      
      // Convert to preview format
      const preview: PreviewQuestion[] = quiz.questions.map((q, idx) => ({
        id: q.id,
        number: idx + 1,
        text: q.text,
        options: q.answers.map((a, aIdx) => ({
          id: a.id,
          letter: String.fromCharCode(65 + aIdx), // A, B, C, D
          text: a.text,
          isCorrect: a.isCorrect
        }))
      }));

      setPreviewQuestions(preview);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse PDF');
      setStep('error');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCorrectAnswerChange = (questionId: string, optionId: string) => {
    setPreviewQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(opt => ({
            ...opt,
            isCorrect: opt.id === optionId
          }))
        };
      }
      return q;
    }));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setPreviewQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const handleOptionTextChange = (questionId: string, optionId: string, text: string) => {
    setPreviewQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(opt => 
            opt.id === optionId ? { ...opt, text } : opt
          )
        };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setPreviewQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleAddOption = (questionId: string) => {
    setPreviewQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const nextLetter = String.fromCharCode(65 + q.options.length);
        return {
          ...q,
          options: [...q.options, {
            id: generateId(),
            letter: nextLetter,
            text: '',
            isCorrect: false
          }]
        };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionId: string, optionId: string) => {
    setPreviewQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter(opt => opt.id !== optionId)
        };
      }
      return q;
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion: PreviewQuestion = {
      id: generateId(),
      number: previewQuestions.length + 1,
      text: '',
      options: [
        { id: generateId(), letter: 'A', text: '', isCorrect: false },
        { id: generateId(), letter: 'B', text: '', isCorrect: false },
        { id: generateId(), letter: 'C', text: '', isCorrect: false },
        { id: generateId(), letter: 'D', text: '', isCorrect: false },
      ]
    };
    setPreviewQuestions(prev => [...prev, newQuestion]);
  };

  const handleApplyAnswerKey = () => {
    // Parse answer key text - supports formats like:
    // "1-A, 2-B, 3-C" or "1.A 2.B 3.C" or "1 A\n2 B\n3 C" or "ABCD..." (sequential)
    const trimmed = answerKeyText.trim();
    
    // Check if it's just a sequence of letters (e.g., "ВВВГВГББВВААББГДГВГГА")
    const sequentialMatch = trimmed.match(/^[АБВГABCD]+$/i);
    if (sequentialMatch) {
      const letters = trimmed.toUpperCase().split('');
      setPreviewQuestions(prev => prev.map((q, idx) => {
        if (idx < letters.length) {
          const correctLetter = letters[idx];
          return {
            ...q,
            options: q.options.map(opt => ({
              ...opt,
              isCorrect: normalizeAnswerLetter(opt.letter) === normalizeAnswerLetter(correctLetter)
            }))
          };
        }
        return q;
      }));
      setShowAnswerKeyInput(false);
      setAnswerKeyText('');
      return;
    }
    
    // Parse numbered format
    const entries: { num: number; answer: string }[] = [];
    // Match patterns like "1-A", "1.A", "1 A", "1:A"
    const matches = trimmed.matchAll(/(\d+)\s*[-.:)]\s*([АБВГABCD])/gi);
    for (const match of matches) {
      entries.push({
        num: parseInt(match[1], 10),
        answer: match[2].toUpperCase()
      });
    }
    
    if (entries.length > 0) {
      setPreviewQuestions(prev => prev.map((q) => {
        const entry = entries.find(e => e.num === q.number);
        if (entry) {
          return {
            ...q,
            options: q.options.map(opt => ({
              ...opt,
              isCorrect: normalizeAnswerLetter(opt.letter) === normalizeAnswerLetter(entry.answer)
            }))
          };
        }
        return q;
      }));
    }
    
    setShowAnswerKeyInput(false);
    setAnswerKeyText('');
  };

  const normalizeAnswerLetter = (letter: string): string => {
    const upper = letter.toUpperCase();
    const cyrillicToLatin: Record<string, string> = {
      'А': 'A', 'Б': 'B', 'В': 'C', 'Г': 'D'
    };
    return cyrillicToLatin[upper] || upper;
  };

  const handleConfirmImport = () => {
    const quiz: Quiz = {
      name: pdfName,
      questions: previewQuestions.map(pq => ({
        id: pq.id,
        text: pq.text,
        answers: pq.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          explanation: '',
          isCorrect: opt.isCorrect
        }))
      }))
    };

    onImport(quiz);
    setStep('idle');
    setPreviewQuestions([]);
  };

  const handleCancel = () => {
    setStep('idle');
    setPreviewQuestions([]);
    setError('');
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 border border-green-600 hover:border-green-700 transition-colors"
        title="Import PDF file"
      >
        Import PDF
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="Import PDF file"
      />

      {/* Loading Overlay */}
      {step === 'loading' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Parsing PDF...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {step === 'error' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Import Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Preview & Answer Setup Modal */}
      {(step === 'preview' || step === 'answer-setup') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    PDF Import Preview
                  </h3>
                  <p className="text-sm text-gray-500">
                    {previewQuestions.length} questions found. Review and set correct answers.
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  x
                </button>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded"
                >
                  + Add Question
                </button>
                <button
                  onClick={() => setShowAnswerKeyInput(!showAnswerKeyInput)}
                  className="px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 border border-purple-600 hover:border-purple-700 rounded"
                >
                  Bulk Set Answers
                </button>
              </div>
              
              {/* Bulk Answer Key Input */}
              {showAnswerKeyInput && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Enter answer key (e.g., &quot;1-A, 2-B, 3-C&quot; or &quot;ABCD...&quot; for sequential):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={answerKeyText}
                      onChange={(e) => setAnswerKeyText(e.target.value)}
                      placeholder="ВВВГБГВАБ... or 1-В, 2-Б, 3-А..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleApplyAnswerKey}
                      disabled={!answerKeyText.trim()}
                      className="px-3 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports Cyrillic (А,Б,В,Г) and Latin (A,B,C,D) letters
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {previewQuestions.map((question, qIdx) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-500">
                        Q{question.number}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                        title="Delete question"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-200 rounded mb-3 resize-none"
                      rows={3}
                      placeholder="Question text..."
                    />

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Answers (select correct one):
                      </div>
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(question.id, option.id)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {option.letter})
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionTextChange(question.id, option.id, e.target.value)}
                            className={`flex-1 p-1 text-sm border rounded ${
                              option.isCorrect 
                                ? 'border-green-400 bg-green-50' 
                                : 'border-gray-200'
                            }`}
                            placeholder="Answer text..."
                          />
                          <button
                            onClick={() => handleDeleteOption(question.id, option.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                            title="Delete option"
                          >
                            x
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddOption(question.id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                ))}

                {previewQuestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions found in the PDF. The PDF format may not be supported.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={previewQuestions.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {previewQuestions.length} Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
