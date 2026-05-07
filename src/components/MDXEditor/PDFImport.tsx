'use client';

import React, { useRef, useState } from 'react';
import { Quiz } from './types';
import { importPDFToQuiz } from './pdfParser';

interface PDFImportProps {
  onImport: (quiz: Quiz) => void;
}

export const PDFImport: React.FC<PDFImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const quiz = await importPDFToQuiz(file);
      
      if (quiz.questions.length === 0) {
        setError('No questions found in PDF. Check browser console for debug info.');
        setIsLoading(false);
        return;
      }
      
      // Import directly into the editor
      onImport(quiz);
    } catch (err) {
      console.error('[v0] PDF import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse PDF');
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 border border-green-600 hover:border-green-700 transition-colors disabled:opacity-50"
        title="Import quiz from PDF"
      >
        {isLoading ? 'Importing...' : 'Import PDF'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import PDF file"
      />
      
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-50">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
