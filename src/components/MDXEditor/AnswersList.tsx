'use client';

import React from 'react';
import { Question } from './types';
import { AnswerItem } from './AnswerItem';

interface AnswersListProps {
  question: Question;
  onAddAnswer: () => void;
  onUpdateAnswer: (answerId: string, updates: any) => void;
  onDeleteAnswer: (answerId: string) => void;
  onMarkCorrect: (answerId: string) => void;
}

export const AnswersList: React.FC<AnswersListProps> = ({
  question,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onMarkCorrect,
}) => {
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Answers</h3>
        <button
          onClick={onAddAnswer}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-sm"
          title="Keyboard shortcut: Cmd/Ctrl + Shift + A"
        >
          + New Answer
        </button>
      </div>

      <div className="space-y-2">
        {question.answers.map((answer, index) => (
          <AnswerItem
            key={answer.id}
            answer={answer}
            index={index}
            onUpdateAnswer={(updates) =>
              onUpdateAnswer(answer.id, updates)
            }
            onDeleteAnswer={() => onDeleteAnswer(answer.id)}
            onMarkCorrect={() => onMarkCorrect(answer.id)}
          />
        ))}
      </div>
    </div>
  );
};
