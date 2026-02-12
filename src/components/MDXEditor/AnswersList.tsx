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
    <div className="space-y-2">
      <button
        onClick={onAddAnswer}
        className="w-full px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        title="Keyboard shortcut: Cmd/Ctrl + Shift + A"
      >
        + Answer
      </button>

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
