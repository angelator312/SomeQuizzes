'use client';

import React from 'react';
import { Question } from './types';
import { AnswersList } from './AnswersList';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdateQuestion: (text: string) => void;
  onDeleteQuestion: () => void;
  onAddAnswer: () => void;
  onUpdateAnswer: (answerId: string, updates: any) => void;
  onDeleteAnswer: (answerId: string) => void;
  onMarkCorrect: (answerId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onMarkCorrect,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  return (
    <div className="mb-6 p-6 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Question {index + 1}</h2>
        <div className="flex gap-2">
          {canMoveUp && (
            <button
              onClick={onMoveUp}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
              title="Move question up"
            >
              ↑ Up
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={onMoveDown}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
              title="Move question down"
            >
              ↓ Down
            </button>
          )}
          <button
            onClick={onDeleteQuestion}
            className="px-3 py-1 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Delete this question"
          >
            Delete Question
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <textarea
          value={question.text}
          onChange={(e) => onUpdateQuestion(e.target.value)}
          placeholder="Enter your question here (can include code blocks, markdown, etc.)..."
          className="w-full p-3 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
      </div>

      <AnswersList
        question={question}
        onAddAnswer={onAddAnswer}
        onUpdateAnswer={onUpdateAnswer}
        onDeleteAnswer={onDeleteAnswer}
        onMarkCorrect={onMarkCorrect}
      />
    </div>
  );
};
