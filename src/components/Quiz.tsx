"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid";
import {
  atom,
  Provider,
  useAtom,
  useAtomValue,
  useSetAtom,
  useStore,
} from "jotai";
import React, { useState, useEffect } from "react";
import { useEditorMode } from "../context/EditorContext";

const finalAnswersAtom = atom<number[]>([]); //saved previous answers

const currentQuestionAtom = atom(0);
const selectedAnswerAtom = atom(null as number | null); //user selection for current question
const correctAnswersAtom = atom([] as number[]); //correct selection(s) for current question

function classNames(...s: (string | boolean)[]) {
  let a: string[] = [];
  for (const e of s) if (typeof e == "string") a.push(e);
  return a.join(" ");
}

const handleSubmittedAnswerAtom = atom(
  null,
  (get, set, answer_index: number) => {
    set(finalAnswersAtom, (prv) => {
      const i = get(currentQuestionAtom);
      const finalAnswersClone = [...prv];
      finalAnswersClone[i] = answer_index;
      return finalAnswersClone;
      // code below doesn't work for some reason
      // probably because it's not a deep clone
      // prv[get(currentQuestionAtom)] = answer_index;
      // return prv;
    });
  },
); //updates the finalAnswersArray upon question submit

const submittedAtom = atom(false); //whether or not the current question is currently submitted

