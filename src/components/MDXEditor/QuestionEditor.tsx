'use client';

import React, { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="p-4 border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sm font-semibold text-gray-900 hover:text-gray-700 flex items-center gap-1"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <span>{isCollapsed ? '▶' : '▼'}</span>
          Q{index + 1}
        </button>
        <div className="flex gap-1">
          {canMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-1 text-gray-500 hover:text-gray-700 text-xs"
              title="Move up"
            >
              ↑
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-1 text-gray-500 hover:text-gray-700 text-xs"
              title="Move down"
            >
              ↓
            </button>
          )}
          <button
            onClick={onDeleteQuestion}
            className="p-1 text-red-500 hover:text-red-700 text-xs"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <textarea
            value={question.text}
            onChange={(e) => onUpdateQuestion(e.target.value)}
            placeholder="Question text..."
            className="w-full p-2 text-sm border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 mb-3 resize-none"
            rows={4}
          />

          <AnswersList
            question={question}
            onAddAnswer={onAddAnswer}
            onUpdateAnswer={onUpdateAnswer}
            onDeleteAnswer={onDeleteAnswer}
            onMarkCorrect={onMarkCorrect}
          />
        </>
      )}
    </div>
  );
};
