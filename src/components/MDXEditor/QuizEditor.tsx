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
        setQuiz(quizUtils.addQuestion);
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
    setQuiz(quizUtils.addQuestion);
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
    <div className="min-h-screen bg-gray-100">
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Quiz MDX Editor</h1>
          <div className="flex gap-3">
            <ImportExport quiz={quiz} onImport={handleImport} />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-2 gap-6 p-6 h-[calc(100vh-120px)]">
        {/* Left pane: Editor */}
        <div className="overflow-auto bg-white rounded-lg shadow p-6 border border-gray-200">
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
        <div className="overflow-auto bg-white rounded-lg shadow border border-gray-200">
          <PreviewPane quiz={quiz} />
        </div>
      </div>
    </div>
  );
};
