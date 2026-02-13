'use client';

import React, { useState } from 'react';
import { Link } from 'waku';
import { QuizEditor } from '../components/MDXEditor/QuizEditor';
import { ImportExport } from '../components/MDXEditor/ImportExport';
import { EditorProvider } from '../context/EditorContext';
import { Quiz } from '../components/MDXEditor/types';
import { downloadQuizzesFromMinIO } from '../actions/downloadQuizzes';

export default function AdminPage() {
  const [quiz, setQuiz] = useState<Quiz>({ questions: [], name: '' });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDownloadQuizzes = async () => {
    setIsDownloading(true);
    setDownloadMessage(null);
    try {
      const result = await downloadQuizzesFromMinIO();
      if (result.success) {
        setDownloadMessage({
          type: 'success',
          text: result.message,
        });
      } else {
        setDownloadMessage({
          type: 'error',
          text: result.error || result.message,
        });
      }
    } catch (error) {
      setDownloadMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsDownloading(false);
    }
  };

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

        {/* Footer with Download Button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleDownloadQuizzes}
              disabled={isDownloading}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                isDownloading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }`}
              aria-label="Download quizzes from MinIO"
            >
              {isDownloading ? 'Downloading...' : 'Download Quizzes'}
            </button>
            {downloadMessage && (
              <div
                className={`text-sm font-medium ${
                  downloadMessage.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {downloadMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
