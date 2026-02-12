'use client';

import React from 'react';
import { Link } from 'waku';
import { QuizEditor } from '../components/MDXEditor/QuizEditor';

export default function AdminPage() {
  return (
    <div className="w-full">
      <QuizEditor />
      <div className="fixed bottom-4 left-4">
        <Link
          to="/"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
        >
          ← Back to Quizzes
        </Link>
      </div>
    </div>
  );
}
