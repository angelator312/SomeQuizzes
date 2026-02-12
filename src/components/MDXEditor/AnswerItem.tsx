'use client';

import React from 'react';
import { Answer } from './types';

interface AnswerItemProps {
  answer: Answer;
  index: number;
  onUpdateAnswer: (updates: Partial<Answer>) => void;
  onDeleteAnswer: () => void;
  onMarkCorrect: () => void;
}

export const AnswerItem: React.FC<AnswerItemProps> = ({
  answer,
  index,
  onUpdateAnswer,
  onDeleteAnswer,
  onMarkCorrect,
}) => {
  return (
    <div className="p-3 border border-gray-200 bg-gray-50">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-600">A{index + 1}</span>
        <div className="flex gap-1">
          <button
            onClick={onMarkCorrect}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              answer.isCorrect
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            title="Mark as correct answer"
          >
            {answer.isCorrect ? '✓' : 'Correct'}
          </button>
          <button
            onClick={onDeleteAnswer}
            className="px-2 py-1 rounded text-xs font-medium text-red-500 hover:text-red-700"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      <textarea
        value={answer.text}
        onChange={(e) => onUpdateAnswer({ text: e.target.value })}
        placeholder="Answer text..."
        className="w-full p-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 mb-2 resize-none"
        rows={2}
      />

      <textarea
        value={answer.explanation}
        onChange={(e) => onUpdateAnswer({ explanation: e.target.value })}
        placeholder="Explanation (optional)..."
        className="w-full p-2 text-xs border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
        rows={1}
      />
    </div>
  );
};
