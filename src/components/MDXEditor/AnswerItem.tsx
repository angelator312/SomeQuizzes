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
    <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Answer {index + 1}</h4>
        <div className="flex gap-2">
          <button
            onClick={onMarkCorrect}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              answer.isCorrect
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            title="Mark as correct answer"
          >
            {answer.isCorrect ? '✓ Correct' : 'Mark Correct'}
          </button>
          <button
            onClick={onDeleteAnswer}
            className="px-3 py-1 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Delete this answer"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer Text
          </label>
          <textarea
            value={answer.text}
            onChange={(e) => onUpdateAnswer({ text: e.target.value })}
            placeholder="Enter answer option text..."
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Explanation (optional)
          </label>
          <textarea
            value={answer.explanation}
            onChange={(e) => onUpdateAnswer({ explanation: e.target.value })}
            placeholder="Enter explanation for this answer..."
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};
