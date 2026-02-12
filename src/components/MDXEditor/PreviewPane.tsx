'use client';

import React from 'react';
import { Quiz } from './types';
import QuizComponent from '../Quiz';

interface PreviewPaneProps {
  quiz: Quiz;
}

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

// Component to render the quiz preview with markdown/code/math support
const QuizRenderer: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  // Build React elements from the quiz data
  const questions = quiz.questions.map((q, idx) => {
    const questionAnswers = q.answers.map((a, aIdx) => {
      return (
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
      );
    });

    return (
      <QuizComponent.Question key={q.id}>
        {q.text}
        {questionAnswers}
      </QuizComponent.Question>
    );
  });

  return (
    <div>
      <QuizComponent>{questions}</QuizComponent>
    </div>
  );
};