const QuizAnswerExplanation = (props: { children?: React.ReactNode }) => {
  // read theme locally so this element updates regardless of Tailwind dark strategy
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("code-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "code-theme") {
        const newVal = e.newValue;
        if (newVal === "light" || newVal === "dark") setTheme(newVal);
      }
    };
    window.addEventListener("code-theme-changed", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("code-theme-changed", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const cls = classNames(
    "no-y-margin text-sm",
    theme === "dark" ? "text-gray-400" : "text-gray-700",
  );

  return <div className={cls}>{props.children}</div>;
};
QuizAnswerExplanation.displayName = "QuizAnswerExplanation";
// Answer choice component
const QuizMCAnswer = (props) => {
  const store = useStore();
  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom, {
    store,
  });
  const isSelected = selectedAnswer === props.number;
  const [submitted, setSubmittedValue] = useAtom(submittedAtom, { store });
  const correctAnswers = useAtomValue(correctAnswersAtom, { store });

  // Theme - read local preference so we don't rely on Tailwind media dark mode
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("code-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "code-theme") {
        const newVal = e.newValue;
        if (newVal === "light" || newVal === "dark") setTheme(newVal);
      }
    };
    window.addEventListener("code-theme-changed", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("code-theme-changed", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const showVerdict =
    submitted && (isSelected || correctAnswers.includes(selectedAnswer ?? -1)); //display correctness/explanation
  const isCorrect = submitted && correctAnswers.includes(selectedAnswer ?? -1);
  const Element = isCorrect ? "div" : "button";

  const baseContainer = "flex w-full items-start rounded-2xl px-4 py-3 text-left focus:outline-hidden";
  const bgClass = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const containerClass = `${baseContainer} ${bgClass}`;

  const ringOffset = theme === "dark" ? "ring-offset-gray-900" : "ring-offset-gray-100";
  const selectedText = theme === "dark" ? "text-gray-900" : "text-gray-100";
  const notSelectedBorder = theme === "dark" ? "dark:border-gray-500 dark:text-gray-300" : "border border-gray-600 text-gray-800";
  // note: kept the border classes for light; for dark we only set colors that matter

  return (
    <Element
      className={containerClass}
      onClick={() => {
        if (!showVerdict) {
          if (selectedAnswer !== props.number) {
            // switch answers
            setSelectedAnswer(props.number);
            setSubmittedValue(false);
          } else if (!submitted) {
            //unselect current choice
            setSelectedAnswer(null);
          }
        }
      }}
    >
      <span
        className={classNames(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium",
          // selected / showVerdict branch
          isSelected || showVerdict
            ? classNames("font-bold", selectedText, "ring-2", ringOffset)
            : notSelectedBorder,
          // show verdict color (correct/wrong)
          showVerdict &&
            (props.correct
              ? theme === "dark"
                ? "bg-green-300 ring-green-300"
                : "bg-green-600 ring-green-600"
              : theme === "dark"
              ? "bg-red-300 ring-red-300"
              : "bg-red-600 ring-red-600"),
          // selected but not submitted
          isSelected && !submitted && (theme === "dark" ? "bg-gray-300 ring-gray-300" : "bg-gray-600 ring-gray-600"),
        )}
      >
        {props.number + 1}
      </span>

      <div className={"no-y-margin ml-3 flex-1"}>
        {React.Children.map(props.children, (child) => {
          if (child?.type?.displayName == "QuizAnswerExplanation") {
            if (!child.props.children || !showVerdict) {
              return null;
            }
          }
          if (!isCorrect && child?.type?.name == "pre") {
            return React.cloneElement(child, { copyButton: false });
          }
          return child;
        })}
      </div>
    </Element>
  );
};
QuizMCAnswer.displayName = "QuizMCAnswer";

const QuizQuestion = (props) => {
  const store = useStore();
  const setCorrectAnswers = useSetAtom(correctAnswersAtom, { store });
  React.useEffect(() => {
    const correctAnswers: number[] = [];
    let answerNum = 0;
    React.Children.map(props.children, (child) => {
      if (child?.type?.displayName === "QuizMCAnswer") {
        if (child.props.correct) correctAnswers.push(answerNum);
        answerNum++;
      }
    });
    setCorrectAnswers(correctAnswers);
  }, []);

  let num = 0;
  const answerChoices = React.Children.map(props.children, (child) => {
    if (child?.type?.displayName === "QuizMCAnswer") {
      return React.cloneElement(child, {
        number: num++,
      });
    } else {
      return child;
    }
  });
  return <div className="space-y-2">{answerChoices}</div>;
};
QuizQuestion.displayName = "QuizQuestion";



// needed to use scoped provider
const ActualQuiz = (props) => {
  const store = useStore();
  const { isEditorMode } = useEditorMode();
  const [currentQuestion, setCurrentQuestion] = useAtom(currentQuestionAtom, {
    store,
  });

  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom, {
    store,
  });
  const finalAnswers = useAtomValue(finalAnswersAtom, { store });
  const submitAnswer = useSetAtom(handleSubmittedAnswerAtom, { store });
  const [submitted, setSubmitted] = useAtom(submittedAtom, { store });
  const canMoveOn = submitted || selectedAnswer === null; //if you can move on to the next question

  // Minimal theme integration: read ThemeSwitcher preference from localStorage
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("code-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch (e) {
      // ignore localStorage errors
    }

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "code-theme") {
        const newVal = e.newValue;
        if (newVal === "light" || newVal === "dark") setTheme(newVal);
      }
    };

    window.addEventListener("code-theme-changed", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(
        "code-theme-changed",
        onCustom as EventListener,
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleQuestionChange = (newQuestionIndex: number) => {
    const newAnswer = finalAnswers[newQuestionIndex] ?? null;
    setCurrentQuestion(newQuestionIndex);
    setSubmitted(newAnswer !== null);
    setSelectedAnswer(newAnswer);
  };

  // Keyboard shortcuts - disabled in editor mode
  React.useEffect(() => {
    if (isEditorMode) return; // Don't attach keyboard listeners in editor mode

    const questionList: React.ReactElement[] = React.Children.map(
      props.children,
      (child) => child,
    );

    const handleKeyPress = (e: KeyboardEvent) => {
      // Arrow Right or Enter: Next/Submit
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (!canMoveOn) {
          submitAnswer(selectedAnswer);
          setSubmitted(true);
        } else if (currentQuestion < questionList.length - 1) {
          handleQuestionChange(currentQuestion + 1);
        }
      }
      // Arrow Left: Previous
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentQuestion > 0) {
          handleQuestionChange(currentQuestion - 1);
        }
      }
      // Space: Skip
      else if (e.key === " ") {
        e.preventDefault();
        if (!submitted) {
          setSelectedAnswer(null);
          setSubmitted(false);
        }
        if (currentQuestion < questionList.length - 1) {
          handleQuestionChange(currentQuestion + 1);
        }
      }
      // Number keys (1-4): Select answer
      else if (e.key >= "1" && e.key <= "4") {
        const answerNumber = parseInt(e.key) - 1;
        const answerCount = React.Children.count(props.children) > 0 ? 4 : 0;
        if (answerNumber < answerCount && !submitted) {
          setSelectedAnswer(answerNumber);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestion, selectedAnswer, submitted, canMoveOn, props.children, isEditorMode]);

  const questionList: React.ReactElement[] = React.Children.map(
    props.children,
    (child) => {
      if (child?.type?.displayName === "QuizQuestion") {
      } else {
        console.log(child);
        throw new Error(
          "Children of the Quiz component can only be Quiz.Question",
        );
      }
      return child;
    },
  );
  return (
    // Apply the 'dark' class to this container when the selected code-theme is 'dark'
    <div className={classNames("quiz", theme === "dark" ? "dark text-white" : "")}>
      {questionList[currentQuestion]}

      <div className="mt-4 flex items-center justify-between">
        <button
          className="btn"
          disabled={currentQuestion === 0}
          onClick={() => handleQuestionChange(currentQuestion - 1)}
          title="Keyboard shortcut: ← Arrow Left"
        >
          <ArrowLeftIcon className="mr-2 -ml-0.5 h-4 w-4" /> Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Question {currentQuestion + 1} of{" "}
          {React.Children.count(props.children)}
        </span>
        <button
          className="btn"
          disabled={canMoveOn && currentQuestion === questionList.length - 1}
          onClick={() => {
            if (!canMoveOn) {
              submitAnswer(selectedAnswer);
              setSubmitted(true);
            } else {
              handleQuestionChange(currentQuestion + 1);
            }
          }}
          title={selectedAnswer === null ? "Keyboard shortcut: Space" : "Keyboard shortcut: → Arrow Right or Enter"}
        >
          {selectedAnswer === null ? "Skip" : submitted ? "Next" : "Submit"}{" "}
          {canMoveOn && <ArrowRightIcon className="-mr-0.5 ml-2 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

const Quiz = (props): JSX.Element => {
  return (
    <Provider>
      <ActualQuiz {...props} />
    </Provider>
  );
};

Quiz.Question = QuizQuestion;
Quiz.Answer = QuizMCAnswer;
Quiz.Explanation = QuizAnswerExplanation;

export default Quiz;
