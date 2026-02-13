'use client';

import React from 'react';
import { Question } from './types';
import { AnswerItem } from './AnswerItem';

interface AnswersListProps {
  question: Question;
  questionId: string;
  onAddAnswer: (questionId: string) => void;
  onUpdateAnswer: (questionId: string, answerId: string, updates: any) => void;
  onDeleteAnswer: (questionId: string, answerId: string) => void;
  onMarkCorrect: (questionId: string, answerId: string) => void;
}

export const AnswersList: React.FC<AnswersListProps> = ({
  question,
  questionId,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onMarkCorrect,
}) => {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onAddAnswer(questionId)}
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
            questionId={questionId}
            answerId={answer.id}
            onUpdateAnswer={onUpdateAnswer}
            onDeleteAnswer={onDeleteAnswer}
            onMarkCorrect={onMarkCorrect}
          />
        ))}
      </div>
    </div>
  );
};
