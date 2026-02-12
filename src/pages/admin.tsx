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

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <QuizEditor />
        </div>
      </div>
    </EditorProvider>
  );
}
