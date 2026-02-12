'use client';

import React, { useMemo } from 'react';
import { Quiz } from './types';
import { generateMDX } from './mdxGenerator';
import QuizComponent from '../Quiz';

interface PreviewPaneProps {
  quiz: Quiz;
}

// Simple MDX component renderer for preview
// This creates a temporary component that renders the Quiz
const createQuizRenderer = (mdxContent: string) => {
  // Parse the MDX to extract questions and answers
  // We'll render it using the Quiz component directly
  return mdxContent;
};

export const PreviewPane: React.FC<PreviewPaneProps> = ({ quiz }) => {
  const mdxContent = useMemo(() => generateMDX(quiz), [quiz]);

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Preview</h2>

      {quiz.questions.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <p className="text-gray-600">
            Add questions to see the preview here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <QuizRenderer quiz={quiz} />
        </div>
      )}

      {/* Show the raw MDX for debugging */}
      <details className="mt-6">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
          View Generated MDX
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded overflow-auto text-xs">
          {mdxContent}
        </pre>
      </details>
    </div>
  );
};

// Component to render the quiz preview
const QuizRenderer: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  // Build React elements from the quiz data
  const answers = quiz.questions.flatMap((q, qIdx) =>
    q.answers.map((a, aIdx) => (
      <QuizComponent.Answer
        key={`${qIdx}-${aIdx}`}
        correct={a.isCorrect}
      >
        {a.text}
        {a.explanation && (
          <QuizComponent.Explanation>
            {a.explanation}
          </QuizComponent.Explanation>
        )}
      </QuizComponent.Answer>
    ))
  );

  const questions = quiz.questions.map((q, idx) => (
    <QuizComponent.Question key={q.id}>
      {q.text}
      {q.answers.map((a, aIdx) => (
        <QuizComponent.Answer
          key={`${idx}-${aIdx}`}
          correct={a.isCorrect}
        >
          {a.text}
          {a.explanation && (
            <QuizComponent.Explanation>
              {a.explanation}
            </QuizComponent.Explanation>
          )}
        </QuizComponent.Answer>
      ))}
    </QuizComponent.Question>
  ));

  return (
    <div>
      <QuizComponent>{questions}</QuizComponent>
    </div>
  );
};
