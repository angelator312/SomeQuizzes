'use client';

import React from 'react';
import { Question } from './types';
import { QuestionEditor } from './QuestionEditor';

interface QuestionListProps {
  questions: Question[];
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onUpdateQuestion: (questionId: string, text: string) => void;
  onAddAnswer: (questionId: string) => void;
  onUpdateAnswer: (questionId: string, answerId: string, updates: any) => void;
  onDeleteAnswer: (questionId: string, answerId: string) => void;
  onMarkCorrect: (questionId: string, answerId: string) => void;
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onMarkCorrect,
  onMoveQuestion,
}) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onAddQuestion}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        title="Keyboard shortcut: Cmd/Ctrl + Shift + Q"
      >
        + Add Question
      </button>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          <p>No questions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              questionId={question.id}
              index={index}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onAddAnswer={onAddAnswer}
              onUpdateAnswer={onUpdateAnswer}
              onDeleteAnswer={onDeleteAnswer}
              onMarkCorrect={onMarkCorrect}
              onMoveUp={onMoveQuestion}
              onMoveDown={onMoveQuestion}
              canMoveUp={index > 0}
              canMoveDown={index < questions.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
