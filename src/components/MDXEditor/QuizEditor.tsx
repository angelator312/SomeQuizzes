'use client';

import React, { useState, useEffect } from 'react';
import { Quiz } from './types';
import { QuestionList } from './QuestionList';
import { PreviewPane } from './PreviewPane';
import { ImportExport } from './ImportExport';
import * as quizUtils from './quizUtils';

export const QuizEditor: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz>(quizUtils.createEmptyQuiz());

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Shift + Q: Add question
      if (modifier && e.shiftKey && e.key.toUpperCase() === 'Q') {
        e.preventDefault();
        setQuiz((q) => quizUtils.addQuestion(q));
      }

      // Cmd/Ctrl + ?: Show help
      if (modifier && e.shiftKey && e.key === '?') {
        e.preventDefault();
        alert(
          'Keyboard Shortcuts:\n' +
          'Cmd/Ctrl + Shift + Q: Add new question\n' +
          'Cmd/Ctrl + Shift + A: Add new answer\n' +
          'Cmd/Ctrl + Enter: Mark answer as correct'
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddQuestion = () => {
    setQuiz((q) => quizUtils.addQuestion(q));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuiz((q) => quizUtils.deleteQuestion(q, questionId));
  };

  const handleUpdateQuestion = (questionId: string, text: string) => {
    setQuiz((q) => quizUtils.updateQuestion(q, questionId, text));
  };

  const handleAddAnswer = (questionId: string) => {
    setQuiz((q) => quizUtils.addAnswer(q, questionId));
  };

  const handleUpdateAnswer = (
    questionId: string,
    answerId: string,
    updates: any
  ) => {
    setQuiz((q) => quizUtils.updateAnswer(q, questionId, answerId, updates));
  };

  const handleDeleteAnswer = (questionId: string, answerId: string) => {
    setQuiz((q) => quizUtils.deleteAnswer(q, questionId, answerId));
  };

  const handleMarkCorrect = (questionId: string, answerId: string) => {
    setQuiz((q) => quizUtils.markCorrectAnswer(q, questionId, answerId));
  };

  const handleMoveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setQuiz((q) => {
      const index = q.questions.findIndex((qu) => qu.id === questionId);
      if (
        (direction === 'up' && index <= 0) ||
        (direction === 'down' && index >= q.questions.length - 1)
      ) {
        return q;
      }

      const newQuestions = [...q.questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newQuestions[index], newQuestions[newIndex]] = [
        newQuestions[newIndex],
        newQuestions[index],
      ];

      return { ...q, questions: newQuestions };
    });
  };

  const handleImport = (importedQuiz: Quiz) => {
    setQuiz(importedQuiz);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main content */}
      <div className="grid grid-cols-2 gap-0 h-[calc(100vh-60px)]">
        {/* Left pane: Editor */}
        <div className="overflow-auto border-r border-gray-200 p-6">
          <QuestionList
            questions={quiz.questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onAddAnswer={handleAddAnswer}
            onUpdateAnswer={handleUpdateAnswer}
            onDeleteAnswer={handleDeleteAnswer}
            onMarkCorrect={handleMarkCorrect}
            onMoveQuestion={handleMoveQuestion}
          />
        </div>

        {/* Right pane: Preview */}
        <div className="overflow-auto bg-gray-50 p-6">
          <PreviewPane quiz={quiz} />
        </div>
      </div>
    </div>
  );
};
