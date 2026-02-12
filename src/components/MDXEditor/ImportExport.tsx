'use client';

import React, { useRef } from 'react';
import { Quiz } from './types';
import { generateMDX } from './mdxGenerator';
import { parseMDX } from './mdxParser';

interface ImportExportProps {
  quiz: Quiz;
  onImport: (quiz: Quiz) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  quiz,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const mdxContent = generateMDX(quiz);
    const element = document.createElement('a');
    const file = new Blob([mdxContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);

    // Generate filename based on first question or use default
    let filename = 'quiz.mdx';
    if (quiz.questions.length > 0 && quiz.questions[0].text) {
      const firstLineOfQuestion = quiz.questions[0].text.split('\n')[0];
      const cleanedName = firstLineOfQuestion
        .slice(0, 30)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase();
      if (cleanedName) {
        filename = `${cleanedName}.mdx`;
      }
    }

    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const importedQuiz = parseMDX(content);
        onImport(importedQuiz);
        alert('Quiz imported successfully!');
      } catch (error) {
        alert('Error importing quiz: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
        title="Import an MDX quiz file"
      >
        📥 Import
      </button>
      <button
        onClick={handleExport}
        disabled={quiz.questions.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Export quiz as MDX file"
      >
        📥 Export
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mdx"
        onChange={handleImport}
        style={{ display: 'none' }}
        aria-label="Import MDX file"
      />
    </div>
  );
};
