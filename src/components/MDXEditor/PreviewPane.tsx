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
  return (
    <div className="h-full overflow-auto">
      {quiz.questions.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          <p>Preview appears here</p>
        </div>
      ) : (
        <div className="p-6">
          <QuizRenderer quiz={quiz} />
        </div>
      )}
    </div>
  );
};

// Component to render the quiz preview
const QuizRenderer: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  // Build React elements from the quiz data
  const answers = quiz.questions.flatMap((q, qIdx) =>
    q.answers.map((a, aIdx) => {
      return (
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
      )
    })
  );

  const questions = quiz.questions.map((q, idx) => {
    console.log(a.text)
    return (
      <QuizComponent.Question key={q.id}>
        {q.text}
        {answers}
      </QuizComponent.Question>
    )
  });

  return (
    <div>
      <QuizComponent>{questions}</QuizComponent>
    </div>
  );
};
