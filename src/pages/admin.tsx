'use client';

import React from 'react';
import { Link } from 'waku';
import { QuizEditor } from '../components/MDXEditor/QuizEditor';
import { ImportExport } from '../components/MDXEditor/ImportExport';
import { EditorProvider } from '../context/EditorContext';

export default function AdminPage() {
  return (
    <EditorProvider isEditorMode={true}>
      <div className="w-full h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Quiz Editor</h1>
            <div className="flex items-center gap-4">
              <ImportExport quiz={{ questions: [] }} onImport={() => { }} />
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
          <QuizEditor />
        </div>
      </div>
    </EditorProvider>
  );
}
