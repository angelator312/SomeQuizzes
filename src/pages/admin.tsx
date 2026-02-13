'use client';

import React, { useState } from 'react';
import { Link } from 'waku';
import { QuizEditor } from '../components/MDXEditor/QuizEditor';
import { ImportExport } from '../components/MDXEditor/ImportExport';
import { EditorProvider } from '../context/EditorContext';
import { Quiz } from '../components/MDXEditor/types';

export default function AdminPage() {
  const [quiz, setQuiz] = useState<Quiz>({ questions: [], name: '' });

  return (
    <EditorProvider isEditorMode={true}>
      <div className="w-full h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Quiz Editor</h1>
            <div className="flex items-center gap-4">
              <input
                value={quiz.name || ''}
                onChange={(e) => setQuiz((q) => ({ ...q, name: e.target.value }))}
                placeholder="Quiz name"
                className="px-3 py-1 text-sm border border-gray-200 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400"
                aria-label="Quiz name"
              />
              <ImportExport quiz={quiz} onImport={setQuiz} />
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
              >
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <QuizEditor initialQuiz={quiz} onQuizChange={setQuiz} />
        </div>
      </div>
    </EditorProvider>
  );
}
